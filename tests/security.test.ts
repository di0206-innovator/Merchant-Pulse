import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeText, hashPassword, timingSafeEqual } from '@/lib/security';
import { rateLimit } from '@/lib/rate-limit';
import { createAdminSessionToken, verifyAdminSessionToken, validateAdminPassword } from '@/lib/auth';

describe('Security Utilities', () => {
  it('escapes dangerous HTML special characters to prevent XSS', () => {
    const malicious = '<script>alert("XSS")</script>&foo=bar\'';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#39;');
  });

  it('sanitizes text inputs by stripping tags and javascript protocols', () => {
    const dirty = 'Hello <a href="javascript:alert(1)">Click Me</a>';
    const clean = sanitizeText(dirty);
    expect(clean).toBe('Hello Click Me');
    expect(clean).not.toContain('<a');
    expect(clean).not.toContain('javascript:');
  });

  it('hashes passwords deterministically with salts', async () => {
    const hash1 = await hashPassword('secure_test_password', 'salt1');
    const hash2 = await hashPassword('secure_test_password', 'salt1');
    const hash3 = await hashPassword('secure_test_password', 'salt2');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1.length).toBe(64); // SHA-256 hex string length
  });

  it('performs timing-safe string comparison without leaking length mismatches', () => {
    expect(timingSafeEqual('abcd', 'abcd')).toBe(true);
    expect(timingSafeEqual('abcd', 'abce')).toBe(false);
    expect(timingSafeEqual('abcd', 'abc')).toBe(false);
  });
});

describe('Rate Limiter', () => {
  it('allows requests within limit and throttles subsequent requests', () => {
    const testId = `test_ip_${Date.now()}`;
    const opts = { limit: 3, windowMs: 5000 };

    const req1 = rateLimit(testId, opts);
    expect(req1.success).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = rateLimit(testId, opts);
    expect(req2.success).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = rateLimit(testId, opts);
    expect(req3.success).toBe(true);
    expect(req3.remaining).toBe(0);

    // 4th request must be rejected
    const req4 = rateLimit(testId, opts);
    expect(req4.success).toBe(false);
    expect(req4.remaining).toBe(0);
  });
});

describe('Admin Authentication & Session Tokens', () => {
  it('creates and verifies valid admin session tokens', async () => {
    const token = await createAdminSessionToken('admin');
    expect(token).toBeDefined();

    const session = await verifyAdminSessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.role).toBe('admin');
    expect(session?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects tampered session tokens', async () => {
    const token = await createAdminSessionToken('admin');
    const tampered = token.slice(0, -4) + 'abcd';
    const session = await verifyAdminSessionToken(tampered);
    expect(session).toBeNull();
  });

  it('validates admin password correctly', async () => {
    const valid = await validateAdminPassword('admin_demo_secure_pass_2026');
    expect(valid).toBe(true);

    const invalid = await validateAdminPassword('wrong_password');
    expect(invalid).toBe(false);
  });
});
