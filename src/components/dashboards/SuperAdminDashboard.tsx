import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, AuditLogItem, SystemConfigItem } from '../../types/index.ts';
import {
  ShieldAlert,
  Users,
  Sliders,
  Database,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Server,
  Activity,
  UserPlus,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  activeTab: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab }) => {
  const { token, user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [systemData, setSystemData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'candidate' | 'recruiter' | 'admin' | 'super_admin'>('recruiter');
  const [newDepartment, setNewDepartment] = useState('Talent Acquisition');
  const [newDesignation, setNewDesignation] = useState('Recruiter');
  const [newMfa, setNewMfa] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const fetchSuperAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
      };

      const [resUsers, resLogs, resSystem] = await Promise.all([
        fetch('/api/super-admin/users', { headers }),
        fetch('/api/super-admin/audit-logs', { headers }),
        fetch('/api/super-admin/system', { headers }),
      ]);

      if (resUsers.ok) {
        const u = await resUsers.json();
        setUsersList(u.users || []);
      }
      if (resLogs.ok) {
        const l = await resLogs.json();
        setAuditLogs(l.logs || []);
      }
      if (resSystem.ok) {
        const s = await resSystem.json();
        setSystemData(s);
      }
    } catch (err) {
      console.error('Super Admin fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  // Modify user role or status
  const handleUpdateUser = async (userId: number, payload: any) => {
    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchSuperAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user failed:', err);
    }
  };

  // Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier.trim() || !newEmail.trim() || !newFullName.trim()) return;

    setIsSubmittingUser(true);
    try {
      const res = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({
          identifier: newIdentifier.trim(),
          email: newEmail.trim(),
          fullName: newFullName.trim(),
          role: newRole,
          department: newDepartment,
          designation: newDesignation,
          mfaEnabled: newMfa,
        }),
      });

      if (res.ok) {
        setIsAddUserOpen(false);
        setNewIdentifier('');
        setNewEmail('');
        setNewFullName('');
        fetchSuperAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Create user error:', err);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mb-3" />
        <p className="text-sm">Loading Security Governance Console...</p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.identifier.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.severity === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              Root Security & RBAC Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            9HR India System Governance & Security Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-tier authorization roles, inspect immutable audit events, and configure enterprise policies.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision System User</span>
        </button>
      </div>

      {/* System Telemetry & Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Cloud SQL PostgreSQL</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 font-mono">
            {systemData?.metrics?.databaseRegion || 'asia-southeast1'}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Online & Synced</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Active Sessions</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {systemData?.metrics?.activeSessions || 1}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cloud SQL session tokens</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Provisioned Accounts</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {systemData?.metrics?.totalUsers || usersList.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all 4 tiers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Audit Stream</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{auditLogs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded compliance events</div>
        </div>
      </div>

      {/* VIEW: USER DIRECTORY & ROLES */}
      {(activeTab === 'users' || !activeTab) && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">System Users & Access Permissions</h2>
              <p className="text-xs text-slate-500">
                Grant or revoke roles, enforce MFA, and reset temporary lockouts.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user, ID, role..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">User Profile</th>
                  <th className="py-3 px-6">Assigned Role</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6">MFA Policy</th>
                  <th className="py-3 px-6">Last Login</th>
                  <th className="py-3 px-6 text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {u.identifier} • {u.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <select
                        value={u.role}
                        disabled={currentUser?.id === u.id}
                        onChange={(e) =>
                          handleUpdateUser(u.id, { role: e.target.value })
                        }
                        className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-xs cursor-pointer capitalize disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">HR Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() =>
                          handleUpdateUser(u.id, {
                            status: u.status === 'active' ? 'disabled' : 'active',
                          })
                        }
                        disabled={currentUser?.id === u.id}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {u.status === 'active' ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() =>
                          handleUpdateUser(u.id, { mfaEnabled: !u.mfaEnabled })
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                          u.mfaEnabled
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{u.mfaEnabled ? 'Enforced' : 'Optional'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {u.failedLoginAttempts && u.failedLoginAttempts > 0 ? (
                        <button
                          onClick={() => handleUpdateUser(u.id, { resetLock: true })}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Clear Lockout ({u.failedLoginAttempts})
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SECURITY & AUDIT LOGS */}
      {(activeTab === 'audit_logs' || activeTab === 'system') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Real-Time Security Audit Stream</h2>
              <p className="text-xs text-slate-500">
                Immutable records stored in PostgreSQL Cloud SQL audit_logs table.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-6">Timestamp</th>
                  <th className="py-2.5 px-6">Event Action</th>
                  <th className="py-2.5 px-6">User / Identifier</th>
                  <th className="py-2.5 px-6">IP / Client</th>
                  <th className="py-2.5 px-6">Details</th>
                  <th className="py-2.5 px-6">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-6 font-bold text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-6 text-slate-700">
                      {log.userIdentifier || `User #${log.userId || 'System'}`}
                    </td>
                    <td className="py-2.5 px-6 text-slate-500 text-[11px]">
                      {log.ipAddress || 'internal'}
                    </td>
                    <td className="py-2.5 px-6 text-slate-600 max-w-xs truncate font-sans text-xs">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Provision System User</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add candidate, recruiter, or administrator directly to Cloud SQL PostgreSQL.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee / Candidate ID</label>
                <input
                  type="text"
                  required
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value.toUpperCase())}
                  placeholder="e.g. 9HR-REC-205 or 9HR-EMP-1050"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Suresh Menon"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="suresh.m@9hrindia.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">HR Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Department"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newMfa"
                  checked={newMfa}
                  onChange={(e) => setNewMfa(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="newMfa" className="font-semibold text-slate-700">
                  Enforce Multi-Factor Authentication (MFA)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUser ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
