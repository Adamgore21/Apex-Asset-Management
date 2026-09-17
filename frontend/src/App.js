import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SetupPassword from './pages/SetupPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Assets from './pages/Assets';
import Handovers from './pages/Handovers';
import Maintenance from './pages/Maintenance';
import AdminUsers from './pages/AdminUsers';
import AuditLogs from './pages/AuditLogs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const SUPER_USER_EMAIL = 'support@apexingoodcompany.co.uk';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedEmail = localStorage.getItem('admin_email');
    
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setAdminEmail(savedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (newToken, email) => {
    setToken(newToken);
    setAdminEmail(email);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    setToken('');
    setAdminEmail('');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Check if this is a setup page (has token param)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('token');
  
  if (inviteToken) {
    return <SetupPassword apiUrl={API_URL} />;
  }
  
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />;
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'assets', label: 'Assets', icon: '📦' },
    { id: 'handovers', label: 'Handovers', icon: '🔄' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    ...(adminEmail === SUPER_USER_EMAIL ? [
      { id: 'admin-users', label: 'Admin Users', icon: '🔑' },
      { id: 'audit-logs', label: 'Audit Logs', icon: '📋' }
    ] : [])
  ];

  return (
    <div className="App">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <img src="/apex-logo.png" alt="APEX Asset Management" className="logo-image" style={{ height: '70px' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#ff5500' }}>APEX</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>Asset Management</p>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.85, color: '#b8b8b8', fontWeight: 400, letterSpacing: '0.05em' }}>
              Enterprise-grade asset tracking and management
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#ff5500', fontSize: '0.9rem', fontWeight: '600' }}>{adminEmail}</span>
            <button
              onClick={logout}
              style={{
                padding: '0.6rem 1rem',
                background: 'transparent',
                border: '2px solid #ff5500',
                color: '#ff5500',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 85, 0, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="navbar">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <main className="container">
        {activeTab === 'dashboard' && <Dashboard apiUrl={API_URL} token={token} />}
        {activeTab === 'employees' && <Employees apiUrl={API_URL} token={token} />}
        {activeTab === 'assets' && <Assets apiUrl={API_URL} token={token} />}
        {activeTab === 'handovers' && <Handovers apiUrl={API_URL} token={token} />}
        {activeTab === 'maintenance' && <Maintenance apiUrl={API_URL} token={token} />}
        {activeTab === 'admin-users' && adminEmail === SUPER_USER_EMAIL && (
          <AdminUsers apiUrl={API_URL} token={token} />
        )}
        {activeTab === 'audit-logs' && adminEmail === SUPER_USER_EMAIL && (
          <AuditLogs apiUrl={API_URL} token={token} email={adminEmail} />
        )}
      </main>
    </div>
  );
}

export default App;
