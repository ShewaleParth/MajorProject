
import React, { useState, useEffect, useMemo } from 'react';
import {
    AlertTriangle,
    TrendingUp,
    IndianRupee,
    Package,
    BrainCircuit,
    Filter,
    Download,
    X,
    ArrowRight,
    ChevronDown,
    Info,
    Maximize2,
    Ship,
    Truck
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import '../styles/ForecastingAnalysis.css';

const ForecastingAnalysis = () => {
    const [products, setProducts] = useState([]);
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [scenarioData, setScenarioData] = useState(null);
    const [adjustments, setAdjustments] = useState({
        demandMultiplier: 1.0,
        leadTimeDelta: 0,
        salesSpike: 1.0
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleRunBulkForecast = async () => {
        if (!products.length) return;
        setIsGenerating(true);
        try {
            // Run predictions sequentially or in small chunks to avoid overload
            for (const product of products) {
                await api.predictCustom({
                    sku: product.sku,
                    productName: product.name,
                    currentStock: product.stock,
                    dailySales: product.dailySales || 5,
                    weeklySales: product.weeklySales || 35,
                    reorderLevel: product.reorderPoint || 10,
                    leadTime: product.leadTime || 7,
                    brand: product.brand || 'Generic',
                    category: product.category,
                    location: product.location || 'Warehouse',
                    supplierName: product.supplier,
                    forecastDays: 30
                });
            }
            // Refresh forecasts
            const forecastsRes = await api.getForecasts();
            setForecasts(forecastsRes.forecasts || []);
            alert("Comprehensive system-wide forecast generated successfully.");
        } catch (error) {
            console.error("Bulk forecast failed:", error);
            alert("Some forecasts failed to generate. Check console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, forecastsRes] = await Promise.all([
                    api.getProducts(),
                    api.getForecasts()
                ]);

                setProducts(productsRes.products || []);
                setForecasts(forecastsRes.forecasts || []);
            } catch (error) {
                console.error("Error fetching forecasting data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Compute Summary Metrics
    const summaryMetrics = useMemo(() => {
        if (!forecasts.length) return {
            atRisk: 0,
            avgDaysToStockout: 0,
            capitalLocked: 0,
            totalUnitsForecasted: 0,
            confidenceScore: 0
        };

        const atRisk = forecasts.filter(f => (f.aiInsights?.eta_days || 99) < 10).length;
        const avgDays = forecasts.reduce((acc, f) => acc + (f.aiInsights?.eta_days || 0), 0) / forecasts.length;

        // mock capital calculation: stock * avg price (assume ₹500 avg)
        const capital = forecasts.reduce((acc, f) => acc + (f.currentStock * 550), 0);

        const totalUnits = forecasts.reduce((acc, f) => {
            const forecastSum = f.forecastData?.reduce((sum, d) => sum + d.predicted, 0) || 0;
            return acc + forecastSum;
        }, 0);

        const avgConfidence = forecasts.reduce((acc, f) => {
            const conf = f.forecastData?.[0]?.confidence || 0.85;
            return acc + conf;
        }, 0) / forecasts.length * 100;

        return {
            atRisk,
            avgDaysToStockout: Math.round(avgDays),
            capitalLocked: capital,
            totalUnitsForecasted: Math.round(totalUnits),
            confidenceScore: Math.round(avgConfidence)
        };
    }, [forecasts]);

    // Process table data
    const tableData = useMemo(() => {
        let data = forecasts.map(f => {
            const insights = f.aiInsights || {};
            const riskLevel = insights.risk_level || 'Safe';

            return {
                sku: f.sku,
                name: f.productName,
                currentStock: f.currentStock,
                avgDailySales: f.inputParams?.dailySales || 0,
                daysToStockout: insights.eta_days || 99,
                recommendedReorder: insights.recommended_reorder || 0,
                riskLevel: riskLevel,
                insight: insights.message || 'Inventory status stable.'
            };
        });

        if (filterType === 'High Risk') {
            data = data.filter(d => d.riskLevel === 'Critical' || d.riskLevel === 'High');
        }

        if (searchQuery) {
            data = data.filter(d =>
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.sku.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return data.sort((a, b) => a.daysToStockout - b.daysToStockout);
    }, [forecasts, filterType, searchQuery]);

    // Aggregate Depot Risk
    const depotRisk = useMemo(() => {
        const depots = {};
        forecasts.forEach(f => {
            const depot = f.inputParams?.location || 'General';
            if (!depots[depot]) {
                depots[depot] = { critical: 0, warning: 0, safe: 0 };
            }

            const risk = f.aiInsights?.risk_level;
            if (risk === 'Critical' || risk === 'High') depots[depot].critical++;
            else if (risk === 'Medium' || risk === 'Warning') depots[depot].warning++;
            else depots[depot].safe++;
        });

        return Object.entries(depots).map(([name, counts]) => ({
            name,
            ...counts,
            total: counts.critical + counts.warning + counts.safe
        }));
    }, [forecasts]);

    // Handle row click for drill-down
    const handleProductSelect = async (sku) => {
        const forecast = forecasts.find(f => f.sku === sku);
        if (forecast) {
            setSelectedProduct(forecast);
            setAdjustments({
                demandMultiplier: 1.0,
                leadTimeDelta: 0,
                stockDelta: 0
            });
            setScenarioData(null);
        }
    };

    // Run Scenario Analysis
    const runScenario = async () => {
        if (!selectedProduct) return;

        try {
            const response = await api.runScenario({
                sku: selectedProduct.sku,
                productName: selectedProduct.productName,
                currentStock: selectedProduct.currentStock,
                dailySales: selectedProduct.inputParams.dailySales,
                weeklySales: selectedProduct.inputParams.weeklySales,
                leadTime: selectedProduct.inputParams.leadTime,
                reorderLevel: selectedProduct.inputParams.reorderLevel,
                adjustments: adjustments,
                forecastDays: 30
            });

            if (response.success) {
                setScenarioData(response);
            }
        } catch (error) {
            console.error("Scenario running failed:", error);
        }
    };

    // Auto-run scenario when adjustments change
    useEffect(() => {
        if (selectedProduct) {
            const timer = setTimeout(() => {
                runScenario();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [adjustments, selectedProduct]);

    const exportCSV = () => {
        const headers = ['SKU', 'Product', 'Current Stock', 'Stockout In (Days)', 'Recommended Reorder'];
        const rows = tableData.map(d => [d.sku, d.name, d.currentStock, d.daysToStockout, d.recommendedReorder]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reorder_list.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Initializing Forecast Command Center...</p>
        </div>
    );

    return (
        <div className="forecast-command-center">
            {/* 1. Command Summary Panel */}
            <div className="command-summary-panel">
                <div className="summary-card risk">
                    <span className="label">Products at Risk</span>
                    <span className="value">{summaryMetrics.atRisk}</span>
                    <span className="sub-value">Stock-out within 10 days</span>
                </div>
                <div className="summary-card efficiency">
                    <span className="label">Avg Days to Stock-out</span>
                    <span className="value">{summaryMetrics.avgDaysToStockout}d</span>
                    <span className="sub-value">System-wide average</span>
                </div>
                <div className="summary-card capital">
                    <span className="label">Capital Locked</span>
                    <span className="value">₹{(summaryMetrics.capitalLocked / 1000000).toFixed(2)}M</span>
                    <span className="sub-value">Excess inventory value</span>
                </div>
                <div className="summary-card volume">
                    <span className="label">30D Forecast Vol</span>
                    <span className="value">{summaryMetrics.totalUnitsForecasted.toLocaleString()}</span>
                    <span className="sub-value">Predicted unit demand</span>
                </div>
                <div className="summary-card">
                    <span className="label">Forecast Confidence</span>
                    <span className="value">{summaryMetrics.confidenceScore}%</span>
                    <div className="mini-progress">
                        <div className="mini-fill" style={{ width: `${summaryMetrics.confidenceScore}%`, backgroundColor: 'var(--success)' }}></div>
                    </div>
                </div>
            </div>

            {/* 6. Executive AI Forecast Summary */}
            <div className="executive-ai-summary">
                <div className="ai-avatar">
                    <BrainCircuit size={28} />
                </div>
                <div className="ai-content" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4>Executive Intelligence Summary</h4>
                        <button
                            className="reorder-btn"
                            style={{ width: 'auto', padding: '8px 16px', marginTop: '-10px' }}
                            onClick={handleRunBulkForecast}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Analyzing System...' : 'Run All Predictions'}
                        </button>
                    </div>
                    <p>
                        {forecasts.length === 0
                            ? "No forecast data currently available. Click 'Run All Predictions' to initialize the AI engine for your inventory."
                            : summaryMetrics.atRisk > 0
                                ? `${summaryMetrics.atRisk} critical SKUs are projected to face stock-outs within 10 days. Total required reorder volume stands at ${summaryMetrics.totalUnitsForecasted.toLocaleString()} units. `
                                : "All system stock levels are within safe operating buffers for the next 14 days. "}
                        {forecasts.length > 0 && `Average forecast confidence is high at ${summaryMetrics.confidenceScore}%.`}
                    </p>
                </div>
            </div>

            {/* 5. Depot-Level Risk Heatmap */}
            <div className="risk-heatmap-section">
                <div className="section-title">
                    <h3>Depot Operational Risk Heatmap</h3>
                    <span className="sub-value">Risk distribution across nodes</span>
                </div>
                <div className="heatmap-grid">
                    {depotRisk.map((depot, idx) => (
                        <div key={idx} className="depot-risk-card">
                            <div className="depot-name">{depot.name}</div>
                            <div className="risk-bars">
                                <div className="risk-bar critical" style={{ width: `${(depot.critical / depot.total) * 100}%` }}></div>
                                <div className="risk-bar warning" style={{ width: `${(depot.warning / depot.total) * 100}%` }}></div>
                                <div className="risk-bar safe" style={{ width: `${(depot.safe / depot.total) * 100}%` }}></div>
                            </div>
                            <div className="risk-legend">
                                <span style={{ color: 'var(--danger)' }}>{depot.critical} Crit</span>
                                <span style={{ color: 'var(--warning)' }}>{depot.warning} Warn</span>
                                <span style={{ color: 'var(--success)' }}>{depot.safe} Safe</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Smart Decision Table */}
            <div className="decision-table-section">
                <div className="table-controls">
                    <div className="search-filter-group">
                        <div className="mini-search">
                            <Filter size={16} />
                            <input
                                type="text"
                                placeholder="Find SKU or Product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="card-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Risk Levels</option>
                            <option value="High Risk">High Risk Only</option>
                        </select>
                    </div>
                    <button className="reorder-list-btn" onClick={exportCSV}>
                        <Download size={18} />
                        Generate Reorder List (CSV)
                    </button>
                </div>

                <div className="decision-table-container">
                    <table className="decision-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Current Stock</th>
                                <th>Avg. Sales</th>
                                <th>Stock-out In</th>
                                <th>Recommended</th>
                                <th>Risk Level</th>
                                <th>AI Insight</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, idx) => (
                                <tr key={idx} onClick={() => handleProductSelect(row.sku)}>
                                    <td className="sku-cell"><span className="sku">{row.sku}</span></td>
                                    <td className="font-medium">{row.name}</td>
                                    <td>{row.currentStock}</td>
                                    <td>{row.avgDailySales.toFixed(1)}/day</td>
                                    <td className={row.daysToStockout < 10 ? 'trend-indicator negative' : ''}>
                                        {row.daysToStockout} days
                                    </td>
                                    <td className="font-medium">{row.recommendedReorder}</td>
                                    <td>
                                        <span className={`risk-badge ${row.riskLevel.toLowerCase()}`}>
                                            {row.riskLevel}
                                        </span>
                                    </td>
                                    <td className="ai-insight-cell" title={row.insight}>
                                        {row.insight}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Product Drill-Down Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                        <motion.div
                            className="drilldown-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <div>
                                    <h3>{selectedProduct.productName}</h3>
                                    <span className="sku-label">{selectedProduct.sku}</span>
                                </div>
                                <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="modal-grid">
                                    <div className="chart-card">
                                        <div className="section-header">
                                            <h3>
                                                <TrendingUp size={18} className="ai-icon" />
                                                Interactive Demand Forecast
                                            </h3>
                                            <div className="trend-stat">
                                                <span className="label">Today's Confidence:</span>
                                                <span className="positive">{(selectedProduct.forecastData?.[0]?.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>

                                        <div style={{ height: 350, width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={scenarioData ? scenarioData.scenario.forecastData : selectedProduct.forecastData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                                    <XAxis
                                                        dataKey="date"
                                                        fontSize={10}
                                                        tickFormatter={(str) => {
                                                            const date = new Date(str);
                                                            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                                        }}
                                                    />
                                                    <YAxis fontSize={10} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--bg-card)',
                                                            borderColor: 'var(--border)',
                                                            borderRadius: '8px',
                                                            boxShadow: 'var(--shadow-md)'
                                                        }}
                                                    />
                                                    <ReferenceLine
                                                        y={selectedProduct.inputParams.reorderLevel}
                                                        stroke="var(--danger)"
                                                        strokeDasharray="5 5"
                                                        label={{ value: 'Reorder Level', position: 'right', fill: 'var(--danger)', fontSize: 10 }}
                                                    />
                                                    {/* Historical demand could be added here if available */}
                                                    <Line
                                                        type="monotone"
                                                        dataKey="predicted"
                                                        stroke="var(--primary)"
                                                        strokeWidth={3}
                                                        strokeDasharray="5 5"
                                                        dot={false}
                                                        name="Forecasted Demand"
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="projected_stock"
                                                        stroke="#8b5cf6"
                                                        strokeWidth={2}
                                                        strokeDasharray="5 5"
                                                        dot={false}
                                                        name="Projected Stock"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="predicted"
                                                        stroke="none"
                                                        fill="var(--primary-glow)"
                                                        opacity={0.3}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="ai-insight-box mt-4" style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></div>
                                                <strong style={{ fontSize: '13px' }}>AI Reasoning Engine</strong>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                                                {scenarioData?.ai_analysis?.situation || `Based on current velocity of ${selectedProduct.inputParams.dailySales} units/day, stock exhaustion is inevitable within ${selectedProduct.aiInsights.eta_days} days. Confidence interval bands suggest a ±5% variance in extreme scenarios.`}
                                                <br /><br />
                                                <strong>Risk Assessment:</strong> {scenarioData?.ai_analysis?.risk || `Critical threshold intersection predicted on ${selectedProduct.forecastData?.[Math.floor(selectedProduct.aiInsights.eta_days)]?.date || 'next week'}.`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="details-panel">
                                        <div className="chart-card">
                                            <div className="detail-item">
                                                <span className="label">Predicted Exhaust Date</span>
                                                <span className="value" style={{ color: 'var(--danger)' }}>
                                                    {new Date(Date.now() + (scenarioData?.scenario.insights.eta_days || selectedProduct.aiInsights.eta_days) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                                            <div className="detail-item">
                                                <span className="label">Optimal Reorder Date</span>
                                                <span className="value">
                                                    {new Date(Date.now() + ((scenarioData?.scenario.insights.eta_days || selectedProduct.aiInsights.eta_days) - selectedProduct.inputParams.lead_time) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="detail-item mt-3">
                                                <span className="label">Safety Buffer Quantity</span>
                                                <span className="value">{(selectedProduct.inputParams.dailySales * 3).toFixed(0)} Units</span>
                                            </div>
                                        </div>

                                        {/* 4. What-If Scenario Simulator */}
                                        <div className="simulator-panel">
                                            <h4>
                                                <BrainCircuit size={18} color="var(--primary)" />
                                                What-If Scenario Simulator
                                            </h4>
                                            <div className="slider-group">
                                                <div className="slider-item">
                                                    <div className="slider-header">
                                                        <span>Demand Surge</span>
                                                        <span className="value">+{((adjustments.demandMultiplier - 1) * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        className="slider-input"
                                                        min="1.0"
                                                        max="2.5"
                                                        step="0.1"
                                                        value={adjustments.demandMultiplier}
                                                        onChange={(e) => setAdjustments({ ...adjustments, demandMultiplier: parseFloat(e.target.value) })}
                                                    />
                                                </div>

                                                <div className="slider-item">
                                                    <div className="slider-header">
                                                        <span>Supplier Delay</span>
                                                        <span className="value">+{adjustments.leadTimeDelta} Days</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        className="slider-input"
                                                        min="0"
                                                        max="14"
                                                        step="1"
                                                        value={adjustments.leadTimeDelta}
                                                        onChange={(e) => setAdjustments({ ...adjustments, leadTimeDelta: parseInt(e.target.value) })}
                                                    />
                                                </div>

                                                <div className="slider-item">
                                                    <div className="slider-header">
                                                        <span>Emergency Sales Spike</span>
                                                        <span className="value">+{((adjustments.salesSpike - 1) * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        className="slider-input"
                                                        min="1.0"
                                                        max="3.0"
                                                        step="0.1"
                                                        value={adjustments.salesSpike}
                                                        onChange={(e) => setAdjustments({ ...adjustments, salesSpike: parseFloat(e.target.value) })}
                                                    />
                                                </div>

                                                <div className="comparison-box mt-3" style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '8px', fontSize: '11px' }}>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>Scenario Outcome:</span>
                                                        <strong>{scenarioData?.scenario.insights.risk_level || 'Calculating...'}</strong>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span>New Stock-out:</span>
                                                        <strong className="text-danger">{scenarioData?.scenario.insights.eta_days || selectedProduct.aiInsights.eta_days} Days</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ForecastingAnalysis;
