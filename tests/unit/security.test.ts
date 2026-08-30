import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';
import { globalAuthManager } from '@/core/auth/manager';
import { calculateExpectedValue } from '@/core/revenue/expectedValue';
import { calculatePriorityScore, PrioritizationInput } from '@/core/revenue/prioritizer';
import { globalIdempotencyLedger } from '@/core/events/idempotency';

describe('Security & Zero-Trust Invariants Test Suite', () => {
  const SECRET = 'sec_rzp_live_test_secret_key_12345';

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
        payload: { payment: { entity: { id: 'pay_sec_101', amount: 50000 } } }, // Amount altered
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

  describe('RBAC & Authorization Matrix Enforcement', () => {
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

    it('deterministic EV calculates integer paise values without floating point drift', () => {
      const ev = calculateExpectedValue(850000, {
        failureCode: 'BANK_TIMEOUT',
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
    it('detects duplicate webhook re-deliveries and prevents double processing', () => {
      const rawPayload = JSON.stringify({
        id: 'evt_recon_dup_test_001',
        event: 'payment.failed',
        created_at: 1724500000,
      });

      const key = globalIdempotencyLedger.generateKey('evt_recon_dup_test_001', rawPayload);
      expect(globalIdempotencyLedger.isDuplicate(key)).toBe(false);

      globalIdempotencyLedger.record(key, { processedAt: Date.now(), domainEventId: 'evt_recon_dup_test_001' });

      // Immediate replay of the identical webhook event
      expect(globalIdempotencyLedger.isDuplicate(key)).toBe(true);
    });
  });
});
