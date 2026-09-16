import React, { useState } from 'react';
import axios from 'axios';

function AssetForm({ categories, onAssetCreated, apiUrl, token }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    serial_number: '',
    purchase_date: '',
    value: '',
    location: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(`${apiUrl}/assets`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Asset created successfully! 🎉');
      setFormData({
        name: '',
        description: '',
        category_id: '',
        serial_number: '',
        purchase_date: '',
        value: '',
        location: '',
        status: 'active'
      });
      onAssetCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create asset. Please check your inputs.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid #ef4444',
          borderRadius: '4px',
          color: '#ef4444',
          fontWeight: '600'
        }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: '1rem',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '2px solid #22c55e',
          borderRadius: '4px',
          color: '#22c55e',
          fontWeight: '600'
        }}>
          ✓ {success}
        </div>
      )}

      <div className="form-group">
        <label>Asset Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Laptop, Printer, Vehicle"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add details about this asset..."
          rows="3"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a category...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Serial Number</label>
        <input
          type="text"
          name="serial_number"
          value={formData.serial_number}
          onChange={handleChange}
          required
          placeholder="Unique identifier"
        />
      </div>

      <div className="form-group">
        <label>Purchase Date</label>
        <input
          type="datetime-local"
          name="purchase_date"
          value={formData.purchase_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Asset Value (£)</label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="e.g., Office A, Warehouse, Building 2"
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Creating...' : '✨ Create Asset'}
      </button>
    </form>
  );
}

export default AssetForm;
