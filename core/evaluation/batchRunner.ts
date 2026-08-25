import { BatchConfig, StrategyComparisonResult, StrategyMetrics, SyntheticPaymentEvent } from './benchmarkTypes';
import { BatchGenerator } from './batchGenerator';
import { createEmptyMetrics, finalizeMetrics } from './metrics';
import { RevenueFactStore } from '../revenue/factStore';
import { RevenueOpportunityDetector } from '../revenue/detector';
import { PolicyEngine } from '../policy/evaluator';
import { ActionDispatcher } from '../execution/dispatcher';
import { MockRazorpayClientAdapter } from '../../integrations/razorpay/client';
import { AuditLedger } from '../audit/ledger';
import { RevenuePipelineOrchestrator } from '../pipeline/orchestrator';
import { MockStrategyProvider } from '../strategy/mock';
import { FinancialReconciliationEngine } from '../revenue/reconciliation';

export class BatchRunner {
  private generator = new BatchGenerator();

  public async runBenchmark(config: BatchConfig): Promise<StrategyComparisonResult> {
    const allEvents = this.generator.generateBatch(config);
    const heldOutEvents = allEvents.filter(e => e.isHeldOut);

    const noActionBaseline = this.runNoActionStrategy(heldOutEvents);
    const rulesOnlyBaseline = await this.runRulesOnlyStrategy(heldOutEvents, config);
    const merchantPulseAi = await this.runMerchantPulseAiStrategy(heldOutEvents, config);

    return {
      seed: config.seed,
      batchSize: config.batchSize,
      heldOutCount: heldOutEvents.length,
      noActionBaseline,
      rulesOnlyBaseline,
      merchantPulseAi,
      generatedAt: new Date().toISOString(),
    };
  }

  private runNoActionStrategy(events: SyntheticPaymentEvent[]): StrategyMetrics {
    const metrics = createEmptyMetrics('No-Action Baseline');
    metrics.totalEvents = events.length;
    metrics.totalFailedGmvPaise = events.reduce((sum, e) => sum + e.payment.amountPaise, 0);
    metrics.totalAddressableGmvPaise = metrics.totalFailedGmvPaise;
    return finalizeMetrics(metrics);
  }

  private async runRulesOnlyStrategy(
    events: SyntheticPaymentEvent[],
    config: BatchConfig
  ): Promise<StrategyMetrics> {
    const metrics = createEmptyMetrics('Deterministic Rules-Only');
    metrics.totalEvents = events.length;
    metrics.totalFailedGmvPaise = events.reduce((sum, e) => sum + e.payment.amountPaise, 0);
    metrics.totalAddressableGmvPaise = metrics.totalFailedGmvPaise;

    for (const evt of events) {
      // Blind rule: If payment > ₹1,000 and method != BAD_REQUEST, auto create payment link
      if (evt.payment.amountPaise >= 100000 && evt.payment.error?.code !== 'BAD_REQUEST') {
        metrics.attemptCount++;
        metrics.totalAttemptedGmvPaise += evt.payment.amountPaise;
        metrics.totalInterventionCostPaise += 1500; // ₹15 dispatch fee

        if (evt.simulatedOutcome === 'paid') {
          metrics.totalRecoveredGmvPaise += evt.payment.amountPaise;
        }
      } else {
        metrics.rejectionCount++;
        metrics.totalRejectedGmvPaise += evt.payment.amountPaise;
      }
    }

    return finalizeMetrics(metrics);
  }

  private async runMerchantPulseAiStrategy(
    events: SyntheticPaymentEvent[],
    config: BatchConfig
  ): Promise<StrategyMetrics> {
    const metrics = createEmptyMetrics('MerchantPulse AI Strategy');
    metrics.totalEvents = events.length;
    metrics.totalFailedGmvPaise = events.reduce((sum, e) => sum + e.payment.amountPaise, 0);
    metrics.totalAddressableGmvPaise = metrics.totalFailedGmvPaise;

    const factStore = new RevenueFactStore();
    const auditLedger = new AuditLedger();
    const razorpayAdapter = new MockRazorpayClientAdapter();
    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = new MockStrategyProvider();
    const policyEngine = new PolicyEngine();
    const dispatcher = new ActionDispatcher(razorpayAdapter);
    const reconciliation = new FinancialReconciliationEngine();

    const orchestrator = new RevenuePipelineOrchestrator({
      factStore,
      detector,
      strategyProvider,
      policyEngine,
      dispatcher,
      auditLedger,
      policyConfig: {
        merchantId: config.merchantId,
        allowedActions: ['CREATE_PAYMENT_LINK', 'SEND_PAYMENT_REMINDER', 'NOTIFY_ALTERNATIVE_METHOD', 'ESCALATE_TO_OPS', 'NO_ACTION'],
        maxAutoGmvPaise: 2500000, // ₹25,000
        minEvPaise: 2000, // ₹20
        contactCooldownHours: 24,
        requireManualApprovalForDowntimeAlerts: true,
      },
    });

    for (const evt of events) {
      const opp = await orchestrator.handlePaymentEvent(evt.payment, evt.eventId);

      if (!opp) {
        metrics.rejectionCount++;
        metrics.totalRejectedGmvPaise += evt.payment.amountPaise;
        continue;
      }

      if (opp.status === 'EXECUTED') {
        metrics.attemptCount++;
        metrics.contactCount++;
        metrics.totalAttemptedGmvPaise += evt.payment.amountPaise;
        metrics.totalInterventionCostPaise += 1500; // ₹15 link dispatch fee

        // Outcome Simulation Check
        if (evt.simulatedOutcome === 'paid') {
          const decision = auditLedger.getRecordByOpportunityId(opp.id);
          if (decision && decision.executedActionId) {
            const recRes = reconciliation.reconcileRecovery(decision, opp, evt.payment.amountPaise, evt.payment.id);
            if (recRes.valid) {
              orchestrator.handlePaymentLinkOutcome(decision.executedActionId, 'paid', evt.payment.amountPaise, `evt_rec_${evt.eventId}`);
              metrics.totalRecoveredGmvPaise += recRes.reconciledAmountPaise;
            } else if (recRes.reason?.includes('DUPLICATE')) {
              metrics.duplicateExecutionCount++;
            }
          }
        }
      } else if (opp.status === 'ESCALATED') {
        metrics.escalationCount++;
        metrics.totalEscalatedGmvPaise += evt.payment.amountPaise;

        // Auto-approve 50% of escalated items in benchmark for human-in-the-loop simulation
        if (evt.eventIndex % 2 === 0) {
          const approved = await orchestrator.approveEscalatedOpportunity(opp.id);
          if (approved) {
            metrics.attemptCount++;
            metrics.humanApprovedRecoveryGmvPaise += evt.payment.amountPaise;
            metrics.totalAttemptedGmvPaise += evt.payment.amountPaise;
            metrics.totalInterventionCostPaise += 1500;

            if (evt.simulatedOutcome === 'paid') {
              const decision = auditLedger.getRecordByOpportunityId(opp.id);
              if (decision && decision.executedActionId) {
                const recRes = reconciliation.reconcileRecovery(decision, opp, evt.payment.amountPaise, evt.payment.id);
                if (recRes.valid) {
                  orchestrator.handlePaymentLinkOutcome(decision.executedActionId, 'paid', evt.payment.amountPaise, `evt_rec_${evt.eventId}`);
                  metrics.totalRecoveredGmvPaise += recRes.reconciledAmountPaise;
                }
              }
            }
          }
        }
      } else {
        metrics.rejectionCount++;
        metrics.totalRejectedGmvPaise += evt.payment.amountPaise;
      }
    }

    return finalizeMetrics(metrics);
  }
}
