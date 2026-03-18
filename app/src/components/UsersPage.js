'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'employee' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Preview links
  const [previewLinks, setPreviewLinks] = useState([]);
  const [linkLabel, setLinkLabel] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadUsers();
    loadPreviewLinks();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await authFetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviewLinks = async () => {
    try {
      const res = await authFetch('/api/preview');
      if (res.ok) setPreviewLinks(await res.json());
    } catch (error) {
      console.error('Failed to load preview links:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await authFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: '', username: '', password: '', role: 'employee' });
        loadUsers();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await authFetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadUsers();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleCreatePreviewLink = async () => {
    try {
      const res = await authFetch('/api/preview', {
        method: 'POST',
        body: JSON.stringify({ label: linkLabel || 'Preview Link' }),
      });
      if (res.ok) {
        setLinkLabel('');
        loadPreviewLinks();
      }
    } catch (error) {
      console.error('Create preview link error:', error);
    }
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/preview/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>⚙️ Administration</h1>
          <div className="page-header-sub">Manage users and preview links</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview Links ({previewLinks.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2>Team Members</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add User
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>@{u.username}</td>
                    <td>
                      <span className={`country-badge ${u.role === 'admin' ? 'usa' : 'schengen'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u.role === 'admin'}
                        style={u.role === 'admin' ? { opacity: 0.3 } : {}}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="card">
          <div className="card-header">
            <h2>Preview Links</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                value={linkLabel}
                onChange={e => setLinkLabel(e.target.value)}
                placeholder="Link label (optional)"
                style={{ width: 200, padding: '6px 12px', fontSize: '0.85rem' }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleCreatePreviewLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Generate Link
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Link</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {previewLinks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                      No preview links yet. Generate one above.
                    </td>
                  </tr>
                ) : (
                  previewLinks.map(link => (
                    <tr key={link._id}>
                      <td>{link.label}</td>
                      <td>
                        <span
                          className="preview-link-url"
                          onClick={() => copyLink(link.token)}
                        >
                          {typeof window !== 'undefined' && `${window.location.origin}/preview/${link.token.slice(0, 12)}...`}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => copyLink(link.token)}
                        >
                          {copied === link.token ? '✓ Copied!' : 'Copy Link'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
