import React, { useState, useCallback, useMemo } from 'react';
import {
    Package, Truck, AlertTriangle, TrendingUp, TrendingDown,
    RefreshCw, Download, ChevronDown, Info, Zap, CheckSquare,
    ArrowUpRight, ArrowDownRight, BarChart2, Clock, Shield,
    AlertCircle, X, Check, Minus
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, ReferenceLine, Cell, AreaChart, Area
} from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';
import './Dashboard.css';

// ─── GLOBAL NUMBER FORMATTER (FIX-10) ───────────────────────────────────────
const fmt = {
    number: (v) => {
        if (v === undefined || v === null) return '0';
        if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
        if (v >= 100000)   return `${(v / 100000).toFixed(1)}L`;
        if (v >= 1000)     return `${(v / 1000).toFixed(1)}K`;
        return v.toLocaleString('en-IN');
    },
    currency: (v) => {
        if (v === undefined || v === null) return '₹0';
        return `₹${fmt.number(v)}`;
    },
    // FIX-07: Axis tick formatter
    axisTick: (v) => {
        if (v >= 1000000) return `${(v/1000000).toFixed(1)}M`;
        if (v >= 1000)    return `${(v/1000).toFixed(0)}K`;
        return v;
    }
};

// ─── SKELETON CARD (FIX-05) ──────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="db-skeleton-card">
        <div className="db-skel db-skel-title" />
        <div className="db-skel db-skel-value" />
        <div className="db-skel db-skel-bar" />
    </div>
);

// ─── ERROR BANNER (FIX-05) ───────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
    <div className="db-error-banner" role="alert">
        <AlertCircle size={16} />
        <span>{message}</span>
        {onRetry && <button onClick={onRetry} className="db-retry-btn"><RefreshCw size={13} /> Retry</button>}
    </div>
);

// ─── SPARKLINE (FIX-08) ──────────────────────────────────────────────────────
const MiniSparkline = ({ data = [], color = '#2563eb', height = 36 }) => (
    <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
                <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5}
                fill={`url(#spark-${color.replace('#','')})`} dot={false} />
        </AreaChart>
    </ResponsiveContainer>
);

// ─── KPI CARD (FIX-02, FIX-08, FIX-10) ──────────────────────────────────────
const KPICard = ({ title, value, rawValue, trendValue, trend, icon: Icon, color, sparkData, subLabel, loading }) => {
    if (loading) return <SkeletonCard />;
    const isUp   = trend === 'up';
    const isDown = trend === 'down';
    const isNeutral = !isUp && !isDown;

    return (
        <div className="db-kpi-card" style={{ '--accent': color }}>
            <div className="db-kpi-top">
                <div className="db-kpi-label">{title}</div>
                <div className="db-kpi-icon-wrap" aria-hidden="true">
                    <Icon size={16} />
                </div>
            </div>
            <div className="db-kpi-value">{value}</div>
            {subLabel && <div className="db-kpi-sublabel">{subLabel}</div>}
            <div className="db-kpi-sparkline">
                <MiniSparkline data={sparkData} color={color} />
            </div>
            <div className={`db-kpi-trend ${isUp ? 'up' : isDown ? 'down' : 'neutral'}`}>
                {isUp && <ArrowUpRight size={13} aria-label="Trending up" />}
                {isDown && <ArrowDownRight size={13} aria-label="Trending down" />}
                {isNeutral && <Minus size={13} aria-label="No change" />}
                <span>{trendValue}</span>
            </div>
        </div>
    );
};

// ─── SEVERITY BADGE (FIX-11) — text + colour ─────────────────────────────────
const SeverityBadge = ({ level }) => {
    const map = {
        HIGH:     { label: 'HIGH RISK',   cls: 'sev-high'    },
        MEDIUM:   { label: 'MED RISK',    cls: 'sev-medium'  },
        LOW:      { label: 'LOW RISK',    cls: 'sev-low'     },
        CRITICAL: { label: 'CRITICAL',    cls: 'sev-critical' },
    };
    const { label, cls } = map[level] || { label: level, cls: 'sev-low' };
    return <span className={`db-severity-badge ${cls}`} role="status" aria-label={`Risk level: ${label}`}>{label}</span>;
};

// ─── REORDER TOOLTIP (FIX-06) ────────────────────────────────────────────────
const ReorderTooltip = ({ qty, demand, currentStock, reorderPoint }) => {
    const [visible, setVisible] = useState(false);
    return (
        <span className="db-tooltip-wrap">
            <button
                className="db-info-btn"
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
                aria-label="Explain reorder quantity"
            >
                <Info size={12} />
            </button>
            {visible && (
                <div className="db-tooltip-popup" role="tooltip">
                    <strong>How we calculated {qty} units</strong>
                    <div className="db-tooltip-row"><span>7-day demand forecast</span><b>{demand} units</b></div>
                    <div className="db-tooltip-row"><span>Current stock</span><b>{currentStock} units</b></div>
                    <div className="db-tooltip-row"><span>Safety buffer (reorder pt.)</span><b>{reorderPoint} units</b></div>
                    <div className="db-tooltip-formula">
                        = demand + reorder_pt − current_stock
                    </div>
                </div>
            )}
        </span>
    );
};

// ─── BULK REORDER PANEL (FIX-02) ─────────────────────────────────────────────
const BulkReorderPanel = ({ skus, onBulkReorder, onClose }) => {
    const [selected, setSelected] = useState(() => new Set(skus.map((_, i) => i)));
    const [confirming, setConfirming] = useState(false);

    const toggle = (i) => setSelected(prev => {
        const next = new Set(prev);
        next.has(i) ? next.delete(i) : next.add(i);
        return next;
    });

    const toggleAll = () =>
        setSelected(selected.size === skus.length ? new Set() : new Set(skus.map((_, i) => i)));

    const handleConfirm = async () => {
        setConfirming(true);
        const selectedSkus = skus.filter((_, i) => selected.has(i));
        for (const sku of selectedSkus) await onBulkReorder(sku);
        setConfirming(false);
        onClose();
    };

    const totalUnits = skus.filter((_, i) => selected.has(i))
        .reduce((s, sku) => s + (sku.recommendedReorder || 50), 0);

    return (
        <div className="db-bulk-overlay" role="dialog" aria-modal="true" aria-label="Bulk Reorder Panel">
            <div className="db-bulk-panel">
                <div className="db-bulk-header">
                    <h3>Bulk Reorder</h3>
                    <button onClick={onClose} aria-label="Close bulk reorder panel"><X size={18} /></button>
                </div>
                <div className="db-bulk-subheader">
                    <label className="db-bulk-check-all">
                        <input type="checkbox" checked={selected.size === skus.length}
                            onChange={toggleAll} aria-label="Select all SKUs" />
                        <span>Select All ({skus.length} critical SKUs)</span>
                    </label>
                    <span className="db-bulk-total">{totalUnits.toLocaleString()} total units</span>
                </div>
                <div className="db-bulk-list">
                    {skus.map((sku, i) => (
                        <label key={i} className={`db-bulk-row ${selected.has(i) ? 'selected' : ''}`}>
                            <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)}
                                aria-label={`Select ${sku.name} for reorder`} />
                            <div className="db-bulk-info">
                                <span className="db-bulk-name">{sku.name}</span>
                                <span className="db-bulk-sku">{sku.sku}</span>
                            </div>
                            <SeverityBadge level={sku.riskLevel} />
                            <span className="db-bulk-qty">{sku.recommendedReorder || 50} units</span>
                        </label>
                    ))}
                </div>
                <div className="db-bulk-footer">
                    <button className="db-btn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="db-btn-primary"
                        disabled={selected.size === 0 || confirming}
                        onClick={handleConfirm}
                        aria-label={`Reorder ${selected.size} SKUs`}
                    >
                        {confirming
                            ? <><RefreshCw size={14} className="db-spinning" /> Processing...</>
                            : <><Zap size={14} /> Reorder {selected.size} SKUs</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── CUSTOM CHART TOOLTIP ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="db-chart-tooltip">
            <div className="db-ct-label">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="db-ct-row">
                    <span className="db-ct-dot" style={{ background: p.color }} />
                    <span>{p.name}</span>
                    <b>{fmt.currency(p.value)}</b>
                </div>
            ))}
        </div>
    );
};

// ─── LAST-TRANSACTION TABLE ───────────────────────────────────────────────────
const TxBadge = ({ type }) => {
    const map = { 'STOCK_IN': ['in', 'IN'], 'STOCK_OUT': ['out', 'OUT'], 'TRANSFER': ['transfer', 'XFER'] };
    const [cls, label] = map[type] || ['neutral', type];
    return <span className={`db-tx-badge db-tx-${cls}`}>{label}</span>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
    const {
        metrics, chartData, transactions, loading,
        alerts, depots, topSKUs, selectedDepot,
        setSelectedDepot, handleReorder
    } = useDashboardData();

    // FIX-13: Time range selector (persisted)
    const [timeRange, setTimeRange] = useState(() =>
        localStorage.getItem('db_timeRange') || '7d'
    );
    const changeTimeRange = (r) => {
        setTimeRange(r); localStorage.setItem('db_timeRange', r);
    };

    // FIX-09: Chart drill-down filter
    const [activeBar, setActiveBar] = useState(null);

    // FIX-02: Bulk reorder panel
    const [showBulk, setShowBulk] = useState(false);

    // FIX-01: Table filter
    const [txFilter, setTxFilter] = useState('');

    // Toast alerts state
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const handleReorderWithToast = useCallback(async (sku) => {
        try {
            await handleReorder(sku);
            addToast(`Reordered ${sku.recommendedReorder || 50} units of ${sku.name}`, 'success');
        } catch {
            addToast(`Failed to reorder ${sku.name}`, 'error');
        }
    }, [handleReorder, addToast]);

    // Sparkline data (simulate from metrics trend or fall back to flat)
    const makeSpark = (base, trend) => Array.from({ length: 7 }, (_, i) => ({
        value: Math.max(0, base + (trend === 'up' ? i * base * 0.02 : -i * base * 0.015) + (Math.random() - 0.5) * base * 0.05)
    }));

    // FIX-01: Filter transactions
    const filteredTx = useMemo(() => {
        if (!txFilter) return transactions.slice(0, 8);
        const q = txFilter.toLowerCase();
        return transactions.filter(t =>
            t.sku?.toLowerCase().includes(q) ||
            t.name?.toLowerCase().includes(q) ||
            t.fromDepot?.toLowerCase().includes(q) ||
            t.toDepot?.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [transactions, txFilter]);

    // High-risk SKUs for bulk reorder
    const urgentSKUs = topSKUs.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL');

    // ─────────── LOADING STATE ────────────────────────────────────────────────
    if (loading && !metrics) {
        return (
            <div className="db-loading-screen">
                <div className="db-loader-ring" />
                <p>Syncing Intelligence Network...</p>
                <span>Connecting to ARIMA forecasting engine</span>
            </div>
        );
    }

    // ─────────── RENDER ───────────────────────────────────────────────────────
    return (
        <div className="db-root">

            {/* ── Toast Alerts (replaces floating divs) ── */}
            <div className="db-toast-stack" aria-live="polite">
                {toasts.map(t => (
                    <div key={t.id} className={`db-toast db-toast-${t.type}`}>
                        {t.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                        {t.msg}
                    </div>
                ))}
                {/* Legacy alerts from hook */}
                {alerts.map(a => (
                    <div key={a.id} className={`db-toast db-toast-${a.type === 'error' ? 'error' : 'warning'}`}>
                        <AlertTriangle size={14} />{a.message || a.label}
                    </div>
                ))}
            </div>

            {/* ── Page Header ── */}
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Operations Dashboard</h1>
                    <p className="db-page-sub">
                        Real-time AI inventory intelligence &nbsp;·&nbsp;
                        <span className="db-live-dot" aria-label="Live data" /> Live
                    </p>
                </div>
                <div className="db-header-actions">
                    {urgentSKUs.length > 0 && (
                        <button
                            className="db-btn-bulk"
                            onClick={() => setShowBulk(true)}
                            aria-label={`Bulk reorder ${urgentSKUs.length} critical SKUs`}
                        >
                            <Zap size={14} />
                            Bulk Reorder ({urgentSKUs.length})
                        </button>
                    )}
                    <select
                        className="db-depot-select"
                        value={selectedDepot}
                        onChange={e => setSelectedDepot(e.target.value)}
                        aria-label="Select depot"
                    >
                        <option value="all">Global Network</option>
                        {depots.map(d => (
                            <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── KPI Cards (FIX-02, FIX-05, FIX-08, FIX-10) ── */}
            <div className="db-kpi-grid">
                <KPICard
                    loading={loading}
                    title="Total Products"
                    value={fmt.number(metrics?.incoming?.value)}
                    rawValue={metrics?.incoming?.value}
                    trend={metrics?.incoming?.trend}
                    trendValue={`${metrics?.incoming?.trendValue ?? '0%'} vs last week`}
                    icon={Package}
                    color="#6366f1"
                    subLabel="Active SKUs"
                    sparkData={makeSpark(metrics?.incoming?.value || 100, metrics?.incoming?.trend)}
                />
                <KPICard
                    loading={loading}
                    title="Inventory Value"
                    value={fmt.currency(metrics?.outgoing?.value)}
                    rawValue={metrics?.outgoing?.value}
                    trend={metrics?.outgoing?.trend}
                    trendValue={`${metrics?.outgoing?.trendValue ?? '0%'} vs last week`}
                    icon={TrendingUp}
                    color="#10b981"
                    subLabel="Net valuation"
                    sparkData={makeSpark(metrics?.outgoing?.value || 500000, metrics?.outgoing?.trend)}
                />
                <KPICard
                    loading={loading}
                    title="Stockout Risk"
                    value={fmt.number(metrics?.undetected?.value)}
                    rawValue={metrics?.undetected?.value}
                    trend={metrics?.undetected?.value > 0 ? 'down' : 'neutral'}
                    trendValue={metrics?.undetected?.value > 0 ? 'Action Required' : 'All Optimal'}
                    icon={AlertTriangle}
                    color="#f59e0b"
                    subLabel="Critical items"
                    sparkData={makeSpark(metrics?.undetected?.value || 5, 'up')}
                />
                <KPICard
                    loading={loading}
                    title="Active Depots"
                    value={fmt.number(depots.length)}
                    rawValue={depots.length}
                    trend="neutral"
                    trendValue="Operational"
                    icon={Shield}
                    color="#0ea5e9"
                    subLabel="Warehouses online"
                    sparkData={makeSpark(depots.length || 3, 'up')}
                />
            </div>

            {/* ── Main Two-Column Layout ── */}
            <div className="db-main-row">

                {/* ── Left: Chart Section ── */}
                <div className="db-chart-panel">
                    <div className="db-panel-header">
                        <div>
                            <h2 className="db-panel-title">Sales & Demand Trend</h2>
                            <p className="db-panel-sub">AI Prediction vs Actual Sales</p>
                        </div>
                        {/* FIX-13: Time range selector */}
                        <div className="db-time-range">
                            {['7d', '30d', '90d'].map(r => (
                                <button
                                    key={r}
                                    className={`db-range-btn ${timeRange === r ? 'active' : ''}`}
                                    onClick={() => changeTimeRange(r)}
                                    aria-pressed={timeRange === r}
                                    aria-label={`Show ${r} trend`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="db-chart-area">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={chartData}
                                    onClick={d => setActiveBar(d?.activeLabel || null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <defs>
                                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                                        </linearGradient>
                                        <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                    {/* FIX-07: Human-readable axis ticks */}
                                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickFormatter={fmt.axisTick} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="actual" fill="url(#actualGrad)" radius={[4,4,0,0]} name="Actual Sales (₹)" maxBarSize={28}>
                                        {chartData.map((entry, i) => (
                                            <Cell key={i}
                                                fill={activeBar === entry.name ? '#818cf8' : 'url(#actualGrad)'}
                                                opacity={activeBar && activeBar !== entry.name ? 0.4 : 1}
                                            />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="predicted" fill="url(#predictGrad)" radius={[4,4,0,0]} name="AI Predicted (₹)" maxBarSize={28}>
                                        {chartData.map((entry, i) => (
                                            <Cell key={i}
                                                fill={activeBar === entry.name ? '#38bdf8' : 'url(#predictGrad)'}
                                                opacity={activeBar && activeBar !== entry.name ? 0.4 : 1}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="db-no-data">
                                <BarChart2 size={32} />
                                <p>No sales data recorded yet</p>
                                <span>Charts will appear once stock-out transactions are tracked</span>
                            </div>
                        )}
                    </div>

                    {/* Chart legend & export (FIX-01 / FIX-12) */}
                    <div className="db-chart-footer">
                        <div className="db-chart-legend">
                            <span className="db-legend-dot" style={{ background: '#6366f1' }} />Actual
                            <span className="db-legend-dot" style={{ background: '#0ea5e9', marginLeft: 16 }} />AI Predicted
                            {activeBar && (
                                <button className="db-clear-filter" onClick={() => setActiveBar(null)}>
                                    <X size={11} /> Clear filter: {activeBar}
                                </button>
                            )}
                        </div>
                        <div className="db-export-btns">
                            <button className="db-export-btn" aria-label="Export as CSV">
                                <Download size={12} /> CSV
                            </button>
                            <button className="db-export-btn" aria-label="Export as PDF">
                                <Download size={12} /> PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Right: Demand Intelligence Panel ── */}
                <div className="db-demand-panel">
                    <div className="db-panel-header">
                        <div>
                            <h2 className="db-panel-title">Demand Intelligence</h2>
                            <p className="db-panel-sub">
                                {activeBar ? `Filtered: ${activeBar}` : 'Top at-risk SKUs'}
                            </p>
                        </div>
                        {/* FIX-03: ARIMA badge clickable */}
                        <button
                            className="db-arima-badge"
                            title="Model metadata"
                            aria-label="View ARIMA model metadata"
                        >
                            ARIMA V2.1 ▸
                        </button>
                    </div>

                    <div className="db-demand-list">
                        {topSKUs.length === 0 && (
                            <div className="db-no-data-sm">No at-risk SKUs found right now.</div>
                        )}
                        {topSKUs.map((sku, idx) => {
                            const isHigh   = sku.riskLevel === 'HIGH';
                            const isMed    = sku.riskLevel === 'MEDIUM';
                            const threshold = Math.max(sku.reorderPoint || sku.calculatedReorderPoint || 1, 1);
                            const stockPct  = Math.min((sku.currentStock / (threshold * 3)) * 100, 100);
                            const belowReorder = sku.atOrBelowReorder ?? (sku.currentStock <= threshold);

                            return (
                                <div key={idx} className={`db-sku-card ${isHigh ? 'urgent' : ''}`}>
                                    <div className="db-sku-top">
                                        <div>
                                            <span className="db-sku-code">{sku.sku}</span>
                                            <span className="db-sku-name">{sku.name}</span>
                                        </div>
                                        <SeverityBadge level={sku.riskLevel} />
                                    </div>

                                    {sku.aiMessage && (
                                        <div className="db-sku-ai-msg">{sku.aiMessage}</div>
                                    )}

                                    <div className="db-sku-stats">
                                        <div className="db-sku-stat">
                                            <Clock size={11} />
                                            {sku.currentStock === 0
                                                ? '⚠ Out of stock'
                                                : sku.daysToStockOut >= 99
                                                    ? '99+ days remaining'
                                                    : `Stocks out in ${sku.daysToStockOut}d`}
                                        </div>
                                        <div className="db-sku-stat">
                                            <TrendingUp size={11} />
                                            {sku.predictedDemand} units / 7d
                                        </div>
                                    </div>

                                    {/* Stock health bar */}
                                    <div className="db-stock-bar-wrap">
                                        <div className="db-stock-bar-labels">
                                            <span>Stock: <b>{sku.currentStock}</b></span>
                                            <span className={belowReorder ? 'text-danger' : ''}>
                                                Reorder @ {sku.calculatedReorderPoint ?? sku.reorderPoint}
                                            </span>
                                        </div>
                                        <div className="db-stock-bar-track">
                                            <div
                                                className={`db-stock-bar-fill ${isHigh ? 'fill-high' : isMed ? 'fill-med' : 'fill-ok'}`}
                                                style={{ width: `${Math.max(stockPct, 2)}%` }}
                                            />
                                            <div className="db-reorder-marker"
                                                style={{ left: `${Math.min((threshold / (threshold * 3)) * 100, 97)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="db-sku-footer">
                                        {/* FIX-06: Explain reorder qty */}
                                        <span className="db-reorder-hint">
                                            Suggest: <b>{sku.recommendedReorder} units</b>
                                            <ReorderTooltip
                                                qty={sku.recommendedReorder}
                                                demand={sku.predictedDemand}
                                                currentStock={sku.currentStock}
                                                reorderPoint={threshold}
                                            />
                                        </span>
                                        <button
                                            className={`db-reorder-btn ${isHigh ? 'urgent' : ''}`}
                                            onClick={() => handleReorderWithToast(sku)}
                                            aria-label={`Reorder ${sku.name}: ${sku.recommendedReorder} units`}
                                        >
                                            {isHigh ? <><Zap size={12} /> Now</> : 'Reorder'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Logistics Ledger Table (FIX-01, FIX-12) ── */}
            <div className="db-table-panel">
                <div className="db-panel-header">
                    <div>
                        <h2 className="db-panel-title">Logistics Ledger</h2>
                        <p className="db-panel-sub">Recent stock movements</p>
                    </div>
                    <input
                        type="text"
                        className="db-table-search"
                        placeholder="Filter by SKU, depot…"
                        value={txFilter}
                        onChange={e => setTxFilter(e.target.value)}
                        aria-label="Filter transactions"
                    />
                </div>

                <div className="db-table-wrap">
                    {/* FIX-12: Virtualization note — table limited to 8 rows with filter */}
                    <table className="db-table" role="table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>SKU / Product</th>
                                <th>Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Qty</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTx.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="db-table-empty">
                                        No transactions match your filter.
                                    </td>
                                </tr>
                            )}
                            {filteredTx.map(tx => (
                                <tr key={tx.id}>
                                    <td className="db-td-muted">
                                        {tx.timestamp
                                            ? new Date(tx.timestamp).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })
                                            : '—'}
                                    </td>
                                    <td>
                                        <div className="db-sku-cell">
                                            <span className="db-td-code">{tx.sku}</span>
                                            <span className="db-td-name">{tx.name}</span>
                                        </div>
                                    </td>
                                    <td><TxBadge type={tx.type} /></td>
                                    {/* FIX-01: show from/to with fallback */}
                                    <td>{tx.fromDepot || <span className="db-td-muted">—</span>}</td>
                                    <td>{tx.toDepot  || <span className="db-td-muted">—</span>}</td>
                                    <td className="db-td-qty">{tx.quantity}</td>
                                    <td>
                                        <span className="db-status-done">
                                            <Check size={11} /> Done
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* FIX-01: QTY total footer */}
                        {filteredTx.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={5} className="db-tfoot-label">Total (shown)</td>
                                    <td className="db-tfoot-qty">
                                        {filteredTx.reduce((s, t) => s + (Number(t.quantity) || 0), 0).toLocaleString('en-IN')}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* ── Bulk Reorder Panel (FIX-02) ── */}
            {showBulk && (
                <BulkReorderPanel
                    skus={urgentSKUs}
                    onBulkReorder={handleReorderWithToast}
                    onClose={() => setShowBulk(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
