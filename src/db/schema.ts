import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  identifier: text('identifier').notNull().unique(), // e.g. 9HR-EMP-1001 or email
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // 'candidate' | 'recruiter' | 'admin' | 'super_admin'
  passwordHash: text('password_hash').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'disabled' | 'pending'
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: text('mfa_secret'),
  department: text('department'),
  designation: text('designation'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  lastLoginAt: timestamp('last_login_at'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const candidateProfiles = pgTable('candidate_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  candidateId: text('candidate_id').notNull().unique(),
  recruiterId: integer('recruiter_id').references(() => users.id),
  joiningDate: text('joining_date'),
  location: text('location').default('Bengaluru, India'),
  department: text('department').default('Engineering'),
  designation: text('designation').default('Software Engineer'),
  stage: text('stage').default('docs_pending'), // 'offer_accepted' | 'docs_pending' | 'under_review' | 'verified' | 'joining_scheduled' | 'joined'
  panNumber: text('pan_number'),
  aadhaarNumber: text('aadhaar_number'),
  bankName: text('bank_name'),
  bankAccountNumber: text('bank_account_number'),
  bankIfsc: text('bank_ifsc'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelation: text('emergency_contact_relation'),
  laptopPreference: text('laptop_preference'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  docType: text('doc_type').notNull(), // 'aadhaar' | 'pan' | 'degree' | 'relieving' | 'bank_proof' | 'offer_letter'
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').notNull(),
  fileUrl: text('file_url').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  feedback: text('feedback'),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const onboardingTasks = pgTable('onboarding_tasks', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'documents' | 'compliance' | 'it_setup' | 'hr_induction'
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed'
  dueDate: text('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  severity: text('severity').default('info'), // 'info' | 'warning' | 'critical'
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemConfigs = pgTable('system_configs', {
  id: serial('id').primaryKey(),
  configKey: text('config_key').notNull().unique(),
  configValue: text('config_value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  candidateProfile: one(candidateProfiles, {
    fields: [users.id],
    references: [candidateProfiles.userId],
  }),
  documents: many(documents),
  tasks: many(onboardingTasks),
  auditLogs: many(auditLogs),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one }) => ({
  user: one(users, {
    fields: [candidateProfiles.userId],
    references: [users.id],
  }),
  recruiter: one(users, {
    fields: [candidateProfiles.recruiterId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  candidate: one(users, {
    fields: [documents.candidateId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [documents.verifiedBy],
    references: [users.id],
  }),
}));
