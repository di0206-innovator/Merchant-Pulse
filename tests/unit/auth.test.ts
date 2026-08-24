import { describe, it, expect, beforeEach } from 'vitest';
import { AuthManager } from '@/core/auth/manager';
import { PRESET_USERS } from '@/core/auth';

describe('Auth & Multi-Tenant RBAC Tests', () => {
  let auth: AuthManager;

  beforeEach(() => {
    auth = new AuthManager();
  });

  it('authenticates preset admin user as OWNER with full permissions', () => {
    const admin = PRESET_USERS['admin@merchantpulse.io'];
    expect(admin).toBeDefined();
    expect(admin.role).toBe('OWNER');
    expect(auth.hasPermission(admin, 'opportunities:override')).toBe(true);
    expect(auth.hasPermission(admin, 'policy:write')).toBe(true);
  });

  it('restricts AUDITOR role to read-only permissions', () => {
    const auditor = PRESET_USERS['auditor@merchantpulse.io'];
    expect(auditor).toBeDefined();
    expect(auditor.role).toBe('AUDITOR');
    expect(auth.hasPermission(auditor, 'opportunities:read')).toBe(true);
    expect(auth.hasPermission(auditor, 'opportunities:execute')).toBe(false);
    expect(auth.hasPermission(auditor, 'policy:write')).toBe(false);
  });

  it('creates and verifies secure merchant API Keys', () => {
    const { apiKey, secret } = auth.createApiKey('Live Production Key', 'OWNER');
    expect(apiKey.id).toMatch(/^key_/);
    expect(secret).toMatch(/^mp_live_/);
    expect(apiKey.keyPrefix).toBe(secret.slice(0, 10) + '...');

    const verified = auth.verifyApiKey(secret);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(apiKey.id);
    expect(verified?.role).toBe('OWNER');

    // Invalid key rejected
    expect(auth.verifyApiKey('fake_secret_key_123')).toBeNull();
  });

  it('creates valid 7-day user sessions', () => {
    const session = auth.createSession('custom_merchant@store.in');
    expect(session).not.toBeNull();
    expect(session?.token).toMatch(/^sess_/);
    expect(session?.user.email).toBe('custom_merchant@store.in');

    const authenticatedUser = auth.authenticateSession(session!.token);
    expect(authenticatedUser).not.toBeNull();
    expect(authenticatedUser?.email).toBe('custom_merchant@store.in');
  });
});
