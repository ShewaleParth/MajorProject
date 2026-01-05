import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import InventoryOverview from './pages/InventoryOverview';
import Depots from './pages/Depots';
import ForecastingAnalysis from './pages/ForecastingAnalysis';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeItem, setActiveItem] = useState('Dashboard');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Inventory Overview':
        return <InventoryOverview />;
      case 'Depots':
        return <Depots />;
      case 'Forecasting Analysis':
        return <ForecastingAnalysis />;
      default:
        return (
          <div className="placeholder-view">
            <h2>{activeItem}</h2>
            <p>This module is currently initializing. Connection to Logistics Ledger established.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="main-layout">
        <Header theme={theme} toggleTheme={toggleTheme} title={activeItem} />
        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
