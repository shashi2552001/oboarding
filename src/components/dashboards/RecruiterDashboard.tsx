import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { EnrichedCandidate, CandidateStage, DocumentItem } from '../../types/index.ts';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileCheck2,
  ChevronRight,
  Plus,
  X,
  Check,
  Send,
  Building,
  MapPin,
  Laptop,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface RecruiterDashboardProps {
  activeTab: string;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ activeTab }) => {
  const { token, user } = useAuth();
  const [candidates, setCandidates] = useState<EnrichedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<EnrichedCandidate | null>(null);

  // Verification Modal State
  const [verificationDoc, setVerificationDoc] = useState<DocumentItem | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Invite Candidate Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('Engineering');
  const [inviteDesignation, setInviteDesignation] = useState('Software Engineer');
  const [inviteDoj, setInviteDoj] = useState('2026-11-16');
  const [inviteLocation, setInviteLocation] = useState('Bengaluru - Outer Ring Road Campus');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Fetch candidates from real backend
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recruiter/candidates', {
        headers: {
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        if (selectedCandidate) {
          const updated = data.candidates.find(
            (c: EnrichedCandidate) => c.userId === selectedCandidate.userId
          );
          if (updated) setSelectedCandidate(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Handle Document Verification
  const handleVerifyDocument = async (docId: number, status: 'approved' | 'rejected') => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/recruiter/documents/${docId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({
          status,
          feedback: status === 'rejected' ? rejectFeedback : 'Verified and approved by Recruiter.',
        }),
      });

      if (res.ok) {
        setVerificationDoc(null);
        setRejectFeedback('');
        fetchCandidates();
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Stage Advancement
  const handleUpdateStage = async (userId: number, newStage: CandidateStage) => {
    try {
      const res = await fetch(`/api/recruiter/candidates/${userId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (err) {
      console.error('Stage update failed:', err);
    }
  };

  // Handle Invite Candidate
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteSuccessMsg(null);
    try {
      const res = await fetch('/api/recruiter/candidates/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({
          fullName: inviteName.trim(),
          email: inviteEmail.trim(),
          phone: invitePhone.trim(),
          department: inviteDepartment,
          designation: inviteDesignation,
          joiningDate: inviteDoj,
          location: inviteLocation,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setInviteSuccessMsg(`Candidate invited with ID: ${data.candidateId}`);
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteName('');
          setInviteEmail('');
          setInvitePhone('');
          setInviteSuccessMsg(null);
          fetchCandidates();
        }, 1500);
      } else {
        alert(data.error || 'Failed to invite candidate');
      }
    } catch (e) {
      console.error('Invite error:', e);
    } finally {
      setIsInviting(false);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === 'all' || c.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const stages: { id: CandidateStage; label: string }[] = [
    { id: 'offer_accepted', label: 'Offer Accepted' },
    { id: 'docs_pending', label: 'Docs Pending' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'verified', label: 'Verified' },
    { id: 'joining_scheduled', label: 'Joining Scheduled' },
    { id: 'joined', label: 'Joined' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm">Fetching Recruiter Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Talent Acquisition & Onboarding Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Assigned Candidates & Document Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage onboarding milestones, verify statutory KYC records, and track Day 1 joining readiness.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite New Candidate</span>
        </button>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Assigned</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{candidates.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Pending Review</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {candidates.reduce((sum, c) => sum + c.docStats.pending, 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Docs Approved</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {candidates.reduce((sum, c) => sum + c.docStats.approved, 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Joining Scheduled</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {candidates.filter((c) => c.stage === 'joining_scheduled').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, ID (e.g. 9HR-CAN-2024), email, department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Pipeline Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Candidate Details</th>
                <th className="py-3.5 px-6">Department & Role</th>
                <th className="py-3.5 px-6">Target DOJ</th>
                <th className="py-3.5 px-6">Document Health</th>
                <th className="py-3.5 px-6">Pipeline Stage</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((c) => (
                <tr
                  key={c.userId}
                  onClick={() => setSelectedCandidate(c)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedCandidate?.userId === c.userId ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                      {c.candidateId} • {c.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">{c.department}</div>
                    <div className="text-slate-500 text-[11px]">{c.designation}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.joiningDate || 'TBD'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {c.docStats.approved} Approved
                      </span>
                      {c.docStats.pending > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          {c.docStats.pending} In Review
                        </span>
                      )}
                      {c.docStats.rejected > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          {c.docStats.rejected} Rejected
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        c.stage === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.stage === 'under_review'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : c.stage === 'joining_scheduled'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {stages.find((s) => s.id === c.stage)?.label || c.stage}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(c);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Verification Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600">
                  {selectedCandidate.candidateId}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-xs text-slate-500 capitalize">
                  {selectedCandidate.stage.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {selectedCandidate.fullName}
              </h2>
            </div>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Candidate Details Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Corporate Email:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selectedCandidate.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-semibold text-slate-900">
                  {selectedCandidate.phone || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department / Title:</span>
                <span className="font-semibold text-slate-900">
                  {selectedCandidate.department} • {selectedCandidate.designation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Workstation Campus:</span>
                <span className="font-semibold text-slate-900">
                  {selectedCandidate.location}
                </span>
              </div>
            </div>

            {/* Stage Transition Selector */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                Update Onboarding Stage
              </label>
              <div className="flex flex-wrap gap-1.5">
                {stages.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleUpdateStage(selectedCandidate.userId, st.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCandidate.stage === st.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Documents Verification List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Submitted Documents</h3>
                <span className="text-xs text-slate-500">
                  {selectedCandidate.documents.length} files attached
                </span>
              </div>

              {selectedCandidate.documents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No documents uploaded yet by this candidate.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCandidate.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">{doc.title}</div>
                          <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                            {doc.fileName} • {doc.fileSize}
                          </div>
                        </div>
                        <div>
                          {doc.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Approved
                            </span>
                          )}
                          {doc.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                          {doc.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {doc.feedback && (
                        <div className="mt-2 p-2 rounded bg-slate-50 text-slate-600 text-[11px]">
                          <strong>Feedback:</strong> {doc.feedback}
                        </div>
                      )}

                      {/* Recruiter Verification Action Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerifyDocument(doc.id, 'approved')}
                          disabled={isVerifying}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setVerificationDoc(doc)}
                          disabled={isVerifying}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Reject / Request Resubmit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Feedback Modal */}
      {verificationDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reject / Request Document Resubmission
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the compliance issue so the candidate can rectify and re-upload.
            </p>
            <textarea
              rows={3}
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="e.g. Seal is blurred, document expired, or signature is missing..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setVerificationDoc(null);
                  setRejectFeedback('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyDocument(verificationDoc.id, 'rejected')}
                disabled={isVerifying}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? 'Saving...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Candidate Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Invite New Candidate</h3>
                <p className="text-xs text-slate-500">
                  Generates an authorized Candidate ID in Cloud SQL and seeds onboarding tasks.
                </p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{inviteSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="vikram.m@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Data Platform">Data Platform</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={inviteDesignation}
                    onChange={(e) => setInviteDesignation(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target DOJ</label>
                  <input
                    type="date"
                    value={inviteDoj}
                    onChange={(e) => setInviteDoj(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
                  <input
                    type="text"
                    value={inviteLocation}
                    onChange={(e) => setInviteLocation(e.target.value)}
                    placeholder="Bengaluru Campus"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isInviting ? 'Inviting...' : 'Create & Dispatch Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
