'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import UsersPage from '@/components/UsersPage';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Chat from '@/components/Chat';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function UsersContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const normalizedRole = user.role.toLowerCase();
      if (!['admin', 'moderator', 'sub-admin'].includes(normalizedRole)) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <LoginPage />;
  const normalizedRole = user.role.toLowerCase();
  if (!['admin', 'moderator', 'sub-admin'].includes(normalizedRole)) return null;

  return (
    <>
      <Navbar />
      <div className="app-layout">
        <main className="main-content">
          <UsersPage />
        </main>
        <Sidebar />
      </div>
      <Chat />
    </>
  );
}

export default function Users() {
  return (
    <AuthProvider>
      <UsersContent />
    </AuthProvider>
  );
}
