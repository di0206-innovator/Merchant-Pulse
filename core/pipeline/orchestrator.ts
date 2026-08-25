import crypto from 'node:crypto';
import { RevenueFactStore } from '../revenue/factStore';
import { RevenueOpportunityDetector } from '../revenue/detector';
import { RevenueStrategyProvider } from '../strategy/provider';
import { PolicyEngine } from '../policy/evaluator';
import { ActionDispatcher } from '../execution/dispatcher';
import { AuditLedger } from '../audit/ledger';
import { PaymentEntity, OrderEntity } from '../domain/payment';
import { RevenueOpportunity } from '../domain/opportunity';
import { MerchantPolicyConfig } from '../domain/policy';
import { StrategyRecommendation } from '../domain/strategy';
import { DecisionAuditRecord } from '../domain/audit';
import { computeMerchantMetrics, MerchantRevenueMetrics } from '../revenue/metrics';

export interface PipelineDependencies {
  factStore: RevenueFactStore;
  detector: RevenueOpportunityDetector;
  strategyProvider: RevenueStrategyProvider;
  policyEngine: PolicyEngine;
  dispatcher: ActionDispatcher;
  auditLedger: AuditLedger;
  policyConfig: MerchantPolicyConfig;
}

export class RevenuePipelineOrchestrator {
  private factStore: RevenueFactStore;
  private detector: RevenueOpportunityDetector;
  private strategyProvider: RevenueStrategyProvider;
  private policyEngine: PolicyEngine;
  private dispatcher: ActionDispatcher;
  private auditLedger: AuditLedger;
  private policyConfig: MerchantPolicyConfig;
  private opportunities: Map<string, RevenueOpportunity> = new Map();
  private recommendations: Map<string, StrategyRecommendation> = new Map();

  constructor(deps: PipelineDependencies) {
    this.factStore = deps.factStore;
    this.detector = deps.detector;
    this.strategyProvider = deps.strategyProvider;
    this.policyEngine = deps.policyEngine;
    this.dispatcher = deps.dispatcher;
    this.auditLedger = deps.auditLedger;
    this.policyConfig = deps.policyConfig;
  }

  /**
   * Primary ingestion handler for payment events (e.g. payment.failed, payment.captured)
   */
  public async handlePaymentEvent(payment: PaymentEntity, eventId: string): Promise<RevenueOpportunity | null> {
    // 1. Fact Store updates
    this.factStore.recordPayment(payment);

    // 2. If payment captured, check if it resolves an open opportunity
    if (payment.status === 'captured') {
      if (payment.orderId) {
        const matchingOpp = Array.from(this.opportunities.values()).find(
          o => o.orderId === payment.orderId && o.status !== 'RECOVERED'
        );
        if (matchingOpp) {
          matchingOpp.status = 'RECOVERED';
          matchingOpp.updatedAt = Math.floor(Date.now() / 1000);
          this.opportunities.set(matchingOpp.id, matchingOpp);
          const decision = this.auditLedger.getRecordByOpportunityId(matchingOpp.id);
          if (decision) {
            this.auditLedger.updateOutcome(decision.decisionId, {
              status: 'RECOVERED',
              recoveredAmountPaise: payment.amountPaise,
              resolutionEventId: eventId,
            });
          }
        }
      }
      return null;
    }

    // 3. Detect Opportunity from payment failure
    const opportunity = this.detector.detectFromPaymentFailure(payment, eventId, this.policyConfig.merchantId);
    if (!opportunity) {
      return null;
    }

    this.opportunities.set(opportunity.id, opportunity);

    // 4. Generate AI Strategy Recommendation
    const recommendation = await this.strategyProvider.generateStrategy(opportunity);
    this.recommendations.set(opportunity.id, recommendation);
    opportunity.status = 'STRATEGY_GENERATED';

    // 5. Evaluate Policy Guardrails
    const customer = (payment.contact || payment.email)
      ? this.factStore.getCustomer(payment.contact || payment.email || '')
      : undefined;

    const policyResult = this.policyEngine.evaluate(opportunity, recommendation, this.policyConfig, customer);
    opportunity.status = 'POLICY_EVALUATED';

    // 6. Action Execution or Escalation Router
    const now = Math.floor(Date.now() / 1000);
    const hash = crypto.createHash('sha256').update(`${opportunity.id}_${now}`).digest('hex').slice(0, 14);
    const decisionId = `dec_${hash}`;
    let actionStatus: DecisionAuditRecord['actionStatus'] = 'REJECTED';
    let executedActionId: string | undefined;

    if (policyResult.verdict === 'AUTO_EXECUTE') {
      const execResult = await this.dispatcher.execute(opportunity, recommendation);
      if (execResult.status === 'SUCCESS') {
        actionStatus = 'AUTO_EXECUTED';
        executedActionId = execResult.razorpayReferenceId;
        opportunity.status = 'EXECUTED';
        if (customer) {
          customer.lastContactedAt = now;
        }
      } else {
        actionStatus = 'FAILED';
        opportunity.status = 'DETECTED';
      }
    } else if (policyResult.verdict === 'ESCALATE_HUMAN') {
      actionStatus = 'ESCALATED';
      opportunity.status = 'ESCALATED';
    } else {
      actionStatus = 'REJECTED';
      opportunity.status = 'REJECTED';
    }

    opportunity.updatedAt = now;
    this.opportunities.set(opportunity.id, opportunity);

    // 7. Write immutable audit ledger trace
    const auditRecord: DecisionAuditRecord = {
      decisionId,
      eventId,
      merchantId: this.policyConfig.merchantId,
      opportunityId: opportunity.id,
      timestamp: now,
      deterministicMetrics: {
        amountPaise: opportunity.amountPaise,
        recoverableGmvPaise: opportunity.expectedValue.recoverableGmvPaise,
        expectedValuePaise: opportunity.expectedValue.netExpectedValuePaise,
        failureCode: opportunity.evidence.failureCode,
        customerLtvPaise: opportunity.evidence.customerLtvPaise,
      },
      aiRecommendation: recommendation,
      policyResult,
      actionStatus,
      executedActionId,
      outcome: {
        status: 'PENDING',
      },
    };

    this.auditLedger.recordDecision(auditRecord);
    return opportunity;
  }

  /**
   * Processes closed-loop outcome webhooks (payment_link.paid / payment_link.expired)
   */
  public handlePaymentLinkOutcome(
    paymentLinkId: string,
    status: 'paid' | 'expired' | 'cancelled',
    amountPaise?: number,
    eventId: string = 'evt_outcome'
  ): boolean {
    const decision = this.auditLedger.getRecordByPaymentLinkId(paymentLinkId);
    if (!decision) return false;

    const opportunity = this.opportunities.get(decision.opportunityId);

    if (status === 'paid') {
      this.auditLedger.updateOutcome(decision.decisionId, {
        status: 'RECOVERED',
        recoveredAmountPaise: amountPaise || decision.deterministicMetrics.amountPaise,
        resolutionEventId: eventId,
      });
      if (opportunity) {
        opportunity.status = 'RECOVERED';
        opportunity.updatedAt = Math.floor(Date.now() / 1000);
        this.opportunities.set(opportunity.id, opportunity);
      }
      return true;
    } else if (status === 'expired') {
      this.auditLedger.updateOutcome(decision.decisionId, {
        status: 'EXPIRED',
        resolutionEventId: eventId,
      });
      if (opportunity && opportunity.status === 'EXECUTED') {
        opportunity.status = 'EXPIRED';
        opportunity.updatedAt = Math.floor(Date.now() / 1000);
        this.opportunities.set(opportunity.id, opportunity);
      }
      return true;
    }

    return false;
  }

  /**
   * Merchant Human Approval for Escalated opportunities
   */
  public async approveEscalatedOpportunity(opportunityId: string): Promise<boolean> {
    const opportunity = this.opportunities.get(opportunityId);
    const recommendation = this.recommendations.get(opportunityId);
    const decision = this.auditLedger.getRecordByOpportunityId(opportunityId);

    if (!opportunity || !recommendation || !decision || opportunity.status !== 'ESCALATED') {
      return false;
    }

    const execResult = await this.dispatcher.execute(opportunity, recommendation);
    if (execResult.status === 'SUCCESS') {
      opportunity.status = 'EXECUTED';
      opportunity.updatedAt = Math.floor(Date.now() / 1000);
      this.opportunities.set(opportunity.id, opportunity);

      decision.actionStatus = 'MANUALLY_APPROVED';
      decision.executedActionId = execResult.razorpayReferenceId;
      this.auditLedger.recordDecision(decision);

      const customerKey = opportunity.customerContact || opportunity.customerEmail;
      if (customerKey) {
        const customer = this.factStore.getCustomer(customerKey);
        if (customer) customer.lastContactedAt = Math.floor(Date.now() / 1000);
      }
      return true;
    }

    return false;
  }

  public getOpportunities(): RevenueOpportunity[] {
    return Array.from(this.opportunities.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getOpportunity(id: string): RevenueOpportunity | undefined {
    return this.opportunities.get(id);
  }

  public getRecommendation(opportunityId: string): StrategyRecommendation | undefined {
    return this.recommendations.get(opportunityId);
  }

  public getMetrics(): MerchantRevenueMetrics {
    return computeMerchantMetrics(this.factStore, Array.from(this.opportunities.values()));
  }

  public getAuditTrail(): DecisionAuditRecord[] {
    return this.auditLedger.getAllRecords();
  }

  public getFactStore(): RevenueFactStore {
    return this.factStore;
  }

  public clear(): void {
    this.opportunities.clear();
    this.recommendations.clear();
    this.factStore.clear();
    this.auditLedger.clear();
  }
}
