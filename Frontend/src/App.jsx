import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import InventoryOverview from './pages/InventoryOverview';
import Depots from './pages/Depots';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
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
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
                  <div className="main-layout">
                    <Header theme={theme} toggleTheme={toggleTheme} title={activeItem} />
                    <main className="content">
                      {renderContent()}
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
