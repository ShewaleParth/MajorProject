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
  ChevronLeft
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Inventory Overview' },
    { icon: Search, label: 'Stock Search & Tracking' },
    { icon: RefreshCcw, label: 'Movement & Transactions' },
    { icon: Sparkles, label: 'AI Features' },
  ];

  const otherItems = [
    { icon: FileText, label: 'Reports Export' },
    { icon: History, label: 'History Logs' },
    { icon: Bell, label: 'Email Notifications', badge: 24 },
  ];

  const accountItems = [
    { icon: User, label: 'Account' },
    { icon: Settings, label: 'System Settings' },
    { icon: MessageSquare, label: 'Feedback' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">M</div>
          <div className="logo-text">
            <h4>WareHub</h4>
            <span>prajasi@mail.com</span>
          </div>
        </div>
        <button className="collapse-btn">
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="section-title">MAIN MENU</p>
          {menuItems.map((item, i) => (
            <button key={i} className={`nav-item ${item.active ? 'active' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">OTHER</p>
          {otherItems.map((item, i) => (
            <button key={i} className="nav-item">
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">ACCOUNT</p>
          {accountItems.map((item, i) => (
            <button key={i} className="nav-item">
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="upgrade-card">
          <div className="progress-container">
            <div className="progress-labels">
              <span>Day 10 of 16</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '60%' }}></div>
            </div>
          </div>
          <button className="upgrade-btn">
            <Package size={16} />
            <div className="btn-text">
              <strong>Upgrade plan</strong>
              <span>Your free trial will be over</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
