'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import CasesPage from '@/components/CasesPage';
import Navbar from '@/components/Navbar';
import Chat from '@/components/Chat';

function AppContent() {
  const { user, loading } = useAuth();

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
          <CasesPage department="Study" />
        </main>
      </div>
      <Chat />
    </>
  );
}

export default function StudyPage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
