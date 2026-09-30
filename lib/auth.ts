/**
 * Authentication and access control helpers for protected admin routes.
 */
import { hashPassword, timingSafeEqual } from '@/lib/security';
import { getAdminPassword } from '@/lib/env';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mp_secure_auth_session_secret_default_2026';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  role: 'admin' | 'operator';
  expiresAt: number;
}

/**
 * Creates a signed session token.
 */
export async function createAdminSessionToken(role: 'admin' | 'operator' = 'admin'): Promise<string> {
  const expiresAt = Date.now() + TOKEN_MAX_AGE_MS;
  const payload = JSON.stringify({ role, expiresAt });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = await hashPassword(base64Payload, SESSION_SECRET);
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies an admin session token.
 */
export async function verifyAdminSessionToken(token: string | null | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  const expectedSignature = await hashPassword(base64Payload, SESSION_SECRET);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const raw = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as AdminSession;
    if (Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validates admin password against configured secret.
 */
export async function validateAdminPassword(plainTextPassword: string): Promise<boolean> {
  if (!plainTextPassword) return false;
  const correctPassword = getAdminPassword();
  const inputHash = await hashPassword(plainTextPassword);
  const correctHash = await hashPassword(correctPassword);
  return timingSafeEqual(inputHash, correctHash);
}
