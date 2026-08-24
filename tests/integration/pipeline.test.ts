import { describe, it, expect, beforeEach } from 'vitest';
import { RevenuePipelineOrchestrator } from '@/core/pipeline/orchestrator';
import { RevenueFactStore } from '@/core/revenue/factStore';
import { RevenueOpportunityDetector } from '@/core/revenue/detector';
import { MockStrategyProvider } from '@/core/strategy/mock';
import { PolicyEngine } from '@/core/policy/evaluator';
import { ActionDispatcher } from '@/core/execution/dispatcher';
import { MockRazorpayClientAdapter } from '@/integrations/razorpay/client';
import { AuditLedger } from '@/core/audit/ledger';
import { PaymentEntity } from '@/core/domain';

describe('Revenue Pipeline Closed-Loop Integration Tests', () => {
  let orchestrator: RevenuePipelineOrchestrator;
  let factStore: RevenueFactStore;
  let auditLedger: AuditLedger;
  let razorpayAdapter: MockRazorpayClientAdapter;

  beforeEach(() => {
    factStore = new RevenueFactStore();
    auditLedger = new AuditLedger();
    razorpayAdapter = new MockRazorpayClientAdapter();

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
        merchantId: 'rzp_merchant_test',
        allowedActions: [
          'CREATE_PAYMENT_LINK',
          'SEND_PAYMENT_REMINDER',
          'NOTIFY_ALTERNATIVE_METHOD',
          'ESCALATE_TO_OPS',
          'NO_ACTION',
        ],
        maxAutoGmvPaise: 2500000, // ₹25,000 auto execution limit
        minEvPaise: 2000, // ₹20 min EV
        contactCooldownHours: 24,
        requireManualApprovalForDowntimeAlerts: true,
      },
    });
  });

  it('runs complete closed-loop: failed payment -> AI strategy -> policy auto-execute -> Razorpay link -> recovery webhook', async () => {
    // 1. Initial failed payment event (₹4,500 due to bank timeout)
    const failedPayment: PaymentEntity = {
      id: 'pay_fail_e2e_1',
      orderId: 'order_e2e_1',
      amountPaise: 450000,
      currency: 'INR',
      status: 'failed',
      method: 'upi',
      contact: '+919876543210',
      email: 'customer@example.com',
      error: {
        code: 'BANK_TIMEOUT',
        description: 'Issuer bank timed out during UPI authorization',
      },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(failedPayment, 'evt_trigger_001');

    expect(opp).not.toBeNull();
    expect(opp?.status).toBe('EXECUTED');
    expect(opp?.amountPaise).toBe(450000);

    // Verify Decision Audit Record
    const auditRecord = auditLedger.getRecordByOpportunityId(opp!.id);
    expect(auditRecord).toBeDefined();
    expect(auditRecord?.actionStatus).toBe('AUTO_EXECUTED');
    expect(auditRecord?.executedActionId).toMatch(/^plink_/);

    const paymentLinkId = auditRecord!.executedActionId!;
    const linkInRazorpay = razorpayAdapter.getCreatedLink(paymentLinkId);
    expect(linkInRazorpay).toBeDefined();
    expect(linkInRazorpay?.amountPaise).toBe(450000);

    // 2. Simulated customer opens link and completes payment (payment_link.paid)
    const outcomeProcessed = orchestrator.handlePaymentLinkOutcome(
      paymentLinkId,
      'paid',
      450000,
      'evt_webhook_paid_001'
    );

    expect(outcomeProcessed).toBe(true);

    // Verify final opportunity state and recovered metrics
    const updatedOpp = orchestrator.getOpportunity(opp!.id);
    expect(updatedOpp?.status).toBe('RECOVERED');

    const metrics = orchestrator.getMetrics();
    expect(metrics.recoveredGmvPaise).toBe(450000);
    expect(metrics.recoveredOpportunityCount).toBe(1);
  });

  it('escalates high-value payment (₹75,000) and executes upon manual human approval', async () => {
    const highValuePayment: PaymentEntity = {
      id: 'pay_fail_high_value',
      orderId: 'order_hv_1',
      amountPaise: 7500000, // ₹75,000 (Exceeds ₹25,000 limit)
      currency: 'INR',
      status: 'failed',
      method: 'card',
      contact: '+919123456789',
      email: 'vip@example.com',
      error: {
        code: 'GATEWAY_ERROR',
        description: 'Gateway unavailable',
      },
      createdAt: 1724500000,
    };

    const opp = await orchestrator.handlePaymentEvent(highValuePayment, 'evt_hv_001');

    expect(opp).not.toBeNull();
    expect(opp?.status).toBe('ESCALATED');

    const auditRecord = auditLedger.getRecordByOpportunityId(opp!.id);
    expect(auditRecord?.actionStatus).toBe('ESCALATED');
    expect(auditRecord?.executedActionId).toBeUndefined();

    // Merchant clicks "Approve" in Human Review Queue
    const approvalSuccess = await orchestrator.approveEscalatedOpportunity(opp!.id);
    expect(approvalSuccess).toBe(true);

    const postApprovalOpp = orchestrator.getOpportunity(opp!.id);
    expect(postApprovalOpp?.status).toBe('EXECUTED');

    const postApprovalAudit = auditLedger.getRecordByOpportunityId(opp!.id);
    expect(postApprovalAudit?.actionStatus).toBe('MANUALLY_APPROVED');
    expect(postApprovalAudit?.executedActionId).toMatch(/^plink_/);
  });
});
