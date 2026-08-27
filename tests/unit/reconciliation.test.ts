import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialReconciliationEngine } from '@/core/revenue/reconciliation';
import { DecisionAuditRecord } from '@/core/domain/audit';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { InMemoryReconciliationStore } from '@/core/storage/inMemoryStores';

describe('Financial Reconciliation Engine Unit Tests', () => {
  let reconciliationEngine: FinancialReconciliationEngine;
  let store: InMemoryReconciliationStore;

  const mockOpportunity: RevenueOpportunity = {
    id: 'opp_test_recon_101',
    merchantId: 'rzp_merchant_test',
    orderId: 'order_recon_101',
    amountPaise: 500000, // ₹5,000.00
    type: 'HIGH_VALUE_DROPOFF',
    status: 'EXECUTED',
    triggerEventId: 'evt_recon_101',
    customerName: 'Aarav Sharma',
    customerContact: '+919876543210',
    customerEmail: 'aarav@example.com',
    expectedValue: {
      pSuccess: 0.75,
      recoverableGmvPaise: 500000,
      estimatedInterventionCostPaise: 130,
      customerFatiguePenaltyPaise: 0,
      netExpectedValuePaise: 374870,
      isProfitable: true,
    },
    evidence: {
      consecutiveFailures: 1,
      historicalRecoveryRatePct: 65,
      intentScore: 0.85,
      paymentMethod: 'upi',
      failureCode: 'BANK_TIMEOUT',
      customerLtvPaise: 1500000,
    },
    createdAt: 1724500000,
    updatedAt: 1724500005,
  };

  const mockExecutedDecision: DecisionAuditRecord = {
    decisionId: 'dec_recon_101',
    eventId: 'evt_recon_101',
    merchantId: 'rzp_merchant_test',
    opportunityId: 'opp_test_recon_101',
    timestamp: 1724500005,
    deterministicMetrics: {
      amountPaise: 500000,
      recoverableGmvPaise: 500000,
      expectedValuePaise: 374870,
      failureCode: 'BANK_TIMEOUT',
      customerLtvPaise: 1500000,
    },
    aiRecommendation: {
      opportunityId: 'opp_test_recon_101',
      diagnosis: 'Bank timeout on high intent UPI checkout',
      recommendedActionType: 'CREATE_PAYMENT_LINK',
      actionPayload: {},
      confidenceScore: 0.88,
      rationale: 'Valid EV positive recovery opportunity',
      suggestedExpiryMinutes: 120,
    },
    policyResult: {
      opportunityId: 'opp_test_recon_101',
      verdict: 'AUTO_EXECUTE',
      ruleResults: [],
      evaluatedAt: 1724500005,
      overrideAllowed: true,
    },
    actionStatus: 'AUTO_EXECUTED',
    executedActionId: 'plink_recon_101',
    outcome: {
      status: 'PENDING',
    },
  };

  beforeEach(() => {
    store = new InMemoryReconciliationStore();
    reconciliationEngine = new FinancialReconciliationEngine(store);
  });

  it('successfully attributes an executed payment link payment', async () => {
    const result = await reconciliationEngine.reconcileRecovery(
      mockExecutedDecision,
      mockOpportunity,
      500000,
      'pay_rzp_recon_1',
      'evt_wh_link_paid'
    );

    expect(result.valid).toBe(true);
    expect(result.attributionType).toBe('ATTRIBUTED_INTERVENTION');
    expect(result.reconciledAmountPaise).toBe(500000);

    const isReconciled = await store.isDecisionReconciled(mockExecutedDecision.decisionId);
    expect(isReconciled).toBe(true);
  });

  it('guarantees zero double-counting: one decision cannot be counted twice', async () => {
    // First reconciliation succeeds
    const firstResult = await reconciliationEngine.reconcileRecovery(
      mockExecutedDecision,
      mockOpportunity,
      500000,
      'pay_rzp_recon_1'
    );
    expect(firstResult.valid).toBe(true);

    // Second reconciliation attempt with duplicate decision ID must be rejected
    const secondResult = await reconciliationEngine.reconcileRecovery(
      mockExecutedDecision,
      mockOpportunity,
      500000,
      'pay_rzp_recon_2'
    );
    expect(secondResult.valid).toBe(false);
    expect(secondResult.attributionType).toBe('DUPLICATE_RECOVERY_EVENT');
    expect(secondResult.reconciledAmountPaise).toBe(0);
  });

  it('guarantees zero double-counting: one payment cannot be counted twice', async () => {
    // First decision with payment pay_unique_99
    const result1 = await reconciliationEngine.reconcileRecovery(
      mockExecutedDecision,
      mockOpportunity,
      500000,
      'pay_unique_99'
    );
    expect(result1.valid).toBe(true);

    // Different decision reusing the same payment ID
    const secondDecision: DecisionAuditRecord = {
      ...mockExecutedDecision,
      decisionId: 'dec_recon_102',
      opportunityId: 'opp_recon_102',
    };
    const result2 = await reconciliationEngine.reconcileRecovery(
      secondDecision,
      mockOpportunity,
      500000,
      'pay_unique_99'
    );
    expect(result2.valid).toBe(false);
    expect(result2.attributionType).toBe('DUPLICATE_RECOVERY_EVENT');
    expect(result2.reconciledAmountPaise).toBe(0);
  });

  it('rejects reconciliation if recovered amount exceeds original failed GMV', async () => {
    const inflatedAmountPaise = 600000; // ₹6,000 paid for ₹5,000 failure
    const result = await reconciliationEngine.reconcileRecovery(
      mockExecutedDecision,
      mockOpportunity,
      inflatedAmountPaise,
      'pay_rzp_inflated'
    );

    expect(result.valid).toBe(false);
    expect(result.attributionType).toBe('AMOUNT_MISMATCH');
    expect(result.reconciledAmountPaise).toBe(0);
    expect(result.reason).toContain('AMOUNT_MISMATCH');
  });

  it('distinguishes organic recovery from MerchantPulse intervention', async () => {
    // Unexecuted decision (e.g. rejected by policy or escalated without execution)
    const rejectedDecision: DecisionAuditRecord = {
      ...mockExecutedDecision,
      decisionId: 'dec_unexecuted_001',
      actionStatus: 'REJECTED',
      executedActionId: undefined,
    };

    const result = await reconciliationEngine.reconcileRecovery(
      rejectedDecision,
      mockOpportunity,
      500000,
      'pay_organic_001'
    );

    expect(result.valid).toBe(false);
    expect(result.attributionType).toBe('ORGANIC_RECOVERY');
    expect(result.reason).toContain('without an active executed MerchantPulse intervention');
  });
});
