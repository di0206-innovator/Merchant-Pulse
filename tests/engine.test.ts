import { describe, expect, it } from 'vitest';
import { detectOpportunities, parsePayment } from '@/core/determinism/engine';
import { recommendDeterministically } from '@/core/strategy/recommend';
import { evaluatePolicy } from '@/core/execution/policy';
import type { MerchantProfile, RazorpayPayment } from '@/core/types';

const merchant: MerchantProfile = {
  id: 'm1', name: 'Test Merchant', monthly_gmv_paise: 10000000,
  daily_action_budget_paise: 200000, max_payment_attempts: 3, auto_execute_threshold: 0.6,
};

const payments: RazorpayPayment[] = [
  { id: 'p1', order_id: 'o1', amount: 100000, currency: 'INR', status: 'failed', error_code: 'GATEWAY_TIMEOUT', error_description: 'Network timeout', created_at: 1, attempts: 1, customer_id: 'c1' },
  { id: 'p2', order_id: 'o2', amount: 90000, currency: 'INR', status: 'captured', created_at: 2, attempts: 1, customer_id: 'c2' },
];

describe('MerchantPulse core', () => {
  it('parses retryable failures deterministically', () => {
    const parsed = parsePayment(payments[0], new Set(['c1']));
    expect(parsed.failure_category).toBe('network');
    expect(parsed.retryable).toBe(true);
    expect(parsed.repeat_customer).toBe(true);
  });

  it('detects a recovery opportunity', () => {
    const ids = new Set(payments.map((p) => p.customer_id).filter(Boolean) as string[]);
    const parsed = payments.map((p) => parsePayment(p, ids));
    const opportunities = detectOpportunities(parsed);
    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities[0].type).toBe('recovery');
  });

  it('keeps policy authoritative', () => {
    const ids = new Set(payments.map((p) => p.customer_id).filter(Boolean) as string[]);
    const parsed = payments.map((p) => parsePayment(p, ids));
    const opportunity = detectOpportunities(parsed)[0];
    const recommendation = recommendDeterministically(opportunity, parsed, merchant);
    const policy = evaluatePolicy(recommendation, merchant);
    expect(['execute', 'escalate', 'reject']).toContain(policy.action);
    expect(typeof policy.allowed).toBe('boolean');
  });
});
