import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SetupPassword({ apiUrl }) {
  const [token] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/invites/validate/${encodeURIComponent(token)}`
        );

        setInvite(response.data);
        setError('');
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          'Invalid or expired invite link'
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateInvite();
    } else {
      setError('No invite token was provided.');
      setLoading(false);
    }
  }, [token, apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/invites/accept`,
        {
          token,
          password
        }
      );

      localStorage.setItem(
        'admin_token',
        response.data.access_token
      );

      localStorage.setItem(
        'admin_email',
        response.data.email
      );

      setSuccess(true);
      setError('');

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to accept invite'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invite) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e5e5e5'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '1.2rem',
              marginBottom: '1rem'
            }}
          >
            Loading invite...
          </div>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div
          style={{
            background: '#1a0a0a',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%'
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}
          >
            ❌
          </div>

          <h2
            style={{
              color: '#ef4444',
              marginBottom: '1rem'
            }}
          >
            Invalid Invite
          </h2>

          <p
            style={{
              color: '#999',
              marginBottom: '1.5rem'
            }}
          >
            {error}
          </p>

          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background:
                'linear-gradient(135deg, #ff5500 0%, #ff7722 100%)',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '2px solid #1f1f1f',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}
            >
              ✓
            </div>

            <h2
              style={{
                color: '#10b981',
                marginBottom: '0.5rem'
              }}
            >
              Account Created!
            </h2>

            <p
              style={{
                color: '#999',
                marginBottom: '1rem'
              }}
            >
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <h1
              style={{
                margin: '0 0 0.5rem 0',
                color: '#ff5500',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}
            >
              Welcome to APEX
            </h1>

            <p
              style={{
                color: '#999',
                marginBottom: '2rem',
                fontSize: '0.9rem'
              }}
            >
              Set up your password to get started
            </p>

            {error && (
              <div
                style={{
                  background: '#1a0a0a',
                  border: '2px solid #ef4444',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  color: '#ef4444',
                  fontSize: '0.9rem'
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#ff5500',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  value={invite?.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: '#111111',
                    border: '2px solid #1f1f1f',
                    borderRadius: '4px',
                    color: '#999',
                    fontFamily: 'inherit',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#ff5500',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Password
                </label>

                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: '#111111',
                    border: '2px solid #1f1f1f',
                    borderRadius: '4px',
                    color: '#e5e5e5',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff5500';
                    e.target.style.background = '#0a0a0a';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1f1f1f';
                    e.target.style.background = '#111111';
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#ff5500',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm password"
                  value={passwordConfirm}
                  onChange={(e) =>
                    setPasswordConfirm(e.target.value)
                  }
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: '#111111',
                    border: '2px solid #1f1f1f',
                    borderRadius: '4px',
                    color: '#e5e5e5',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff5500';
                    e.target.style.background = '#0a0a0a';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1f1f1f';
                    e.target.style.background = '#111111';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.6rem',
                  background:
                    'linear-gradient(135deg, #ff5500 0%, #ff7722 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: loading
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow:
                    '0 6px 20px rgba(255, 85, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform =
                      'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform =
                    'translateY(0)';
                }}
              >
                {loading
                  ? 'Creating Account...'
                  : 'Create Account'}
              </button>
            </form>

            <p
              style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.85rem'
              }}
            >
              Role:{' '}
              <span
                style={{
                  color: '#ff5500',
                  fontWeight: '600'
                }}
              >
                {invite?.role || 'Unknown'}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default SetupPassword;