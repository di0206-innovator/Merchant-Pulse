import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyEngine } from '@/core/policy';
import {
  RevenueOpportunity,
  StrategyRecommendation,
  MerchantPolicyConfig,
  CustomerProfile,
} from '@/core/domain';

describe('Policy Engine & Guardrail Tests', () => {
  let policyEngine: PolicyEngine;
  let baseConfig: MerchantPolicyConfig;
  let baseOpportunity: RevenueOpportunity;
  let baseRecommendation: StrategyRecommendation;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
    baseConfig = {
      merchantId: 'rzp_merchant_main',
      allowedActions: [
        'CREATE_PAYMENT_LINK',
        'SEND_PAYMENT_REMINDER',
        'NOTIFY_ALTERNATIVE_METHOD',
        'ESCALATE_TO_OPS',
        'NO_ACTION',
      ],
      maxAutoGmvPaise: 2500000, // ₹25,000 limit
      minEvPaise: 2000, // ₹20 min EV
      contactCooldownHours: 24,
      requireManualApprovalForDowntimeAlerts: true,
    };

    baseOpportunity = {
      id: 'opp_policy_test_1',
      merchantId: 'rzp_merchant_main',
      type: 'HIGH_VALUE_DROPOFF',
      status: 'DETECTED',
      triggerEventId: 'evt_1',
      orderId: 'order_1',
      customerContact: '+919876543210',
      customerEmail: 'user@example.com',
      amountPaise: 450000, // ₹4,500
      evidence: {
        failureCode: 'GATEWAY_ERROR',
        consecutiveFailures: 1,
        customerLtvPaise: 500000,
        historicalRecoveryRatePct: 65,
        intentScore: 0.85,
      },
      expectedValue: {
        recoverableGmvPaise: 450000,
        pSuccess: 0.65,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 500,
        netExpectedValuePaise: 291870,
        isProfitable: true,
      },
      createdAt: 1724500000,
      updatedAt: 1724500000,
    };

    baseRecommendation = {
      opportunityId: 'opp_policy_test_1',
      diagnosis: 'Transient gateway timeout',
      recommendedActionType: 'CREATE_PAYMENT_LINK',
      actionPayload: { expireByMinutes: 120 },
      confidenceScore: 0.88,
      rationale: 'High intent customer with positive EV',
      suggestedExpiryMinutes: 120,
    };
  });

  it('verdict is AUTO_EXECUTE when all rules pass', () => {
    const result = policyEngine.evaluate(baseOpportunity, baseRecommendation, baseConfig);

    expect(result.verdict).toBe('AUTO_EXECUTE');
    expect(result.ruleResults.every(r => r.passed)).toBe(true);
  });

  it('verdict is ESCALATE_HUMAN when transaction amount exceeds max auto GMV limit', () => {
    const highValueOpp: RevenueOpportunity = {
      ...baseOpportunity,
      amountPaise: 8500000, // ₹85,000 (Exceeds ₹25,000 limit)
    };

    const result = policyEngine.evaluate(highValueOpp, baseRecommendation, baseConfig);

    expect(result.verdict).toBe('ESCALATE_HUMAN');
    const gmvRule = result.ruleResults.find(r => r.ruleId === 'MAX_AUTO_GMV_THRESHOLD');
    expect(gmvRule?.passed).toBe(false);
    expect(gmvRule?.severity).toBe('WARNING');
  });

  it('verdict is REJECT when customer was contacted within cooldown period', () => {
    const customer: CustomerProfile = {
      id: 'cust_123',
      contact: '+919876543210',
      totalOrders: 2,
      failedOrders: 1,
      ltvPaise: 500000,
      lastContactedAt: Math.floor(Date.now() / 1000) - (2 * 3600), // Contacted 2 hours ago (cooldown is 24h)
    };

    const result = policyEngine.evaluate(baseOpportunity, baseRecommendation, baseConfig, customer);

    expect(result.verdict).toBe('REJECT');
    const freqRule = result.ruleResults.find(r => r.ruleId === 'CONTACT_FREQUENCY_CAP');
    expect(freqRule?.passed).toBe(false);
  });

  it('verdict is REJECT when Expected Value is below minimum margin', () => {
    const lowEvOpp: RevenueOpportunity = {
      ...baseOpportunity,
      expectedValue: {
        recoverableGmvPaise: 5000, // ₹50
        pSuccess: 0.1,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 500,
        netExpectedValuePaise: -130, // Negative EV
        isProfitable: false,
      },
    };

    const result = policyEngine.evaluate(lowEvOpp, baseRecommendation, baseConfig);

    expect(result.verdict).toBe('REJECT');
    const evRule = result.ruleResults.find(r => r.ruleId === 'POSITIVE_EV_REQUIRED');
    expect(evRule?.passed).toBe(false);
  });

  it('verdict is REJECT when recommended action is disabled in merchant config', () => {
    const restrictedConfig: MerchantPolicyConfig = {
      ...baseConfig,
      allowedActions: ['NOTIFY_ALTERNATIVE_METHOD'], // CREATE_PAYMENT_LINK is not allowed
    };

    const result = policyEngine.evaluate(baseOpportunity, baseRecommendation, restrictedConfig);

    expect(result.verdict).toBe('REJECT');
    const allowlistRule = result.ruleResults.find(r => r.ruleId === 'ACTION_ALLOWLIST');
    expect(allowlistRule?.passed).toBe(false);
  });

  it('verdict is REJECT when customer contact information is completely absent', () => {
    const noContactOpp: RevenueOpportunity = {
      ...baseOpportunity,
      customerContact: undefined,
      customerEmail: undefined,
      orderId: undefined,
    };

    const result = policyEngine.evaluate(noContactOpp, baseRecommendation, baseConfig);

    expect(result.verdict).toBe('REJECT');
    const evidenceRule = result.ruleResults.find(r => r.ruleId === 'EVIDENCE_SUFFICIENCY');
    expect(evidenceRule?.passed).toBe(false);
  });
});
