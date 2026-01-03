import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="content">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
