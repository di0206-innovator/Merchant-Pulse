import { describe, it, expect } from 'vitest';
import {
  PaymentEntitySchema,
  ExpectedValueMetricsSchema,
  StrategyRecommendationSchema,
  MerchantPolicyConfigSchema,
  RazorpayWebhookEventSchema,
} from '@/core/domain';

describe('Domain Model & Schemas Unit Tests', () => {
  it('validates a well-formed PaymentEntity with failure details', () => {
    const validPayment = {
      id: 'pay_ABC1234567890',
      orderId: 'order_XYZ123456',
      amountPaise: 450000, // ₹4,500.00
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      vpa: 'customer@okhdfcbank',
      email: 'customer@example.com',
      contact: '+919876543210',
      error: {
        code: 'GATEWAY_ERROR',
        description: 'Payment timed out on bank server',
        source: 'bank',
        step: 'payment_authentication',
      },
      createdAt: 1724500000,
    };

    const parsed = PaymentEntitySchema.safeParse(validPayment);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.amountPaise).toBe(450000);
      expect(parsed.data.status).toBe('failed');
    }
  });

  it('rejects invalid payment entities with negative amounts or bad IDs', () => {
    const invalidPayment = {
      id: 'invalid_id', // Must start with pay_
      amountPaise: -500, // Negative not allowed
      currency: 'USD', // Currency must be INR
      status: 'unknown_status',
      createdAt: 1724500000,
    };

    const parsed = PaymentEntitySchema.safeParse(invalidPayment);
    expect(parsed.success).toBe(false);
  });

  it('validates ExpectedValueMetrics invariants', () => {
    const validEv = {
      recoverableGmvPaise: 500000, // ₹5,000
      pSuccess: 0.65,
      estimatedInterventionCostPaise: 1500, // ₹15.00
      customerFatiguePenaltyPaise: 500, // ₹5.00
      netExpectedValuePaise: 323000, // (500000 * 0.65) - 1500 - 500 = 323000
      isProfitable: true,
    };

    const parsed = ExpectedValueMetricsSchema.safeParse(validEv);
    expect(parsed.success).toBe(true);
  });

  it('validates StrategyRecommendation Zod schema output from AI layer', () => {
    const validRecommendation = {
      opportunityId: 'opp_12345',
      diagnosis: 'HDFC UPI gateway experienced a transient timeout during authorization step.',
      recommendedActionType: 'CREATE_PAYMENT_LINK',
      actionPayload: {
        expireByMinutes: 120,
        notifyMedium: ['sms', 'email'],
      },
      confidenceScore: 0.88,
      rationale: 'Customer has high historical LTV (₹18,500) and this is their first failure today.',
      suggestedExpiryMinutes: 120,
      customerMessaging: {
        smsText: 'Your payment of ₹4,500 for Order #XYZ123 timed out. Complete securely here: {short_url}',
      },
    };

    const parsed = StrategyRecommendationSchema.safeParse(validRecommendation);
    expect(parsed.success).toBe(true);
  });

  it('rejects StrategyRecommendation with hallucinated action types', () => {
    const invalidRecommendation = {
      opportunityId: 'opp_12345',
      diagnosis: 'Refund user money',
      recommendedActionType: 'REFUND_INCENTIVE', // Hallucinated action type
      actionPayload: {},
      confidenceScore: 0.9,
      rationale: 'Refund to make customer happy',
    };

    const parsed = StrategyRecommendationSchema.safeParse(invalidRecommendation);
    expect(parsed.success).toBe(false);
  });

  it('parses valid Razorpay webhook event envelope', () => {
    const webhookPayload = {
      entity: 'event',
      account_id: 'acc_12345678',
      event: 'payment.failed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_N9K8J7H6G5F4E3',
            amount: 250000,
            currency: 'INR',
            status: 'failed',
            method: 'netbanking',
            bank: 'HDFC',
          },
        },
      },
      created_at: 1724500000,
    };

    const parsed = RazorpayWebhookEventSchema.safeParse(webhookPayload);
    expect(parsed.success).toBe(true);
  });
});
