import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, Clock, Package, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { api } from '../utils/api';
import '../styles/ForecastModal.css';

const ForecastModal = ({ isOpen, onClose, product }) => {
    const [loading, setLoading] = useState(true);
    const [forecastData, setForecastData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && product) {
            fetchForecast();
        }
    }, [isOpen, product]);

    const fetchForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getForecastBySku(product.sku);
            if (data.success) {
                setForecastData(data.forecast);
            } else {
                setError(data.error || 'Failed to fetch forecast');
            }
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('Error connecting to AI service');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const insights = forecastData?.aiInsights || {};
    const chartData = [];

    // Combine historical and forecast data for the chart
    if (forecastData) {
        if (forecastData.historicalData) {
            forecastData.historicalData.forEach((val, i) => {
                chartData.push({
                    name: `H-${30 - i}`,
                    demand: val,
                    type: 'historical'
                });
            });
        }
        if (forecastData.forecastData) {
            forecastData.forecastData.forEach((item, i) => {
                chartData.push({
                    name: item.date,
                    demand: item.predicted,
                    stock: item.projected_stock,
                    type: 'forecast'
                });
            });
        }
    }

    const renderRiskBadge = (level) => {
        const lv = level?.toLowerCase();
        if (lv === 'critical' || lv === 'high') return <span className="risk-badge critical"><AlertTriangle size={14} /> {level}</span>;
        if (lv === 'medium' || lv === 'warning') return <span className="risk-badge warning"><Clock size={14} /> {level}</span>;
        return <span className="risk-badge safe"><CheckCircle size={14} /> {level || 'Safe'}</span>;
    };

    return (
        <div className="modal-overlay forecast-modal-overlay">
            <div className="modal-content forecast-modal-content">
                <div className="modal-header">
                    <div className="header-title">
                        <TrendingUp className="header-icon" />
                        <div>
                            <h2>AI Demand Forecast</h2>
                            <p className="subtitle">{product.name} • {product.sku}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Analyzing historical patterns and training ARIMA model...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <AlertTriangle size={48} color="#ef4444" />
                            <h3>Forecast Unavailable</h3>
                            <p>{error}</p>
                            <button onClick={fetchForecast} className="retry-btn">Retry Analysis</button>
                        </div>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <label>Current Stock</label>
                                    <div className="value">{forecastData.currentStock} <span className="unit">units</span></div>
                                </div>
                                <div className="stat-card">
                                    <label>Avg. Daily Demand</label>
                                    <div className="value">{insights.avg_daily_demand} <span className="unit">u/day</span></div>
                                </div>
                                <div className="stat-card">
                                    <label>Days To Stock-Out</label>
                                    <div className="value highlight">{insights.eta_days} <span className="unit">days</span></div>
                                </div>
                                <div className="stat-card">
                                    <label>Supplier Lead Time</label>
                                    <div className="value">{product.leadTime || 7} <span className="unit">days</span></div>
                                </div>
                                <div className="stat-card">
                                    <label>Reorder Point</label>
                                    <div className="value">{insights.reorder_point} <span className="unit">units</span></div>
                                </div>
                                <div className="stat-card">
                                    <label>Recommended Reorder</label>
                                    <div className="value primary">{insights.recommended_reorder} <span className="unit">units</span></div>
                                </div>
                                <div className="stat-card">
                                    <label>Predicted Stock-Out</label>
                                    <div className="value">{insights.predicted_stock_out_date}</div>
                                </div>
                                <div className="stat-card">
                                    <label>Risk Level</label>
                                    <div className="value-badge">{renderRiskBadge(insights.risk_level)}</div>
                                </div>
                            </div>

                            <div className="ai-insight-box">
                                <div className="insight-header">
                                    <BarChart2 size={18} />
                                    <span>AI Intelligence Report</span>
                                </div>
                                <p className="insight-text">{forecastData.alert || 'No specific risks identified for this period.'}</p>
                            </div>

                            <div className="chart-container">
                                <div className="chart-header">
                                    <h3>Demand Projection (Next 30 Days)</h3>
                                    <div className="chart-legend">
                                        <span className="legend-item"><span className="dot historic"></span> Historical</span>
                                        <span className="legend-item"><span className="dot forecast"></span> Forecast</span>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                interval={5}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: '8px' }}
                                                itemStyle={{ color: '#e2e8f0' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="demand"
                                                stroke="#8b5cf6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorDemand)"
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForecastModal;
