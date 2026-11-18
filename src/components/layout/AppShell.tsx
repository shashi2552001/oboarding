import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { NineHrLogo } from '../NineHrLogo.tsx';
import {
  FileText,
  Users,
  CheckSquare,
  Shield,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  Home,
  UserCheck,
  FolderGit2,
  BarChart3,
  Sliders,
  ShieldAlert,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!user) return null;

  // Determine navigation items based on role
  const getNavItems = () => {
    switch (user.role) {
      case 'candidate':
        return [
          { id: 'overview', label: 'Onboarding Overview', icon: Home },
          { id: 'documents', label: 'My Documents', icon: FileText, badge: 'Required' },
          { id: 'tasks', label: 'Onboarding Tasks', icon: CheckSquare },
          { id: 'profile', label: 'Personal & Statutory Profile', icon: User },
        ];
      case 'recruiter':
        return [
          { id: 'candidates', label: 'Assigned Candidates', icon: Users },
          { id: 'verification', label: 'Document Verification', icon: UserCheck, badge: 'Review' },
          { id: 'joining_tracker', label: 'Joining Tracker', icon: Clock },
          { id: 'invite', label: 'Invite Candidate', icon: Sparkles },
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Operations Dashboard', icon: BarChart3 },
          { id: 'candidates', label: 'Candidate Management', icon: Users },
          { id: 'recruiters', label: 'Recruiter Workloads', icon: UserCheck },
          { id: 'reports', label: 'Compliance Reports', icon: FileText },
        ];
      case 'super_admin':
        return [
          { id: 'users', label: 'User Directory & Roles', icon: Users },
          { id: 'audit_logs', label: 'Security & Audit Logs', icon: ShieldAlert, badge: 'Live' },
          { id: 'system', label: 'System Health & Policies', icon: Sliders },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Role display metadata
  const roleMeta = {
    candidate: { label: 'Candidate Portal', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
    recruiter: { label: 'Recruiter Workspace', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
    admin: { label: 'HR Operations Admin', color: 'bg-purple-500/10 text-purple-700 border-purple-300' },
    super_admin: { label: 'Super Admin Console', color: 'bg-amber-500/10 text-amber-700 border-amber-300' },
  }[user.role] || { label: 'Portal', color: 'bg-slate-100 text-slate-800' };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <NineHrLogo size="sm" variant="white" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Left Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between border-r border-slate-800 z-30 ${
          isMobileMenuOpen ? 'fixed inset-0 top-14' : 'relative'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800/80 hidden md:block">
            <NineHrLogo size="md" variant="white" />
          </div>

          {/* Current Role Badge */}
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Active Environment
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.fullName}</div>
              <div className="text-xs text-slate-400 font-mono truncate">{user.identifier}</div>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Navbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Breadcrumbs & Status */}
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-slate-800">9HR India</span>
            <span className="text-slate-300">/</span>
            <span className="capitalize text-slate-500">{user.role.replace('_', ' ')}</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-blue-600 capitalize">
              {navItems.find((n) => n.id === activeTab)?.label || activeTab}
            </span>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud SQL Connected</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase">Onboarding Notifications</span>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="py-2 space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-slate-800">
                      <div className="font-semibold text-blue-900">Document Verification SLA</div>
                      <div className="text-slate-600 mt-0.5">All submitted KYC and educational files are routed within 48h.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-slate-800">
                      <div className="font-semibold text-emerald-900">PostgreSQL Cloud SQL Active</div>
                      <div className="text-slate-600 mt-0.5">Session managed securely on asia-southeast1 instance.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{user.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
                    <div className="text-[11px] text-blue-600 font-semibold mt-1">ID: {user.identifier}</div>
                    {user.department && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{user.department}</div>
                    )}
                  </div>
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsLogoutConfirmOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Role Page Body */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Sign Out of 9HR India Portal?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Your server-managed session in Cloud SQL will be safely invalidated. You will need your Employee ID or Candidate ID to sign back in.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  logout();
                }}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
