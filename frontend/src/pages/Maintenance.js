import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Maintenance({ apiUrl, token }) {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    issue_description: '',
    repair_company: '',
    estimated_cost: ''
  });

  useEffect(() => {
    fetchMaintenance();
    fetchAssets();
  }, []);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data);
    } catch (err) {
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${apiUrl}/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(response.data);
    } catch (err) {
      console.error('Failed to load assets', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/maintenance`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        asset_id: '',
        issue_description: '',
        repair_company: '',
        estimated_cost: ''
      });
      setShowForm(false);
      fetchMaintenance();
    } catch (err) {
      setError('Failed to create maintenance record');
    }
  };

  const getAssetName = (assetId) => {
    return assets.find(a => a.id === assetId)?.name || `Asset #${assetId}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'in_progress': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#666'
    };
    return colors[status] || '#ff5500';
  };

  const activeRecords = records.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const historicalRecords = records.filter(r => r.status === 'completed' || r.status === 'cancelled');

  return (
    <div className="page">
      <h1 style={{ margin: '0 0 2rem 0', color: '#ff5500', fontSize: '1.8rem', fontWeight: '700' }}>🔧 Maintenance</h1>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: '#1a0a0a', borderRadius: '4px' }}>{error}</div>}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '1.5rem',
          padding: '0.85rem 1.6rem',
          background: 'linear-gradient(135deg, #ff5500 0%, #ff7722 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        {showForm ? '✕ Cancel' : '+ Report Issue'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#0a0a0a',
          border: '2px solid #1f1f1f',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div className="form-group">
            <label>Asset *</label>
            <select value={formData.asset_id} onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })} required>
              <option value="">Select asset</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.asset_id})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Issue Description *</label>
            <textarea
              placeholder="Describe the issue..."
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              required
              style={{ minHeight: '100px' }}
            />
          </div>
          <div className="form-group">
            <label>Repair Company</label>
            <input
              type="text"
              value={formData.repair_company}
              onChange={(e) => setFormData({ ...formData, repair_company: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Estimated Cost</label>
            <input
              type="number"
              step="0.01"
              value={formData.estimated_cost}
              onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            />
          </div>
          <button type="submit" style={{ gridColumn: '1 / -1' }}>Create Maintenance Record</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading maintenance records...</div>
      ) : (
        <>
          {/* Active Maintenance */}
          {activeRecords.length > 0 && (
            <>
              <h2 style={{ color: '#f59e0b', margin: '2rem 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '700' }}>🚨 Active Issues</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                {activeRecords.map(record => (
                  <div key={record.id} style={{
                    background: '#0a0a0a',
                    border: `2px solid ${getStatusColor(record.status)}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    borderLeft: `4px solid ${getStatusColor(record.status)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ color: '#ff5500', fontWeight: '700' }}>{getAssetName(record.asset_id)}</div>
                      <div style={{
                        padding: '0.4rem 0.8rem',
                        background: `${getStatusColor(record.status)}20`,
                        color: getStatusColor(record.status),
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {record.status}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>ISSUE</div>
                      <div style={{ color: '#e5e5e5', fontSize: '0.95rem' }}>{record.issue_description}</div>
                    </div>

                    {record.repair_company && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>REPAIR COMPANY</div>
                        <div style={{ color: '#999' }}>{record.repair_company}</div>
                      </div>
                    )}

                    <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>ESTIMATED COST</div>
                        <div style={{ color: '#10b981' }}>£{record.estimated_cost?.toFixed(2) || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>ACTUAL COST</div>
                        <div style={{ color: record.actual_cost ? '#ff5500' : '#666' }}>£{record.actual_cost?.toFixed(2) || 'Pending'}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Reported: {new Date(record.reported_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Historical Records */}
          {historicalRecords.length > 0 && (
            <>
              <h2 style={{ color: '#666', margin: '2rem 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700' }}>History</h2>
              <div style={{
                background: '#0a0a0a',
                border: '2px solid #1f1f1f',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#111111',
                  borderBottom: '2px solid #1f1f1f',
                  fontWeight: '700',
                  color: '#ff5500',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <div>Asset</div>
                  <div>Issue</div>
                  <div>Status</div>
                  <div>Cost</div>
                  <div>Completed</div>
                </div>
                {historicalRecords.map((record, idx) => (
                  <div key={record.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr',
                    gap: '1rem',
                    padding: '1.5rem',
                    borderBottom: idx < historicalRecords.length - 1 ? '1px solid #1f1f1f' : 'none',
                    alignItems: 'center'
                  }}>
                    <div style={{ color: '#ff5500', fontWeight: '600' }}>{getAssetName(record.asset_id)}</div>
                    <div style={{ color: '#999', fontSize: '0.9rem' }}>{record.issue_description}</div>
                    <div style={{ color: getStatusColor(record.status), fontSize: '0.85rem' }}>{record.status}</div>
                    <div style={{ color: '#999' }}>£{record.actual_cost?.toFixed(2) || '-'}</div>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>
                      {record.date_returned ? new Date(record.date_returned).toLocaleDateString() : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeRecords.length === 0 && historicalRecords.length === 0 && (
            <div className="empty-state">No maintenance records</div>
          )}
        </>
      )}
    </div>
  );
}

export default Maintenance;
