import { DecisionAuditRecord } from '../domain/audit';
import { RevenueOpportunity } from '../domain/opportunity';

export interface ReconciliationResult {
  valid: boolean;
  attributionType: 'ATTRIBUTED_INTERVENTION' | 'ORGANIC_RECOVERY' | 'REJECTED_UNATTRIBUTED';
  reconciledAmountPaise: number;
  reason?: string;
}

export class FinancialReconciliationEngine {
  private reconciledDecisionIds: Set<string> = new Set();
  private reconciledPaymentIds: Set<string> = new Set();

  /**
   * Reconciles a recovery event against an audit decision and opportunity.
   */
  public reconcileRecovery(
    decision: DecisionAuditRecord,
    opportunity: RevenueOpportunity,
    actualPaidAmountPaise: number,
    paymentId?: string
  ): ReconciliationResult {
    // 1. Zero double-counting check
    if (this.reconciledDecisionIds.has(decision.decisionId)) {
      return {
        valid: false,
        attributionType: 'REJECTED_UNATTRIBUTED',
        reconciledAmountPaise: 0,
        reason: 'DUPLICATE_DECISION_RECONCILIATION: Decision has already been reconciled.',
      };
    }

    if (paymentId && this.reconciledPaymentIds.has(paymentId)) {
      return {
        valid: false,
        attributionType: 'REJECTED_UNATTRIBUTED',
        reconciledAmountPaise: 0,
        reason: 'DUPLICATE_PAYMENT_RECONCILIATION: Payment has already been credited.',
      };
    }

    // 2. Must link to an executed intervention
    if (!decision.executedActionId && decision.actionStatus !== 'AUTO_EXECUTED' && decision.actionStatus !== 'MANUALLY_APPROVED') {
      return {
        valid: false,
        attributionType: 'ORGANIC_RECOVERY',
        reconciledAmountPaise: actualPaidAmountPaise,
        reason: 'ORGANIC_RECOVERY: Outcome occurred without an active executed MerchantPulse intervention.',
      };
    }

    // 3. Recovered amount validation: cannot exceed original failed/eligible opportunity amount
    if (actualPaidAmountPaise > opportunity.amountPaise) {
      return {
        valid: false,
        attributionType: 'REJECTED_UNATTRIBUTED',
        reconciledAmountPaise: 0,
        reason: `AMOUNT_MISMATCH: Recovered amount (₹${actualPaidAmountPaise / 100}) exceeds original eligible GMV (₹${opportunity.amountPaise / 100}).`,
      };
    }

    // 4. Successful attribution
    this.reconciledDecisionIds.add(decision.decisionId);
    if (paymentId) {
      this.reconciledPaymentIds.add(paymentId);
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
