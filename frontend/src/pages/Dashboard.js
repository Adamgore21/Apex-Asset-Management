import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ apiUrl, token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${apiUrl}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444', padding: '2rem', textAlign: 'center' }}>{error}</div>;
  }

  if (!stats) {
    return <div className="loading">No data available</div>;
  }

  const StatCard = ({ label, value, icon, color = '#ff5500', subtext = '' }) => (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
      border: `2px solid ${color}20`,
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}30`;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${color}20`;
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color }}>{icon}</div>
      <div style={{ fontSize: '0.85rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
        {typeof value === 'number' && label.includes('Value') ? `£${value.toLocaleString()}` : value}
      </div>
      {subtext && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>{subtext}</div>}
    </div>
  );

  return (
    <div className="dashboard">
      <h1 style={{ margin: '0 0 2rem 0', color: '#ff5500', fontSize: '1.8rem', fontWeight: '700' }}>📊 Dashboard</h1>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard
          label="Total Assets"
          value={stats.total_assets}
          icon="📦"
          color="#ff5500"
        />
        <StatCard
          label="Total Value"
          value={stats.total_asset_value}
          icon="💰"
          color="#10b981"
        />
        <StatCard
          label="Book Value"
          value={stats.book_value}
          icon="📈"
          color="#3b82f6"
          subtext={`${((1 - stats.book_value / stats.total_asset_value) * 100).toFixed(1)}% depreciated`}
        />
        <StatCard
          label="Due Replacement"
          value={stats.assets_due_replacement}
          icon="🔄"
          color="#f59e0b"
        />
        <StatCard
          label="Warranty Expiring"
          value={stats.warranty_expiring_soon}
          icon="⏰"
          color="#ef4444"
        />
        <StatCard
          label="In Repair"
          value={stats.assets_in_repair}
          icon="🔧"
          color="#8b5cf6"
        />
        <StatCard
          label="Missing"
          value={stats.assets_missing}
          icon="❓"
          color="#dc2626"
        />
      </div>

      {/* Recent Activity */}
      {stats.recent_activities && stats.recent_activities.length > 0 && (
        <div style={{
          background: '#0a0a0a',
          border: '2px solid #1f1f1f',
          borderRadius: '8px',
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#ff5500', fontSize: '1.1rem', fontWeight: '700' }}>📋 Recent Activity</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {stats.recent_activities.map((activity, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                borderBottom: idx < stats.recent_activities.length - 1 ? '1px solid #1f1f1f' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#ff5500', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {activity.action || 'Action'}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>
                    {activity.resource_name || activity.details}
                  </div>
                </div>
                <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'right' }}>
                  {new Date(activity.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
