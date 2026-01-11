import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useDashboardData = () => {
    const [metrics, setMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);
    const [depots, setDepots] = useState([]);
    const [topSKUs, setTopSKUs] = useState([]);
    const [selectedDepot, setSelectedDepot] = useState('all');

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, depotsRes, insightsRes, topSkusRes, trendRes, txRes] = await Promise.all([
                api.getDashboardStats().catch(e => ({ status: 'error', error: e })),
                api.getDepots().catch(e => ({ status: 'error', error: e })),
                api.getForecastInsights().catch(e => ({ status: 'error', error: e })),
                api.getTopSKUs().catch(e => ({ status: 'error', error: e })),
                api.getSalesTrend().catch(e => ({ status: 'error', error: e })),
                api.getTransactions(selectedDepot !== 'all' ? { depotId: selectedDepot } : {}).catch(e => ({ status: 'error', error: e }))
            ]);

            // 1. Process Metrics
            if (statsRes && statsRes.kpis) {
                const kpiMap = {};
                statsRes.kpis.forEach(kpi => kpiMap[kpi.title] = kpi);

                const totalValue = statsRes.stats?.totalValue || 0;
                const totalProducts = statsRes.stats?.totalProducts || 0;
                const lowStockCount = statsRes.stats?.lowStockCount || 0;

                setMetrics({
                    incoming: {
                        value: totalProducts,
                        trend: kpiMap['Total Products']?.changeType === 'positive' ? 'up' : 'down',
                        trendValue: `${kpiMap['Total Products']?.change || 0}%`,
                        categories: [
                            { label: 'Total Products', value: totalProducts, percentage: 100, color: '#8b5cf6' }
                        ]
                    },
                    outgoing: {
                        value: totalValue,
                        trend: kpiMap['Inventory Value']?.changeType === 'positive' ? 'up' : 'down',
                        trendValue: `${kpiMap['Inventory Value']?.change || 0}%`,
                        categories: [
                            { label: 'Net Valuation', value: `₹${(totalValue / 100000).toFixed(1)}L`, percentage: 100, color: '#10b981' }
                        ]
                    },
                    undetected: {
                        value: lowStockCount,
                        trend: lowStockCount > 0 ? 'up' : 'neutral',
                        trendValue: lowStockCount > 0 ? 'Action Required' : 'Optimal',
                        categories: [
                            { label: 'Critical Items', value: lowStockCount, percentage: (totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0), color: '#f59e0b' }
                        ]
                    }
                });
            }

            // 2. Process Depots
            if (depotsRes && depotsRes.depots) {
                setDepots(depotsRes.depots);
            }

            // 3. Process Alerts
            if (insightsRes && insightsRes.topReorders) {
                setAlerts(insightsRes.topReorders.map((item, idx) => ({
                    id: idx,
                    type: item.priority === 'Very High' ? 'danger' : 'warning',
                    label: `REORDER: ${item.name}`,
                    percentage: item.priority === 'Very High' ? 85 : 45,
                    current: item.currentStock,
                    max: item.currentStock + item.predictedDemand,
                    date: item.sku
                })));
            } else if (insightsRes && insightsRes.status !== 'error') {
                setAlerts([]);
            }

            // 4. Process Top SKUs
            if (topSkusRes && topSkusRes.topSKUs) {
                setTopSKUs(topSkusRes.topSKUs);
            } else if (topSkusRes && topSkusRes.status !== 'error') {
                setTopSKUs([]);
            }

            // 5. Process Trend
            if (trendRes && trendRes.trendData) {
                setChartData(trendRes.trendData.map(d => ({
                    name: d.date,
                    actual: d.sales || 0,
                    predicted: d.predicted || 0
                })));
            } else if (trendRes && trendRes.status !== 'error') {
                setChartData([]);
            }

            // 6. Process Transactions
            if (txRes && txRes.transactions) {
                setTransactions(txRes.transactions.map(t => ({
                    id: t.id || t._id,
                    timestamp: t.timestamp,
                    name: t.productName,
                    sku: t.productSku,
                    type: t.transactionType,
                    fromDepot: t.fromDepot,
                    toDepot: t.toDepot,
                    quantity: t.quantity,
                    status: 'Completed'
                })));
            } else if (txRes && txRes.status !== 'error') {
                setTransactions([]);
            }

        } catch (error) {
            console.error('Error in useDashboardData:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDepot]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleReorder = useCallback(async (item) => {
        console.log(`Reordering ${item}...`);
    }, []);

    return {
        metrics,
        chartData,
        transactions,
        loading,
        alerts,
        depots,
        topSKUs,
        selectedDepot,
        setSelectedDepot,
        handleReorder
    };
};
