import React, { useState } from 'react';
import { 
    FileText, Download, Calendar, Filter, TrendingUp, Package, 
    Warehouse, DollarSign, BarChart3, PieChart, FileSpreadsheet,
    FileDown, Printer, Mail, Share2, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState('last-30-days');
    const [reportFormat, setReportFormat] = useState('pdf');

    // Static report data
    const reportCategories = [
        {
            id: 'inventory',
            name: 'Inventory Reports',
            icon: Package,
            color: '#667eea',
            reports: [
                { id: 'inv-summary', name: 'Inventory Summary', description: 'Complete overview of all inventory items', lastGenerated: '2 hours ago', size: '2.4 MB' },
                { id: 'stock-levels', name: 'Stock Levels Report', description: 'Current stock levels across all depots', lastGenerated: '5 hours ago', size: '1.8 MB' },
                { id: 'low-stock', name: 'Low Stock Alert', description: 'Items below reorder point', lastGenerated: '1 day ago', size: '856 KB' },
                { id: 'stock-movement', name: 'Stock Movement', description: 'Inflow and outflow analysis', lastGenerated: '3 hours ago', size: '3.2 MB' }
            ]
        },
        {
            id: 'depot',
            name: 'Depot Reports',
            icon: Warehouse,
            color: '#4facfe',
            reports: [
                { id: 'depot-performance', name: 'Depot Performance', description: 'Utilization and efficiency metrics', lastGenerated: '4 hours ago', size: '1.5 MB' },
                { id: 'capacity-analysis', name: 'Capacity Analysis', description: 'Storage capacity and trends', lastGenerated: '6 hours ago', size: '2.1 MB' },
                { id: 'depot-comparison', name: 'Depot Comparison', description: 'Compare performance across depots', lastGenerated: '1 day ago', size: '1.9 MB' }
            ]
        },
        {
            id: 'financial',
            name: 'Financial Reports',
            icon: DollarSign,
            color: '#43e97b',
            reports: [
                { id: 'inventory-valuation', name: 'Inventory Valuation', description: 'Total stock value and breakdown', lastGenerated: '2 hours ago', size: '1.2 MB' },
                { id: 'cost-analysis', name: 'Cost Analysis', description: 'Holding costs and expenses', lastGenerated: '1 day ago', size: '980 KB' },
                { id: 'profit-loss', name: 'Profit & Loss', description: 'Revenue and cost summary', lastGenerated: '3 days ago', size: '1.4 MB' }
            ]
        },
        {
            id: 'analytics',
            name: 'Analytics Reports',
            icon: BarChart3,
            color: '#fa709a',
            reports: [
                { id: 'trend-analysis', name: 'Trend Analysis', description: 'Historical trends and patterns', lastGenerated: '5 hours ago', size: '4.2 MB' },
                { id: 'forecast-accuracy', name: 'Forecast Accuracy', description: 'Prediction vs actual comparison', lastGenerated: '1 day ago', size: '2.8 MB' },
                { id: 'turnover-rate', name: 'Turnover Rate', description: 'Inventory turnover metrics', lastGenerated: '8 hours ago', size: '1.6 MB' }
            ]
        }
    ];

    const quickStats = [
        { label: 'Total Reports', value: '156', trend: '+12%', icon: FileText, color: '#667eea' },
        { label: 'Generated Today', value: '8', trend: '+3', icon: Clock, color: '#4facfe' },
        { label: 'Scheduled Reports', value: '24', trend: 'Active', icon: Calendar, color: '#43e97b' },
        { label: 'Storage Used', value: '48.2 GB', trend: '68%', icon: FileSpreadsheet, color: '#fa709a' }
    ];

    return (
        <div className="reports-container">
            {/* Header */}
            <div className="reports-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p className="text-muted">Generate comprehensive reports and export data</p>
                </div>
                <button className="add-items-btn">
                    <FileDown size={18} />
                    Generate Custom Report
                </button>
            </div>

            {/* Quick Stats */}
            <div className="reports-stats-grid">
                {quickStats.map((stat, idx) => (
                    <div key={idx} className="report-stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="report-stat-icon" style={{ background: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="report-stat-content">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value">{stat.value}</div>
                            <span className="stat-trend">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="reports-filters-section">
                <div className="filter-group">
                    <label>Date Range</label>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="filter-select">
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last-7-days">Last 7 Days</option>
                        <option value="last-30-days">Last 30 Days</option>
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Export Format</label>
                    <div className="format-buttons">
                        <button 
                            className={`format-btn ${reportFormat === 'pdf' ? 'active' : ''}`}
                            onClick={() => setReportFormat('pdf')}
                        >
                            <FileText size={16} /> PDF
                        </button>
                        <button 
                            className={`format-btn ${reportFormat === 'csv' ? 'active' : ''}`}
                            onClick={() => setReportFormat('csv')}
                        >
                            <FileSpreadsheet size={16} /> CSV
                        </button>
                        <button 
                            className={`format-btn ${reportFormat === 'excel' ? 'active' : ''}`}
                            onClick={() => setReportFormat('excel')}
                        >
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Categories */}
            <div className="reports-categories">
                {reportCategories.map((category, catIdx) => (
                    <div key={category.id} className="report-category" style={{ animationDelay: `${catIdx * 0.15}s` }}>
                        <div className="category-header">
                            <div className="category-icon" style={{ background: category.color }}>
                                <category.icon size={24} />
                            </div>
                            <h3>{category.name}</h3>
                            <span className="report-count">{category.reports.length} reports</span>
                        </div>
                        
                        <div className="reports-grid">
                            {category.reports.map((report) => (
                                <div 
                                    key={report.id} 
                                    className="report-card"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <div className="report-card-header">
                                        <h4>{report.name}</h4>
                                        <div className="report-status">
                                            <CheckCircle size={14} />
                                            Ready
                                        </div>
                                    </div>
                                    <p className="report-description">{report.description}</p>
                                    <div className="report-meta">
                                        <span className="meta-item">
                                            <Clock size={12} />
                                            {report.lastGenerated}
                                        </span>
                                        <span className="meta-item">
                                            <FileText size={12} />
                                            {report.size}
                                        </span>
                                    </div>
                                    <div className="report-actions">
                                        <button className="action-btn primary">
                                            <Download size={14} />
                                            Download
                                        </button>
                                        <button className="action-btn">
                                            <Printer size={14} />
                                        </button>
                                        <button className="action-btn">
                                            <Mail size={14} />
                                        </button>
                                        <button className="action-btn">
                                            <Share2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scheduled Reports Section */}
            <div className="scheduled-reports-section">
                <h3>Scheduled Reports</h3>
                <div className="scheduled-reports-grid">
                    <div className="scheduled-report-card">
                        <div className="schedule-icon">
                            <Calendar size={20} />
                        </div>
                        <div className="schedule-info">
                            <h4>Weekly Inventory Summary</h4>
                            <p>Every Monday at 9:00 AM</p>
                        </div>
                        <span className="schedule-badge active">Active</span>
                    </div>
                    <div className="scheduled-report-card">
                        <div className="schedule-icon">
                            <Calendar size={20} />
                        </div>
                        <div className="schedule-info">
                            <h4>Monthly Financial Report</h4>
                            <p>1st of every month at 8:00 AM</p>
                        </div>
                        <span className="schedule-badge active">Active</span>
                    </div>
                    <div className="scheduled-report-card">
                        <div className="schedule-icon">
                            <Calendar size={20} />
                        </div>
                        <div className="schedule-info">
                            <h4>Daily Stock Movement</h4>
                            <p>Every day at 6:00 PM</p>
                        </div>
                        <span className="schedule-badge active">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
