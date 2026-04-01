'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ProgressBar';

const COUNTRY_EMOJI = { Schengen: '🇪🇺', USA: '🇺🇸', UK: '🇬🇧', Canada: '🇨🇦' };

export default function DashboardPage({ previewToken = null }) {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const url = previewToken
        ? `/api/preview/${previewToken}?view=dashboard`
        : '/api/dashboard';
      const res = previewToken
        ? await fetch(url)
        : await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(previewToken ? data.dashboard : data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!stats) return <div className="empty-state"><h3>Failed to load dashboard</h3></div>;

  return (
    <div className="dashboard-container" style={{ paddingBottom: '2rem' }}>
      <div 
        className="page-header" 
        style={{ 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, transparent 100%)',
          padding: '2rem', 
          borderRadius: '16px', 
          border: '1px solid var(--border)',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(45deg, var(--primary), #a18cd1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📊 Welcome to the Dashboard
          </h1>
          <div className="page-header-sub" style={{ fontSize: '1rem', opacity: 0.8 }}>
            Real-time overview of all cases, progress, and country breakdown.
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-icon primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-card-value">{stats.totalCases}</div>
          <div className="stat-card-label">Total Cases</div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-icon success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-card-value">{stats.completedCases}</div>
          <div className="stat-card-label">Completed</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-icon warning">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div className="stat-card-value">{stats.overallAvgProgress}%</div>
          <div className="stat-card-label">Avg. Progress</div>
        </div>

        <div className="stat-card info">
          <div className="stat-card-icon info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="stat-card-value">4</div>
          <div className="stat-card-label">Countries</div>
        </div>
      </div>

      {/* Chart Section */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, marginTop: 32 }}>
        Case Distribution Chart
      </h2>
      <div className="chart-container" style={{ background: 'var(--bg-card)', padding: '32px 24px 16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', height: '300px', gap: '8%', marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        {Object.entries(stats.countryStats).map(([country, data]) => {
          const heightPct = stats.totalCases > 0 ? (data.count / stats.totalCases) * 100 : 0;
          return (
            <div key={country} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', group: 'hover' }}>
              <div style={{ marginBottom: 8, fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                {data.count} <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>cases</span>
              </div>
              <div 
                className="animated-bar"
                style={{ 
                  width: '100%', 
                  maxWidth: '80px',
                  background: 'linear-gradient(to top, var(--primary), #a18cd1)', 
                  height: `${heightPct}%`, 
                  minHeight: '4px',
                  borderRadius: '12px 12px 0 0',
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 -4px 15px rgba(161, 140, 209, 0.3)'
                }}
              ></div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.2rem' }}>{COUNTRY_EMOJI[country]}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{country}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Country Stats */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
        Performance Details
      </h2>
      <div className="country-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {Object.entries(stats.countryStats).map(([country, data]) => (
          <div key={country} className="country-stat-card" style={{ transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}>
            <div className="country-stat-header">
              <h3>
                <span style={{ marginRight: 8 }}>{COUNTRY_EMOJI[country]}</span>
                {country}
              </h3>
              <span className={`country-badge ${country.toLowerCase()}`}>
                {data.count} case{data.count !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="country-stat-details">
              <div className="country-stat-item">
                <div className="value">{data.completed}</div>
                <div className="label">Completed</div>
              </div>
              <div className="country-stat-item">
                <div className="value">{data.count > 0 ? data.count - data.completed : 0}</div>
                <div className="label">In Progress</div>
              </div>
            </div>
            <ProgressBar value={data.avgProgress} />
          </div>
        ))}
      </div>
    </div>
  );
}
