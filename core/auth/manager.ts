import { hashString, generateRandomHex } from '@/lib/cryptoUtils';
import { UserProfile, UserRole, ApiKey, ROLE_PERMISSIONS } from './types';

export const PRESET_USERS: Record<string, UserProfile> = {
  'admin@merchantpulse.io': {
    id: 'usr_admin_001',
    name: 'Divyanshu Sinha',
    email: 'admin@merchantpulse.io',
    role: 'OWNER',
    merchantId: 'rzp_merchant_pulse',
    permissions: ROLE_PERMISSIONS.OWNER,
  },
  'ops@merchantpulse.io': {
    id: 'usr_ops_002',
    name: 'Rahul Sharma',
    email: 'ops@merchantpulse.io',
    role: 'OPS_MANAGER',
    merchantId: 'rzp_merchant_pulse',
    permissions: ROLE_PERMISSIONS.OPS_MANAGER,
  },
  'auditor@merchantpulse.io': {
    id: 'usr_auditor_003',
    name: 'Neha Verma',
    email: 'auditor@merchantpulse.io',
    role: 'AUDITOR',
    merchantId: 'rzp_merchant_pulse',
    permissions: ROLE_PERMISSIONS.AUDITOR,
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ACTIVE_SESSIONS = 5000;
const MAX_API_KEYS = 500;

export class AuthManager {
  private apiKeys: Map<string, ApiKey> = new Map();
  private activeSessions: Map<string, { user: UserProfile; expiresAt: number }> = new Map();

  constructor() {
    // Seed default demo API key in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      this.createApiKey('Production Razorpay Bridge Key', 'OWNER', 'mp_live_k8j7h6g5f4e3d2c1');
    }
  }

  public authenticateSession(token?: string | null): UserProfile | null {
    const trimmedToken = typeof token === 'string' ? token.trim() : '';

    if (!trimmedToken) {
      // Allow sandbox owner fallback only outside strict production
      if (process.env.NODE_ENV !== 'production') {
        return PRESET_USERS['admin@merchantpulse.io'];
      }
      return null;
    }

    const session = this.activeSessions.get(trimmedToken);
    if (session) {
      if (Date.now() > session.expiresAt) {
        this.activeSessions.delete(trimmedToken);
        return null;
      }
      return session.user;
    }

    // Also allow authenticating via a valid merchant API key
    const verifiedKey = this.verifyApiKey(trimmedToken);
    if (verifiedKey) {
      return {
        id: `usr_key_${verifiedKey.id}`,
        name: verifiedKey.name,
        email: `${verifiedKey.role.toLowerCase()}@merchantpulse.io`,
        role: verifiedKey.role,
        merchantId: verifiedKey.merchantId,
        permissions: ROLE_PERMISSIONS[verifiedKey.role] || ROLE_PERMISSIONS.AUDITOR,
      };
    }

    // Non-empty invalid or forged token must always be rejected
    return null;
  }

  public createSession(email: string): { token: string; user: UserProfile } | null {
    if (typeof email !== 'string') {
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (
      !normalizedEmail ||
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      return null;
    }

    this.pruneSessionsIfNeeded();

    const user = PRESET_USERS[normalizedEmail] || {
      id: `usr_${hashString(normalizedEmail)}`,
      name: normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') || 'Merchant User',
      email: normalizedEmail,
      role: 'OPS_MANAGER' as UserRole,
      merchantId: 'rzp_merchant_pulse',
      permissions: ROLE_PERMISSIONS.OPS_MANAGER,
    };

    const token = `sess_${generateRandomHex(32)}`;
    const expiresAt = Date.now() + (86400 * 1000 * 7); // 7-day session
    this.activeSessions.set(token, { user, expiresAt });

    return { token, user };
  }

  private pruneSessionsIfNeeded(): void {
    if (this.activeSessions.size < MAX_ACTIVE_SESSIONS) {
      return;
    }
    const now = Date.now();
    for (const [key, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(key);
      }
    }
    while (this.activeSessions.size >= MAX_ACTIVE_SESSIONS) {
      const oldestKey = this.activeSessions.keys().next().value;
      if (!oldestKey) break;
      this.activeSessions.delete(oldestKey);
    }
  }

  public createApiKey(name: string, role: UserRole = 'OWNER', customKey?: string): { apiKey: ApiKey; secret: string } {
    const safeName = (typeof name === 'string' && name.trim())
      ? name.trim().slice(0, 128)
      : 'Merchant API Key';
    const validRole: UserRole = ROLE_PERMISSIONS[role] ? role : 'AUDITOR';

    if (this.apiKeys.size >= MAX_API_KEYS) {
      const oldestKey = this.apiKeys.keys().next().value;
      if (oldestKey) this.apiKeys.delete(oldestKey);
    }

    const secret = customKey || `mp_${validRole === 'OWNER' ? 'live' : 'test'}_${generateRandomHex(24)}`;
    const hashedKey = hashString(secret);
    const id = `key_${generateRandomHex(12)}`;

    const apiKey: ApiKey = {
      id,
      name: safeName,
      keyPrefix: `${secret.slice(0, 10)}...`,
      hashedKey,
      merchantId: 'rzp_merchant_pulse',
      createdAt: Math.floor(Date.now() / 1000),
      role: validRole,
    };

    this.apiKeys.set(hashedKey, apiKey);
    return { apiKey, secret };
  }

  public verifyApiKey(secret: string): ApiKey | null {
    if (typeof secret !== 'string' || !secret.trim()) {
      return null;
    }
    const hashed = hashString(secret.trim());
    const key = this.apiKeys.get(hashed);
    if (!key) return null;

    key.lastUsedAt = Math.floor(Date.now() / 1000);
    this.apiKeys.set(hashed, key);
    return key;
  }

  public listApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  public hasPermission(user: UserProfile | null | undefined, permission: string): boolean {
    if (!user || !Array.isArray(user.permissions) || typeof permission !== 'string') {
      return false;
    }
    return user.permissions.includes(permission) || user.role === 'OWNER';
  }
}

const globalForAuth = globalThis as unknown as {
  __merchantPulseAuthManager?: AuthManager;
};

export const globalAuthManager = globalForAuth.__merchantPulseAuthManager || new AuthManager();
if (process.env.NODE_ENV !== 'production') {
  globalForAuth.__merchantPulseAuthManager = globalAuthManager;
}
