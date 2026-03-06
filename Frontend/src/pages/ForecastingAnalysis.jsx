import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ShieldAlert,
    AlertTriangle,
    CheckCircle,
    Clock,
    BrainCircuit,
    ChevronRight,
    X,
    LayoutDashboard,
    ArrowRightLeft,
    TrendingUp,
    Zap,
    AlertCircle,
    Activity,
    Compass
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { riskApi } from '../components/SupplierRiskRadar/riskApi';
import '../styles/SupplierIntelligence.css';

const ForecastingAnalysis = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [actionPlan, setActionPlan] = useState(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await riskApi.getRiskOverview();

            // 🔍 DEBUG LOGS
            console.log('🔍 Risk API Response:', data);
            console.log('📊 Suppliers Array:', data.suppliers);
            if (data.suppliers && data.suppliers.length > 0) {
                console.log('📈 First Supplier:', data.suppliers[0]);
                console.log('🎯 Risk Score:', data.suppliers[0].risk_score);
                console.log('⚠️ Risk Level:', data.suppliers[0].risk_level);
            }

            if (data.success) {
                setSuppliers(data.suppliers);
            }
        } catch (error) {
            console.error("❌ Error loading suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s =>
            s.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    const stats = useMemo(() => {
        const counts = { critical: 0, high: 0, stable: 0 };
        suppliers.forEach(s => {
            if (s.risk_score > 75) counts.critical++;
            else if (s.risk_score > 50) counts.high++;
            else counts.stable++;
        });
        return counts;
    }, [suppliers]);

    // KPIs computed from live supplier data
    const kpis = useMemo(() => {
        if (suppliers.length === 0) return { riskEvents: 0, avgDelay: '0.0', qualityFail: '0.0', lossRisk: '0.0' };
        const riskEvents = suppliers.filter(s => s.risk_score > 30).length;
        const avgDelay = (suppliers.reduce((sum, s) => sum + (s.avg_delay || 0), 0) / suppliers.length).toFixed(1);
        const qualityFail = (suppliers.reduce((sum, s) => sum + (s.avg_rejection || 0), 0) / suppliers.length).toFixed(1);
        const highRiskCount = suppliers.filter(s => s.risk_level === 'High').length;
        const lossLakh = ((highRiskCount * 0.4) + (riskEvents * 0.1)).toFixed(1);
        return { riskEvents, avgDelay, qualityFail, lossRisk: lossLakh };
    }, [suppliers]);

    // Live alerts built from real high-risk suppliers
    const liveAlerts = useMemo(() => {
        const alerts = [];
        const sorted = [...suppliers].sort((a, b) => b.risk_score - a.risk_score);
        sorted.forEach(s => {
            if (s.risk_score > 60)
                alerts.push({ type: 'critical', text: `${s.supplier} – Delay probability ${s.avg_delay > 5 ? 'crossed 70%' : 'elevated at ' + Math.round(s.avg_delay * 10) + '%'}`, meta: `Risk Score ${s.risk_score} • Critical` });
            else if (s.risk_score > 35)
                alerts.push({ type: 'warning', text: `${s.supplier} – Quality rejection at ${s.avg_rejection}%`, meta: `${s.category} • Warning` });
            else if (s.risk_score <= 20)
                alerts.push({ type: 'success', text: `${s.supplier} stabilized fulfillment to ${s.avg_fulfillment}%`, meta: 'Positive Trend' });
        });
        if (sorted.length > 0)
            alerts.push({ type: 'info', text: `Suggested review pricing with ${sorted[sorted.length - 1].supplier}`, meta: 'Strategic Insight' });
        return alerts.slice(0, 4);
    }, [suppliers]);

    const getScoreColor = (score) => {
        if (score > 75) return '#ef4444'; // Red
        if (score > 50) return '#f59e0b'; // Orange
        if (score > 25) return '#eab308'; // Yellow
        return '#10b981'; // Green
    };

    const generateActionPlan = (supplier) => {
        setIsGeneratingPlan(true);
        // Simulate AI analysis time
        setTimeout(() => {
            const plan = {
                id: `CAP-${Math.floor(Math.random() * 9000) + 1000}`,
                timestamp: new Date().toLocaleString(),
                supplier: supplier.supplier,
                priority: supplier.risk_score > 70 ? "CRITICAL" : "HIGH",
                actions: [
                    { title: "Immediate Logistic Diversification", detail: `Relocate 25% of current pending volume for ${supplier.category} to secondary back-up vendors.` },
                    { title: "Payment Cycle Audit", detail: "Investigate recorded payment lags in regional transit hubs mentioned in AI analysis." },
                    { title: "Quality Threshold Clause", detail: "Enforce strict quality inspection at source for the next 4 shipment cycles." },
                    { title: "Executive Review", detail: "Schedule a high-priority procurement meeting with vendor leadership." }
                ]
            };
            setActionPlan(plan);
            setIsGeneratingPlan(false);
        }, 1500);
    };

    if (loading) return (
        <div className="loading-state-purple">
            <div className="spinner"></div>
            <p>Syncing Command Center Intelligence...</p>
        </div>
    );

    return (
        <div className="supplier-command-center">
            {/* 1. Header Row */}
            <header className="command-header">
                <div className="header-title-group">
                    <h1>Supplier Risk Radar</h1>
                    <p>Live Procurement Threat Intelligence</p>
                </div>
                <div className="header-summary-stats">
                    <div className="stat-pill"><div className="dot" style={{ backgroundColor: '#ef4444' }}></div> {stats.critical} Critical</div>
                    <div className="stat-pill"><div className="dot" style={{ backgroundColor: '#f59e0b' }}></div> {stats.high} High Risk</div>
                    <div className="stat-pill"><div className="dot" style={{ backgroundColor: '#10b981' }}></div> {stats.stable} Stable</div>
                </div>
            </header>

            {/* 2. KPI row — all values from real supplier data */}
            <div className="kpi-row">
                <div className="kpi-card-v2">
                    <span className="label">Active Risk Events</span>
                    <div className="value" style={{ color: kpis.riskEvents > 0 ? '#ef4444' : '#10b981' }}>{kpis.riskEvents}</div>
                </div>
                <div className="kpi-card-v2">
                    <span className="label">Avg Delivery Delay</span>
                    <div className="value">{kpis.avgDelay} Days</div>
                </div>
                <div className="kpi-card-v2">
                    <span className="label">Quality Failures</span>
                    <div className="value" style={{ color: parseFloat(kpis.qualityFail) > 10 ? '#ef4444' : parseFloat(kpis.qualityFail) > 5 ? '#f59e0b' : '#10b981' }}>{kpis.qualityFail}%</div>
                </div>
                <div className="kpi-card-v2">
                    <span className="label">Procurement Loss Risk</span>
                    <div className="value">₹{kpis.lossRisk}L</div>
                </div>
            </div>

            {/* 3. Main Grid */}
            <div className="command-grid">
                {/* Table Side */}
                <div className="table-panel">
                    <div className="table-header-alt">
                        <div className="d-flex align-items-center gap-4">
                            <h2>Risk Radar</h2>
                            <div className="mini-search" style={{ margin: 0 }}>
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search Suppliers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="table-tracking-info">
                            Currently tracking {suppliers.length} active supplier{suppliers.length !== 1 ? 's' : ''}
                            {suppliers.length > 0 && ` across ${[...new Set(suppliers.map(s => s.category))].length} categories`}
                        </div>
                    </div>

                    <div className="table-responsive-wrapper">
                        <table className="radar-table-v2">
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Delay Risk</th>
                                    <th>Quality Risk</th>
                                    <th>Fulfilment</th>
                                    <th>Risk Score</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.map((s, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="font-bold">{s.supplier}</div>
                                            <div className="text-muted text-xs">{s.category}</div>
                                        </td>
                                        <td>
                                            <div className="risk-bar-container">
                                                <div className="risk-bar-fill" style={{ width: `${s.avg_delay * 10}%`, backgroundColor: '#f59e0b' }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="risk-bar-container">
                                                <div className="risk-bar-fill" style={{ width: `${s.avg_rejection * 15}%`, backgroundColor: '#ef4444' }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="risk-bar-container">
                                                <div className="risk-bar-fill" style={{ width: `${s.avg_fulfillment}%`, backgroundColor: '#10b981' }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="risk-score-badge" style={{ backgroundColor: getScoreColor(s.risk_score) }}>
                                                {s.risk_score}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${s.risk_level.toLowerCase() === 'high' ? 'critical' : s.risk_level.toLowerCase() === 'medium' ? 'risky' : 'safe'}`}>
                                                {s.risk_level}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="view-profile-btn" onClick={() => setSelectedSupplier(s)}>View Profile</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Ops Feed — dynamic alerts from real supplier data */}
                <aside className="ai-ops-feed">
                    <div className="feed-header">
                        <BrainCircuit size={20} className="text-primary" />
                        Live Alerts Panel
                    </div>

                    {liveAlerts.length === 0 && (
                        <div className="alert-item">
                            <div className="alert-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                                <CheckCircle size={18} />
                            </div>
                            <div className="alert-content">
                                <div className="alert-text">All suppliers within safe thresholds</div>
                                <div className="alert-meta">No active alerts</div>
                            </div>
                        </div>
                    )}

                    {liveAlerts.map((alert, i) => (
                        <div key={i} className={`alert-item ${alert.type === 'critical' ? 'pulse-red' : ''}`}>
                            <div className="alert-icon" style={{
                                backgroundColor: alert.type === 'critical' ? '#fee2e2' : alert.type === 'warning' ? '#ffedd5' : alert.type === 'success' ? '#d1fae5' : '#dbeafe',
                                color: alert.type === 'critical' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : alert.type === 'success' ? '#10b981' : '#3b82f6'
                            }}>
                                {alert.type === 'critical' ? <AlertCircle size={18} /> : alert.type === 'warning' ? <AlertTriangle size={18} /> : alert.type === 'success' ? <CheckCircle size={18} /> : <BrainCircuit size={18} />}
                            </div>
                            <div className="alert-content">
                                <div className="alert-text">{alert.text}</div>
                                <div className="alert-meta">{alert.meta}</div>
                            </div>
                        </div>
                    ))}
                </aside>
            </div>

            {/* Drill-down Drawer */}
            <AnimatePresence>
                {selectedSupplier && (
                    <div className="intel-drawer-overlay" onClick={() => setSelectedSupplier(null)}>
                        <motion.div
                            className="intel-drawer"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="drawer-header" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <h2 className="text-2xl font-black">{selectedSupplier.supplier}</h2>
                                    <p className="text-muted font-bold text-xs uppercase">{selectedSupplier.category} Intelligence Profile</p>
                                </div>
                                <button className="close-btn" style={{ background: 'var(--bg-main)', padding: '8px', borderRadius: '50%' }} onClick={() => setSelectedSupplier(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="drawer-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', padding: '32px' }}>
                                <div className="drawer-left">
                                    <div className="drawer-chart-card">
                                        <h3 className="font-bold mb-4">Delay & Quality Trends</h3>
                                        <div style={{ height: 280 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    { month: 'Jan', delay: 2, qual: 98 },
                                                    { month: 'Feb', delay: 4, qual: 95 },
                                                    { month: 'Mar', delay: 3, qual: 97 },
                                                    { month: 'Apr', delay: 5, qual: 92 },
                                                    { month: 'May', delay: 6, qual: 90 },
                                                    { month: 'Jun', delay: selectedSupplier.avg_delay, qual: 100 - selectedSupplier.avg_rejection },
                                                ]}>
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="qual" stroke="#10b981" fill="#10b98122" name="Quality Score" />
                                                    <Line type="monotone" dataKey="delay" stroke="#ef4444" strokeWidth={3} name="Delay Days" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-4 mt-6">
                                        <div className="kpi-card-v2 w-full">
                                            <span className="label">Fulfillment Reliability</span>
                                            <div className="value">{selectedSupplier.avg_fulfillment}%</div>
                                        </div>
                                        <div className="kpi-card-v2 w-full">
                                            <span className="label">Avg Lead Time</span>
                                            <div className="value" style={{ color: selectedSupplier.avg_delay > 5 ? '#ef4444' : '#10b981' }}>
                                                {selectedSupplier.avg_delay}d
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="drawer-right drawer-insight-section">
                                    <h3 className="font-black text-lg mb-4">AI Explanation</h3>

                                    <div className="ai-reason-bubble">
                                        {selectedSupplier.avg_delay > 5
                                            ? `"Avg delivery delay of ${selectedSupplier.avg_delay} days detected. Supplier exceeds the safe 5-day threshold."`
                                            : `"Delivery delay within safe range at ${selectedSupplier.avg_delay} days. No delay risk detected."`}
                                    </div>

                                    <div className="ai-reason-bubble" style={{ borderColor: selectedSupplier.avg_rejection > 10 ? '#ef4444' : '#10b981' }}>
                                        {selectedSupplier.avg_rejection > 10
                                            ? `"Quality rejection rate of ${selectedSupplier.avg_rejection}% exceeds 10% alert threshold. Inspect incoming batches."`
                                            : `"Fulfilment reliability at ${selectedSupplier.avg_fulfillment}%. Quality is within acceptable range."`}
                                    </div>

                                    <div className="ai-reason-bubble" style={{ borderColor: '#10b981' }}>
                                        {selectedSupplier.risk_level === 'High'
                                            ? `"Recommendation: Reduce orders from ${selectedSupplier.supplier} by 20-30% and explore alternate ${selectedSupplier.category} vendors."`
                                            : selectedSupplier.risk_level === 'Medium'
                                                ? `"Monitor ${selectedSupplier.supplier} closely. Diversify ${selectedSupplier.category} sourcing if delays persist."`
                                                : `"${selectedSupplier.supplier} is a reliable vendor. Consider increasing ${selectedSupplier.category} order volume."`}
                                    </div>

                                    <button
                                        className={`add-items-btn w-full mt-auto ${isGeneratingPlan ? 'opacity-50 pointer-events-none' : ''}`}
                                        onClick={() => generateActionPlan(selectedSupplier)}
                                    >
                                        {isGeneratingPlan ? 'Generating Plan...' : 'Generate Corrective Action Plan'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Action Plan Modal */}
            <AnimatePresence>
                {actionPlan && (
                    <div className="intel-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setActionPlan(null)}>
                        <motion.div
                            className="drilldown-modal"
                            style={{ maxWidth: '600px', width: '90%' }}
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="intel-modal-header d-flex justify-content-between">
                                <div>
                                    <h3 className="font-bold">Corrective Action Plan (CAP)</h3>
                                    <p className="text-xs text-muted">Ref ID: {actionPlan.id} • {actionPlan.timestamp}</p>
                                </div>
                                <button className="close-btn" onClick={() => setActionPlan(null)}><X /></button>
                            </div>
                            <div className="intel-modal-body p-4">
                                <div className="alert-item mb-4" style={{ backgroundColor: actionPlan.priority === 'CRITICAL' ? '#fee2e2' : '#ffedd5' }}>
                                    <div className="alert-icon" style={{ color: actionPlan.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b' }}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-text">Priority: {actionPlan.priority}</div>
                                        <div className="alert-meta">AI-Generated Strategy for {actionPlan.supplier}</div>
                                    </div>
                                </div>

                                <div className="action-list">
                                    {actionPlan.actions.map((act, i) => (
                                        <div key={i} className="task-item mb-3" style={{ display: 'block', padding: '16px' }}>
                                            <div className="font-bold text-primary mb-1 d-flex align-items-center gap-2">
                                                <Zap size={14} /> {act.title}
                                            </div>
                                            <div className="text-sm text-muted">{act.detail}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex gap-3 mt-6">
                                    <button className="add-items-btn w-full" onClick={() => {
                                        alert("Action Plan Exported to PDF & Shared with Procurement Team");
                                        setActionPlan(null);
                                    }}>Execute & Share CAP</button>
                                    <button className="view-profile-btn" onClick={() => setActionPlan(null)}>Dismiss</button>
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
