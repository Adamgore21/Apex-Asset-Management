import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminUsers({ apiUrl, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'admin'
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ email: '', role: 'admin' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdatePermissions = async (userId, permissions) => {
    try {
      await axios.put(`${apiUrl}/users/${userId}`, permissions, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setEditingUser(null);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Deactivate this user?')) {
      try {
        await axios.delete(`${apiUrl}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        setSelectedUser(null);
      } catch (err) {
        setError('Failed to deactivate user');
      }
    }
  };

  const RolePermissions = {
    super_admin: {
      label: 'Super Admin',
      color: '#ff5500',
      perms: {
        can_view_dashboard: true,
        can_manage_assets: true,
        can_manage_employees: true,
        can_manage_handovers: true,
        can_manage_maintenance: true,
        can_view_audit_logs: true,
        can_manage_users: true
      }
    },
    admin: {
      label: 'Admin',
      color: '#10b981',
      perms: {
        can_view_dashboard: true,
        can_manage_assets: true,
        can_manage_employees: true,
        can_manage_handovers: true,
        can_manage_maintenance: true,
        can_view_audit_logs: false,
        can_manage_users: false
      }
    },
    manager: {
      label: 'Manager',
      color: '#3b82f6',
      perms: {
        can_view_dashboard: true,
        can_manage_assets: true,
        can_manage_employees: false,
        can_manage_handovers: true,
        can_manage_maintenance: true,
        can_view_audit_logs: false,
        can_manage_users: false
      }
    },
    viewer: {
      label: 'Viewer',
      color: '#999',
      perms: {
        can_view_dashboard: true,
        can_manage_assets: false,
        can_manage_employees: false,
        can_manage_handovers: false,
        can_manage_maintenance: false,
        can_view_audit_logs: false,
        can_manage_users: false
      }
    }
  };

  const applyRoleTemplate = (role) => {
    if (editingUser && RolePermissions[role]) {
      handleUpdatePermissions(editingUser.id, { role, ...RolePermissions[role].perms });
    }
  };

  return (
    <div className="page">
      <h1 style={{ margin: '0 0 2rem 0', color: '#ff5500', fontSize: '1.8rem', fontWeight: '700' }}>🔑 User Management</h1>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: '#1a0a0a', borderRadius: '4px' }}>{error}</div>}

      <button
        onClick={() => { setShowForm(!showForm); setEditingUser(null); }}
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
        {showForm ? '✕ Cancel' : '+ Add User'}
      </button>

      {showForm && (
        <form onSubmit={handleAddUser} style={{
          background: '#0a0a0a',
          border: '2px solid #1f1f1f',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Admin Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@apexingoodcompany.co.uk"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Role *</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button type="submit" style={{
              padding: '0.8rem 1.6rem',
              background: 'linear-gradient(135deg, #ff5500 0%, #ff7722 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '700',
              cursor: 'pointer',
              alignSelf: 'flex-end',
              whiteSpace: 'nowrap'
            }}>
              Add User
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Users List */}
        <div>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#ff5500', fontSize: '1.1rem', fontWeight: '700' }}>Users</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div style={{
              background: '#0a0a0a',
              border: '2px solid #1f1f1f',
              borderRadius: '8px',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              {users.filter(u => u.is_active).map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #1f1f1f',
                    cursor: 'pointer',
                    background: selectedUser?.id === user.id ? '#111111' : 'transparent',
                    borderLeft: selectedUser?.id === user.id ? '4px solid #ff5500' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#111111'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedUser?.id === user.id ? '#111111' : 'transparent'}
                >
                  <div style={{ fontWeight: '600', color: '#ff5500', marginBottom: '0.25rem' }}>{user.email}</div>
                  <div style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem',
                    background: `${RolePermissions[user.role]?.color || '#666'}20`,
                    color: RolePermissions[user.role]?.color || '#666',
                    borderRadius: '3px',
                    width: 'fit-content',
                    marginTop: '0.25rem'
                  }}>
                    {RolePermissions[user.role]?.label || user.role}
                  </div>
                </div>
              ))}
              {users.filter(u => u.is_active).length === 0 && <div className="empty-state">No active users</div>}
            </div>
          )}
        </div>

        {/* User Details & Permissions */}
        {selectedUser ? (
          <div style={{
            background: '#0a0a0a',
            border: '2px solid #1f1f1f',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#ff5500', fontSize: '1.3rem', fontWeight: '700' }}>
                  {selectedUser.email}
                </h2>
                <div style={{ color: '#999', fontSize: '0.9rem' }}>
                  Created: {new Date(selectedUser.created_at).toLocaleDateString()}
                </div>
              </div>
              {!editingUser && (
                <button
                  onClick={() => setEditingUser(selectedUser)}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {editingUser && editingUser.id === selectedUser.id ? (
              <div>
                <h3 style={{ color: '#ff5500', marginBottom: '1.5rem', fontWeight: '700' }}>Quick Roles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {Object.entries(RolePermissions).map(([roleKey, roleData]) => (
                    <button
                      key={roleKey}
                      onClick={() => applyRoleTemplate(roleKey)}
                      style={{
                        padding: '1rem',
                        background: '#111111',
                        border: `2px solid ${roleData.color}`,
                        borderRadius: '6px',
                        color: roleData.color,
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = `${roleData.color}10`}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#111111'}
                    >
                      {roleData.label}
                    </button>
                  ))}
                </div>

                <h3 style={{ color: '#ff5500', marginBottom: '1.5rem', fontWeight: '700' }}>Custom Permissions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { key: 'can_view_dashboard', label: '📊 View Dashboard' },
                    { key: 'can_manage_assets', label: '📦 Manage Assets' },
                    { key: 'can_manage_employees', label: '👥 Manage Employees' },
                    { key: 'can_manage_handovers', label: '🔄 Manage Handovers' },
                    { key: 'can_manage_maintenance', label: '🔧 Manage Maintenance' },
                    { key: 'can_view_audit_logs', label: '📋 View Audit Logs' },
                    { key: 'can_manage_users', label: '🔑 Manage Users' }
                  ].map(perm => (
                    <label key={perm.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.75rem',
                      background: '#111111',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${selectedUser[perm.key] ? '#10b981' : '#666'}`,
                      color: '#e5e5e5'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedUser[perm.key]}
                        onChange={(e) => {
                          const updated = { ...selectedUser, [perm.key]: e.target.checked };
                          setSelectedUser(updated);
                        }}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleUpdatePermissions(selectedUser.id, {
                      can_view_dashboard: selectedUser.can_view_dashboard,
                      can_manage_assets: selectedUser.can_manage_assets,
                      can_manage_employees: selectedUser.can_manage_employees,
                      can_manage_handovers: selectedUser.can_manage_handovers,
                      can_manage_maintenance: selectedUser.can_manage_maintenance,
                      can_view_audit_logs: selectedUser.can_view_audit_logs,
                      can_manage_users: selectedUser.can_manage_users
                    })}
                    style={{
                      flex: 1,
                      padding: '0.8rem 1.6rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => { setEditingUser(null); setSelectedUser(null); }}
                    style={{
                      padding: '0.8rem 1.6rem',
                      background: '#333',
                      color: '#e5e5e5',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    style={{
                      padding: '0.8rem 1.6rem',
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {[
                  { key: 'can_view_dashboard', label: '📊 View Dashboard' },
                  { key: 'can_manage_assets', label: '📦 Manage Assets' },
                  { key: 'can_manage_employees', label: '👥 Manage Employees' },
                  { key: 'can_manage_handovers', label: '🔄 Manage Handovers' },
                  { key: 'can_manage_maintenance', label: '🔧 Manage Maintenance' },
                  { key: 'can_view_audit_logs', label: '📋 View Audit Logs' },
                  { key: 'can_manage_users', label: '🔑 Manage Users' }
                ].map(perm => (
                  <div key={perm.key} style={{
                    padding: '1rem',
                    background: '#111111',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${selectedUser[perm.key] ? '#10b981' : '#666'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: selectedUser[perm.key] ? '#10b981' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.8rem'
                    }}>
                      {selectedUser[perm.key] ? '✓' : '✗'}
                    </div>
                    <div style={{ color: '#e5e5e5' }}>{perm.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Select a user to manage permissions
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
