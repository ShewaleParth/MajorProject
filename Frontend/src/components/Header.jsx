import React, { useState } from 'react';
import { Search, Bell, Grid, Moon, Sun, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ theme, toggleTheme, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="header">
      <div className="header-left">
        <h2 className="page-title">{title || 'Inventory Control & Depot Management'}</h2>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search SKU / Product..." />
          <div className="search-shortcuts">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="action-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          <button className="action-btn">
            <Grid size={20} />
          </button>
          <div className="user-profile-wrapper">
            <div 
              className="user-profile" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <User size={16} />
                  <div className="user-info">
                    <p className="user-name">{user?.first_name} {user?.last_name}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
