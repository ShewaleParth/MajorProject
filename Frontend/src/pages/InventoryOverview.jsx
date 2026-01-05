import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, ChevronDown, MoreHorizontal, Grid, List, TrendingUp, Package, DollarSign, X, Upload } from 'lucide-react';
import { api } from '../utils/api';
import ForecastModal from '../components/ForecastModal';

const AddItemModal = ({ isOpen, onClose, onAdd, depots }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Sneakers',
        price: '',
        stock: '',
        size: '38 - 49',
        brand: 'Nike',
        supplier: 'Default Supplier',
        depotId: '',
        image: ''
    });

    useEffect(() => {
        if (isOpen && depots.length > 0 && !formData.depotId) {
            setFormData(prev => ({ ...prev, depotId: depots[0].id || depots[0]._id }));
        }
    }, [isOpen, depots]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
        setFormData({ name: '', sku: '', category: 'Sneakers', price: '', stock: '', size: '38 - 49', brand: 'Nike', supplier: 'Default Supplier', depotId: '', image: '' });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Inventory Item</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="add-item-form">
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Air Jordan 1" />
                        </div>
                        <div className="form-group">
                            <label>SKU / ID Number</label>
                            <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. AJ1-CHI" />
                        </div>
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option>Sneakers</option>
                                <option>Electronics</option>
                                <option>Apparel</option>
                                <option>Accessories</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Brand</label>
                            <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="Nike, Apple, etc." />
                        </div>
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label>Initial Stock</label>
                            <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Storage Depot</label>
                        <select required value={formData.depotId} onChange={e => setFormData({ ...formData, depotId: e.target.value })}>
                            {depots.length === 0 && <option value="">Loading depots...</option>}
                            {depots.map(d => (
                                <option key={d.id || d._id} value={d.id || d._id}>{d.name} ({d.location})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Product Image</label>
                        <div className="image-mode-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                            <span className="text-muted-sm">Paste URL or Upload File:</span>
                        </div>
                        <div className="image-inputs-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                className="url-input-custom"
                                style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}
                            />
                            <div className="image-upload-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input-custom" />
                                {formData.image && (
                                    <div className="preview-box">
                                        <img src={formData.image} alt="Preview" className="image-preview-small" style={{ display: 'block' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="submit-btn-purple">Create Item</button>
                </form>
            </div>
        </div>
    );
};

const InventoryOverview = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [depots, setDepots] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDepot, setSelectedDepot] = useState('All');
    const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
    const [selectedProductForForecast, setSelectedProductForForecast] = useState(null);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsData, depotsData] = await Promise.all([
                api.getProducts(),
                api.getDepots()
            ]);

            if (productsData && productsData.products) {
                const enhancedProducts = productsData.products.map(p => ({
                    ...p,
                    size: p.size || '38 - 49',
                    brand: p.brand || 'Generic',
                    year: p.year || 2024,
                    cost: p.cost || '10%',
                    origin: p.origin || 'International',
                    // Keep raw image separate from display image to avoid pre-filling placeholders into edit modal
                    displayImage: p.image && p.image.trim() !== '' ? p.image : `https://api.dicebear.com/7.x/identicon/svg?seed=${p.sku}`
                }));
                setProducts(enhancedProducts);
            } else {
                setProducts([]);
            }

            if (depotsData && depotsData.depots) {
                setDepots(depotsData.depots);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddProduct = async (newProduct) => {
        try {
            if (!newProduct.depotId) {
                alert('Please select a storage depot.');
                return;
            }

            const payload = {
                ...newProduct,
                depotQuantity: parseInt(newProduct.stock),
                reorderPoint: Math.floor(parseInt(newProduct.stock) * 0.2)
            };

            const response = await api.createProduct(payload);
            if (response.message === 'Product created successfully') {
                fetchData();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to add product:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.deleteProduct(id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Error deleting product.');
            }
        }
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleEditProduct = (product) => {
        // Use raw image when editing, not the identicon display image
        setEditingProduct({ ...product, image: product.image || '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (id, updatedData) => {
        try {
            await api.updateProduct(id, updatedData);
            fetchData();
            setIsEditModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Error updating product.');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split(/\r?\n/).filter(r => r.trim());
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

            const items = rows.slice(1).map(row => {
                // Regex to handle CSV with quoted fields containing commas
                const values = row.match(/(\"([^\"]*)\"|[^,]+)/g).map(v => v.replace(/^\"|\"$/g, '').trim());
                const item = {};
                headers.forEach((h, i) => {
                    item[h] = values[i];
                });
                return item;
            });

            try {
                const response = await api.bulkUpload(items);
                alert(`Successfully processed ${response.results.success} items!`);
                fetchData();
            } catch (error) {
                console.error('Failed to upload CSV:', error);
                alert('Error uploading CSV. Please ensure the format is correct (sku, name, category, stock, price, etc.)');
            }
        };
        reader.readAsText(file);
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesDepot = selectedDepot === 'All' ||
            (p.depotDistribution && p.depotDistribution.some(d => d.depotId === selectedDepot || d.depotName === selectedDepot));

        return matchesSearch && matchesCategory && matchesDepot;
    });

    const categories = ['All', ...new Set(products.map(p => p.category))];

    return (
        <div className="inventory-view-container">
            <ForecastModal
                isOpen={isForecastModalOpen}
                onClose={() => setIsForecastModalOpen(false)}
                product={selectedProductForForecast}
            />
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProduct}
                depots={depots}
            />

            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Inventory Item</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateProduct(editingProduct.id, editingProduct);
                        }} className="add-item-form">
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input type="text" required value={editingProduct.sku} onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" required value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Image URL or Base64</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input type="text" value={editingProduct.image} onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })} placeholder="Paste image URL or Base64" style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setEditingProduct({ ...editingProduct, image: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} className="file-input-custom" />
                                        {editingProduct.image && <img src={editingProduct.image} alt="Preview" className="image-preview-small" />}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn-purple">Update Item</button>
                        </form>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleFileUpload}
            />

            <div className="inventory-sidebar">
                <div className="search-section-box">
                    <h3>Search for items</h3>
                    <p className="text-muted-sm">Type id number or name of items</p>
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon-purple" />
                        <input
                            type="text"
                            placeholder="search for items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="summary-card-modern">
                    <div className="summary-header">
                        <select className="summary-period-select">
                            <option>Monthly</option>
                            <option>Weekly</option>
                        </select>
                    </div>

                    <div className="stat-row-modern">
                        <div className="stat-item">
                            <span className="stat-label">Purchased</span>
                            <div className="stat-value">{products.length > 0 ? '2209' : '0'} <span className="unit">pairs</span></div>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Available</span>
                            <div className="stat-value">{products.reduce((acc, p) => acc + p.stock, 0)} <span className="unit">items</span></div>
                        </div>
                    </div>

                    <div className="sparkline-section">
                        <div className="spark-stat">
                            <span className="label">Store Health</span>
                            <div className="val-box">
                                <strong>{products.length > 0 ? 'Optimal' : 'Checking...'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="upgrade-promo-card">
                        <p>Need advanced analytics? Connect your Python ML models.</p>
                        <button className="upgrade-btn-white">Manage Models</button>
                    </div>
                </div>
            </div>

            <div className="inventory-main-content">
                <div className="inventory-header-filters">
                    <div className="filters-left">
                        <div className="filter-group-modern" style={{ display: 'flex', gap: '12px' }}>
                            <div className="filter-select-wrapper">
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Category</label>
                                <select
                                    className="modern-select-sm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="filter-select-wrapper">
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Depot</label>
                                <select
                                    className="modern-select-sm"
                                    value={selectedDepot}
                                    onChange={(e) => setSelectedDepot(e.target.value)}
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}
                                >
                                    <option value="All">All Depots</option>
                                    {depots.map(d => <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="filters-right">
                        <button className="export-btn" onClick={() => fileInputRef.current.click()}>
                            Upload CSV <Upload size={18} style={{ marginLeft: '8px' }} />
                        </button>
                        <button className="add-items-btn" onClick={() => setIsModalOpen(true)}>
                            Add items <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className="modern-table-container">
                    {loading ? (
                        <div className="loading-state-purple">
                            <div className="spinner"></div>
                            <p>Loading Inventory...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state-card">
                            <Package size={48} className="text-muted" />
                            <h3>No items in inventory</h3>
                            <p>Upload a CSV or add an item manually to get started.</p>
                        </div>
                    ) : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                                    <th style={{ width: '60px' }}>#</th>
                                    <th>ID Number</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Stock-out In</th>
                                    <th>Reorder Qty</th>
                                    <th>Risk</th>
                                    <th style={{ width: '40px' }}>Forecast</th>
                                    <th style={{ width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <React.Fragment key={product.id}>
                                        <tr className={expandedRow === product.id ? 'row-expanded' : ''} onClick={() => toggleRow(product.id)}>
                                            <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                                            <td>
                                                <div className="product-thumb">
                                                    <img src={product.displayImage} alt="" />
                                                </div>
                                            </td>
                                            <td className="sku-text font-bold">{product.sku}</td>
                                            <td>{product.name}</td>
                                            <td className="font-bold">₹{product.price}</td>
                                            <td className="font-bold">{product.stock} units</td>
                                            <td className="font-bold">{product.daysToStockOut ?? '??'} days</td>
                                            <td className="font-bold">{product.reorderQty ?? '??'} units</td>
                                            <td>
                                                <span className={`risk-badge ${product.riskLevel?.toLowerCase() || 'safe'}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {product.riskLevel || 'SAFE'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="view-forecast-small-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProductForForecast(product);
                                                        setIsForecastModalOpen(true);
                                                    }}
                                                    title="View AI Forecast"
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <TrendingUp size={18} />
                                                </button>
                                            </td>
                                            <td><ChevronDown size={18} className={`expand-icon ${expandedRow === product.id ? 'rotated' : ''}`} /></td>
                                        </tr>
                                        {expandedRow === product.id && (
                                            <tr className="expanded-details-row">
                                                <td colSpan="11">
                                                    <div className="expanded-card">
                                                        <div className="product-big-preview">
                                                            <img src={product.displayImage} alt="" />
                                                        </div>
                                                        <div className="details-info-grid">
                                                            <div className="info-group">
                                                                <label>Name</label>
                                                                <div className="val">{product.name}</div>
                                                            </div>
                                                            <div className="info-group">
                                                                <label>Price</label>
                                                                <div className="val">₹{product.price}</div>
                                                            </div>
                                                            <div className="info-group">
                                                                <label>ID Number</label>
                                                                <div className="val">{product.sku}</div>
                                                            </div>
                                                            <div className="info-group">
                                                                <label>Brand</label>
                                                                <div className="val">{product.brand}</div>
                                                            </div>
                                                            <div className="info-group">
                                                                <label>Stock</label>
                                                                <div className="val">{product.stock} units</div>
                                                            </div>
                                                            <div className="info-group" style={{ gridColumn: 'span 2' }}>
                                                                <label>AI Forecast Insight</label>
                                                                <div className="val" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                                                    {product.aiExplanation}
                                                                </div>
                                                            </div>
                                                            <div className="info-group tags-group">
                                                                <label>Actions</label>
                                                                <div className="tags-list">
                                                                    <span className="tag" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedProductForForecast(product);
                                                                        setIsForecastModalOpen(true);
                                                                    }} style={{ background: 'var(--primary)', color: 'white', cursor: 'pointer' }}>View Forecast</span>
                                                                    <span className="tag" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }} style={{ cursor: 'pointer' }}>Edit Item</span>
                                                                    <span className="tag" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}>Delete</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryOverview;
