import { describe, it, expect } from 'vitest';
import { MockStrategyProvider, getStrategyProvider } from '@/core/strategy';
import { GeminiStrategyProvider } from '@/integrations/gemini/client';
import { RevenueOpportunity, StrategyRecommendationSchema } from '@/core/domain';

describe('AI Strategy Layer Unit & Contract Tests', () => {
  const mockOpportunity: RevenueOpportunity = {
    id: 'opp_test_123',
    merchantId: 'rzp_merchant_main',
    type: 'HIGH_VALUE_DROPOFF',
    status: 'DETECTED',
    triggerEventId: 'evt_123',
    orderId: 'order_456',
    paymentId: 'pay_789',
    amountPaise: 450000, // ₹4,500
    evidence: {
      failureCode: 'BANK_TIMEOUT',
      failureDescription: 'Issuer bank did not respond within SLA',
      paymentMethod: 'upi',
      consecutiveFailures: 1,
      customerLtvPaise: 1200000,
      historicalRecoveryRatePct: 65,
      intentScore: 0.9,
    },
    expectedValue: {
      recoverableGmvPaise: 450000,
      pSuccess: 0.73,
      estimatedInterventionCostPaise: 130,
      customerFatiguePenaltyPaise: 500,
      netExpectedValuePaise: 327870,
      isProfitable: true,
    },
    createdAt: 1724500000,
    updatedAt: 1724500000,
  };

  it('MockStrategyProvider generates strictly schema-valid recommendations', async () => {
    const provider = new MockStrategyProvider();
    const strategy = await provider.generateStrategy(mockOpportunity);

    expect(strategy).toBeDefined();
    expect(strategy.opportunityId).toBe('opp_test_123');
    expect(strategy.recommendedActionType).toBe('CREATE_PAYMENT_LINK');
    expect(strategy.confidenceScore).toBeGreaterThan(0.7);
    expect(strategy.suggestedExpiryMinutes).toBe(120);
    expect(strategy.customerMessaging?.smsText).toContain('{short_url}');

    // Strict Zod re-validation
    const validated = StrategyRecommendationSchema.safeParse(strategy);
    expect(validated.success).toBe(true);
  });

  it('GeminiStrategyProvider gracefully activates fallback when unconfigured', async () => {
    const unconfiguredGemini = new GeminiStrategyProvider('invalid_or_missing_key');
    const strategy = await unconfiguredGemini.generateStrategy(mockOpportunity);

    expect(strategy).toBeDefined();
    expect(strategy.opportunityId).toBe(mockOpportunity.id);
    expect(strategy.recommendedActionType).toBe('CREATE_PAYMENT_LINK');
    const validated = StrategyRecommendationSchema.safeParse(strategy);
    expect(validated.success).toBe(true);
  });

  it('getStrategyProvider returns an active provider instance', () => {
    const provider = getStrategyProvider(false);
    expect(provider).toBeDefined();
    expect(provider.name).toBe('MockStrategyProvider');
  });
});
