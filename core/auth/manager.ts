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

export class AuthManager {
  private apiKeys: Map<string, ApiKey> = new Map();
  private activeSessions: Map<string, { user: UserProfile; expiresAt: number }> = new Map();

  constructor() {
    // Seed default demo API key
    this.createApiKey('Production Razorpay Bridge Key', 'OWNER', 'mp_live_k8j7h6g5f4e3d2c1');
  }

  public authenticateSession(token: string): UserProfile | null {
    const session = this.activeSessions.get(token);
    if (!session) {
      // Default to Owner in demo sandbox mode if token is empty
      return PRESET_USERS['admin@merchantpulse.io'];
    }

    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return null;
    }

    return session.user;
  }

  public createSession(email: string): { token: string; user: UserProfile } | null {
    const user = PRESET_USERS[email] || {
      id: `usr_${hashString(email)}`,
      name: email.split('@')[0],
      email,
      role: 'OPS_MANAGER' as UserRole,
      merchantId: 'rzp_merchant_pulse',
      permissions: ROLE_PERMISSIONS.OPS_MANAGER,
    };

    const token = `sess_${generateRandomHex(32)}`;
    const expiresAt = Date.now() + (86400 * 1000 * 7); // 7-day session
    this.activeSessions.set(token, { user, expiresAt });

    return { token, user };
  }

  public createApiKey(name: string, role: UserRole = 'OWNER', customKey?: string): { apiKey: ApiKey; secret: string } {
    const secret = customKey || `mp_${role === 'OWNER' ? 'live' : 'test'}_${generateRandomHex(24)}`;
    const hashedKey = hashString(secret);
    const id = `key_${generateRandomHex(12)}`;

    const apiKey: ApiKey = {
      id,
      name,
      keyPrefix: `${secret.slice(0, 10)}...`,
      hashedKey,
      merchantId: 'rzp_merchant_pulse',
      createdAt: Math.floor(Date.now() / 1000),
      role,
    };

    this.apiKeys.set(hashedKey, apiKey);
    return { apiKey, secret };
  }

  public verifyApiKey(secret: string): ApiKey | null {
    const hashed = hashString(secret);
    const key = this.apiKeys.get(hashed);
    if (!key) return null;

    key.lastUsedAt = Math.floor(Date.now() / 1000);
    this.apiKeys.set(hashed, key);
    return key;
  }

  public listApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  public hasPermission(user: UserProfile, permission: string): boolean {
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
