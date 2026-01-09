import React, { useState, useEffect } from 'react';
import { 
    FileText, Download, Calendar, Filter, TrendingUp, Package, 
    Warehouse, DollarSign, BarChart3, PieChart, FileSpreadsheet,
    FileDown, Printer, Mail, Share2, Clock, CheckCircle, AlertCircle, Loader, RefreshCw
} from 'lucide-react';
import { api } from '../utils/api';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState('last-30-days');
    const [reportFormat, setReportFormat] = useState('pdf');
    const [stats, setStats] = useState(null);
    const [generatedReports, setGeneratedReports] = useState([]);
    const [depots, setDepots] = useState([]);
    const [selectedDepot, setSelectedDepot] = useState('');
    const [generating, setGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchDepots();
        
        // Poll for report updates every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, reportsData] = await Promise.all([
                api.getReportStats(),
                api.getReportsList()
            ]);
            setStats(statsData);
            setGeneratedReports(reportsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepots = async () => {
        try {
            const depotsData = await api.getDepots();
            console.log('🔍 Raw depots response:', depotsData);
            
            if (Array.isArray(depotsData)) {
                console.log('🔍 Setting depots from array:', depotsData);
                setDepots(depotsData);
            } else if (depotsData && Array.isArray(depotsData.depots)) {
                console.log('🔍 Setting depots from .depots property:', depotsData.depots);
                setDepots(depotsData.depots);
            } else {
                console.warn('🔍 No valid depots data found');
                setDepots([]);
            }
        } catch (error) {
            console.error('Error fetching depots:', error);
            setDepots([]);
        }
    };

    const handleGenerateReport = async () => {
        if (!selectedDepot) {
            alert('Please select a depot');
            return;
        }

        // Validate that selectedDepot is an ObjectId (24 hex characters)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(selectedDepot)) {
            console.error('🔍 Invalid depot ID format:', selectedDepot);
            console.error('🔍 This looks like display text, not an ObjectId');
            alert('⚠️ Invalid depot selection. Please close this modal and try again. If the issue persists, refresh the page.');
            setSelectedDepot(''); // Reset the selection
            return;
        }

        console.log('🔍 Debug - Selected Depot ID:', selectedDepot);
        console.log('🔍 Debug - Depots array:', depots);

        setGenerating(true);
        try {
            const result = await api.generateReport({
                reportType: 'depot-analysis',
                targetId: selectedDepot,
                format: reportFormat
            });

            alert('✅ Report generation started! AI is analyzing your data. Check back in a few moments.');
            setShowGenerateModal(false);
            setSelectedDepot('');
            
            // Refresh data after 2 seconds
            setTimeout(fetchData, 2000);
        } catch (error) {
            console.error('Error generating report:', error);
            console.error('🔍 Debug - Failed targetId:', selectedDepot);
            alert('❌ Failed to generate report: ' + (error.response?.data?.error || error.message));
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadReport = async (reportId, fileName) => {
        try {
            const blob = await api.downloadReport(reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || `report-${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report. It may still be processing.');
        }
    };

    const handlePrintReport = async (reportId) => {
        try {
            const blob = await api.downloadReport(reportId);
            const url = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow.print();
            };
        } catch (error) {
            console.error('Error printing report:', error);
            alert('Failed to print report');
        }
    };

    const handleEmailReport = (reportId) => {
        const subject = encodeURIComponent('Sangrahak Report');
        const body = encodeURIComponent(`Please find the report attached. Report ID: ${reportId}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleShareReport = (reportId) => {
        const shareUrl = `${window.location.origin}/reports/${reportId}`;
        if (navigator.share) {
            navigator.share({
                title: 'Sangrahak Report',
                text: 'Check out this report',
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Report link copied to clipboard!');
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        
        try {
            await api.deleteReport(reportId);
            alert('Report deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Failed to delete report');
        }
    };

    const handleGenerateTemplateReport = async (reportType) => {
        setGenerating(true);
        try {
            const result = await api.generateReport({
                reportType,
                format: reportFormat
            });

            alert('✅ Report generation started! AI is analyzing your data. Check back in a few moments.');
            
            // Refresh data after 2 seconds
            setTimeout(fetchData, 2000);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('❌ Failed to generate report: ' + (error.response?.data?.error || error.message));
        } finally {
            setGenerating(false);
        }
    };

    // Report categories with correct backend IDs
    const reportCategories = [
        {
            id: 'inventory',
            name: 'Inventory Reports',
            icon: Package,
            color: '#667eea',
            reports: [
                { id: 'inventory-summary', name: 'Inventory Summary', description: 'Complete overview of all inventory items' },
                { id: 'stock-levels', name: 'Stock Levels Report', description: 'Current stock levels across all depots' },
                { id: 'low-stock', name: 'Low Stock Alert', description: 'Items below reorder point' },
                { id: 'stock-movement', name: 'Stock Movement', description: 'Inflow and outflow analysis' }
            ]
        },
        {
            id: 'depot',
            name: 'Depot Reports',
            icon: Warehouse,
            color: '#4facfe',
            reports: [
                { id: 'depot-analysis', name: 'Depot Performance', description: 'Utilization and efficiency metrics', needsDepot: true },
                { id: 'capacity-analysis', name: 'Capacity Analysis', description: 'Storage capacity and trends' },
                { id: 'depot-comparison', name: 'Depot Comparison', description: 'Compare performance across depots' }
            ]
        },
        {
            id: 'financial',
            name: 'Financial Reports',
            icon: DollarSign,
            color: '#43e97b',
            reports: [
                { id: 'inventory-valuation', name: 'Inventory Valuation', description: 'Total stock value and breakdown' },
                { id: 'cost-analysis', name: 'Cost Analysis', description: 'Holding costs and expenses' },
                { id: 'profit-loss', name: 'Profit & Loss', description: 'Revenue and cost summary' }
            ]
        },
        {
            id: 'analytics',
            name: 'Analytics Reports',
            icon: BarChart3,
            color: '#fa709a',
            reports: [
                { id: 'trend-analysis', name: 'Trend Analysis', description: 'Historical trends and patterns' },
                { id: 'forecast-accuracy', name: 'Forecast Accuracy', description: 'Prediction vs actual comparison' },
                { id: 'turnover-rate', name: 'Turnover Rate', description: 'Inventory turnover metrics' }
            ]
        }
    ];

    const quickStats = stats ? [
        { label: 'Total Reports', value: stats.totalReports.toString(), trend: '+12%', icon: FileText, color: '#667eea' },
        { label: 'Generated Today', value: stats.generatedToday.toString(), trend: `+${stats.generatedToday}`, icon: Clock, color: '#4facfe' },
        { label: 'Scheduled Reports', value: stats.scheduledReports.toString(), trend: 'Active', icon: Calendar, color: '#43e97b' },
        { label: 'Storage Used', value: stats.storageUsed, trend: '68%', icon: FileSpreadsheet, color: '#fa709a' }
    ] : [
        { label: 'Total Reports', value: '0', trend: 'Loading...', icon: FileText, color: '#667eea' },
        { label: 'Generated Today', value: '0', trend: 'Loading...', icon: Clock, color: '#4facfe' },
        { label: 'Scheduled Reports', value: '0', trend: 'Loading...', icon: Calendar, color: '#43e97b' },
        { label: 'Storage Used', value: '0 MB', trend: 'Loading...', icon: FileSpreadsheet, color: '#fa709a' }
    ];

    return (
        <div className="reports-container">
            {/* Header */}
            <div className="reports-header">
                <div>
                    <h1>🤖 AI-Powered Reports & Analytics</h1>
                    <p className="text-muted">Generate intelligent reports with AI analysis</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="add-items-btn" onClick={fetchData} style={{ background: '#6c757d' }}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button className="add-items-btn" onClick={() => setShowGenerateModal(true)}>
                        <FileDown size={18} />
                        Generate Custom Report
                    </button>
                </div>
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

            {/* Generated Reports Section */}
            {generatedReports.length > 0 && (
                <div className="report-category" style={{ marginBottom: '32px' }}>
                    <div className="category-header">
                        <div className="category-icon" style={{ background: '#667eea' }}>
                            <FileText size={24} />
                        </div>
                        <h3>🎯 Your Generated Reports</h3>
                        <span className="report-count">{generatedReports.length} reports</span>
                    </div>
                    
                    <div className="reports-grid">
                        {generatedReports.map((report) => (
                            <div key={report._id} className="report-card">
                                <div className="report-card-header">
                                    <h4>{report.title || report.reportType}</h4>
                                    <div className={`report-status status-${report.status}`}>
                                        {report.status === 'completed' && <CheckCircle size={14} />}
                                        {report.status === 'processing' && <Loader size={14} className="spinning" />}
                                        {report.status === 'failed' && <AlertCircle size={14} />}
                                        {report.status === 'completed' ? 'Ready' : report.status}
                                    </div>
                                </div>
                                <p className="report-description">
                                    {report.targetName} - {report.reportType.replace('-', ' ')}
                                </p>
                                {report.aiSummary?.executive && (
                                    <div className="ai-summary-preview">
                                        <strong>🤖 AI Summary:</strong>
                                        <p>{report.aiSummary.executive.substring(0, 120)}...</p>
                                    </div>
                                )}
                                <div className="report-meta">
                                    <span className="meta-item">
                                        <Clock size={12} />
                                        {new Date(report.createdAt).toLocaleString()}
                                    </span>
                                    {report.fileSize && (
                                        <span className="meta-item">
                                            <FileText size={12} />
                                            {(report.fileSize / 1024).toFixed(1)} KB
                                        </span>
                                    )}
                                </div>
                                <div className="report-actions">
                                    {report.status === 'completed' ? (
                                        <>
                                            <button 
                                                className="action-btn primary"
                                                onClick={() => handleDownloadReport(report._id, report.fileName)}
                                                title="Download Report"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => handlePrintReport(report._id)}
                                                title="Print Report"
                                            >
                                                <Printer size={14} />
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => handleEmailReport(report._id)}
                                                title="Email Report"
                                            >
                                                <Mail size={14} />
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => handleShareReport(report._id)}
                                                title="Share Report"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                        </>
                                    ) : report.status === 'processing' ? (
                                        <button className="action-btn" disabled>
                                            <Loader size={14} className="spinning" />
                                            Processing... {report.progress}%
                                        </button>
                                    ) : (
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleDeleteReport(report._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                    onClick={() => {
                                        if (report.needsDepot) {
                                            setShowGenerateModal(true);
                                        } else {
                                            handleGenerateTemplateReport(report.id);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="report-card-header">
                                        <h4>{report.name}</h4>
                                        <div className="report-status" style={{ background: '#d1fae5', color: '#065f46' }}>
                                            <CheckCircle size={14} />
                                            Available
                                        </div>
                                    </div>
                                    <p className="report-description">{report.description}</p>
                                    <div className="report-meta">
                                        <span className="meta-item">
                                            🤖 AI-Powered Analysis
                                        </span>
                                    </div>
                                    <div className="report-actions">
                                        <button 
                                            className="action-btn primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (report.needsDepot) {
                                                    setShowGenerateModal(true);
                                                } else {
                                                    handleGenerateTemplateReport(report.id);
                                                }
                                            }}
                                            disabled={generating}
                                        >
                                            <FileDown size={14} />
                                            Generate
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
                <h3>📅 Scheduled Reports (Coming Soon)</h3>
                <div className="scheduled-reports-grid">
                    <div className="scheduled-report-card" style={{ opacity: 0.6 }}>
                        <div className="schedule-icon">
                            <Calendar size={20} />
                        </div>
                        <div className="schedule-info">
                            <h4>Weekly Inventory Summary</h4>
                            <p>Every Monday at 9:00 AM</p>
                        </div>
                        <span className="schedule-badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>Coming Soon</span>
                    </div>
                </div>
            </div>

            {/* Generate Report Modal */}
            {showGenerateModal && (
                <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>🤖 Generate AI-Powered Report</h2>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            Select a depot to generate an intelligent analysis report with AI insights
                        </p>
                        
                        <div className="form-group">
                            <label>Select Depot</label>
                            <select 
                                value={selectedDepot} 
                                onChange={(e) => {
                                    console.log('🔍 Depot selected:', e.target.value);
                                    setSelectedDepot(e.target.value);
                                }}
                                className="filter-select"
                                autoComplete="off"
                            >
                                <option value="">Choose a depot...</option>
                                {depots && depots.map((depot, index) => {
                                    console.log(`🔍 Depot ${index}:`, {
                                        _id: depot._id,
                                        id: depot.id,
                                        name: depot.name,
                                        location: depot.location,
                                        fullObject: depot
                                    });
                                    return (
                                        <option key={depot._id || depot.id || index} value={depot._id || depot.id}>
                                            {depot.name} - {depot.location}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Report Format</label>
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
                                    disabled
                                    style={{ opacity: 0.5 }}
                                >
                                    <FileSpreadsheet size={16} /> CSV (Soon)
                                </button>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={() => setShowGenerateModal(false)}
                                disabled={generating}
                            >
                                Cancel
                            </button>
                            <button 
                                className="add-items-btn" 
                                onClick={handleGenerateReport}
                                disabled={generating || !selectedDepot}
                            >
                                {generating ? (
                                    <>
                                        <Loader size={18} className="spinning" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileDown size={18} />
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
