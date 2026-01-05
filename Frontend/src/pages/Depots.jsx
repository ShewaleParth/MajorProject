import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, BarChart3, Package, ShieldCheck, AlertTriangle, Search, Plus, ExternalLink, X } from 'lucide-react';
import { api } from '../utils/api';
import DepotDetails from './DepotDetails';

const AddDepotModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: 10000,
        currentUtilization: 0,
        itemsStored: 0
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
        setFormData({ name: '', location: '', capacity: 10000, currentUtilization: 0, itemsStored: 0 });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Register New Depot</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="add-item-form">
                    <div className="form-group">
                        <label>Depot Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Bangalore Distribution Center" />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Karnataka, India" />
                    </div>
                    <div className="form-group">
                        <label>Total Capacity (Units)</label>
                        <input type="number" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="10000" />
                    </div>
                    <button type="submit" className="submit-btn-purple">Create Depot</button>
                </form>
            </div>
        </div>
    );
};

const DepotCard = ({ depot, onViewDetails }) => {
    const utilization = Math.round((depot.currentUtilization / depot.capacity) * 100) || 0;
    const getStatusColor = (u) => {
        if (u > 85) return '#ef4444'; // Critical
        if (u > 60) return '#f59e0b'; // Warning
        return '#10b981'; // Healthy
    };

    return (
        <div className="depot-card-premium">
            <div className="depot-card-header">
                <div className="depot-icon-wrapper">
                    <Warehouse size={24} />
                </div>
                <div className="depot-header-info">
                    <h3>{depot.name}</h3>
                    <div className="location-pill">
                        <MapPin size={12} /> {depot.location}
                    </div>
                </div>
                <div className="status-indicator" style={{ backgroundColor: getStatusColor(utilization) }}></div>
            </div>

            <div className="depot-stats-grid">
                <div className="depot-stat-item">
                    <span className="label">Utilization</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${utilization}%`, backgroundColor: getStatusColor(utilization) }}></div>
                    </div>
                    <span className="value">{utilization}%</span>
                </div>
                <div className="depot-stat-item">
                    <span className="label">Items Stored</span>
                    <span className="value-large">{depot.itemsStored} <span className="text-muted-sm">SKUs</span></span>
                </div>
            </div>

            <div className="depot-footer">
                <div className="capacity-info">
                    <BarChart3 size={14} />
                    <span>Cap: {depot.capacity?.toLocaleString()} units</span>
                </div>
                <button className="view-inventory-btn" onClick={() => onViewDetails(depot.id || depot._id)}>
                    View Details <ExternalLink size={14} />
                </button>
            </div>
        </div>
    );
};

const Depots = () => {
    const [depots, setDepots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'
    const [selectedDepotId, setSelectedDepotId] = useState(null);
    const [stats, setStats] = useState({
        totalCapacity: 0,
        totalStored: 0,
        avgUtilization: 0
    });

    const fetchDepots = async () => {
        setLoading(true);
        try {
            const response = await api.getDepots();
            if (response && response.depots) {
                setDepots(response.depots);

                // Calculate summary stats
                const totalCap = response.depots.reduce((acc, d) => acc + (d.capacity || 0), 0);
                const totalStored = response.depots.reduce((acc, d) => acc + (d.currentUtilization || 0), 0);
                const avgUtil = totalCap > 0 ? (totalStored / totalCap) * 100 : 0;

                setStats({
                    totalCapacity: totalCap,
                    totalStored: totalStored,
                    avgUtilization: Math.round(avgUtil)
                });
            }
        } catch (error) {
            console.error('Error fetching depots:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepots();
    }, []);

    const handleAddDepot = async (newDepot) => {
        try {
            const response = await api.createDepot(newDepot);
            if (response.message === 'Depot created successfully') {
                fetchDepots();
            }
        } catch (error) {
            console.error('Failed to add depot:', error);
            alert(`Error adding depot: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleViewDetails = (depotId) => {
        setSelectedDepotId(depotId);
        setCurrentView('details');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedDepotId(null);
        fetchDepots(); // Refresh data when returning to list
    };

    // Show depot details view
    if (currentView === 'details' && selectedDepotId) {
        return <DepotDetails depotId={selectedDepotId} onBack={handleBackToList} />;
    }

    return (
        <div className="depots-page-container">
            <AddDepotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddDepot}
            />

            <div className="depots-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1>Depot Management</h1>
                    <p className="text-muted">Monitor storage capacity and SKU distribution across your network.</p>
                </div>
                <button className="add-items-btn" onClick={() => setIsModalOpen(true)}>
                    Register New Depot <Plus size={18} />
                </button>
            </div>

            <div className="depots-summary-grid">
                <div className="summary-metric-card">
                    <div className="icon purple"><ShieldCheck /></div>
                    <div className="info">
                        <span className="label">Network Health</span>
                        <span className="value">{stats.avgUtilization < 80 ? 'Optimal' : 'Caution'}</span>
                    </div>
                </div>
                <div className="summary-metric-card">
                    <div className="icon green"><Package /></div>
                    <div className="info">
                        <span className="label">Total Occupancy</span>
                        <span className="value">{stats.totalStored.toLocaleString()} / {stats.totalCapacity.toLocaleString()}</span>
                    </div>
                </div>
                <div className="summary-metric-card">
                    <div className="icon orange"><AlertTriangle /></div>
                    <div className="info">
                        <span className="label">Avg. Utilization</span>
                        <span className="value">{stats.avgUtilization}%</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state-purple">
                    <div className="spinner"></div>
                    <p>Scanning network nodes...</p>
                </div>
            ) : (
                <div className="depots-grid">
                    {depots.map(depot => (
                        <DepotCard key={depot._id || depot.id} depot={depot} onViewDetails={handleViewDetails} />
                    ))}

                    <div className="depot-card-add" onClick={() => setIsModalOpen(true)}>
                        <div className="add-icon"><Plus size={32} /></div>
                        <h3>Add New Node</h3>
                        <p>Expand your logistics network</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Depots;
