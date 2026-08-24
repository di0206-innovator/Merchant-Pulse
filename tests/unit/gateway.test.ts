import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';
import { MockRazorpayClientAdapter } from '@/integrations/razorpay/client';
import { normalizeRazorpayWebhook } from '@/core/events/normalizer';
import { IdempotencyLedger } from '@/core/events/idempotency';
import { RazorpayWebhookEvent } from '@/core/domain';

describe('Razorpay Gateway & Webhook Ingestion Tests', () => {
  const secret = 'webhook_secret_key_12345';
  let idempotency: IdempotencyLedger;

  beforeEach(() => {
    idempotency = new IdempotencyLedger();
  });

  describe('HMAC-SHA256 Signature Verification', () => {
    it('successfully verifies a correctly signed raw payload', () => {
      const rawPayload = JSON.stringify({
        entity: 'event',
        account_id: 'acc_1234',
        event: 'payment.failed',
      });

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(rawPayload)
        .digest('hex');

      const isValid = verifyRazorpayWebhookSignature(rawPayload, validSignature, secret);
      expect(isValid).toBe(true);
    });

    it('rejects tampered payloads or forged signatures', () => {
      const rawPayload = JSON.stringify({ entity: 'event', event: 'payment.failed' });
      const tamperedPayload = JSON.stringify({ entity: 'event', event: 'payment.captured' });

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(rawPayload)
        .digest('hex');

      const isTamperedValid = verifyRazorpayWebhookSignature(tamperedPayload, validSignature, secret);
      expect(isTamperedValid).toBe(false);

      const isFakeSigValid = verifyRazorpayWebhookSignature(rawPayload, 'fake_signature_abc123', secret);
      expect(isFakeSigValid).toBe(false);
    });
  });

  describe('Idempotency Guard', () => {
    it('detects and suppresses duplicate webhook deliveries', () => {
      const eventId = 'evt_duplicate_test_123';
      const key = idempotency.generateKey(eventId);

      expect(idempotency.isDuplicate(key)).toBe(false);
      idempotency.record(key, { status: 'PROCESSED' });

      // Immediate second delivery
      expect(idempotency.isDuplicate(key)).toBe(true);
      expect(idempotency.getStoredResult(key)).toEqual({ status: 'PROCESSED' });
    });
  });

  describe('Webhook Normalization', () => {
    it('normalizes a payment.failed webhook into a DomainEvent', () => {
      const rawWebhook: RazorpayWebhookEvent = {
        entity: 'event',
        account_id: 'acc_test_merchant',
        event: 'payment.failed',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: 'pay_fail_abc',
              order_id: 'order_123',
              amount: 550000,
              currency: 'INR',
              status: 'failed',
              method: 'upi',
              contact: '+919876543210',
              email: 'user@example.com',
              error_code: 'BANK_TIMEOUT',
              error_description: 'Issuer bank timed out',
            },
          },
        },
        created_at: 1724500000,
      };

      const domainEvent = normalizeRazorpayWebhook(rawWebhook);
      expect(domainEvent).not.toBeNull();
      expect(domainEvent?.type).toBe('PAYMENT_FAILED');
      expect(domainEvent?.payment?.amountPaise).toBe(550000);
      expect(domainEvent?.payment?.error?.code).toBe('BANK_TIMEOUT');
    });
  });

  describe('Razorpay Client Adapter', () => {
    it('MockRazorpayClientAdapter creates structured payment links', async () => {
      const client = new MockRazorpayClientAdapter();
      const link = await client.createPaymentLink({
        amountPaise: 450000,
        currency: 'INR',
        referenceId: 'ref_rec_001',
        description: 'Order Recovery Link',
        customer: {
          name: 'Jane Doe',
          contact: '+919876543210',
          email: 'jane@example.com',
        },
        expireByMinutes: 120,
      });

      expect(link.id).toMatch(/^plink_/);
      expect(link.status).toBe('created');
      expect(link.shortUrl).toContain('https://rzp.io/i/');
      expect(link.amountPaise).toBe(450000);
      expect(link.referenceId).toBe('ref_rec_001');
    });
  });
});
