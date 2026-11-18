import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import {
  users,
  candidateProfiles,
  documents,
  onboardingTasks,
  auditLogs,
  systemConfigs,
} from './schema.ts';

export async function seedDatabase() {
  console.log('Checking database status for 9HR India Pvt. Ltd....');

  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log(`Database already initialized with ${existingUsers.length} users.`);
    return;
  }

  console.log('Seeding initial production data for 9HR India Pvt. Ltd....');

  const defaultPassword = 'Password@9HR2026';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(defaultPassword, salt);

  // 1. Super Admin
  const [superAdmin] = await db
    .insert(users)
    .values({
      identifier: '9HR-SA-001',
      email: 'superadmin@9hrindia.com',
      fullName: 'Rajesh Sharma',
      role: 'super_admin',
      passwordHash,
      status: 'active',
      mfaEnabled: true,
      mfaSecret: '984512',
      department: 'Executive Governance & Technology',
      designation: 'Chief Information & Security Officer',
      phone: '+91 98450 11001',
    })
    .returning();

  // 2. HR Admin
  const [admin] = await db
    .insert(users)
    .values({
      identifier: '9HR-ADM-101',
      email: 'admin@9hrindia.com',
      fullName: 'Priya Varma',
      role: 'admin',
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      department: 'People Operations',
      designation: 'Senior Director - HR Operations',
      phone: '+91 98200 44211',
    })
    .returning();

  // 3. Recruiter
  const [recruiter] = await db
    .insert(users)
    .values({
      identifier: '9HR-REC-201',
      email: 'recruiter@9hrindia.com',
      fullName: 'Ananya Sen',
      role: 'recruiter',
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      department: 'Talent Acquisition',
      designation: 'Lead Talent Acquisition Partner',
      phone: '+91 97410 88320',
    })
    .returning();

  // 4. Primary Candidate
  const [candidate] = await db
    .insert(users)
    .values({
      identifier: '9HR-CAN-2024',
      email: 'candidate@9hrindia.com',
      fullName: 'Rohan Nair',
      role: 'candidate',
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      department: 'Engineering & Technology',
      designation: 'Senior Full Stack Engineer',
      phone: '+91 99001 55432',
    })
    .returning();

  // 5. Additional Candidates for realistic pipeline
  const [can2] = await db
    .insert(users)
    .values({
      identifier: '9HR-CAN-2025',
      email: 'kavita.krishnan@example.com',
      fullName: 'Kavita Krishnan',
      role: 'candidate',
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      department: 'Cloud & Infrastructure',
      designation: 'DevOps & Reliability Engineer',
      phone: '+91 98112 33445',
    })
    .returning();

  const [can3] = await db
    .insert(users)
    .values({
      identifier: '9HR-CAN-2026',
      email: 'amit.patel@example.com',
      fullName: 'Amit Patel',
      role: 'candidate',
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      department: 'Data Platform',
      designation: 'Data Platform Architect',
      phone: '+91 97223 44556',
    })
    .returning();

  const [can4] = await db
    .insert(users)
    .values({
      identifier: '9HR-CAN-2027',
      email: 'sneha.rao@example.com',
      fullName: 'Sneha Rao',
      role: 'candidate',
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      department: 'Product Design',
      designation: 'Lead Product Designer',
      phone: '+91 96334 55667',
    })
    .returning();

  // Profiles
  await db.insert(candidateProfiles).values([
    {
      userId: candidate.id,
      candidateId: '9HR-CAN-2024',
      recruiterId: recruiter.id,
      joiningDate: '2026-11-02',
      location: 'Bengaluru - Outer Ring Road Campus',
      department: 'Engineering & Technology',
      designation: 'Senior Full Stack Engineer',
      stage: 'docs_pending',
      panNumber: 'ABCDE1234F',
      aadhaarNumber: 'XXXX-XXXX-8821',
      bankName: 'HDFC Bank Ltd.',
      bankAccountNumber: '501002348912',
      bankIfsc: 'HDFC0000240',
      emergencyContactName: 'Geetha Nair',
      emergencyContactPhone: '+91 99001 55433',
      emergencyContactRelation: 'Spouse',
      laptopPreference: 'MacBook Pro 16" (M3 Pro / 36GB RAM)',
      notes: 'Background verification initiated. Top quartile technical evaluation.',
    },
    {
      userId: can2.id,
      candidateId: '9HR-CAN-2025',
      recruiterId: recruiter.id,
      joiningDate: '2026-11-09',
      location: 'Hyderabad - HITEC City Campus',
      department: 'Cloud & Infrastructure',
      designation: 'DevOps & Reliability Engineer',
      stage: 'under_review',
      panNumber: 'KLMNO5678P',
      aadhaarNumber: 'XXXX-XXXX-4432',
      bankName: 'ICICI Bank',
      bankAccountNumber: '001205001234',
      bankIfsc: 'ICIC0000012',
      laptopPreference: 'ThinkPad T16 (Linux Fedora Workstation)',
      notes: 'All educational and previous employer relieving letters submitted.',
    },
    {
      userId: can3.id,
      candidateId: '9HR-CAN-2026',
      recruiterId: recruiter.id,
      joiningDate: '2026-11-16',
      location: 'Pune - EON Free Zone Campus',
      department: 'Data Platform',
      designation: 'Data Platform Architect',
      stage: 'verified',
      panNumber: 'PQRST9012R',
      aadhaarNumber: 'XXXX-XXXX-9912',
      bankName: 'Axis Bank',
      bankAccountNumber: '912010045678',
      bankIfsc: 'UTIB0000123',
      laptopPreference: 'MacBook Pro 14" (M3 Max / 64GB RAM)',
      notes: 'Document verification completed by Recruiter Ananya Sen. Ready for induction scheduling.',
    },
    {
      userId: can4.id,
      candidateId: '9HR-CAN-2027',
      recruiterId: recruiter.id,
      joiningDate: '2026-10-27',
      location: 'Bengaluru - Outer Ring Road Campus',
      department: 'Product Design',
      designation: 'Lead Product Designer',
      stage: 'joining_scheduled',
      panNumber: 'UVWXY3456S',
      aadhaarNumber: 'XXXX-XXXX-1144',
      bankName: 'State Bank of India',
      bankAccountNumber: '320011223344',
      bankIfsc: 'SBIN0001234',
      laptopPreference: 'MacBook Pro 16" Liquid Retina XDR',
      notes: 'Day 1 induction kit prepared. Badge access card provisioned.',
    },
  ]);

  // Documents for Candidate 1 (Rohan Nair)
  await db.insert(documents).values([
    {
      candidateId: candidate.id,
      docType: 'pan',
      title: 'Permanent Account Number (PAN) Card',
      fileName: 'PAN_Rohan_Nair.pdf',
      fileSize: '412 KB',
      fileUrl: '/uploads/PAN_Rohan_Nair.pdf',
      status: 'approved',
      feedback: 'Verified against NSDL database. Name matches offer letter.',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
    {
      candidateId: candidate.id,
      docType: 'aadhaar',
      title: 'Aadhaar Identity Card (Front & Back)',
      fileName: 'Aadhaar_Card_Masked.pdf',
      fileSize: '720 KB',
      fileUrl: '/uploads/Aadhaar_Card_Masked.pdf',
      status: 'pending',
      feedback: 'Under review by HR compliance desk.',
    },
    {
      candidateId: candidate.id,
      docType: 'degree',
      title: 'Highest Educational Qualification Degree Certificate',
      fileName: 'BTech_Degree_Certificate.pdf',
      fileSize: '1.4 MB',
      fileUrl: '/uploads/BTech_Degree_Certificate.pdf',
      status: 'pending',
      feedback: 'Pending verification with university clearing registry.',
    },
    {
      candidateId: candidate.id,
      docType: 'relieving',
      title: 'Previous Employer Relieving & Service Letter',
      fileName: 'Relieving_Letter_PrevOrg.pdf',
      fileSize: '890 KB',
      fileUrl: '/uploads/Relieving_Letter_PrevOrg.pdf',
      status: 'rejected',
      feedback: 'Official seal is slightly blurred. Please re-upload a clear scanned copy.',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
    {
      candidateId: candidate.id,
      docType: 'bank_proof',
      title: 'Cancelled Cheque or Bank Passbook Proof',
      fileName: 'HDFC_Cancelled_Cheque.pdf',
      fileSize: '310 KB',
      fileUrl: '/uploads/HDFC_Cancelled_Cheque.pdf',
      status: 'approved',
      feedback: 'Account number and IFSC code confirmed for payroll setup.',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
    // Documents for Candidate 2 (Kavita)
    {
      candidateId: can2.id,
      docType: 'pan',
      title: 'PAN Card',
      fileName: 'PAN_Kavita.pdf',
      fileSize: '380 KB',
      fileUrl: '/uploads/PAN_Kavita.pdf',
      status: 'approved',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
    {
      candidateId: can2.id,
      docType: 'aadhaar',
      title: 'Aadhaar Card',
      fileName: 'Aadhaar_Kavita.pdf',
      fileSize: '650 KB',
      fileUrl: '/uploads/Aadhaar_Kavita.pdf',
      status: 'pending',
    },
    {
      candidateId: can2.id,
      docType: 'degree',
      title: 'MTech Degree Certificate',
      fileName: 'Degree_Kavita.pdf',
      fileSize: '1.2 MB',
      fileUrl: '/uploads/Degree_Kavita.pdf',
      status: 'pending',
    },
    // Documents for Candidate 3 (Amit)
    {
      candidateId: can3.id,
      docType: 'pan',
      title: 'PAN Card',
      fileName: 'PAN_Amit.pdf',
      fileSize: '450 KB',
      fileUrl: '/uploads/PAN_Amit.pdf',
      status: 'approved',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
    {
      candidateId: can3.id,
      docType: 'aadhaar',
      title: 'Aadhaar Card',
      fileName: 'Aadhaar_Amit.pdf',
      fileSize: '820 KB',
      fileUrl: '/uploads/Aadhaar_Amit.pdf',
      status: 'approved',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
    {
      candidateId: can3.id,
      docType: 'degree',
      title: 'BE Computer Science Degree',
      fileName: 'BE_Degree_Amit.pdf',
      fileSize: '1.5 MB',
      fileUrl: '/uploads/BE_Degree_Amit.pdf',
      status: 'approved',
      verifiedBy: recruiter.id,
      verifiedAt: new Date(),
    },
  ]);

  // Tasks for Candidate 1
  await db.insert(onboardingTasks).values([
    {
      candidateId: candidate.id,
      title: 'Sign Digital Offer Letter & Compensation Structure',
      description: 'Review the 9HR India employment terms, benefits, and sign digitally.',
      category: 'compliance',
      status: 'completed',
      dueDate: '2026-10-22',
      completedAt: new Date(),
    },
    {
      candidateId: candidate.id,
      title: 'Upload Mandatory Identity & Education Documents',
      description: 'Submit PAN, Aadhaar, degree certificates, and previous experience letters.',
      category: 'documents',
      status: 'in_progress',
      dueDate: '2026-10-25',
    },
    {
      candidateId: candidate.id,
      title: 'IT Hardware & Workstation Requisition',
      description: 'Select your preferred laptop configuration, peripheral needs, and shipping address.',
      category: 'it_setup',
      status: 'pending',
      dueDate: '2026-10-26',
    },
    {
      candidateId: candidate.id,
      title: 'Complete Statutory PF / Gratuity / ESI Declaration',
      description: 'Provide Universal Account Number (UAN) and nominee declarations for statutory benefits.',
      category: 'compliance',
      status: 'pending',
      dueDate: '2026-10-28',
    },
    {
      candidateId: candidate.id,
      title: 'Day 1 Virtual Induction & Orientation Briefing',
      description: 'Attend the welcome session hosted by the 9HR People Experience team.',
      category: 'hr_induction',
      status: 'pending',
      dueDate: '2026-11-02',
    },
  ]);

  // Initial System Configs
  await db.insert(systemConfigs).values([
    {
      configKey: 'PORTAL_NAME',
      configValue: '9HR India Pvt. Ltd. Enterprise Onboarding Portal',
      description: 'System organization brand title',
    },
    {
      configKey: 'SESSION_TIMEOUT_MINUTES',
      configValue: '120',
      description: 'Inactivity session timeout duration',
    },
    {
      configKey: 'MANDATORY_MFA_ROLES',
      configValue: 'super_admin',
      description: 'Roles requiring Multi-Factor Authentication',
    },
    {
      configKey: 'DOC_MAX_FILE_SIZE_MB',
      configValue: '10',
      description: 'Maximum document upload file size in Megabytes',
    },
    {
      configKey: 'COMPANY_SUPPORT_EMAIL',
      configValue: 'onboarding-support@9hrindia.com',
      description: 'Corporate HR helpdesk email',
    },
  ]);

  // Initial Security Audit Logs
  await db.insert(auditLogs).values([
    {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZED',
      details: '9HR India Enterprise HR Onboarding Portal initialized with security policies.',
      ipAddress: '127.0.0.1',
      userAgent: 'Server Provisioner',
      severity: 'info',
    },
    {
      userId: admin.id,
      action: 'WORKFLOW_CONFIGURED',
      details: 'Onboarding document requirements and SLA set to 48 hours for document verification.',
      ipAddress: '192.168.1.10',
      userAgent: 'HR Ops Workstation',
      severity: 'info',
    },
    {
      userId: recruiter.id,
      action: 'DOC_VERIFIED',
      details: 'PAN Card approved for Candidate Rohan Nair (9HR-CAN-2024).',
      ipAddress: '192.168.1.42',
      userAgent: 'Recruiter Terminal',
      severity: 'info',
    },
  ]);

  console.log('Seeding completed successfully!');
}
