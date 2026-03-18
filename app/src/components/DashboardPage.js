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
    <div>
      <div className="page-header">
        <div>
          <h1>📊 Dashboard</h1>
          <div className="page-header-sub">Overview of all cases and progress</div>
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

      {/* Country Stats */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
        Country Breakdown
      </h2>
      <div className="country-stats">
        {Object.entries(stats.countryStats).map(([country, data]) => (
          <div key={country} className="country-stat-card">
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
