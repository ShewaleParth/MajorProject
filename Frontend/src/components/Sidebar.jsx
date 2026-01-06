import React from 'react';
import {
  LayoutDashboard,
  Package,
  Search,
  RefreshCcw,
  Sparkles,
  FileText,
  History,
  Bell,
  User,
  Settings,
  MessageSquare,
  ChevronLeft,
  Warehouse,
  X
} from 'lucide-react';

const Sidebar = ({ activeItem, setActiveItem, isMobileOpen, onClose }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', live: true },
    { icon: Package, label: 'Inventory Overview', live: true },
    { icon: Sparkles, label: 'Forecasting Analysis', live: true },
  ];

  const logisticsItems = [
    { icon: Warehouse, label: 'Depots', live: true },
    { icon: RefreshCcw, label: 'Movement & Transactions' },
    { icon: Search, label: 'Stock Search & Tracking' },
  ];

  const otherItems = [
    { icon: FileText, label: 'Reports Export' },
    { icon: Bell, label: 'Notifications', badge: 12 },
  ];

  const accountItems = [
    { icon: User, label: 'Account' },
    { icon: Settings, label: 'System Settings' },
    { icon: MessageSquare, label: 'Feedback' },
  ];

  const handleNavClick = (label) => {
    setActiveItem(label);
    // Close sidebar on mobile when item is clicked
    if (onClose && window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon shadow-sm">D</div>
          <div className="logo-text">
            <h4>Depot Manager</h4>
            <span>Logistics Control System</span>
          </div>
        </div>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={16} />
        </button>
        <button className="collapse-btn">
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="section-title">MAIN MENU</p>
          {menuItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavClick(item.label)}
            >
              <item.icon size={20} className={activeItem === item.label ? 'pulse' : ''} />
              <span>{item.label}</span>
              {item.live && <span className="live-pill">LIVE</span>}
              {activeItem === item.label && <div className="active-indicator" />}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">LOGISTICS NETWORK</p>
          {logisticsItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavClick(item.label)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.live && <span className="live-pill">LIVE</span>}
              {activeItem === item.label && <div className="active-indicator" />}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">SYSTEM</p>
          {otherItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavClick(item.label)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
              {activeItem === item.label && <div className="active-indicator" />}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">SYSTEM CONTROL</p>
          {accountItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavClick(item.label)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeItem === item.label && <div className="active-indicator" />}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-sm glass-effect">
          <div className="user-avatar shadow-md">P</div>
          <div className="user-info">
            <strong>Parth</strong>
            <span>Admin Control Panel</span>
          </div>
          <Settings size={16} className="settings-icon spin-on-hover" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
