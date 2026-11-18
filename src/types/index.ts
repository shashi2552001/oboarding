export type UserRole = 'candidate' | 'recruiter' | 'admin' | 'super_admin';

export interface User {
  id: number;
  identifier: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
  avatarUrl: string | null;
  mfaEnabled: boolean | null;
  lastLoginAt?: string | null;
  failedLoginAttempts?: number | null;
}

export type CandidateStage =
  | 'offer_accepted'
  | 'docs_pending'
  | 'under_review'
  | 'verified'
  | 'joining_scheduled'
  | 'joined';

export interface CandidateProfile {
  id: number;
  userId: number;
  candidateId: string;
  recruiterId: number | null;
  joiningDate: string | null;
  location: string | null;
  department: string | null;
  designation: string | null;
  stage: CandidateStage;
  panNumber: string | null;
  aadhaarNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  laptopPreference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface DocumentItem {
  id: number;
  candidateId: number;
  docType: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  status: DocumentStatus;
  feedback: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  uploadedAt: string;
}

export interface OnboardingTask {
  id: number;
  candidateId: number;
  title: string;
  description: string | null;
  category: 'documents' | 'compliance' | 'it_setup' | 'hr_induction';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  userId: number | null;
  userIdentifier?: string;
  userFullName?: string;
  userRole?: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface SystemConfigItem {
  id: number;
  configKey: string;
  configValue: string;
  description: string | null;
  updatedAt: string;
}

export interface EnrichedCandidate {
  userId: number;
  candidateId: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string;
  designation: string;
  stage: CandidateStage;
  joiningDate: string;
  location: string;
  recruiterId: number | null;
  createdAt: string;
  documents: DocumentItem[];
  docStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}
