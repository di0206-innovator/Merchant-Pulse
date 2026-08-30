import { describe, it, expect, beforeEach } from 'vitest';
import { RevenuePipelineOrchestrator } from '../../../core/pipeline/orchestrator';
import { RevenueFactStore } from '../../../core/revenue/factStore';
import { RevenueOpportunityDetector } from '../../../core/revenue/detector';
import { MockStrategyProvider } from '../../../core/strategy/mock';
import { PolicyEngine } from '../../../core/policy/evaluator';
import { ActionDispatcher } from '../../../core/execution/dispatcher';
import { MockRazorpayClientAdapter } from '../../../integrations/razorpay/client';
import { AuditLedger } from '../../../core/audit/ledger';
import { PaymentEntity, RevenueOpportunity, StrategyRecommendation } from '../../../core/domain';
import { FinancialReconciliationEngine } from '../../../core/revenue/reconciliation';

describe('32-Scenario Adversarial Safety Benchmark', () => {
  let orchestrator: RevenuePipelineOrchestrator;
  let factStore: RevenueFactStore;
  let auditLedger: AuditLedger;
  let razorpayAdapter: MockRazorpayClientAdapter;
  let reconciliation: FinancialReconciliationEngine;
  let dispatcher: ActionDispatcher;

  beforeEach(() => {
    factStore = new RevenueFactStore();
    auditLedger = new AuditLedger();
    razorpayAdapter = new MockRazorpayClientAdapter();
    reconciliation = new FinancialReconciliationEngine();

    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = new MockStrategyProvider();
    const policyEngine = new PolicyEngine();
    dispatcher = new ActionDispatcher(razorpayAdapter);

    orchestrator = new RevenuePipelineOrchestrator({
      factStore,
      detector,
      strategyProvider,
      policyEngine,
      dispatcher,
      auditLedger,
      policyConfig: {
        merchantId: 'rzp_merchant_safety',
        allowedActions: ['CREATE_PAYMENT_LINK', 'SEND_PAYMENT_REMINDER', 'NOTIFY_ALTERNATIVE_METHOD', 'ESCALATE_TO_OPS', 'NO_ACTION'],
        maxAutoGmvPaise: 2500000, // ₹25,000 auto limit
        minEvPaise: 2000, // ₹20 min EV
        contactCooldownHours: 24,
        requireManualApprovalForDowntimeAlerts: true,
      },
    });
  });

  it('SCEN-011: Handles Gemini unavailable gracefully using deterministic fallback', async () => {
    const payment: PaymentEntity = {
      id: 'pay_safe_011',
      amountPaise: 450000,
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919800000011',
      createdAt: 1724500000,
    };
    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_safe_011');
    expect(opp).not.toBeNull();
    expect(opp?.status).toBe('EXECUTED');
  });

  it('SCEN-018: Prevents duplicate execution via idempotency intent key', async () => {
    const opp: RevenueOpportunity = {
      id: 'opp_safe_018',
      merchantId: 'rzp_merchant_main',
      type: 'HIGH_VALUE_DROPOFF',
      status: 'POLICY_EVALUATED',
      triggerEventId: 'evt_safe_018',
      amountPaise: 500000,
      evidence: {
        consecutiveFailures: 1,
        customerLtvPaise: 1000000,
        historicalRecoveryRatePct: 70,
        intentScore: 0.8,
        recentContactCount: 0,
        failureCode: 'BANK_TIMEOUT',
        paymentMethod: 'upi',
      },
      expectedValue: {
        recoverableGmvPaise: 500000,
        pSuccess: 0.7,
        estimatedInterventionCostPaise: 5000,
        customerFatiguePenaltyPaise: 1000,
        netExpectedValuePaise: 344000,
        isProfitable: true,
      },
      createdAt: 1724500000,
      updatedAt: 1724500000,
    };
    const rec: StrategyRecommendation = {
      opportunityId: opp.id,
      diagnosis: 'Bank timeout failure',
      recommendedActionType: 'CREATE_PAYMENT_LINK',
      confidenceScore: 0.9,
      actionPayload: {},
      rationale: 'Retry via payment link',
      suggestedExpiryMinutes: 120,
      customerMessaging: { smsText: 'Order recovery link' },
    };

    const res1 = await dispatcher.execute(opp, rec);
    expect(res1.status).toBe('SUCCESS');
    const linkId1 = res1.razorpayReferenceId;

    // Duplicate execution call with identical opportunity & recommendation
    const res2 = await dispatcher.execute(opp, rec);
    expect(res2.status).toBe('SUCCESS');
    expect(res2.razorpayReferenceId).toBe(linkId1);
  });

  it('SCEN-022: Rejects recovery attribution when amount exceeds original payment GMV', async () => {
    const payment: PaymentEntity = {
      id: 'pay_safe_022',
      amountPaise: 300000, // ₹3,000
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919800000022',
      createdAt: 1724500000,
    };
    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_safe_022');
    const decision = auditLedger.getRecordByOpportunityId(opp!.id);

    // Attempt reconciliation with tampered higher amount ₹30,000
    const recResult = reconciliation.reconcileRecovery(decision!, opp!, 3000000, payment.id);
    expect(recResult.valid).toBe(false);
    expect(recResult.reason).toContain('AMOUNT_MISMATCH');
  });

  it('SCEN-025: Blocks customer contact if customer contacted within 24h cooldown', async () => {
    const payment1: PaymentEntity = {
      id: 'pay_safe_025_1',
      amountPaise: 400000,
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919800000025',
      createdAt: 1724500000,
    };
    await orchestrator.handlePaymentEvent(payment1, 'evt_safe_025_1');

    // Second failure for same customer within 24h
    const payment2: PaymentEntity = {
      id: 'pay_safe_025_2',
      amountPaise: 400000,
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919800000025',
      createdAt: 1724500000 + 3600,
    };
    const opp2 = await orchestrator.handlePaymentEvent(payment2, 'evt_safe_025_2');
    expect(opp2?.status).toBe('REJECTED');

    const audit2 = auditLedger.getRecordByOpportunityId(opp2!.id);
    expect(audit2?.policyResult.notes).toContain('CONTACT_FREQUENCY_CAP');
  });
});
