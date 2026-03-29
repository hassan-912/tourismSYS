'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CaseForm from '@/components/CaseForm';
import ProgressBar from '@/components/ProgressBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CasesPage() {
  const { user, authFetch } = useAuth();
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // country filter
  const [userFilter, setUserFilter] = useState('all'); // user filter
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadCases();
  }, [filter, userFilter, search]);

  const loadUsers = async () => {
    try {
      const res = await authFetch('/api/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  const loadCases = async () => {
    try {
      let url = '/api/cases?';
      if (filter !== 'all') url += `country=${filter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await authFetch(url);
      if (res.ok) {
        let data = await res.json();
        if (userFilter !== 'all') {
          data = data.filter(c => c.createdBy?._id === userFilter || c.createdBy === userFilter);
        }
        setCases(data);
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = (exportCases = cases) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Tourism Tracker - Cases Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Client Name", "Odoo ID", "Phone", "Country", "Visa Type", "Appointment Date", "Progress", "Created By", "Next Step"];
    const tableRows = [];

    exportCases.forEach(c => {
      const caseData = [
        c.clientName,
        c.odooId,
        c.phone || '-',
        c.country,
        c.visaType || '-',
        formatDate(c.appointmentDate),
        `${c.progress}%`,
        c.createdBy?.name || '-',
        c.nextStep || '-'
      ];
      tableRows.push(caseData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`cases_report_${new Date().getTime()}.pdf`);
  };

  const handleExportPdfSingle = (c) => {
    exportPdf([c]);
  };

  const handleCreate = () => {
    setEditCase(null);
    setShowModal(true);
    setError('');
  };

  const handleEdit = (c) => {
    setEditCase(c);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    try {
      const res = await authFetch(`/api/cases/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCases();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const url = editCase ? `/api/cases/${editCase._id}` : '/api/cases';
      const method = editCase ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setEditCase(null);
        loadCases();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = (c) => {
    if (user.role === 'admin') return true;
    return c.createdBy?._id === user.id || c.createdBy === user.id;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📋 Cases</h1>
          <div className="page-header-sub">{cases.length} total case{cases.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => exportPdf(cases)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
               <polyline points="14 2 14 8 20 8" />
               <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            Export PDF
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Case
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'Schengen', 'USA', 'UK', 'Canada'].map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Countries' : f}
            </button>
          ))}
        </div>
        
        <select 
          className="form-select" 
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="all">All Users</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>

        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, phone, or Odoo ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>No cases found</h3>
          <p>Create your first case to get started</p>
        </div>
      ) : (
        <div className="cases-grid">
          {cases.map(c => (
            <div key={c._id} className="case-card">
              <div className="case-card-header">
                <h3>{c.clientName}</h3>
                <span className={`country-badge ${c.country.toLowerCase()}`}>
                  {c.country}
                </span>
              </div>
              <div className="case-card-body">
                <div className="case-field">
                  <span className="case-field-label">📅 Appointment</span>
                  <span className="case-field-value">{formatDate(c.appointmentDate)}</span>
                </div>
                <div className="case-field">
                  <span className="case-field-label">🔢 Odoo ID</span>
                  <span className="case-field-value">{c.odooId}</span>
                </div>
                {c.visaType && (
                  <div className="case-field">
                    <span className="case-field-label">🏷️ Visa Type</span>
                    <span className="case-field-value">{c.visaType}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="case-field">
                    <span className="case-field-label">📞 Phone</span>
                    <span className="case-field-value">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="case-field">
                    <span className="case-field-label">📧 Email</span>
                    <span className="case-field-value">{c.email}</span>
                  </div>
                )}
                {c.nextStep && (
                  <div className="case-field">
                    <span className="case-field-label">➡️ Next Step</span>
                    <span className="case-field-value">{c.nextStep}</span>
                  </div>
                )}
                {c.followUpName && (
                  <div className="case-field">
                    <span className="case-field-label">🔄 Follow Up</span>
                    <span className="case-field-value">{c.followUpName}</span>
                  </div>
                )}
                <div className="case-field">
                  <span className="case-field-label">👤 Created By</span>
                  <span className="case-field-value">{c.createdBy?.name || 'Unknown'}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <ProgressBar value={c.progress} />
                </div>
              </div>
              <div className="case-card-footer">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formatDate(c.createdAt)}
                </span>
                <div className="case-card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleExportPdfSingle(c)} title="Download PDF">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  {canEdit(c) && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(c)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(c._id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editCase ? 'Edit Case' : 'Create New Case'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && (
              <div style={{ padding: '0 24px' }}>
                <div className="alert alert-error">{error}</div>
              </div>
            )}
            <CaseForm
              caseData={editCase}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
              loading={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
