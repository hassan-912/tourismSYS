'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        Tourism Tracker
      </Link>

      <ul className="navbar-nav">
        <li>
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Tourism
          </Link>
        </li>
        <li>
          <Link href="/mg-plus" className={`nav-link ${pathname === '/mg-plus' ? 'active' : ''}`}>
            MG+
          </Link>
        </li>
        <li>
          <Link href="/reviewer" className={`nav-link ${pathname === '/reviewer' ? 'active' : ''}`}>
            Reviewer
          </Link>
        </li>
        <li>
          <Link href="/jobseeker" className={`nav-link ${pathname === '/jobseeker' ? 'active' : ''}`}>
            Jobseeker
          </Link>
        </li>
        <li>
          <Link href="/immigration" className={`nav-link ${pathname === '/immigration' ? 'active' : ''}`}>
            Immigration
          </Link>
        </li>
        <li>
          <Link href="/study" className={`nav-link ${pathname === '/study' ? 'active' : ''}`}>
            Study
          </Link>
        </li>
        {['admin', 'moderator', 'sub-admin'].includes(user?.role?.toLowerCase()) && (
          <li>
            <Link href="/users" className={`nav-link ${pathname === '/users' ? 'active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Users
            </Link>
          </li>
        )}
      </ul>

      <div className="navbar-user">
        <div className="user-badge">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span>{user?.name}</span>
          <span style={{ fontSize: '0.72rem', opacity: 0.7, textTransform: 'capitalize' }}>
            ({user?.role})
          </span>
        </div>
        <button className="btn-logout" onClick={logout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}
