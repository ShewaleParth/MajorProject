import React, { useState, useEffect } from 'react';
import {
    Bell,
    AlertTriangle,
    PackageX,
    TrendingUp,
    Clock,
    XCircle,
    Warehouse,
    Calendar,
    CheckCircle,
    Trash2,
    Check,
    X
} from 'lucide-react';
import { api } from '../utils/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'critical'
    const [stats, setStats] = useState({ total: 0, unread: 0, critical: 0 });

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = {};

            if (filter === 'unread') {
                params.isRead = false;
            } else if (filter === 'critical') {
                params.category = 'critical';
            }

            const response = await api.getAlerts(params);
            setNotifications(response.alerts || []);

            // Calculate stats
            const total = response.alerts?.length || 0;
            const unread = response.alerts?.filter(n => !n.isRead).length || 0;
            const critical = response.alerts?.filter(n => n.category === 'critical').length || 0;
            setStats({ total, unread, critical });
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.markAlertAsRead(notificationId);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.markAllAlertsAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.deleteAlert(notificationId);
                fetchNotifications();
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            'low-stock': PackageX,
            'out-of-stock': PackageX,
            'overstock': TrendingUp,
            'reorder-point': Bell,
            'expiry-warning': Clock,
            'demand-spike': TrendingUp,
            'delayed-delivery': Clock,
            'transfer-failed': XCircle,
            'capacity-warning': Warehouse,
            'anomaly': AlertTriangle
        };
        return iconMap[type] || Bell;
    };

    const getNotificationColor = (category) => {
        const colorMap = {
            critical: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colorMap[category] || '#6b7280';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const groupNotificationsByDate = (notifications) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [],
            yesterday: [],
            earlier: []
        };

        notifications.forEach(notif => {
            const notifDate = new Date(notif.createdAt);
            notifDate.setHours(0, 0, 0, 0);

            if (notifDate.getTime() === today.getTime()) {
                groups.today.push(notif);
            } else if (notifDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(notif);
            } else {
                groups.earlier.push(notif);
            }
        });

        return groups;
    };

    const filteredNotifications = notifications;
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    return (
        <div className="notifications-page-container">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    <p className="text-muted">Stay updated with system alerts and important events</p>
                </div>
                {stats.unread > 0 && (
                    <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                        <CheckCircle size={18} />
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="notification-filters">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                    <span className="filter-badge">{stats.total}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread
                    {stats.unread > 0 && <span className="filter-badge unread">{stats.unread}</span>}
                </button>
                <button
                    className={`filter-tab ${filter === 'critical' ? 'active' : ''}`}
                    onClick={() => setFilter('critical')}
                >
                    Critical
                    {stats.critical > 0 && <span className="filter-badge critical">{stats.critical}</span>}
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="loading-state-purple">
                    <div className="spinner"></div>
                    <p>Loading notifications...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="empty-state-card">
                    <Bell size={48} className="text-muted" />
                    <h3>No notifications</h3>
                    <p>
                        {filter === 'unread' && 'You\'re all caught up! No unread notifications.'}
                        {filter === 'critical' && 'No critical alerts at the moment.'}
                        {filter === 'all' && 'No notifications to display.'}
                    </p>
                </div>
            ) : (
                <div className="notifications-list">
                    {groupedNotifications.today.length > 0 && (
                        <div className="notification-group">
                            <h3 className="group-title">Today</h3>
                            <div>
                                {groupedNotifications.today.map(notif => (
                                    <NotificationCard
                                        key={notif._id}
                                        notification={notif}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        getIcon={getNotificationIcon}
                                        getColor={getNotificationColor}
                                        formatTime={formatTimestamp}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedNotifications.yesterday.length > 0 && (
                        <div className="notification-group">
                            <h3 className="group-title">Yesterday</h3>
                            <div>
                                {groupedNotifications.yesterday.map(notif => (
                                    <NotificationCard
                                        key={notif._id}
                                        notification={notif}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        getIcon={getNotificationIcon}
                                        getColor={getNotificationColor}
                                        formatTime={formatTimestamp}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedNotifications.earlier.length > 0 && (
                        <div className="notification-group">
                            <h3 className="group-title">Earlier</h3>
                            <div>
                                {groupedNotifications.earlier.map(notif => (
                                    <NotificationCard
                                        key={notif._id}
                                        notification={notif}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        getIcon={getNotificationIcon}
                                        getColor={getNotificationColor}
                                        formatTime={formatTimestamp}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const NotificationCard = ({ notification, onMarkAsRead, onDelete, getIcon, getColor, formatTime }) => {
    const Icon = getIcon(notification.type);
    const color = getColor(notification.category);

    return (
        <div className={`notification-card ${!notification.isRead ? 'unread' : ''}`}>
            <div className="notification-icon-wrapper" style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={20} />
            </div>

            <div className="notification-content">
                <div className="notification-header-row">
                    <h4>{notification.title}</h4>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                </div>

                <p className="notification-description">{notification.description}</p>

                {notification.productId && (
                    <div className="notification-meta">
                        <span className="meta-tag">
                            Product: {notification.productId.name} ({notification.productId.sku})
                        </span>
                    </div>
                )}

                {notification.depotId && (
                    <div className="notification-meta">
                        <span className="meta-tag">
                            Depot: {notification.depotId.name}
                        </span>
                    </div>
                )}

                <div className="notification-actions">
                    {!notification.isRead && (
                        <button
                            className="action-btn mark-read"
                            onClick={() => onMarkAsRead(notification._id)}
                            title="Mark as read"
                        >
                            <Check size={14} />
                            Mark as Read
                        </button>
                    )}
                    <button
                        className="action-btn delete"
                        onClick={() => onDelete(notification._id)}
                        title="Delete notification"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {!notification.isRead && <div className="unread-indicator"></div>}
        </div>
    );
};

export default Notifications;
