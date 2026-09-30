import type { InterventionOption, MerchantProfile, Opportunity, ParsedPayment, StrategyRecommendation } from '@/core/types';
import { expectedRecoveryRate, scoreRecoveryCandidate } from '@/core/determinism/engine';

export function recommendDeterministically(opportunity: Opportunity, payments: ParsedPayment[], profile: MerchantProfile): StrategyRecommendation {
  const candidates = payments
    .filter((p) => p.status === 'failed' && p.retryable)
    .map((p) => ({ payment: p, score: scoreRecoveryCandidate(p, profile) }))
    .sort((a, b) => b.score - a.score);

  const lead = candidates[0];
  const recoveryRate = lead ? expectedRecoveryRate(lead.score) : 0;
  const expectedValue = Math.round(opportunity.revenue_at_risk_paise * recoveryRate);

  const primary: InterventionOption = {
    type: opportunity.recommended_action,
    expected_recovery_rate: recoveryRate,
    expected_value_paise: expectedValue,
    execution_cost_paise: 0,
    rationale: lead
      ? `Prioritize the highest-scoring recoverable segment. Evidence score ${(opportunity.evidence_score * 100).toFixed(0)}% and estimated recovery ${(recoveryRate * 100).toFixed(0)}%.`
      : 'No qualifying payment cohort met the recovery criteria.',
  };

  const alternatives: InterventionOption[] = [
    {
      type: 'create_follow_up_order',
      expected_recovery_rate: Math.max(0.05, recoveryRate - 0.08),
      expected_value_paise: Math.round(opportunity.revenue_at_risk_paise * Math.max(0.05, recoveryRate - 0.08)),
      execution_cost_paise: 0,
      rationale: 'Use a fresh order/payment flow when the original attempt cannot be retried directly.',
    },
    {
      type: 'escalate',
      expected_recovery_rate: 0.35,
      expected_value_paise: Math.round(opportunity.revenue_at_risk_paise * 0.35),
      execution_cost_paise: 0,
      rationale: 'Escalate when the action is outside merchant automation policy or evidence is weak.',
    },
  ];

  const strategy_score = Math.min(0.99, 0.55 * opportunity.evidence_score + 0.45 * (primary.expected_recovery_rate));
  return {
    recommendation: primary,
    alternatives,
    strategy_score,
    assumptions: [
      'Recovery rates are estimates derived from demo evidence, not guarantees.',
      'All live money movement must occur through a valid Razorpay payment flow.',
      'Policy gates remain authoritative over the strategy recommendation.',
    ],
  };
}
