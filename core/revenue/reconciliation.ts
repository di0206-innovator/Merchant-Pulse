import { DecisionAuditRecord } from '../domain/audit';
import { RevenueOpportunity } from '../domain/opportunity';
import { ReconciliationStore } from '../storage/interfaces';

export type ReconciliationAttributionType =
  | 'ATTRIBUTED_INTERVENTION'
  | 'ORGANIC_RECOVERY'
  | 'DUPLICATE_RECOVERY_EVENT'
  | 'AMOUNT_MISMATCH'
  | 'REJECTED_UNATTRIBUTED';

export interface ReconciliationResult {
  valid: boolean;
  attributionType: ReconciliationAttributionType;
  reconciledAmountPaise: number;
  reason?: string;
}

export class FinancialReconciliationEngine {
  private reconciledDecisionIds: Set<string> = new Set();
  private reconciledPaymentIds: Set<string> = new Set();

  constructor(private store?: ReconciliationStore) {}

  /**
   * Reconciles a recovery event against an audit decision and opportunity.
   */
  public reconcileRecovery(
    decision: DecisionAuditRecord,
    opportunity: RevenueOpportunity,
    actualPaidAmountPaise: number,
    paymentId?: string,
    resolutionEventId?: string
  ): ReconciliationResult {
    // 1. Zero double-counting check (Decision ID level)
    if (this.reconciledDecisionIds.has(decision.decisionId)) {
      return {
        valid: false,
        attributionType: 'DUPLICATE_RECOVERY_EVENT',
        reconciledAmountPaise: 0,
        reason: 'DUPLICATE_DECISION_RECONCILIATION: Decision has already been reconciled.',
      };
    }

    // 2. Zero double-counting check (Payment ID level)
    if (paymentId && this.reconciledPaymentIds.has(paymentId)) {
      return {
        valid: false,
        attributionType: 'DUPLICATE_RECOVERY_EVENT',
        reconciledAmountPaise: 0,
        reason: 'DUPLICATE_PAYMENT_RECONCILIATION: Payment has already been credited.',
      };
    }

    // 3. Must link to an active executed intervention
    const isExecutedIntervention =
      Boolean(decision.executedActionId) &&
      (decision.actionStatus === 'AUTO_EXECUTED' || decision.actionStatus === 'MANUALLY_APPROVED');

    if (!isExecutedIntervention) {
      return {
        valid: false,
        attributionType: 'ORGANIC_RECOVERY',
        reconciledAmountPaise: actualPaidAmountPaise,
        reason: 'ORGANIC_RECOVERY: Outcome occurred without an active executed MerchantPulse intervention.',
      };
    }

    // 4. Recovered amount validation: cannot exceed original failed/eligible opportunity amount
    if (actualPaidAmountPaise > opportunity.amountPaise) {
      return {
        valid: false,
        attributionType: 'AMOUNT_MISMATCH',
        reconciledAmountPaise: 0,
        reason: `AMOUNT_MISMATCH: Recovered amount (₹${actualPaidAmountPaise / 100}) exceeds original eligible GMV (₹${opportunity.amountPaise / 100}).`,
      };
    }

    // 5. Successful Intervention Attribution
    this.reconciledDecisionIds.add(decision.decisionId);
    if (paymentId) {
      this.reconciledPaymentIds.add(paymentId);
    }

    if (this.store) {
      this.store.recordOutcome({
        decisionId: decision.decisionId,
        opportunityId: opportunity.id,
        merchantId: opportunity.merchantId,
        attributionType: 'ATTRIBUTED_INTERVENTION',
        status: 'RECOVERED',
        reconciledAmountPaise: actualPaidAmountPaise,
        resolutionEventId,
        reconciledPaymentId: paymentId,
        reconciledAt: Math.floor(Date.now() / 1000),
      }).catch(err => {
        console.error('[ReconciliationStore] Record outcome error:', err);
      });
    }

    return {
      valid: true,
      attributionType: 'ATTRIBUTED_INTERVENTION',
      reconciledAmountPaise: actualPaidAmountPaise,
    };
  }

  public clear(): void {
    this.reconciledDecisionIds.clear();
    this.reconciledPaymentIds.clear();
  }
}
