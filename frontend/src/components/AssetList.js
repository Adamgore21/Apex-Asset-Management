import React from 'react';
import axios from 'axios';

function AssetList({ assets, categories, onAssetDeleted, apiUrl, token }) {
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (assetId, assetName) => {
    if (window.confirm(`Are you sure you want to delete "${assetName}"?`)) {
      try {
        await axios.delete(`${apiUrl}/assets/${assetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onAssetDeleted(assetId);
      } catch (error) {
        alert('Failed to delete asset');
      }
    }
  };

  if (assets.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
        <div>No assets yet. Create one to get started!</div>
      </div>
    );
  }

  return (
    <div>
      {assets.map((asset, index) => (
        <div key={asset.id} className="asset-card" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="asset-info">
            <h3>💼 {asset.name}</h3>
            <p><strong>Category:</strong> {getCategoryName(asset.category_id)}</p>
            <p><strong>Serial:</strong> <code style={{ background: '#111111', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', color: '#ff5500' }}>{asset.serial_number}</code></p>
            <p><strong>Purchased:</strong> {formatDate(asset.purchase_date)}</p>
            <p><strong>Value:</strong> <span style={{ color: '#ff5500', fontWeight: '700' }}>£{asset.value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
            <p><strong>Location:</strong> 📍 {asset.location}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`status-badge ${asset.status === 'inactive' ? 'inactive' : asset.status === 'maintenance' ? 'maintenance' : asset.status === 'retired' ? 'retired' : ''}`}>
                {asset.status}
              </span>
            </p>
            {asset.description && (
              <p><strong>Description:</strong> {asset.description}</p>
            )}
          </div>
          <div className="asset-actions">
            <button
              className="delete-btn"
              onClick={() => handleDelete(asset.id, asset.name)}
              title="Delete this asset"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssetList;
