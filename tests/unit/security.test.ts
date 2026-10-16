import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';
import { globalAuthManager } from '@/core/auth/manager';
import { calculateExpectedValue } from '@/core/revenue/expectedValue';
import { calculatePriorityScore, PrioritizationInput } from '@/core/revenue/prioritizer';
import { globalIdempotencyLedger } from '@/core/events/idempotency';
import {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  maskApiKey,
} from '@/lib/cryptoUtils';
import {
  checkRateLimit,
  resetRateLimiter,
  validateEnv,
} from '@/lib/env';

describe('Security & Zero-Trust Invariants Test Suite', () => {
  const SECRET = 'sec_rzp_live_test_secret_key_12345';

  beforeEach(() => {
    resetRateLimiter();
  });

  describe('Webhook Cryptographic Signature Verification', () => {
    it('verifies valid HMAC-SHA256 signature generated with matching secret', () => {
      const rawPayload = JSON.stringify({
        event: 'payment.failed',
        payload: { payment: { entity: { id: 'pay_sec_101', amount: 500000 } } },
      });

      const signature = crypto
        .createHmac('sha256', SECRET)
        .update(Buffer.from(rawPayload, 'utf8'))
        .digest('hex');

      const isValid = verifyRazorpayWebhookSignature(rawPayload, signature, SECRET);
      expect(isValid).toBe(true);
    });

    it('rejects tampered payload even if signature is valid for original payload', () => {
      const originalPayload = JSON.stringify({
        event: 'payment.failed',
        payload: { payment: { entity: { id: 'pay_sec_101', amount: 500000 } } },
      });

      const tamperedPayload = JSON.stringify({
        event: 'payment.failed',
        payload: { payment: { entity: { id: 'pay_sec_101', amount: 50000 } } },
      });

      const signature = crypto
        .createHmac('sha256', SECRET)
        .update(Buffer.from(originalPayload, 'utf8'))
        .digest('hex');

      const isValid = verifyRazorpayWebhookSignature(tamperedPayload, signature, SECRET);
      expect(isValid).toBe(false);
    });

    it('rejects signatures generated with incorrect secret key', () => {
      const payload = JSON.stringify({ event: 'payment_link.paid' });
      const signatureWithWrongSecret = crypto
        .createHmac('sha256', 'wrong_attacker_secret')
        .update(Buffer.from(payload, 'utf8'))
        .digest('hex');

      const isValid = verifyRazorpayWebhookSignature(payload, signatureWithWrongSecret, SECRET);
      expect(isValid).toBe(false);
    });

    it('handles empty or malformed parameters safely without throwing', () => {
      expect(verifyRazorpayWebhookSignature('', 'sig', SECRET)).toBe(false);
      expect(verifyRazorpayWebhookSignature('body', '', SECRET)).toBe(false);
      expect(verifyRazorpayWebhookSignature('body', 'sig', '')).toBe(false);
      expect(verifyRazorpayWebhookSignature('body', 'short_malformed_sig', SECRET)).toBe(false);
    });
  });

  describe('RBAC, Forged Token Rejection & Password Hashing', () => {
    it('restricts AUDITOR role to read-only access and blocks execution actions', () => {
      const session = globalAuthManager.createSession('auditor@merchantpulse.io');
      expect(session).not.toBeNull();

      const user = globalAuthManager.authenticateSession(session!.token);

      expect(user).not.toBeNull();
      expect(user?.role).toBe('AUDITOR');
      expect(globalAuthManager.hasPermission(user!, 'opportunities:execute')).toBe(false);
      expect(globalAuthManager.hasPermission(user!, 'policy:write')).toBe(false);
      expect(globalAuthManager.hasPermission(user!, 'opportunities:read')).toBe(true);
    });

    it('rejects non-empty forged or invalid session tokens', () => {
      const forgedUser = globalAuthManager.authenticateSession('sess_forged_invalid_token_99999');
      expect(forgedUser).toBeNull();
    });

    it('permits ADMIN/OWNER and OPS_MANAGER roles to execute approved opportunities', () => {
      const adminSession = globalAuthManager.createSession('admin@merchantpulse.io');
      expect(adminSession).not.toBeNull();
      const adminUser = globalAuthManager.authenticateSession(adminSession!.token);

      expect(adminUser).not.toBeNull();
      expect(globalAuthManager.hasPermission(adminUser!, 'opportunities:execute')).toBe(true);

      const opSession = globalAuthManager.createSession('ops@merchantpulse.io');
      expect(opSession).not.toBeNull();
      const opUser = globalAuthManager.authenticateSession(opSession!.token);

      expect(opUser).not.toBeNull();
      expect(globalAuthManager.hasPermission(opUser!, 'opportunities:execute')).toBe(true);
    });

    it('verifies API keys cryptographically and enforces key roles', () => {
      const { apiKey, secret } = globalAuthManager.createApiKey('Test Read Key', 'AUDITOR');
      const verified = globalAuthManager.verifyApiKey(secret);

      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(apiKey.id);
      expect(verified?.role).toBe('AUDITOR');

      expect(globalAuthManager.verifyApiKey('mp_invalid_fake_key_123')).toBeNull();
    });

    it('salts and hashes passwords with PBKDF2-SHA256 and verifies in constant time', () => {
      const hashed = hashPassword('SuperSecret#2026');
      expect(hashed).toMatch(/^pbkdf2_v1\$/);
      expect(verifyPassword('SuperSecret#2026', hashed)).toBe(true);
      expect(verifyPassword('WrongPassword#2026', hashed)).toBe(false);
    });
  });

  describe('XSS Input Sanitization, Secret Masking & Rate Limiting', () => {
    it('strips XSS script tags, event handlers, and javascript: URIs from form input', () => {
      const malicious = '<script>alert("xss")</script><img src=x onerror="steal()">javascript:evil()Safe Brand Name';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).toContain('Safe Brand Name');
    });

    it('masks sensitive API keys and validates environment schema safely', () => {
      expect(maskApiKey('rzp_test_TUHSBfjPgODDOy')).toBe('rzp_tes••••DDOy');
      expect(maskApiKey('')).toBe('NOT_SET');

      const report = validateEnv();
      expect(report).toHaveProperty('environment');
      expect(report.maskedKeys.razorpayKeyId).not.toContain('TUHSBfjPg');
    });

    it('enforces sliding-window rate limits and emits X-RateLimit-* headers', () => {
      const r1 = checkRateLimit('192.0.2.1:/api/login', 2, 60_000);
      const r2 = checkRateLimit('192.0.2.1:/api/login', 2, 60_000);
      const r3 = checkRateLimit('192.0.2.1:/api/login', 2, 60_000);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(false);
      expect(r3.remaining).toBe(0);
      expect(r3.headers['Retry-After']).toBeDefined();
    });
  });

  describe('Mathematical Boundary & Injection Safety', () => {
    it('prevents NaN and infinite values under extreme boundary inputs', () => {
      const extremeInput: PrioritizationInput = {
        expectedValue: {
          pSuccess: 1,
          recoverableGmvPaise: Number.MAX_SAFE_INTEGER,
          estimatedInterventionCostPaise: 0,
          customerFatiguePenaltyPaise: 0,
          netExpectedValuePaise: 100000000,
          isProfitable: true,
        },
        evidence: {
          consecutiveFailures: 0,
          intentScore: 1,
          historicalRecoveryRatePct: 100,
          paymentMethod: 'upi',
          customerLtvPaise: 100000000,
          recentContactCount: 0,
        },
        amountPaise: 100000000,
      };

      const result = calculatePriorityScore(extremeInput);
      expect(Number.isFinite(result.score)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('deterministic EV calculates integer paise values and blocks Object.prototype lookup', () => {
      const ev = calculateExpectedValue(850000, {
        failureCode: 'toString', // Prototype pollution / lookup attempt
        paymentMethod: 'upi',
        consecutiveFailures: 0,
        customerLtvPaise: 0,
      });

      expect(Number.isInteger(ev.recoverableGmvPaise)).toBe(true);
      expect(Number.isInteger(ev.estimatedInterventionCostPaise)).toBe(true);
      expect(Number.isInteger(ev.customerFatiguePenaltyPaise)).toBe(true);
      expect(Number.isInteger(ev.netExpectedValuePaise)).toBe(true);
    });
  });

  describe('Idempotency & Replay Protection', () => {
    it('detects duplicate webhook re-deliveries and releases uncommitted locks cleanly', () => {
      const rawPayload = JSON.stringify({
        id: 'evt_recon_dup_test_001',
        event: 'payment.failed',
        created_at: 1724500000,
      });

      const key = globalIdempotencyLedger.generateKey('evt_recon_dup_test_001', rawPayload);
      expect(globalIdempotencyLedger.isDuplicate(key)).toBe(false);

      expect(globalIdempotencyLedger.acquireLock(key)).toBe(true);
      globalIdempotencyLedger.releaseLock(key);
      expect(globalIdempotencyLedger.isDuplicate(key)).toBe(false);

      globalIdempotencyLedger.record(key, { processedAt: Date.now(), domainEventId: 'evt_recon_dup_test_001' });
      expect(globalIdempotencyLedger.isDuplicate(key)).toBe(true);
    });
  });
});
