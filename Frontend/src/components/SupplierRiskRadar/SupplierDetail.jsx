import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { X, ShieldAlert, TrendingUp, AlertCircle } from 'lucide-react';
import { riskApi } from './riskApi';

const SupplierDetail = ({ supplier, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await riskApi.getSupplierHistory(supplier.supplier);
                if (data.success) {
                    setHistory(data.trend);
                }
            } catch (error) {
                console.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [supplier]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="drilldown-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="title-group">
                        <ShieldAlert className="text-primary" />
                        <div>
                            <h3>{supplier.supplier}</h3>
                            <span className="sku-label">{supplier.category}</span>
                        </div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}><X /></button>
                </div>

                <div className="modal-body">
                    <div className="modal-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="chart-card">
                            <div className="section-header">
                                <h3><TrendingUp size={18} /> Risk Trend (Last 10 Orders)</h3>
                            </div>
                            <div style={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                        <XAxis dataKey="date" fontSize={10} hide />
                                        <YAxis fontSize={10} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="rejection" stroke="#ef4444" name="Rejection %" />
                                        <Line type="monotone" dataKey="delay" stroke="#f59e0b" name="Delay Days" />
                                        <Line type="monotone" dataKey="fulfillment" stroke="#10b981" name="Fulfillment %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="details-panel">
                            <div className="chart-card">
                                <div className="detail-item">
                                    <span className="label">Current Risk Score</span>
                                    <span className="value" style={{
                                        color: supplier.risk_level === 'High' ? 'var(--danger)' :
                                            supplier.risk_level === 'Medium' ? 'var(--warning)' : 'var(--success)'
                                    }}>
                                        {supplier.risk_score}/100
                                    </span>
                                </div>
                                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                                <div className="detail-item">
                                    <span className="label">Average Delay</span>
                                    <span className="value">{supplier.avg_delay} Days</span>
                                </div>
                                <div className="detail-item mt-3">
                                    <span className="label">Avg Quality score</span>
                                    <span className="value">{100 - supplier.avg_rejection}%</span>
                                </div>
                            </div>

                            <div className="ai-insight-box mt-3" style={{ background: 'var(--primary-glow)', padding: '16px', borderRadius: '12px' }}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <AlertCircle size={16} className="text-primary" />
                                    <strong>AI Risk Assessment</strong>
                                </div>
                                <p style={{ fontSize: '12px', margin: 0 }}>
                                    {supplier.risk_level === 'High'
                                        ? "This supplier is showing multiple risk flags. New orders should be limited and alternatives explored."
                                        : "Supplier performance is within acceptable thresholds. No immediate action required."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDetail;
