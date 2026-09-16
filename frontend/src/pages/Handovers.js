import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Handovers({ apiUrl, token }) {
  const [handovers, setHandovers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    employee_id: '',
    condition_at_handover: 'good',
    accessories: '',
    notes: ''
  });

  useEffect(() => {
    fetchHandovers();
    fetchAssets();
    fetchEmployees();
  }, []);

  const fetchHandovers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/handovers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHandovers(response.data);
    } catch (err) {
      setError('Failed to load handovers');
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

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/handovers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        asset_id: '',
        employee_id: '',
        condition_at_handover: 'good',
        accessories: '',
        notes: ''
      });
      setShowForm(false);
      fetchHandovers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create handover');
    }
  };

  const handleReturn = async (id) => {
    const condition = prompt('Asset condition at return (excellent/good/fair/poor):');
    if (condition) {
      try {
        await axios.post(`${apiUrl}/handovers/${id}/return`, 
          { condition_at_return: condition },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchHandovers();
      } catch (err) {
        setError('Failed to return asset');
      }
    }
  };

  const getAssetName = (assetId) => {
    return assets.find(a => a.id === assetId)?.name || `Asset #${assetId}`;
  };

  const getEmployeeName = (empId) => {
    return employees.find(e => e.id === empId)?.name || `Employee #${empId}`;
  };

  return (
    <div className="page">
      <h1 style={{ margin: '0 0 2rem 0', color: '#ff5500', fontSize: '1.8rem', fontWeight: '700' }}>🔄 Handovers</h1>

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
        {showForm ? '✕ Cancel' : '+ New Handover'}
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
              {assets.filter(a => a.status === 'available').map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.asset_id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Employee *</label>
            <select value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Condition at Handover</label>
            <select value={formData.condition_at_handover} onChange={(e) => setFormData({ ...formData, condition_at_handover: e.target.value })}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Accessories</label>
            <input type="text" placeholder="e.g. Charger, USB cable" value={formData.accessories} onChange={(e) => setFormData({ ...formData, accessories: e.target.value })} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Notes</label>
            <textarea placeholder="Any additional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ minHeight: '100px' }} />
          </div>
          <button type="submit" style={{ gridColumn: '1 / -1' }}>Assign Asset</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading handovers...</div>
      ) : (
        <div>
          {/* Active Handovers */}
          <h2 style={{ color: '#ff5500', margin: '2rem 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700' }}>Active</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {handovers.filter(h => h.is_active).map(handover => (
              <div key={handover.id} style={{
                background: '#0a0a0a',
                border: '2px solid #10b981',
                borderRadius: '8px',
                padding: '1.5rem',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ color: '#10b981', fontWeight: '700', marginBottom: '1rem' }}>✓ In Use</div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>ASSET</div>
                  <div style={{ color: '#ff5500', fontWeight: '600', fontSize: '1rem' }}>{getAssetName(handover.asset_id)}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>ASSIGNED TO</div>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{getEmployeeName(handover.employee_id)}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>HANDOVER DATE</div>
                  <div style={{ color: '#999' }}>{new Date(handover.handover_date).toLocaleDateString()}</div>
                </div>
                {handover.condition_at_handover && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>CONDITION</div>
                    <div style={{ color: '#999', textTransform: 'capitalize' }}>{handover.condition_at_handover}</div>
                  </div>
                )}
                {handover.accessories && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.25rem' }}>ACCESSORIES</div>
                    <div style={{ color: '#999' }}>{handover.accessories}</div>
                  </div>
                )}
                <button
                  onClick={() => handleReturn(handover.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #ff5500 0%, #ff7722 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Return Asset
                </button>
              </div>
            ))}
            {handovers.filter(h => h.is_active).length === 0 && (
              <div className="empty-state">No active handovers</div>
            )}
          </div>

          {/* Returned Handovers */}
          {handovers.some(h => !h.is_active) && (
            <>
              <h2 style={{ color: '#666', margin: '2rem 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700' }}>History</h2>
              <div style={{
                background: '#0a0a0a',
                border: '2px solid #1f1f1f',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {handovers.filter(h => !h.is_active).map((handover, idx) => (
                  <div key={handover.id} style={{
                    padding: '1.5rem',
                    borderBottom: idx < handovers.filter(h => !h.is_active).length - 1 ? '1px solid #1f1f1f' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>Asset</div>
                      <div style={{ color: '#ff5500', fontWeight: '600' }}>{getAssetName(handover.asset_id)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>Employee</div>
                      <div style={{ color: '#fff' }}>{getEmployeeName(handover.employee_id)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>Handover</div>
                      <div style={{ color: '#999' }}>{new Date(handover.handover_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>Returned</div>
                      <div style={{ color: '#999' }}>{handover.return_date ? new Date(handover.return_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Handovers;
