import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_LOCATION = 'APEX HUB';

function Assets({ apiUrl, token }) {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const emptyForm = () => ({
    name: '', description: '', category_id: '', asset_type: 'other', make_model: '', serial_number: '',
    purchase_date: '', purchase_price: '', current_value: '', warranty_expiry: '', condition: 'good',
    location: DEFAULT_LOCATION, status: 'available', notes: ''
  });
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchAssets(); fetchCategories(); }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/assets`, { headers: { Authorization: `Bearer ${token}` } });
      setAssets(response.data); setError('');
    } catch (err) { setError('Failed to load assets'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categories`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(response.data);
    } catch (err) { console.error('Failed to load categories', err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, location: formData.location.trim() || DEFAULT_LOCATION };
      await axios.post(`${apiUrl}/assets`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setFormData(emptyForm()); setShowForm(false); fetchAssets();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create asset'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this asset?')) {
      try {
        await axios.delete(`${apiUrl}/assets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAssets(); setSelectedAsset(null);
      } catch (err) { setError('Failed to delete asset'); }
    }
  };

  const getStatusColor = (status) => ({ available: '#10b981', assigned: '#3b82f6', maintenance: '#8b5cf6', repair: '#8b5cf6', retired: '#666', missing: '#ef4444', lost: '#ef4444' }[status] || '#ff5500');

  return (
    <div className="page" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: '0 0 0.25rem 0', color: '#ff5500', fontSize: '1.6rem', fontWeight: '700' }}>📦 Assets</h1>
        <div style={{ color: '#777', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Main location: <strong style={{ color: '#ddd' }}>{DEFAULT_LOCATION}</strong></div>
        <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '1.5rem', width: '100%', padding: '0.85rem 1.6rem', background: 'linear-gradient(135deg, #ff5500 0%, #ff7722 100%)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '+ Add Asset'}
        </button>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: '#1a0a0a', borderRadius: '4px', fontSize: '0.9rem' }}>{error}</div>}
        {loading ? <div className="loading">Loading assets...</div> : (
          <div style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            {assets.map(asset => (
              <div key={asset.id} onClick={() => setSelectedAsset(asset)} style={{ padding: '1rem', borderBottom: '1px solid #1f1f1f', cursor: 'pointer', background: selectedAsset?.id === asset.id ? '#111111' : 'transparent', borderLeft: selectedAsset?.id === asset.id ? '4px solid #ff5500' : '4px solid transparent' }}>
                <div style={{ fontWeight: '600', color: '#ff5500', marginBottom: '0.25rem' }}>{asset.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>{asset.asset_id}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: `${getStatusColor(asset.status)}20`, color: getStatusColor(asset.status), borderRadius: '3px', textTransform: 'capitalize' }}>{asset.status}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: '#ffffff10', color: '#aaa', borderRadius: '3px' }}>{asset.location || DEFAULT_LOCATION}</span>
                </div>
              </div>
            ))}
            {assets.length === 0 && <div className="empty-state">No assets yet</div>}
          </div>
        )}
      </div>

      <div>
        {selectedAsset ? (
          <div style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div><h2 style={{ margin: '0 0 0.5rem 0', color: '#ff5500', fontSize: '1.4rem', fontWeight: '700' }}>{selectedAsset.name}</h2><div style={{ color: '#999', fontSize: '0.9rem' }}>{selectedAsset.asset_id}</div></div>
              <button onClick={() => handleDelete(selectedAsset.id)} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <InfoField label="Category" value={categories.find(c => c.id === selectedAsset.category_id)?.name || 'N/A'} />
              <InfoField label="Asset Type" value={selectedAsset.asset_type} />
              <InfoField label="Make/Model" value={selectedAsset.make_model || 'N/A'} />
              <InfoField label="Serial Number" value={selectedAsset.serial_number} />
              <InfoField label="Condition" value={selectedAsset.condition} color={selectedAsset.condition === 'good' ? '#10b981' : '#f59e0b'} />
              <InfoField label="Status" value={selectedAsset.status} color={getStatusColor(selectedAsset.status)} />
              <InfoField label="Purchase Date" value={new Date(selectedAsset.purchase_date).toLocaleDateString()} />
              <InfoField label="Purchase Price" value={`£${selectedAsset.purchase_price.toLocaleString()}`} />
              <InfoField label="Current Value" value={`£${selectedAsset.current_value.toLocaleString()}`} />
              <InfoField label="Warranty Expiry" value={selectedAsset.warranty_expiry ? new Date(selectedAsset.warranty_expiry).toLocaleDateString() : 'N/A'} />
              <InfoField label="Location" value={selectedAsset.location || DEFAULT_LOCATION} color={selectedAsset.location === DEFAULT_LOCATION || !selectedAsset.location ? '#10b981' : '#e5e5e5'} />
              <InfoField label="Notes" value={selectedAsset.notes || 'No notes'} />
            </div>
          </div>
        ) : <div className="empty-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Select an asset to view details</div>}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#0a0a0a', border: '2px solid #1f1f1f', borderRadius: '8px', padding: '2rem', marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group"><label>Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Serial Number *</label><input type="text" value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} required /></div>
            <div className="form-group"><label>Category *</label><select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required><option value="">Select category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
            <div className="form-group"><label>Asset Type</label><select value={formData.asset_type} onChange={e => setFormData({ ...formData, asset_type: e.target.value })}><option value="laptop">Laptop</option><option value="desktop">Desktop</option><option value="phone">Phone</option><option value="printer">Printer</option><option value="monitor">Monitor</option><option value="vehicle">Vehicle</option><option value="other">Other</option></select></div>
            <div className="form-group"><label>Purchase Price *</label><input type="number" step="0.01" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} required /></div>
            <div className="form-group"><label>Current Value *</label><input type="number" step="0.01" value={formData.current_value} onChange={e => setFormData({ ...formData, current_value: e.target.value })} required /></div>
            <div className="form-group"><label>Purchase Date *</label><input type="date" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} required /></div>
            <div className="form-group"><label>Warranty Expiry</label><input type="date" value={formData.warranty_expiry} onChange={e => setFormData({ ...formData, warranty_expiry: e.target.value })} /></div>
            <div className="form-group"><label>Location</label><input type="text" value={formData.location} placeholder={DEFAULT_LOCATION} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
            <div className="form-group"><label>Condition</label><select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })}><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option></select></div>
            <button type="submit" style={{ gridColumn: '1 / -1' }}>Create Asset</button>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, color = '#e5e5e5' }) { return <div><div style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div><div style={{ color, fontWeight: '600', fontSize: '0.95rem' }}>{value}</div></div>; }

export default Assets;
