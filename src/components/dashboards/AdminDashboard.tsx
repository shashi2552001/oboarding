import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  UserCheck,
  Building,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet,
  ArrowRightLeft,
  Search,
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab }) => {
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reassignCandidate, setReassignCandidate] = useState<any | null>(null);
  const [targetRecruiterId, setTargetRecruiterId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
      };

      const [resOverview, resRecruiters, resCandidates] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/recruiters', { headers }),
        fetch('/api/recruiter/candidates', { headers }),
      ]);

      if (resOverview.ok) setOverview(await resOverview.json());
      if (resRecruiters.ok) {
        const rData = await resRecruiters.json();
        setRecruiters(rData.recruiters || []);
      }
      if (resCandidates.ok) {
        const cData = await resCandidates.json();
        setCandidates(cData.candidates || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignCandidate || !targetRecruiterId) return;

    setIsReassigning(true);
    try {
      const res = await fetch(`/api/admin/candidates/${reassignCandidate.userId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({ recruiterId: targetRecruiterId }),
      });

      if (res.ok) {
        setReassignCandidate(null);
        setTargetRecruiterId('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Reassign failed:', err);
    } finally {
      setIsReassigning(false);
    }
  };

  const handleExportCSV = () => {
    if (!candidates.length) return;
    const headers = ['Candidate ID', 'Full Name', 'Email', 'Department', 'Designation', 'Stage', 'DOJ'];
    const rows = candidates.map((c) => [
      c.candidateId,
      `"${c.fullName}"`,
      c.email,
      `"${c.department}"`,
      `"${c.designation}"`,
      c.stage,
      c.joiningDate || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `9HR_Onboarding_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm">Loading HR Operations Analytics...</p>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            HR Operations & Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Onboarding Operations & Compliance Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor organizational SLA benchmarks, assign candidates, and inspect compliance velocity.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Onboarding CSV</span>
        </button>
      </div>

      {/* Operational KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Pipeline</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {overview?.totalCandidates || candidates.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cross-recruiter onboarding</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>SLA Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {overview?.slaComplianceRate || '96.4%'}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Target: &gt; 95% within 48 hours</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Avg Verification Velocity</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {overview?.avgVerificationDays || '1.8'} <span className="text-sm font-medium text-slate-500">Days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">From upload to verification</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Recruiters</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {recruiters.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Talent Acquisition Partners</div>
        </div>
      </div>

      {/* VIEW: OVERVIEW / RECRUITER WORKLOADS */}
      {(activeTab === 'overview' || activeTab === 'recruiters') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Talent Acquisition Workload Distribution</h2>
              <p className="text-xs text-slate-500">
                Turnaround efficiency and active pipeline allocations per recruiter
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruiters.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                    {r.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{r.fullName}</div>
                    <div className="text-xs text-slate-500 font-mono">{r.identifier}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Assigned Candidates:</span>
                    <span className="font-bold text-slate-900">{r.totalAssigned || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active In Flight:</span>
                    <span className="font-bold text-blue-600">{r.activeOnboarding || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <span className="font-mono text-[11px]">{r.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: CANDIDATES MANAGEMENT & REASSIGNMENT */}
      {(activeTab === 'overview' || activeTab === 'candidates') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enterprise Candidate Pipeline</h2>
              <p className="text-xs text-slate-500">
                Assign and rebalance candidates across the recruitment team
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Candidate</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Assigned Recruiter</th>
                  <th className="py-3 px-6">Stage</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((c) => {
                  const assignedRecruiter = recruiters.find((r) => r.id === c.recruiterId);
                  return (
                    <tr key={c.userId} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{c.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{c.candidateId}</div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="text-slate-800 font-semibold">{c.department}</div>
                        <div className="text-slate-500 text-[11px]">{c.designation}</div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-800">
                          {assignedRecruiter ? assignedRecruiter.fullName : 'Unassigned'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {assignedRecruiter ? assignedRecruiter.identifier : '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {c.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => {
                            setReassignCandidate(c);
                            setTargetRecruiterId(c.recruiterId?.toString() || '');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Reassign</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassign Recruiter Modal */}
      {reassignCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reassign Candidate Recruiter</h3>
            <p className="text-xs text-slate-500 mb-4">
              Reallocate <strong>{reassignCandidate.fullName}</strong> ({reassignCandidate.candidateId}) to an active Talent Acquisition Partner.
            </p>

            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Recruiter
                </label>
                <select
                  value={targetRecruiterId}
                  onChange={(e) => setTargetRecruiterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Recruiter --</option>
                  {recruiters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.identifier}) - {r.activeOnboarding || 0} active
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignCandidate(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReassigning || !targetRecruiterId}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isReassigning ? 'Saving...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
