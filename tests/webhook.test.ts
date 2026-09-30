import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { AuditTrail } from '@/core/audit/trail';
import { normalizeRazorpayWebhook, processNormalizedEvent } from '@/core/events/processor';
import { verifyRazorpayWebhook } from '@/lib/webhook';
import { InMemoryEventLedger } from '@/core/events/ledger';

describe('Razorpay webhook boundary', () => {
  const body = JSON.stringify({
    event: 'payment.failed',
    created_at: 1720000000,
    payload: {
      payment: {
        entity: {
          id: 'pay_demo_1',
          order_id: 'order_demo_1',
          amount: 499900,
          currency: 'INR',
          status: 'failed',
        },
      },
    },
  });

  it('verifies a valid signature', () => {
    const secret = 'test-secret';
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    expect(verifyRazorpayWebhook(body, signature, secret)).toBe(true);
  });

  it('rejects malformed signature lengths safely', () => {
    expect(verifyRazorpayWebhook(body, 'abc', 'test-secret')).toBe(false);
  });

  it('normalizes payment events and ignores duplicates', async () => {
    const event = normalizeRazorpayWebhook(body, 'evt_1', 1000);
    const ledger = new InMemoryEventLedger();
    const audit = new AuditTrail();
    const firstResult = await processNormalizedEvent(event, ledger, audit);
    expect(firstResult.duplicate).toBe(false);
    
    const secondResult = await processNormalizedEvent(event, ledger, audit);
    expect(secondResult.duplicate).toBe(true);
    
    expect(audit.all().map((item) => item.action)).toEqual(['webhook_event_accepted', 'duplicate_event_ignored']);
  });
});
