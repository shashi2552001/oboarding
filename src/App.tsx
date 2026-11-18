import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { CandidateDashboard } from './components/dashboards/CandidateDashboard.tsx';
import { RecruiterDashboard } from './components/dashboards/RecruiterDashboard.tsx';
import { AdminDashboard } from './components/dashboards/AdminDashboard.tsx';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard.tsx';
import { NineHrLogo } from './components/NineHrLogo.tsx';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Sync default tab when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'candidate') setActiveTab('overview');
      else if (user.role === 'recruiter') setActiveTab('candidates');
      else if (user.role === 'admin') setActiveTab('overview');
      else if (user.role === 'super_admin') setActiveTab('users');
    }
  }, [user?.role]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <NineHrLogo size="lg" variant="white" className="mb-6 animate-pulse" />
        <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Verifying secure PostgreSQL session token...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: Open directly on single login page
  if (!user) {
    return <LoginPage />;
  }

  // Render authorized role dashboard inside AppShell
  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {user.role === 'candidate' && <CandidateDashboard activeTab={activeTab} />}
      {user.role === 'recruiter' && <RecruiterDashboard activeTab={activeTab} />}
      {user.role === 'admin' && <AdminDashboard activeTab={activeTab} />}
      {user.role === 'super_admin' && <SuperAdminDashboard activeTab={activeTab} />}

      {/* Unauthorized Role Fallback */}
      {!['candidate', 'recruiter', 'admin', 'super_admin'].includes(user.role) && (
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-lg mx-auto mt-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Unauthorized Portal Access</h2>
          <p className="text-xs text-slate-600 mt-2">
            Your account ({user.identifier}) is assigned an unverified role ({user.role}). Please contact 9HR India HR Support.
          </p>
          <button
            onClick={logout}
            className="mt-6 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </AppShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
