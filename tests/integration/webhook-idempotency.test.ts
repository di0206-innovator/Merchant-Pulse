import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { POST } from '@/app/api/webhooks/razorpay/route';
import { globalIdempotencyLedger } from '@/core/events/idempotency';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';

describe('Webhook Hardening & Idempotency Test Suite (Gaps 4, 13, 16)', () => {
  const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_wh_sec_merchantpulse_2026').split(',')[0].trim();

  beforeEach(() => {
    globalIdempotencyLedger.clear();
  });

  it('1. Deduplication: Rejects concurrent duplicate webhooks (3 concurrent requests -> 1 processed, 2 ignored)', async () => {
    const now = Math.floor(Date.now() / 1000);
    const eventPayload = {
      entity: 'event',
      account_id: 'acc_merchant_test',
      event: 'payment.failed',
      contains: ['payment'],
      created_at: now,
      payload: {
        payment: {
          entity: {
            id: `pay_idem_${Date.now()}`,
            amount: 450000,
            currency: 'INR',
            status: 'failed',
            order_id: 'order_idem_101',
            method: 'upi',
            contact: '+919876543210',
            email: 'gaurav.kumar@example.com',
            created_at: now,
            error_code: 'BANK_TIMEOUT',
            error_description: 'Issuing bank timeout',
          },
        },
      },
    };

    const rawBody = JSON.stringify(eventPayload);
    const eventId = `evt_dedup_test_${Date.now()}`;
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    // Create 3 concurrent requests with the same eventId & body
    const makeRequest = () =>
      new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-event-id': eventId,
          'x-razorpay-signature': signature,
        },
        body: rawBody,
      });

    const [res1, res2, res3] = await Promise.all([
      POST(makeRequest()),
      POST(makeRequest()),
      POST(makeRequest()),
    ]);

    const statuses = [res1.status, res2.status, res3.status];
    expect(statuses).toEqual([200, 200, 200]);

    const bodies = await Promise.all([res1.json(), res2.json(), res3.json()]);
    const accepted = bodies.filter((b) => b.status === 'ACCEPTED');
    const duplicates = bodies.filter((b) => b.status === 'DUPLICATE_IGNORED');

    expect(accepted.length).toBe(1);
    expect(duplicates.length).toBe(2);
    expect(duplicates[0].message).toContain('idempotently');
  }, 15000);

  it('2. Replay Protection: Rejects stale webhook events older than 24 hours', async () => {
    const staleTimestamp = Math.floor(Date.now() / 1000) - (25 * 3600); // 25 hours ago
    const stalePayload = {
      entity: 'event',
      account_id: 'acc_merchant_test',
      event: 'payment.failed',
      contains: ['payment'],
      created_at: staleTimestamp,
      payload: {
        payment: {
          entity: {
            id: `pay_stale_${Date.now()}`,
            amount: 500000,
            currency: 'INR',
            status: 'failed',
            order_id: 'order_stale_101',
            method: 'card',
            contact: '+919876543210',
            email: 'gaurav.kumar@example.com',
            created_at: staleTimestamp,
          },
        },
      },
    };

    const rawBody = JSON.stringify(stalePayload);
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-event-id': `evt_stale_${Date.now()}`,
        'x-razorpay-signature': signature,
      },
      body: rawBody,
    });

    const res = await POST(req);
    expect(res.status).toBe(410);

    const body = await res.json();
    expect(body.status).toBe('STALE_EVENT_REJECTED');
    expect(body.message).toContain('exceeds 24-hour freshness window');
  });

  it('3. Secret Rotation: Seamlessly verifies signatures during key rotation window', () => {
    const oldSecret = 'rzp_sec_2025_primary';
    const newSecret = 'rzp_sec_2026_rotated';
    const rotationConfig = `${oldSecret}, ${newSecret}`;
    const payload = JSON.stringify({ event: 'payment.captured', id: 'pay_rot_01' });

    // Generate signature with old secret
    const oldSignature = crypto.createHmac('sha256', oldSecret).update(payload).digest('hex');
    // Generate signature with new secret
    const newSignature = crypto.createHmac('sha256', newSecret).update(payload).digest('hex');
    // Generate signature with invalid secret
    const invalidSignature = crypto.createHmac('sha256', 'wrong_secret').update(payload).digest('hex');

    expect(verifyRazorpayWebhookSignature(payload, oldSignature, rotationConfig)).toBe(true);
    expect(verifyRazorpayWebhookSignature(payload, newSignature, rotationConfig)).toBe(true);
    expect(verifyRazorpayWebhookSignature(payload, invalidSignature, rotationConfig)).toBe(false);
  });
});
