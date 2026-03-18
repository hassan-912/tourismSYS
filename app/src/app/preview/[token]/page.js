'use client';

import { useState, useEffect, use } from 'react';
import DashboardPage from '@/components/DashboardPage';
import ProgressBar from '@/components/ProgressBar';
import Chat from '@/components/Chat';
import { AuthProvider } from '@/context/AuthContext';

function PreviewContent({ token }) {
  const [valid, setValid] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('cases');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    validateToken();
  }, []);

  useEffect(() => {
    if (valid) loadCases();
  }, [valid, filter, search]);

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/preview/${token}`);
      if (res.ok) {
        const data = await res.json();
        setValid(true);
        setCases(data.cases || []);
      } else {
        setValid(false);
      }
    } catch (error) {
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      let url = `/api/preview/${token}?view=cases`;
      if (filter !== 'all') url += `&country=${filter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Failed to load preview cases:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="login-page" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h1>⚠️ Invalid Link</h1>
          <p>This preview link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-layout">
      <div className="preview-banner">
        🔍 Preview Mode — Read Only Access
      </div>

      {/* Preview Nav */}
      <nav className="navbar" style={{ top: 48 }}>
        <span className="navbar-brand" style={{ cursor: 'default' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Tourism Tracker
        </span>
        <ul className="navbar-nav">
          <li>
            <button
              className={`nav-link ${activeView === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveView('cases')}
            >
              Cases
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
          </li>
        </ul>
        <div className="user-badge">
          <span>👁️ Manager Preview</span>
        </div>
      </nav>

      <div className="app-layout" style={{ marginTop: 112 }}>
        <main className="main-content" style={{ marginRight: 0, maxWidth: '100%' }}>
          {activeView === 'dashboard' ? (
            <DashboardPage previewToken={token} />
          ) : (
            <div>
              <div className="page-header">
                <div>
                  <h1>📋 Cases</h1>
                  <div className="page-header-sub">{cases.length} total cases</div>
                </div>
              </div>

              <div className="filters-bar">
                {['all', 'Schengen', 'USA', 'UK', 'Canada'].map(f => (
                  <button
                    key={f}
                    className={`filter-chip ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All Countries' : f}
                  </button>
                ))}
                <div className="search-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {cases.length === 0 ? (
                <div className="empty-state">
                  <h3>No cases found</h3>
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
                        <div className="case-field">
                          <span className="case-field-label">📞 Phone</span>
                          <span className="case-field-value">{c.phone}</span>
                        </div>
                        <div className="case-field">
                          <span className="case-field-label">📧 Email</span>
                          <span className="case-field-value">{c.email}</span>
                        </div>
                        {c.nextStep && (
                          <div className="case-field">
                            <span className="case-field-label">➡️ Next Step</span>
                            <span className="case-field-value">{c.nextStep}</span>
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
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          🔒 Read Only
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Chat isPreview={true} />
    </div>
  );
}

export default function PreviewPage({ params }) {
  const { token } = use(params);

  return (
    <AuthProvider>
      <PreviewContent token={token} />
    </AuthProvider>
  );
}
