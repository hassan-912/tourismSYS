'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import MGPlusPage from '@/components/MGPlusPage';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Chat from '@/components/Chat';
import { useEffect } from 'react';

function AppContent() {
  const { user, loading, authFetch } = useAuth();

  // Seed the database on first load
  useEffect(() => {
    const seedDb = async () => {
      try {
        await fetch('/api/seed', { method: 'POST' });
      } catch (e) {
        // ignore
      }
    };
    seedDb();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <Navbar />
      <div className="app-layout">
        <main className="main-content">
          <MGPlusPage />
        </main>
      </div>
      <Chat />
    </>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
