import React from 'react';
import { Package, Truck, AlertCircle, Sparkles, Search, TrendingUp, Bell } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useDashboardData } from '../hooks/useDashboardData';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const {
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
    } = useDashboardData();

    if (loading || !metrics) {
        return (
            <div className="loading-state-purple">
                <div className="spinner"></div>
                <p>Initializing Logistics Network...</p>
                <span className="text-muted-sm">Syncing with AI Forecasting Nodes</span>
            </div>
        );
    }

    const formatValue = (val, isCurrency = false) => {
        if (val === undefined || val === null) return isCurrency ? '₹0' : '0';
        const formatted = val.toLocaleString('en-IN');
        return isCurrency ? `₹${formatted}` : formatted;
    };

    return (
        <div className="dashboard-container">
            <div className="metrics-grid">
                <MetricCard
                    title="Inbound Stock"
                    value={formatValue(metrics?.incoming?.value, true)}
                    trend={metrics?.incoming?.trend}
                    trendValue={metrics?.incoming?.trendValue}
                    icon={Package}
                    categories={metrics?.incoming?.categories || []}
                />
                <MetricCard
                    title="Outbound Stock"
                    value={formatValue(metrics?.outgoing?.value, true)}
                    trend={metrics?.outgoing?.trend}
                    trendValue={metrics?.outgoing?.trendValue}
                    icon={Truck}
                    categories={metrics?.outgoing?.categories || []}
                />
                <MetricCard
                    title="Stockout Risk"
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
                            <select
                                className="card-select depot-switcher"
                                value={selectedDepot}
                                onChange={(e) => setSelectedDepot(e.target.value)}
                            >
                                <option value="all">Global Network</option>
                                {depots.map(depot => (
                                    <option key={depot._id || depot.id} value={depot._id || depot.id}>{depot.name}</option>
                                ))}
                            </select>
                            <select className="card-select">
                                <option>Weekly Scale</option>
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
                                    <Bar dataKey="actual" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Actual Sales (₹)" />
                                    <Bar dataKey="predicted" fill="#2563eb" radius={[4, 4, 0, 0]} name="AI Predicted Demand (₹)" />
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

                <div className="dashboard-grid">
                    <div className="dashboard-section forecast-section">
                        <div className="section-header">
                            <h3>Demand Intelligence</h3>
                            <div className="ai-badge">ARIMA V2.1 ACTIVE</div>
                        </div>
                        <div className="forecast-list">
                            {topSKUs.map((sku, index) => (
                                <div key={index} className="forecast-item">
                                    <div className="forecast-info">
                                        <span className="sku-label">{sku.sku}</span>
                                        <div className="product-name">{sku.name}</div>
                                        <div className="demand-stat">
                                            <TrendingUp size={14} className="trend-up" />
                                            <span>Predicted: <b>{sku.predictedDemand} units</b> next 7d</span>
                                        </div>
                                    </div>
                                    <div className="forecast-action">
                                        <div className="stock-level">
                                            <span>Stock: {sku.currentStock}</span>
                                            <div className="stock-bar">
                                                <div
                                                    className="stock-fill"
                                                    style={{ width: `${Math.min((sku.currentStock / (sku.predictedDemand || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <button
                                            className="reorder-btn"
                                            onClick={() => handleReorder(sku.name)}
                                        >
                                            Quick Reorder
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-section alerts-section">
                        <div className="section-header">
                            <h3>Network Alerts</h3>
                            <span className="alert-count">{alerts.length} Active</span>
                        </div>
                        <div className="alerts-list">
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`alert-card ${alert.type}`}>
                                    <div className="alert-header">
                                        <span className="alert-label">{alert.label}</span>
                                        <span className="alert-date">{alert.date}</span>
                                    </div>
                                    <div className="alert-progress">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${alert.percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="alert-footer">
                                        <span>Current: {alert.current}</span>
                                        <span>Target: {alert.max}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section full-width">
                <div className="section-header">
                    <h3>Logistics Ledger</h3>
                    <div className="header-controls">
                        <input type="text" placeholder="Filter by SKU or Depot..." className="search-input" />
                    </div>
                </div>
                <div className="table-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>SKU / Product</th>
                                <th>Movement</th>
                                <th>Origin Depot</th>
                                <th>Destination Depot</th>
                                <th>Qty</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="text-muted">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                    <td>
                                        <div className="sku-cell">
                                            <span className="sku">{tx.sku}</span>
                                            <span className="name">{tx.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`transaction-type ${tx.type.toLowerCase()}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td>{tx.fromDepot || 'Supplier / External'}</td>
                                    <td>{tx.toDepot || 'Customer / Outbound'}</td>
                                    <td className="font-medium">{tx.quantity}</td>
                                    <td>
                                        <span className={`status-badge ${tx.status.toLowerCase()}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
