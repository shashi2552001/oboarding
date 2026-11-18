import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.ts';
import { users, sessions, auditLogs } from '../db/schema.ts';
import { eq, and, gt } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: number;
  identifier: string;
  email: string;
  fullName: string;
  role: 'candidate' | 'recruiter' | 'admin' | 'super_admin';
  status: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
  avatarUrl: string | null;
  mfaEnabled: boolean | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  sessionToken?: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function logAudit(
  userId: number | null,
  action: string,
  details: string,
  req?: Request,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req?.socket?.remoteAddress ||
      'unknown';
    const userAgent = req?.headers['user-agent'] || 'unknown';

    await db.insert(auditLogs).values({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      severity,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export async function authenticateToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token) return null;

  try {
    const now = new Date();
    const sessionList = await db
      .select({
        sessionId: sessions.id,
        expiresAt: sessions.expiresAt,
        userId: users.id,
        identifier: users.identifier,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
        department: users.department,
        designation: users.designation,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        mfaEnabled: users.mfaEnabled,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)));

    if (!sessionList || sessionList.length === 0) {
      return null;
    }

    const s = sessionList[0];
    if (s.status !== 'active') {
      return null;
    }

    return {
      id: s.userId,
      identifier: s.identifier,
      email: s.email,
      fullName: s.fullName,
      role: s.role as AuthenticatedUser['role'],
      status: s.status,
      department: s.department,
      designation: s.designation,
      phone: s.phone,
      avatarUrl: s.avatarUrl,
      mfaEnabled: s.mfaEnabled,
    };
  } catch (err) {
    console.error('Session lookup failed:', err);
    return null;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // 1. Bearer Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie Fallback
  if (!token && req.cookies && req.cookies['9hr_session']) {
    token = req.cookies['9hr_session'];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please log in with your Employee ID or Candidate ID.',
      code: 'UNAUTHENTICATED',
    });
  }

  const user = await authenticateToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'Your session has expired or is invalid. Please sign in again.',
      code: 'SESSION_EXPIRED',
    });
  }

  req.user = user;
  req.sessionToken = token;
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Session missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAudit(
        req.user.id,
        'UNAUTHORIZED_ROLE_ACCESS',
        `User ${req.user.identifier} (${req.user.role}) attempted accessing route requiring [${allowedRoles.join(', ')}]`,
        req,
        'warning'
      );
      return res.status(403).json({
        error: `Access Denied: Your account role (${req.user.role}) does not have permission to access this resource.`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
};
