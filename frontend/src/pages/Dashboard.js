import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ apiUrl, token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${apiUrl}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(response.data); setError('');
    } catch (err) { setError('Failed to load dashboard statistics'); console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: '2rem', textAlign: 'center' }}>{error}</div>;
  if (!stats) return <div className="loading">No data available</div>;

  const StatCard = ({ label, value, icon, color = '#ff5500', subtext = '' }) => (
    <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)', border: `2px solid ${color}20`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}30`; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${color}20`; }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color }}>{icon}</div>
      <div style={{ fontSize: '0.85rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>{typeof value === 'number' && label.toLowerCase().includes('value') ? `£${value.toLocaleString()}` : value}</div>
      {subtext && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>{subtext}</div>}
    </div>
  );

  const health = stats.asset_health || {};
  const healthTotal = Object.values(health).reduce((sum, n) => sum + n, 0) || 1;
  const healthRows = [
    ['excellent', '🟢 Excellent', '#10b981'], ['good', '🟢 Good', '#22c55e'], ['fair', '🟠 Fair', '#f59e0b'], ['poor', '🔴 Poor', '#f97316'], ['faulty', '🔴 Faulty', '#ef4444']
  ];

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, color: '#ff5500', fontSize: '1.8rem', fontWeight: '700' }}>📊 APEX HUB Dashboard</h1>
          <div style={{ color: '#777', marginTop: '0.4rem' }}>Asset operations, health and replacement overview</div>
        </div>
        <div style={{ background: '#10b98115', border: '1px solid #10b98150', borderRadius: '20px', padding: '0.45rem 0.9rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>● APEX HUB ONLINE</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard label="Total Assets" value={stats.total_assets} icon="📦" />
        <StatCard label="APEX HUB Assets" value={stats.apex_hub_assets} icon="🏢" color="#ff5500" subtext={`£${(stats.apex_hub_value || 0).toLocaleString()} current value`} />
        <StatCard label="Total Value" value={stats.total_asset_value} icon="💰" color="#10b981" />
        <StatCard label="Book Value" value={stats.book_value} icon="📈" color="#3b82f6" subtext={stats.total_asset_value ? `${Math.max(0, (1 - stats.book_value / stats.total_asset_value) * 100).toFixed(1)}% depreciated` : 'No asset value'} />
        <StatCard label="Assigned" value={stats.assigned_assets || 0} icon="👤" color="#3b82f6" />
        <StatCard label="Available" value={stats.available_assets || 0} icon="✅" color="#10b981" />
        <StatCard label="In Repair" value={stats.assets_in_repair} icon="🔧" color="#8b5cf6" />
        <StatCard label="Missing" value={stats.assets_missing} icon="❓" color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <section style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', color: '#ff5500', fontSize: '1.1rem' }}>🏢 APEX HUB Operations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Mini label="Assets at HUB" value={stats.apex_hub_assets || 0} />
            <Mini label="HUB Value" value={`£${(stats.apex_hub_value || 0).toLocaleString()}`} />
            <Mini label="Assigned Out" value={stats.assigned_assets || 0} />
            <Mini label="Available" value={stats.available_assets || 0} />
          </div>
        </section>

        <section style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', color: '#ff5500', fontSize: '1.1rem' }}>🩺 Asset Health</h2>
          {healthRows.map(([key, label, color]) => {
            const count = health[key] || 0; const pct = Math.round((count / healthTotal) * 100);
            return <div key={key} style={{ marginBottom: '0.8rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}><span style={{ color }}>{label}</span><span style={{ color: '#aaa' }}>{count} ({pct}%)</span></div><div style={{ height: '7px', background: '#1f1f1f', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '5px' }} /></div></div>;
          })}
        </section>

        <section style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', color: '#ff5500', fontSize: '1.1rem' }}>⚠️ Action Required</h2>
          <Alert label="Warranty expiring within 30 days" value={stats.warranty_expiring_soon} color="#ef4444" />
          <Alert label="Assets due for replacement" value={stats.assets_due_replacement} color="#f59e0b" />
          <Alert label="Assets currently in repair" value={stats.assets_in_repair} color="#8b5cf6" />
          <Alert label="Assets marked missing" value={stats.assets_missing} color="#dc2626" />
        </section>
      </div>

      {stats.recent_activities?.length > 0 && <div style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem', color: '#ff5500', fontSize: '1.1rem' }}>📋 Recent Activity</h2>
        {stats.recent_activities.map((activity, idx) => <div key={idx} style={{ padding: '0.9rem 0', borderBottom: idx < stats.recent_activities.length - 1 ? '1px solid #1f1f1f' : 'none', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><div><div style={{ color: '#ff5500', fontWeight: '600' }}>{activity.action || activity.type || 'Action'}</div><div style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.2rem' }}>{activity.resource_name || activity.description || activity.details}</div></div><div style={{ color: '#666', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{activity.created_at ? new Date(activity.created_at).toLocaleString() : activity.time}</div></div>)}
      </div>}
    </div>
  );
}

function Mini({ label, value }) { return <div style={{ background: '#111', borderRadius: '6px', padding: '1rem' }}><div style={{ color: '#777', fontSize: '0.75rem', textTransform: 'uppercase' }}>{label}</div><div style={{ color: '#fff', fontWeight: '700', fontSize: '1.25rem', marginTop: '0.25rem' }}>{value}</div></div>; }
function Alert({ label, value, color }) { return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #1f1f1f' }}><span style={{ color: '#aaa', fontSize: '0.82rem' }}>{label}</span><span style={{ minWidth: '34px', textAlign: 'center', padding: '0.25rem 0.45rem', borderRadius: '12px', background: `${color}20`, color, fontWeight: '700' }}>{value}</span></div>; }

export default Dashboard;
