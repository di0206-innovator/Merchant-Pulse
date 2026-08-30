import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RevenuePipelineOrchestrator } from '@/core/pipeline/orchestrator';
import { RevenueFactStore } from '@/core/revenue/factStore';
import { RevenueOpportunityDetector } from '@/core/revenue/detector';
import { MockStrategyProvider } from '@/core/strategy/mock';
import { PolicyEngine } from '@/core/policy/evaluator';
import { ActionDispatcher } from '@/core/execution/dispatcher';
import { MockRazorpayClientAdapter } from '@/integrations/razorpay/client';
import { AuditLedger } from '@/core/audit/ledger';
import { ConcurrentEventEngine } from '@/core/concurrency/workerPool';
import { PaymentEntity } from '@/core/domain/payment';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { StrategyRecommendation } from '@/core/domain/strategy';
import { InMemoryExecutionIntentStore } from '@/core/storage/inMemoryStores';

describe('Concurrency & Execution Intent Hardening Test Suite', () => {
  let orchestrator: RevenuePipelineOrchestrator;
  let concurrentEngine: ConcurrentEventEngine;
  let mockRazorpayAdapter: MockRazorpayClientAdapter;
  let dispatcher: ActionDispatcher;
  let intentStore: InMemoryExecutionIntentStore;

  beforeEach(() => {
    const factStore = new RevenueFactStore();
    const auditLedger = new AuditLedger();
    mockRazorpayAdapter = new MockRazorpayClientAdapter();
    intentStore = new InMemoryExecutionIntentStore();

    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = new MockStrategyProvider();
    const policyEngine = new PolicyEngine();
    dispatcher = new ActionDispatcher(mockRazorpayAdapter, intentStore);

    orchestrator = new RevenuePipelineOrchestrator({
      factStore,
      detector,
      strategyProvider,
      policyEngine,
      dispatcher,
      auditLedger,
      policyConfig: {
        merchantId: 'rzp_merchant_stress_test',
        allowedActions: [
          'CREATE_PAYMENT_LINK',
          'SEND_PAYMENT_REMINDER',
          'NOTIFY_ALTERNATIVE_METHOD',
          'ESCALATE_TO_OPS',
          'NO_ACTION',
        ],
        maxAutoGmvPaise: 2500000,
        minEvPaise: 2000,
        contactCooldownHours: 24,
        requireManualApprovalForDowntimeAlerts: true,
      },
    });

    concurrentEngine = new ConcurrentEventEngine(orchestrator);
  });

  it('guarantees 100 concurrent execution attempts produce exactly ONE Razorpay Payment Link', async () => {
    const spyCreatePaymentLink = vi.spyOn(mockRazorpayAdapter, 'createPaymentLink');

    const opportunity: RevenueOpportunity = {
      id: 'opp_concurrent_100_race',
      merchantId: 'rzp_merchant_stress_test',
      orderId: 'order_race_100',
      amountPaise: 450000, // ₹4,500
      type: 'HIGH_VALUE_DROPOFF',
      status: 'POLICY_EVALUATED',
      triggerEventId: 'evt_race_100',
      customerName: 'Priya Verma',
      customerContact: '+919876500000',
      customerEmail: 'priya@example.com',
      expectedValue: {
        pSuccess: 0.82,
        recoverableGmvPaise: 450000,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: 368870,
        isProfitable: true,
      },
      evidence: {
        consecutiveFailures: 1,
        historicalRecoveryRatePct: 65,
        intentScore: 0.85,
        paymentMethod: 'upi',
        failureCode: 'BANK_TIMEOUT',
        customerLtvPaise: 2000000,
        recentContactCount: 0,
      },
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    const recommendation: StrategyRecommendation = {
      opportunityId: opportunity.id,
      diagnosis: 'Bank timeout failure on checkout',
      recommendedActionType: 'CREATE_PAYMENT_LINK',
      actionPayload: { amountPaise: 450000 },
      confidenceScore: 0.9,
      rationale: 'Valid high ROI recovery candidate',
      suggestedExpiryMinutes: 120,
    };

    // Fire 100 simultaneous execution attempts for the exact same opportunity
    const CONCURRENT_ATTEMPTS = 100;
    const executionPromises = Array.from({ length: CONCURRENT_ATTEMPTS }, () =>
      dispatcher.execute(opportunity, recommendation)
    );

    const results = await Promise.all(executionPromises);

    // All 100 executions must succeed without crashing
    expect(results).toHaveLength(CONCURRENT_ATTEMPTS);
    results.forEach(res => {
      expect(res.status).toBe('SUCCESS');
      expect(res.razorpayReferenceId).toBeDefined();
    });

    // Exactly 1 external Razorpay Payment Link creation call was made
    expect(spyCreatePaymentLink).toHaveBeenCalledTimes(1);

    // All 100 callers received the identical Razorpay reference ID
    const firstReferenceId = results[0].razorpayReferenceId;
    results.forEach(res => {
      expect(res.razorpayReferenceId).toBe(firstReferenceId);
    });

    // Persisted intent state is EXECUTION_SUCCEEDED
    const intentKey = `intent_${opportunity.merchantId}_${opportunity.id}_${recommendation.recommendedActionType}`;
    const persistedIntent = await intentStore.getIntent(intentKey);
    expect(persistedIntent).not.toBeNull();
    expect(persistedIntent?.state).toBe('EXECUTION_SUCCEEDED');
    expect(persistedIntent?.record?.razorpayReferenceId).toBe(firstReferenceId);
  });

  it('processes 500 simultaneous concurrent payment transactions with 0 dropped events', async () => {
    const CONCURRENCY_USERS = 500;
    const now = Math.floor(Date.now() / 1000);
    const syntheticEvents: Array<{ payment: PaymentEntity; eventId: string }> = [];

    for (let i = 0; i < CONCURRENCY_USERS; i++) {
      const isFailed = i % 2 === 0;
      const payment: PaymentEntity = {
        id: `pay_stress_sim_${i}`,
        orderId: `order_stress_sim_${i}`,
        amountPaise: (Math.floor(Math.random() * 300) + 15) * 10000, // ₹1,500 to ₹31,500
        currency: 'INR',
        status: isFailed ? 'failed' : 'captured',
        method: i % 3 === 0 ? 'upi' : i % 3 === 1 ? 'card' : 'netbanking',
        bank: i % 3 === 2 ? 'HDFC' : undefined,
        contact: `+91981100${(i % 50).toString().padStart(4, '0')}`,
        email: `stress_user_${i}@store.in`,
        error: isFailed ? {
          code: 'BANK_TIMEOUT',
          description: 'Issuer bank timed out under heavy load',
        } : undefined,
        createdAt: now,
      };

      syntheticEvents.push({
        payment,
        eventId: `evt_stress_sim_${i}`,
      });
    }

    // Fire 500 concurrent events simultaneously
    const metrics = await concurrentEngine.executeConcurrentBatch(syntheticEvents, CONCURRENCY_USERS);

    expect(metrics.totalRequests).toBe(CONCURRENCY_USERS);
    expect(metrics.successfulRequests).toBe(CONCURRENCY_USERS);
    expect(metrics.failedRequests).toBe(0);
    expect(metrics.zeroDropGuarantee).toBe(true);
    expect(metrics.latencyP95Ms).toBeLessThan(1500); // Sub-1.5s p95 latency under 500 concurrent load
    expect(metrics.throughputRps).toBeGreaterThan(100); // High throughput execution
  });
});
