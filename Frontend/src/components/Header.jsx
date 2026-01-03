import React from 'react';
import { Search, Bell, Grid, Moon, Sun } from 'lucide-react';

const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h2 className="page-title">Warehouse Inventory</h2>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." />
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
          <div className="user-profile">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
