import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Employees({ apiUrl, token }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    job_title: '',
    phone: '',
    start_date: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/employees`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: '',
        email: '',
        department: '',
        job_title: '',
        phone: '',
        start_date: ''
      });
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError('Failed to create employee');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try {
        await axios.delete(`${apiUrl}/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEmployees();
      } catch (err) {
        setError('Failed to delete employee');
      }
    }
  };

  return (
    <div className="page">
      <h1 style={{ margin: '0 0 2rem 0', color: '#ff5500', fontSize: '1.8rem', fontWeight: '700' }}>👥 Employees</h1>

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
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        {showForm ? '✕ Cancel' : '+ Add Employee'}
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
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <button type="submit" style={{ gridColumn: '1 / -1' }}>Create Employee</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : employees.length > 0 ? (
        <div style={{
          background: '#0a0a0a',
          border: '2px solid #1f1f1f',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 0.8fr',
            gap: '1rem',
            padding: '1.5rem',
            background: '#111111',
            borderBottom: '2px solid #1f1f1f',
            fontWeight: '700',
            color: '#ff5500',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            position: 'sticky',
            top: 0
          }}>
            <div>Name</div>
            <div>Email</div>
            <div>Department</div>
            <div>Job Title</div>
            <div>Action</div>
          </div>
          {employees.map(emp => (
            <div key={emp.id} style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 0.8fr',
              gap: '1rem',
              padding: '1.5rem',
              borderBottom: '1px solid #1f1f1f',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: '600', color: '#fff' }}>{emp.name}</div>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>{emp.email}</div>
              <div style={{ color: '#999' }}>{emp.department}</div>
              <div style={{ color: '#999' }}>{emp.job_title}</div>
              <button
                onClick={() => handleDelete(emp.id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No employees yet. Create one to get started!</div>
      )}
    </div>
  );
}

export default Employees;
