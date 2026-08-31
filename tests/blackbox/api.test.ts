import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getDemo, POST as postDemo } from '@/app/api/demo/route';
import { POST as generateStrategy } from '@/app/api/strategy/generate/route';
import { POST as razorpayWebhook } from '@/app/api/webhooks/razorpay/route';
import { POST as runBenchmark } from '@/app/api/benchmark/route';
import { POST as runStressTest } from '@/app/api/stress-test/route';
import { GET as getSession } from '@/app/api/auth/session/route';
import { POST as loginUser } from '@/app/api/auth/login/route';
import crypto from 'crypto';

describe('Black-Box API Endpoint & Interface Test Suite', () => {
  const TEST_SECRET = 'rzp_test_secret_for_blackbox_testing_9988';
  let origSecret: string | undefined;

  beforeEach(() => {
    origSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = origSecret;
  });

  describe('1. GET /api/demo & POST /api/demo', () => {
    it('returns valid JSON with metrics, opportunities, and auditTrail on GET', async () => {
      const res = await getDemo();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('metrics');
      expect(json).toHaveProperty('opportunities');
      expect(json).toHaveProperty('auditTrail');
      expect(Array.isArray(json.opportunities)).toBe(true);
      expect(Array.isArray(json.auditTrail)).toBe(true);
    });

    it('successfully processes full demo pipeline simulation on POST', async () => {
      const res = await postDemo();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('success', true);
      expect(json).toHaveProperty('metrics');
      expect(json.metrics.totalGmvPaise).toBeGreaterThan(0);
    });
  });

  describe('2. POST /api/strategy/generate', () => {
    it('generates structured strategy and policy evaluation for valid incident facts', async () => {
      const req = new NextRequest('http://localhost:3000/api/strategy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityType: 'FAILED_PAYMENT',
          amountPaise: 850000,
          paymentMethod: 'UPI',
          bankOrIssuer: 'HDFC Bank',
          failureCode: 'BAD_REQUEST_ERROR',
          failureDescription: 'UPI PIN invalid or session timed out',
          customerLtvPaise: 4500000,
        }),
      });

      const res = await generateStrategy(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('opportunity');
      expect(json).toHaveProperty('recommendation');
      expect(json).toHaveProperty('policyResult');
      expect(json.recommendation).toHaveProperty('recommendedActionType');
      expect(json.policyResult).toHaveProperty('verdict');
    });
  });

  describe('3. POST /api/webhooks/razorpay (HMAC Security & Ingestion)', () => {
    it('rejects unauthenticated requests missing razorpay signature header with 400', async () => {
      const payload = JSON.stringify({
        event: 'payment.failed',
        account_id: 'acc_test_merchant',
        payload: { payment: { entity: { id: 'pay_unauth_1' } } }
      });
      const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      const res = await razorpayWebhook(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Missing');
    });

    it('rejects forged / invalid signature with 401', async () => {
      const payload = JSON.stringify({
        event: 'payment.failed',
        account_id: 'acc_test_merchant',
        payload: { payment: { entity: { id: 'pay_tamper_1' } } }
      });
      const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'forged_tampered_signature_hex_value',
        },
        body: payload,
      });

      const res = await razorpayWebhook(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Invalid webhook signature');
    });

    it('accepts and normalizes valid HMAC signed payment.failed webhook', async () => {
      const eventBody = {
        entity: 'event',
        account_id: 'acc_test_merchant',
        event: 'payment.failed',
        contains: ['payment'],
        created_at: Math.floor(Date.now() / 1000),
        payload: {
          payment: {
            entity: {
              id: `pay_bb_${Date.now()}`,
              amount: 500000,
              currency: 'INR',
              status: 'failed',
              method: 'upi',
              vpa: 'user@okhdfcbank',
              email: 'shopper@example.com',
              contact: '+919876543210',
              error_code: 'PAYMENT_FAILED_DOWNTIME',
              error_description: 'Issuer bank server unavailable',
              created_at: Math.floor(Date.now() / 1000),
            },
          },
        },
      };
      const rawPayload = JSON.stringify(eventBody);
      const signature = crypto.createHmac('sha256', TEST_SECRET).update(rawPayload).digest('hex');

      const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body: rawPayload,
      });

      const res = await razorpayWebhook(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ACCEPTED');
    });
  });

  describe('4. POST /api/benchmark & POST /api/stress-test', () => {
    it('executes batch evaluation against synthetic event corpus on POST /api/benchmark', async () => {
      const req = new NextRequest('http://localhost:3000/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalEvents: 100, heldOutSplitPct: 20 }),
      });

      const res = await runBenchmark(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('results');
      expect(json).toHaveProperty('metrics');
      expect(json.results).toHaveProperty('merchantPulseMock');
      expect(json.results).toHaveProperty('rulesOnlyBaseline');
      expect(json.results).toHaveProperty('noActionBaseline');
    });

    it('processes concurrency stress requests on POST /api/stress-test', async () => {
      const req = new NextRequest('http://localhost:3000/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 50 }),
      });

      const res = await runStressTest(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('success', true);
      expect(json).toHaveProperty('concurrencyMetrics');
      expect(json.concurrencyMetrics.zeroDropGuarantee).toBe(true);
      expect(json.concurrencyMetrics.totalRequests).toBe(50);
    });
  });

  describe('5. Auth Endpoints: /api/auth/session & /api/auth/login', () => {
    it('returns demo / mock session when unauthenticated', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/session');
      const res = await getSession(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('user');
      expect(json.user).toHaveProperty('role');
    });

    it('handles login credentials validation on POST /api/auth/login', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@merchantpulse.io', password: 'Password123!' }),
      });

      const res = await loginUser(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('user');
      expect(json.user.role).toBe('OWNER');
    });
  });

});
