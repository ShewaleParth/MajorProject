import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ShieldAlert,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { riskApi } from './riskApi';
import SupplierDetail from './SupplierDetail';

const SupplierRadar = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await riskApi.getRiskOverview();
            if (data.success) {
                setSuppliers(data.suppliers);
            }
        } catch (error) {
            console.error("Error loading suppliers");
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Scanning Supply Chain Risks...</p></div>;

    return (
        <div className="supplier-radar-container">
            <div className="table-controls">
                <div className="search-filter-group">
                    <div className="mini-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search suppliers or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="status-badge" style={{ background: 'var(--bg-card)' }}>
                        <ShieldAlert size={14} />
                        <span>{suppliers.length} Nodes Monitored</span>
                    </div>
                </div>
                <button className="add-items-btn" onClick={loadData}>Refresh Intel</button>
            </div>

            <div className="decision-table-container">
                <table className="decision-table">
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Category</th>
                            <th>Avg. Delay</th>
                            <th>Fulfillment</th>
                            <th>Quality</th>
                            <th>Risk Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map((s, idx) => (
                            <tr key={idx} onClick={() => setSelectedSupplier(s)}>
                                <td className="font-medium">{s.supplier}</td>
                                <td><span className="sku-label" style={{ margin: 0 }}>{s.category}</span></td>
                                <td>
                                    <div className="d-flex align-items-center gap-1">
                                        <Clock size={14} className="text-muted" />
                                        {s.avg_delay}d
                                    </div>
                                </td>
                                <td className={s.avg_fulfillment < 90 ? 'text-danger' : 'text-success'}>
                                    {s.avg_fulfillment}%
                                </td>
                                <td>
                                    {s.avg_rejection > 5 ? (
                                        <span className="trend-indicator negative">
                                            <AlertTriangle size={12} /> {s.avg_rejection}% rejection
                                        </span>
                                    ) : (
                                        <span className="trend-indicator positive">
                                            <CheckCircle size={12} /> {100 - s.avg_rejection}%
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="mini-progress" style={{ width: '60px', height: '6px' }}>
                                            <div
                                                className="mini-fill"
                                                style={{
                                                    width: `${s.risk_score}%`,
                                                    backgroundColor: s.risk_level === 'High' ? 'var(--danger)' :
                                                        s.risk_level === 'Medium' ? 'var(--warning)' : 'var(--success)'
                                                }}
                                            ></div>
                                        </div>
                                        <span className={`risk-badge ${s.risk_level.toLowerCase()}`}>
                                            {s.risk_score}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <button className="action-btn">
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedSupplier && (
                <SupplierDetail
                    supplier={selectedSupplier}
                    onClose={() => setSelectedSupplier(null)}
                />
            )}
        </div>
    );
};

export default SupplierRadar;
