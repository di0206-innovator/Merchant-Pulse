import type { MerchantProfile, Opportunity, ParsedPayment, RazorpayPayment } from '@/core/types';
import { RazorpayPaymentSchema } from '@/core/types';

function classifyFailure(payment: RazorpayPayment): ParsedPayment['failure_category'] {
  if (payment.status !== 'failed') return null;
  const text = `${payment.error_code ?? ''} ${payment.error_description ?? ''}`.toLowerCase();
  if (text.includes('network') || text.includes('timeout') || text.includes('gateway')) return 'network';
  if (text.includes('declin') || text.includes('insufficient') || text.includes('do_not_honor')) return 'customer_declined';
  if (text.includes('auth') || text.includes('otp') || text.includes('verification')) return 'authentication';
  if (text.includes('config') || text.includes('integration') || text.includes('merchant')) return 'merchant_config';
  return 'unknown';
}

export function parsePayment(raw: unknown, knownCustomerIds: Set<string>): ParsedPayment {
  const payment = RazorpayPaymentSchema.parse(raw);
  const failure_category = classifyFailure(payment);
  return {
    payment_id: payment.id,
    order_id: payment.order_id,
    amount_paise: payment.amount,
    status: payment.status,
    failure_category,
    retryable: failure_category === 'network' || failure_category === 'unknown',
    attempt_count: payment.attempts,
    repeat_customer: payment.customer_id ? knownCustomerIds.has(payment.customer_id) : false,
    created_at: payment.created_at,
  };
}

export function detectOpportunities(payments: ParsedPayment[]): Opportunity[] {
  const failed = payments.filter((p) => p.status === 'failed');
  const retryable = failed.filter((p) => p.retryable);
  const repeatCustomerFailures = failed.filter((p) => p.repeat_customer);

  const opportunities: Opportunity[] = [];
  const atRisk = retryable.reduce((sum, p) => sum + p.amount_paise, 0);
  if (retryable.length > 0) {
    opportunities.push({
      type: 'recovery',
      title: 'Recover retryable payment failures',
      description: `${retryable.length} failed payments show retryable or recoverable signals.`,
      affected_transactions: retryable.length,
      revenue_at_risk_paise: atRisk,
      evidence_score: Math.min(0.95, 0.45 + retryable.length / Math.max(payments.length, 1)),
      recommended_action: 'create_payment_recovery_flow',
    });
  }

  if (repeatCustomerFailures.length > 0) {
    const repeatAtRisk = repeatCustomerFailures.reduce((sum, p) => sum + p.amount_paise, 0);
    opportunities.push({
      type: 'retention',
      title: 'Protect repeat-customer conversion',
      description: `${repeatCustomerFailures.length} failures involve repeat customers where recovery is economically valuable.`,
      affected_transactions: repeatCustomerFailures.length,
      revenue_at_risk_paise: repeatAtRisk,
      evidence_score: Math.min(0.9, 0.5 + repeatCustomerFailures.length / Math.max(payments.length, 1)),
      recommended_action: 'create_payment_recovery_flow',
    });
  }

  const captured = payments.filter((p) => p.status === 'captured').length;
  const conversionGap = payments.length > 0 ? 1 - captured / payments.length : 0;
  if (conversionGap > 0.15) {
    const missed = payments.filter((p) => p.status !== 'captured').reduce((sum, p) => sum + p.amount_paise, 0);
    opportunities.push({
      type: 'conversion',
      title: 'Reduce payment conversion leakage',
      description: `Current batch conversion is ${(captured / Math.max(payments.length, 1) * 100).toFixed(1)}%, leaving measurable leakage.`,
      affected_transactions: payments.length - captured,
      revenue_at_risk_paise: missed,
      evidence_score: Math.min(0.88, 0.4 + conversionGap),
      recommended_action: 'create_follow_up_order',
    });
  }

  return opportunities.sort((a, b) => b.revenue_at_risk_paise * b.evidence_score - a.revenue_at_risk_paise * a.evidence_score);
}

export function scoreRecoveryCandidate(payment: ParsedPayment, profile: MerchantProfile): number {
  const retryability = payment.retryable ? 1 : 0.15;
  const repeatSignal = payment.repeat_customer ? 0.2 : 0;
  const remainingBudget = Math.max(0, Math.min(1, profile.daily_action_budget_paise / Math.max(payment.amount_paise, 1)));
  const attemptHeadroom = Math.max(0, Math.min(1, (profile.max_payment_attempts - payment.attempt_count) / profile.max_payment_attempts));
  return Math.max(0, Math.min(1, 0.45 * retryability + 0.2 * repeatSignal + 0.2 * attemptHeadroom + 0.15 * remainingBudget));
}

export function expectedRecoveryRate(score: number): number {
  return Math.max(0.05, Math.min(0.85, 0.15 + score * 0.7));
}
