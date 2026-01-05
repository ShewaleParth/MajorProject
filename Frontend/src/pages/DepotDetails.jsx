import React, { useState, useEffect } from 'react';
import { ArrowLeft, Warehouse, MapPin, Package, TrendingUp, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { api } from '../utils/api';

const DepotDetails = ({ depotId, onBack }) => {
    const [depot, setDepot] = useState(null);
    const [products, setProducts] = useState([]);
    const [recentMovements, setRecentMovements] = useState([]);
    const [utilizationHistory, setUtilizationHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDepotDetails();
    }, [depotId]);

    const fetchDepotDetails = async () => {
        setLoading(true);
        try {
            const response = await api.getDepotDetails(depotId);
            setDepot(response.depot);
            setProducts(response.products || []);
            setRecentMovements(response.recentMovements || []);
            setUtilizationHistory(response.utilizationHistory || []);
        } catch (error) {
            console.error('Error fetching depot details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state-purple">
                <div className="spinner"></div>
                <p>Loading depot details...</p>
            </div>
        );
    }

    if (!depot) {
        return (
            <div className="placeholder-view">
                <h2>Depot Not Found</h2>
                <button onClick={onBack} className="reorder-btn">Go Back</button>
            </div>
        );
    }

    const utilizationPercent = depot.capacity > 0 ? ((depot.currentUtilization / depot.capacity) * 100).toFixed(1) : 0;
    const getStatusColor = (status) => {
        if (status === 'critical') return '#ef4444';
        if (status === 'warning') return '#f59e0b';
        return '#10b981';
    };

    const filteredProducts = products.filter(p =>
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productSku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="depot-details-container">
            {/* Header */}
            <div className="depot-details-header">
                <button onClick={onBack} className="back-btn">
                    <ArrowLeft size={20} /> Back to Depots
                </button>
                <div className="depot-title-section">
                    <div className="depot-icon-large">
                        <Warehouse size={32} />
                    </div>
                    <div>
                        <h1>{depot.name}</h1>
                        <div className="location-info">
                            <MapPin size={16} /> {depot.location}
                        </div>
                    </div>
                    <div className={`status-badge status-${depot.status}`}>
                        {depot.status.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Capacity Overview */}
            <div className="capacity-overview-card">
                <h2>Capacity Overview</h2>
                <div className="capacity-stats">
                    <div className="capacity-stat">
                        <span className="label">Current Occupancy</span>
                        <span className="value">{depot.currentUtilization?.toLocaleString()} units</span>
                    </div>
                    <div className="capacity-stat">
                        <span className="label">Total Capacity</span>
                        <span className="value">{depot.capacity?.toLocaleString()} units</span>
                    </div>
                    <div className="capacity-stat">
                        <span className="label">Utilization</span>
                        <span className="value" style={{ color: getStatusColor(depot.status) }}>
                            {utilizationPercent}%
                        </span>
                    </div>
                </div>
                <div className="capacity-bar-container">
                    <div
                        className="capacity-bar-fill"
                        style={{
                            width: `${Math.min(utilizationPercent, 100)}%`,
                            backgroundColor: getStatusColor(depot.status)
                        }}
                    ></div>
                    {utilizationPercent >= 85 && (
                        <div className="capacity-threshold warning" style={{ left: '85%' }}></div>
                    )}
                    {utilizationPercent >= 95 && (
                        <div className="capacity-threshold critical" style={{ left: '95%' }}></div>
                    )}
                </div>
                {utilizationPercent >= 85 && (
                    <div className="capacity-warning">
                        <AlertTriangle size={16} />
                        <span>
                            {utilizationPercent >= 95
                                ? 'Critical: Depot is at or near maximum capacity!'
                                : 'Warning: Depot utilization is high. Consider redistribution.'}
                        </span>
                    </div>
                )}
            </div>

            {/* Inventory Table */}
            <div className="inventory-section">
                <div className="section-header">
                    <h2><Package size={20} /> Inventory ({depot.itemsStored} SKUs)</h2>
                    <input
                        type="text"
                        placeholder="Search by SKU or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="inventory-table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((item, idx) => (
                                    <tr key={idx}>
                                        <td><code>{item.productSku}</code></td>
                                        <td>{item.productName}</td>
                                        <td>{item.product?.category || 'N/A'}</td>
                                        <td><strong>{item.quantity}</strong></td>
                                        <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm ? 'No products match your search' : 'No inventory in this depot'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Movements */}
            <div className="movements-section">
                <h2><Activity size={20} /> Recent Inventory Movements</h2>
                <div className="movements-list">
                    {recentMovements && recentMovements.length > 0 ? (
                        recentMovements.slice(0, 20).map((movement, idx) => (
                            <div key={idx} className="movement-item">
                                <div className="movement-icon">
                                    <Calendar size={16} />
                                </div>
                                <div className="movement-details">
                                    <div className="movement-header">
                                        <span className={`movement-type ${movement.transactionType}`}>
                                            {movement.transactionType.toUpperCase()}
                                        </span>
                                        <span className="movement-date">
                                            {new Date(movement.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="movement-info">
                                        <strong>{movement.productName}</strong> ({movement.productSku})
                                        <span className="movement-quantity">Qty: {movement.quantity}</span>
                                    </div>
                                    {movement.fromDepot && movement.toDepot && (
                                        <div className="movement-route">
                                            {movement.fromDepot} → {movement.toDepot}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No recent movements recorded</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepotDetails;
