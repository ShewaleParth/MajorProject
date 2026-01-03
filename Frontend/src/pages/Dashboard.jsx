import React from 'react';
import { Package, Truck, AlertCircle, Sparkles, Search, TrendingUp, Bell } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useDashboardData } from '../hooks/useDashboardData';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const { metrics, chartData, transactions, loading, alerts, handleReorder } = useDashboardData();

    if (loading || !metrics) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Connecting to AI Services...</p>
                <style jsx>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 60vh;
            gap: 20px;
            color: var(--text-muted);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    const formatValue = (val) => {
        if (val === undefined || val === null) return '0';
        return val.toLocaleString('en-US').replace(/,/g, '.');
    };

    return (
        <div className="dashboard-container">
            <div className="metrics-grid">
                <MetricCard
                    title="Incoming Package"
                    value={formatValue(metrics?.incoming?.value)}
                    trend={metrics?.incoming?.trend}
                    trendValue={metrics?.incoming?.trendValue}
                    icon={Package}
                    categories={metrics?.incoming?.categories || []}
                />
                <MetricCard
                    title="Outgoing Package"
                    value={formatValue(metrics?.outgoing?.value)}
                    trend={metrics?.outgoing?.trend}
                    trendValue={metrics?.outgoing?.trendValue}
                    icon={Truck}
                    categories={metrics?.outgoing?.categories || []}
                />
                <MetricCard
                    title="Package not Detected"
                    value={formatValue(metrics?.undetected?.value)}
                    trend={metrics?.undetected?.trend}
                    trendValue={metrics?.undetected?.trendValue}
                    icon={AlertCircle}
                    categories={metrics?.undetected?.categories || []}
                />
            </div>

            <div className="main-content-row">
                <div className="chart-section">
                    <div className="section-header">
                        <h3>Inventory Overview</h3>
                        <div className="header-controls">
                            <select className="card-select">
                                <option>Weekly</option>
                            </select>
                        </div>
                    </div>
                    <div className="chart-container">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--bg-main)' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-card)',
                                            borderColor: 'var(--border)',
                                            borderRadius: '8px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    <Bar dataKey="incoming" stackId="a" fill="#2563eb" />
                                    <Bar dataKey="outgoing" stackId="a" fill="#3b82f6" opacity={0.7} />
                                    <Bar dataKey="undetected" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data-placeholder">No forecasting data available yet.</div>
                        )}
                    </div>
                    <div className="chart-footer">
                        <div className="footer-btns">
                            <button className="export-btn">CSV ↓</button>
                            <button className="export-btn">PDF ↓</button>
                        </div>
                        <div className="trend-stat">
                            <TrendingUp size={14} className="positive" />
                            <span className="positive">Updated Live</span>
                        </div>
                    </div>
                </div>

                <div className="ai-section">
                    <div className="section-header">
                        <h3>
                            <Sparkles size={18} className="ai-icon" />
                            AI Features
                        </h3>
                        <button className="more-btn">•••</button>
                    </div>

                    <div className="ai-card recommendation">
                        <div className="ai-card-title">
                            <Bell size={14} />
                            <span>Smart Reorder Recommendation</span>
                        </div>
                        <p className="ai-card-desc">AI indicates {alerts?.[0]?.label || 'predictive analysis'} is needed.</p>
                        <div className="recommendation-target">
                            <Package size={14} />
                            <span>{alerts?.[0]?.sku || 'System Check'}</span>
                        </div>
                        <button
                            className="reorder-btn"
                            onClick={() => handleReorder('Macbook Air')}
                        >
                            Execute Reorder &gt;
                        </button>
                    </div>

                    {alerts && alerts.length > 0 ? alerts.map(alert => (
                        <div key={alert.id} className={`ai-card alert ${alert.type}`}>
                            <div className="ai-card-header">
                                <AlertCircle size={14} />
                                <span>{alert.label}</span>
                                <span className="perc">{alert.percentage}%</span>
                            </div>
                            <div className="mini-progress">
                                <div className={`mini-fill ${alert.type}`} style={{ width: `${alert.percentage}%` }}></div>
                            </div>
                            <div className="ai-card-footer">
                                <span>{alert.current?.toLocaleString()} / {alert.max?.toLocaleString()}</span>
                                <span>{alert.date}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="ai-card info">
                            <p>No active anomalies detected by AI.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="tables-row">
                <div className="table-section">
                    <div className="section-header">
                        <h3>Movement & Transaction</h3>
                        <div className="header-actions">
                            <div className="mini-search">
                                <Search size={14} />
                                <input type="text" placeholder="Search Product" />
                            </div>
                            <select className="card-select">
                                <option>Sort by</option>
                            </select>
                        </div>
                    </div>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Handled By</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions && transactions.length > 0 ? transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.date}</td>
                                        <td>{t.time}</td>
                                        <td>{t.type}</td>
                                        <td>{t.category}</td>
                                        <td>{t.supplier}</td>
                                        <td>
                                            <span className={`status-badge ${t.status?.toLowerCase()}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No recent transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style jsx>{`
        .no-data-placeholder {
            height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-main);
            border-radius: var(--radius-md);
            color: var(--text-muted);
            font-size: 14px;
        }
        .ai-card.info {
            padding: 20px;
            text-align: center;
            color: var(--text-muted);
            border: 1px dashed var(--border);
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
