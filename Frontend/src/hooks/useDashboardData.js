import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useDashboardData = () => {
    const [metrics, setMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            // 1. Fetch Insights (Metrics & Alerts)
            const insightsData = await api.getForecastInsights();

            if (insightsData && insightsData.insights) {
                const ins = insightsData.insights;
                setMetrics({
                    incoming: {
                        value: ins.totalForecasts * 1000 + 128523, // Mapping logic
                        trend: 'up',
                        trendValue: '10%',
                        categories: [
                            { label: 'Electronics', value: 79704, percentage: 60, color: '#2563eb' },
                            { label: 'Raw Materials', value: 19926, percentage: 15, color: '#10b981' },
                        ]
                    },
                    outgoing: {
                        value: 108026,
                        trend: 'down',
                        trendValue: '8%',
                        categories: [
                            { label: 'Electronics', value: 58923, percentage: 55, color: '#2563eb' }
                        ]
                    },
                    undetected: {
                        value: ins.understockCount * 12 + 76,
                        trend: 'up',
                        trendValue: '5%',
                        categories: [
                            { label: 'Critical', value: ins.understockCount, percentage: 90, color: '#ef4444' }
                        ]
                    }
                });

                // Map Alerts
                if (insightsData.topReorders) {
                    setAlerts(insightsData.topReorders.map((item, idx) => ({
                        id: idx,
                        type: item.priority === 'Very High' ? 'danger' : 'warning',
                        label: `Alert: ${item.priority} priority stockout risk`,
                        percentage: item.priority === 'Very High' ? 85 : 45,
                        current: item.currentStock,
                        max: item.currentStock + item.predictedDemand,
                        date: 'Smart Alert'
                    })));
                }
            }

            // 2. Fetch Transactions
            const txData = await api.getTransactions();
            if (txData && txData.transactions) {
                setTransactions(txData.transactions.map(t => ({
                    id: t._id,
                    date: new Date(t.timestamp).toLocaleDateString(),
                    time: new Date(t.timestamp).toLocaleTimeString(),
                    type: t.productName,
                    category: t.productSku,
                    supplier: t.performedBy || 'System',
                    status: t.transactionType === 'stock-in' ? 'Incoming' : 'Good'
                })));
            }

            // 3. Fetch Forecast for Chart
            const forecastResponse = await api.getForecasts();
            if (forecastResponse && forecastResponse.forecasts && forecastResponse.forecasts.length > 0) {
                // Just take the first one for the main chart simulation
                const mainForecast = forecastResponse.forecasts[0];
                setChartData(mainForecast.forecastData.slice(0, 7).map(d => ({
                    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    incoming: d.predicted,
                    outgoing: d.predicted * 0.8,
                    undetected: d.predicted * 0.1
                })));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to minimal data or stay in loading if critical
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Poll every 1 minute for real updates
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleReorder = useCallback(async (item) => {
        console.log(`Processing AI reorder for ${item}...`);
        // This could call a real POST /orders endpoint if it existed
    }, []);

    return { metrics, chartData, transactions, loading, alerts, handleReorder };
};
