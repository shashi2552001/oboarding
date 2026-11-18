import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CandidateProfile, DocumentItem, OnboardingTask } from '../../types/index.ts';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  Laptop,
  CreditCard,
  Phone,
  UserCheck,
  Save,
  Check,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface CandidateDashboardProps {
  activeTab: string;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ activeTab }) => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form State
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [laptopPreference, setLaptopPreference] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Document Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('aadhaar');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch overview from backend
  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/candidate/overview', {
        headers: {
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setDocuments(data.documents || []);
        setTasks(data.tasks || []);

        if (data.profile) {
          setPanNumber(data.profile.panNumber || '');
          setAadhaarNumber(data.profile.aadhaarNumber || '');
          setBankName(data.profile.bankName || '');
          setBankAccountNumber(data.profile.bankAccountNumber || '');
          setBankIfsc(data.profile.bankIfsc || '');
          setEmergencyContactName(data.profile.emergencyContactName || '');
          setEmergencyContactPhone(data.profile.emergencyContactPhone || '');
          setEmergencyContactRelation(data.profile.emergencyContactRelation || '');
          setLaptopPreference(data.profile.laptopPreference || '');
        }
      }
    } catch (err) {
      console.error('Failed to load candidate overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({
          panNumber,
          aadhaarNumber,
          bankName,
          bankAccountNumber,
          bankIfsc,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactRelation,
          laptopPreference,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Onboarding profile details saved to Cloud SQL database!' });
        fetchOverview();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save profile' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network connection failed' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Toggle Task Status
  const handleToggleTask = async (task: OnboardingTask) => {
    const nextStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      const res = await fetch(`/api/candidate/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (e) {
      console.error('Task update failed:', e);
    }
  };

  // Upload Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocType || !uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const fileName = uploadFileName || `${uploadDocType.toUpperCase()}_document.pdf`;
      const res = await fetch('/api/candidate/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || sessionStorage.getItem('9hr_auth_token')}`,
        },
        body: JSON.stringify({
          docType: uploadDocType,
          title: uploadTitle.trim(),
          fileName,
          fileSize: '540 KB',
        }),
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setUploadTitle('');
        setUploadFileName('');
        fetchOverview();
      }
    } catch (e) {
      console.error('Doc upload failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm">Loading Candidate Onboarding Records...</p>
      </div>
    );
  }

  // Calculated Progress
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Candidate Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                Candidate ID: {profile?.candidateId || user?.identifier}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                Stage: {profile?.stage.replace('_', ' ') || 'Docs Pending'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hello, {user?.fullName}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Welcome to the 9HR India onboarding journey. Complete your verification checklist and document uploads before your joining date.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex-shrink-0">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Target DOJ</div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{profile?.joiningDate || '2026-11-02'}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Onboarding Progress</div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{progressPercent}% Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-800">
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* VIEW: OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Verification Health */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Submission Checklist</h3>
                <p className="text-xs text-slate-500">Government identity, qualifications, and previous tenure letters</p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{doc.title}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {doc.fileName} • {doc.fileSize}
                      </div>
                    </div>
                  </div>
                  <div>
                    {doc.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    )}
                    {doc.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        In Review
                      </span>
                    )}
                    {doc.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Needs Resubmission
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter & Assigned Team Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Assigned Recruiter Partner
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  AS
                </div>
                <div>
                  <div className="font-bold text-slate-900">Ananya Sen</div>
                  <div className="text-xs text-slate-500">Lead Talent Acquisition Partner</div>
                  <div className="text-xs text-blue-600 font-mono mt-0.5">recruiter@9hrindia.com</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                "Hi {user?.fullName?.split(' ')[0]}, please upload your degree certificate and updated bank cancelled cheque to finalize your payroll setup before Friday."
              </div>
            </div>

            {/* Workstation & Location */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Workstation & Campus
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Joining Campus</div>
                    <div>{profile?.location || 'Bengaluru - Outer Ring Road Campus'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Laptop className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Hardware Allocation</div>
                    <div>{profile?.laptopPreference || 'MacBook Pro 16" (M3 Pro)'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mandatory Verification Documents</h2>
              <p className="text-xs text-slate-500">
                All documents are cryptographically verified by 9HR India HR Compliance before your start date.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{doc.title}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {doc.fileName} • {doc.fileSize}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    {doc.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    )}
                    {doc.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        In Review
                      </span>
                    )}
                    {doc.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Needs Resubmission
                      </span>
                    )}
                  </div>
                </div>

                {doc.feedback && (
                  <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Reviewer Note: </span>
                    {doc.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: ONBOARDING TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Pre-Joining Onboarding Tasks</h2>
            <p className="text-xs text-slate-500">
              Interactive task tracker for compliance, statutory benefits, and IT hardware setup.
            </p>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                  task.status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    task.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 hover:border-blue-600'
                  }`}
                >
                  {task.status === 'completed' && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-sm font-semibold ${
                        task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <div className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Target Due: {task.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PROFILE & STATUTORY DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal, Banking & Statutory Profile</h2>
              <p className="text-xs text-slate-500">
                Data saved here is securely committed to Cloud SQL PostgreSQL.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Statutory Identifiers
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN Number (10 alphanumeric characters)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aadhaar Number (12 digits masked)
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-8821"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Banking Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Salary Account Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Account number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0000240"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Emergency Contact
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Emergency contact full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relation</label>
                  <input
                    type="text"
                    value={emergencyContactRelation}
                    onChange={(e) => setEmergencyContactRelation(e.target.value)}
                    placeholder="e.g. Spouse / Parent"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* IT Equipment Preference */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                IT Hardware Selection
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laptop Preference
                </label>
                <select
                  value={laptopPreference}
                  onChange={(e) => setLaptopPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="MacBook Pro 16 inch (M3 Pro / 36GB RAM)">
                    Apple MacBook Pro 16&quot; (Apple M3 Pro / 36GB RAM / 1TB SSD)
                  </option>
                  <option value="MacBook Pro 14 inch (M3 Pro / 18GB RAM)">
                    Apple MacBook Pro 14&quot; (Apple M3 Pro / 18GB RAM / 512GB SSD)
                  </option>
                  <option value="ThinkPad T16 (Intel Core i7 / 32GB RAM)">
                    Lenovo ThinkPad T16 (Intel Core Ultra 7 / 32GB RAM / 1TB SSD)
                  </option>
                  <option value="Dell Precision 5680 Workstation">
                    Dell Precision 5680 (Core i9 / RTX 4080 / 64GB RAM)
                  </option>
                </select>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload Onboarding Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              Supported file formats: PDF, JPEG, PNG (max 10MB).
            </p>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="aadhaar">Aadhaar Card (Identity Proof)</option>
                  <option value="pan">PAN Card (Tax Proof)</option>
                  <option value="degree">Degree / Educational Certificate</option>
                  <option value="relieving">Relieving / Experience Certificate</option>
                  <option value="bank_proof">Cancelled Cheque / Bank Passbook</option>
                  <option value="offer_letter">Signed Offer Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Bachelor Degree Certificate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Attachment
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadFileName(f.name);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
