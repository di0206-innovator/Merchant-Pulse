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
import { GeminiStrategyProvider } from '../../integrations/gemini/client';
import { FinancialReconciliationEngine } from '../revenue/reconciliation';

export class BatchRunner {
  private generator = new BatchGenerator();

  public async runBenchmark(config: BatchConfig): Promise<StrategyComparisonResult> {
    const allEvents = this.generator.generateBatch(config);
    const heldOutEvents = allEvents.filter(e => e.isHeldOut);

    const noActionBaseline = this.runNoActionStrategy(heldOutEvents);
    const rulesOnlyBaseline = await this.runRulesOnlyStrategy(heldOutEvents, config);
    const merchantPulseMock = await this.runMerchantPulseStrategy(heldOutEvents, config, false);
    
    let merchantPulseGemini: StrategyMetrics | undefined = undefined;
    if (config.useGeminiAi) {
      merchantPulseGemini = await this.runMerchantPulseStrategy(heldOutEvents, config, true);
    }

    const merchantPulseAi = merchantPulseGemini || merchantPulseMock;

    return {
      seed: config.seed,
      batchSize: config.batchSize,
      heldOutCount: heldOutEvents.length,
      noActionBaseline,
      rulesOnlyBaseline,
      merchantPulseMock,
      merchantPulseAi,
      merchantPulseGemini,
      generatedAt: new Date().toISOString(),
    };
  }

  private runNoActionStrategy(events: SyntheticPaymentEvent[]): StrategyMetrics {
    const metrics = createEmptyMetrics('Baseline 1: No Action');
    metrics.totalEvents = events.length;
    metrics.totalFailedGmvPaise = events.reduce((sum, e) => sum + e.payment.amountPaise, 0);
    metrics.totalAddressableGmvPaise = metrics.totalFailedGmvPaise;
    metrics.totalRejectedGmvPaise = metrics.totalAddressableGmvPaise;
    return finalizeMetrics(metrics);
  }

  private async runRulesOnlyStrategy(
    events: SyntheticPaymentEvent[],
    config: BatchConfig
  ): Promise<StrategyMetrics> {
    const metrics = createEmptyMetrics('Baseline 2: Blind Rules-Only');
    metrics.totalEvents = events.length;
    metrics.totalFailedGmvPaise = events.reduce((sum, e) => sum + e.payment.amountPaise, 0);
    metrics.totalAddressableGmvPaise = metrics.totalFailedGmvPaise;

    for (const evt of events) {
      // Blind rule: If payment >= ₹1,000 and failure != BAD_REQUEST, auto-dispatch payment link
      if (evt.payment.amountPaise >= 100000 && evt.payment.error?.code !== 'BAD_REQUEST') {
        metrics.attemptCount++;
        metrics.contactCount++;
        metrics.autonomousAttemptGmvPaise += evt.payment.amountPaise;
        metrics.totalInterventionCostPaise += 1500; // ₹15 dispatch fee

        // Fatigue penalty on uncontactable users or low intent (< 0.40)
        if (!evt.contactable || evt.intentScore < 0.40) {
          metrics.totalFatigueCostPaise += 5000; // ₹50 fatigue penalty for spamming uncontactable/low-intent user
        }

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

  private async runMerchantPulseStrategy(
    events: SyntheticPaymentEvent[],
    config: BatchConfig,
    useGeminiAi: boolean
  ): Promise<StrategyMetrics> {
    const strategyName = useGeminiAi ? 'MerchantPulse AI Strategy (Gemini 2.5 Flash)' : 'MerchantPulse Strategy (Deterministic Mock)';
    const metrics = createEmptyMetrics(strategyName);
    metrics.totalEvents = events.length;
    metrics.totalFailedGmvPaise = events.reduce((sum, e) => sum + e.payment.amountPaise, 0);
    metrics.totalAddressableGmvPaise = metrics.totalFailedGmvPaise;

    const factStore = new RevenueFactStore();
    const auditLedger = new AuditLedger();
    const razorpayAdapter = new MockRazorpayClientAdapter();
    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = useGeminiAi ? new GeminiStrategyProvider() : new MockStrategyProvider();
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
        maxAutoGmvPaise: 2500000, // ₹25,000 auto-cap
        minEvPaise: 2000, // ₹20 min Net EV
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
        metrics.autonomousAttemptGmvPaise += evt.payment.amountPaise;
        metrics.totalInterventionCostPaise += 1500; // ₹15 dispatch fee

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

        // Simulated Operator Approval Policy: Approves 50% of high-value escalations based on even event indices
        if (evt.eventIndex % 2 === 0) {
          const approved = await orchestrator.approveEscalatedOpportunity(opp.id);
          if (approved) {
            metrics.attemptCount++;
            metrics.humanApprovedCount++;
            metrics.humanApprovedAttemptGmvPaise += evt.payment.amountPaise;
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
          } else {
            metrics.pendingEscalationGmvPaise += evt.payment.amountPaise;
          }
        } else {
          metrics.pendingEscalationGmvPaise += evt.payment.amountPaise;
        }
      } else {
        metrics.rejectionCount++;
        metrics.totalRejectedGmvPaise += evt.payment.amountPaise;
      }
    }

    return finalizeMetrics(metrics);
  }
}
