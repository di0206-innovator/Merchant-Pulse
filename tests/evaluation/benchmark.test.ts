import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { RevenuePipelineOrchestrator } from '@/core/pipeline/orchestrator';
import { RevenueFactStore } from '@/core/revenue/factStore';
import { RevenueOpportunityDetector } from '@/core/revenue/detector';
import { MockStrategyProvider } from '@/core/strategy/mock';
import { PolicyEngine } from '@/core/policy/evaluator';
import { ActionDispatcher } from '@/core/execution/dispatcher';
import { MockRazorpayClientAdapter } from '@/integrations/razorpay/client';
import { AuditLedger } from '@/core/audit/ledger';
import { IdempotencyLedger } from '@/core/events/idempotency';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';
import { StrategyRecommendationSchema, PaymentEntity } from '@/core/domain';

describe('MerchantPulse 10-Scenario Adversarial Evaluation Benchmark Suite', () => {
  let orchestrator: RevenuePipelineOrchestrator;
  let factStore: RevenueFactStore;
  let auditLedger: AuditLedger;
  let razorpayAdapter: MockRazorpayClientAdapter;
  let idempotency: IdempotencyLedger;

  const WEBHOOK_SECRET = 'rzp_wh_sec_eval_999';

  beforeEach(() => {
    factStore = new RevenueFactStore();
    auditLedger = new AuditLedger();
    razorpayAdapter = new MockRazorpayClientAdapter();
    idempotency = new IdempotencyLedger();

    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = new MockStrategyProvider();
    const policyEngine = new PolicyEngine();
    const dispatcher = new ActionDispatcher(razorpayAdapter);

    orchestrator = new RevenuePipelineOrchestrator({
      factStore,
      detector,
      strategyProvider,
      policyEngine,
      dispatcher,
      auditLedger,
      policyConfig: {
        merchantId: 'rzp_merchant_eval',
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
      },
    });
  });

  // SCEN-001
  it('SCEN-001: High-Value Dropoff Recovery (Auto-Execution & Positive EV)', async () => {
    const payment: PaymentEntity = {
      id: 'pay_scen_001',
      orderId: 'order_scen_001',
      amountPaise: 450000, // ₹4,500
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919800000001',
      email: 'user1@example.com',
      error: { code: 'BANK_TIMEOUT', description: 'Bank timed out' },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_scen_001');
    expect(opp).not.toBeNull();
    expect(opp?.status).toBe('EXECUTED');
    expect(opp?.expectedValue.netExpectedValuePaise).toBeGreaterThan(250000);

    const audit = auditLedger.getRecordByOpportunityId(opp!.id);
    expect(audit?.actionStatus).toBe('AUTO_EXECUTED');
    expect(audit?.executedActionId).toMatch(/^plink_/);
  });

  // SCEN-002
  it('SCEN-002: Policy Threshold Over-Limit Escalation (₹85,000 GMV)', async () => {
    const payment: PaymentEntity = {
      id: 'pay_scen_002',
      orderId: 'order_scen_002',
      amountPaise: 8500000, // ₹85,000 (Exceeds ₹25,000 auto limit)
      currency: 'INR',
      status: 'failed',
      method: 'card',
      contact: '+919800000002',
      email: 'user2@example.com',
      error: { code: 'GATEWAY_ERROR', description: 'Gateway error' },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_scen_002');
    expect(opp?.status).toBe('ESCALATED');

    const audit = auditLedger.getRecordByOpportunityId(opp!.id);
    expect(audit?.actionStatus).toBe('ESCALATED');
    expect(audit?.executedActionId).toBeUndefined(); // Zero unapproved external execution
  });

  // SCEN-003
  it('SCEN-003: Negative EV Suppression on Micro-transactions', async () => {
    const payment: PaymentEntity = {
      id: 'pay_scen_003',
      orderId: 'order_scen_003',
      amountPaise: 3000, // ₹30.00
      currency: 'INR',
      status: 'failed',
      method: 'card',
      contact: '+919800000003',
      error: { code: 'INVALID_DETAILS', description: 'Invalid card details' },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_scen_003');
    expect(opp?.status).toBe('REJECTED');

    const audit = auditLedger.getRecordByOpportunityId(opp!.id);
    expect(audit?.actionStatus).toBe('REJECTED');
    const evRule = audit?.policyResult.ruleResults.find(r => r.ruleId === 'POSITIVE_EV_REQUIRED');
    expect(evRule?.passed).toBe(false);
  });

  // SCEN-004
  it('SCEN-004: Customer Fatigue Protection (Within 24h Cooldown)', async () => {
    const contact = '+919800000004';
    factStore.recordPayment({
      id: 'pay_prior',
      amountPaise: 200000,
      currency: 'INR',
      status: 'captured',
      contact,
      createdAt: 1724500000,
    });
    const cust = factStore.getCustomer(contact)!;
    cust.lastContactedAt = Math.floor(Date.now() / 1000) - (2 * 3600); // Contacted 2h ago

    const payment: PaymentEntity = {
      id: 'pay_scen_004',
      orderId: 'order_scen_004',
      amountPaise: 500000,
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact,
      error: { code: 'BANK_TIMEOUT', description: 'Bank timeout' },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_scen_004');
    expect(opp?.status).toBe('REJECTED');

    const audit = auditLedger.getRecordByOpportunityId(opp!.id);
    const freqRule = audit?.policyResult.ruleResults.find(r => r.ruleId === 'CONTACT_FREQUENCY_CAP');
    expect(freqRule?.passed).toBe(false);
  });

  // SCEN-005
  it('SCEN-005: Duplicate Webhook Delivery Idempotency Guard', () => {
    const eventId = 'evt_duplicate_wh_005';
    const key = idempotency.generateKey(eventId);

    expect(idempotency.isDuplicate(key)).toBe(false);
    idempotency.record(key, { processed: true });

    // Repeated delivery
    expect(idempotency.isDuplicate(key)).toBe(true);
  });

  // SCEN-006
  it('SCEN-006: Webhook Signature Tampering Interception', () => {
    const rawPayload = JSON.stringify({ event: 'payment.failed', amount: 50000 });
    const tamperedPayload = JSON.stringify({ event: 'payment.failed', amount: 500000 });

    const validSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawPayload).digest('hex');

    expect(verifyRazorpayWebhookSignature(rawPayload, validSig, WEBHOOK_SECRET)).toBe(true);
    expect(verifyRazorpayWebhookSignature(tamperedPayload, validSig, WEBHOOK_SECRET)).toBe(false);
  });

  // SCEN-007
  it('SCEN-007: Malformed AI Output Schema Defense', () => {
    const malformedAiOutputs = [
      { diagnosis: 'Short' }, // Missing fields
      { recommendedActionType: 'UNAUTHORIZED_REFUND' }, // Invalid enum
      { confidenceScore: 1.5 }, // Score > 1.0
    ];

    for (const output of malformedAiOutputs) {
      const parsed = StrategyRecommendationSchema.safeParse(output);
      expect(parsed.success).toBe(false);
    }
  });

  // SCEN-008
  it('SCEN-008: Gateway Degradation Anomaly Detection', () => {
    // Record 6 netbanking payments on SBI with 4 failures (66.7% failure rate)
    for (let i = 0; i < 6; i++) {
      factStore.recordPayment({
        id: `pay_sbi_${i}`,
        amountPaise: 300000,
        currency: 'INR',
        status: i < 2 ? 'captured' : 'failed',
        method: 'netbanking',
        bank: 'SBIN',
        createdAt: 1724500000 + i,
      });
    }

    const health = factStore.getMethodHealthStats();
    const sbi = health.find(s => s.bank === 'SBIN');
    expect(sbi?.isDegraded).toBe(true);
    expect(sbi?.failureRatePct).toBeGreaterThan(60);
  });

  // SCEN-009
  it('SCEN-009: Closed-Loop Outcome Attribution & GMV Reconciliation', async () => {
    const payment: PaymentEntity = {
      id: 'pay_scen_009',
      orderId: 'order_scen_009',
      amountPaise: 620000, // ₹6,200
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919800000009',
      error: { code: 'UPI_APP_TIMEOUT', description: 'Timeout' },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_scen_009');
    const decision = auditLedger.getRecordByOpportunityId(opp!.id);
    const linkId = decision!.executedActionId!;

    // Customer completes payment
    orchestrator.handlePaymentLinkOutcome(linkId, 'paid', 620000, 'evt_paid_009');

    const updatedOpp = orchestrator.getOpportunity(opp!.id);
    expect(updatedOpp?.status).toBe('RECOVERED');

    const updatedAudit = auditLedger.getRecord(decision!.decisionId);
    expect(updatedAudit?.outcome?.status).toBe('RECOVERED');
    expect(updatedAudit?.outcome?.recoveredAmountPaise).toBe(620000);
  });

  // SCEN-010
  it('SCEN-010: Expired Link Lifecycle Resolution', async () => {
    const payment: PaymentEntity = {
      id: 'pay_scen_010',
      orderId: 'order_scen_010',
      amountPaise: 380000, // ₹3,800
      currency: 'INR',
      status: 'failed',
      method: 'card',
      contact: '+919800000010',
      error: { code: 'GATEWAY_ERROR', description: 'Timeout' },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(payment, 'evt_scen_010');
    const decision = auditLedger.getRecordByOpportunityId(opp!.id);
    const linkId = decision!.executedActionId!;

    // Customer lets link expire past SLA
    orchestrator.handlePaymentLinkOutcome(linkId, 'expired', undefined, 'evt_exp_010');

    const updatedOpp = orchestrator.getOpportunity(opp!.id);
    expect(updatedOpp?.status).toBe('EXPIRED');

    const updatedAudit = auditLedger.getRecord(decision!.decisionId);
    expect(updatedAudit?.outcome?.status).toBe('EXPIRED');
  });

  // ACCOUNTING INVARIANTS TEST
  it('ACCOUNTING-INVARIANT: Non-overlapping GMV partitions & Net EV correctness', async () => {
    const { BatchRunner } = await import('@/core/evaluation/batchRunner');
    const runner = new BatchRunner();
    const result = await runner.runBenchmark({
      batchSize: 100,
      seed: 42,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_eval',
    });

    const metrics = result.merchantPulseMock;
    
    // Invariant 1: Total Addressable GMV = Rejected + Pending Escalation + Autonomous Attempt + Human Approved Attempt
    const totalPartitionedGmv = metrics.totalRejectedGmvPaise + metrics.pendingEscalationGmvPaise + metrics.autonomousAttemptGmvPaise + metrics.humanApprovedAttemptGmvPaise;
    expect(totalPartitionedGmv).toBe(metrics.totalAddressableGmvPaise);

    // Invariant 2: Total Attempted GMV = Autonomous Attempt + Human Approved Attempt
    expect(metrics.totalAttemptedGmvPaise).toBe(metrics.autonomousAttemptGmvPaise + metrics.humanApprovedAttemptGmvPaise);

    // Invariant 3: Total Recovered GMV <= Total Attempted GMV
    expect(metrics.totalRecoveredGmvPaise).toBeLessThanOrEqual(metrics.totalAttemptedGmvPaise);

    // Invariant 4: Net Recovered GMV = max(0, totalRecovered - interventionCost - fatigueCost)
    const expectedNet = Math.max(0, metrics.totalRecoveredGmvPaise - metrics.totalInterventionCostPaise - metrics.totalFatigueCostPaise);
    expect(metrics.netRecoveredGmvPaise).toBe(expectedNet);
  });
});
