import type { MerchantProfile, PolicyDecision, StrategyRecommendation } from '@/core/types';

export function evaluatePolicy(
  recommendation: StrategyRecommendation,
  profile: MerchantProfile,
): PolicyDecision {
  const reasons: string[] = [];
  const option = recommendation.recommendation;

  if (option.expected_value_paise <= 0) {
    reasons.push('Expected value is not positive.');
    return { allowed: false, action: 'reject', reasons };
  }

  if (option.expected_recovery_rate < profile.auto_execute_threshold) {
    reasons.push(`Estimated recovery ${(option.expected_recovery_rate * 100).toFixed(0)}% is below the merchant auto-execute threshold.`);
    return { allowed: false, action: 'escalate', reasons };
  }

  if (option.expected_value_paise > profile.daily_action_budget_paise) {
    reasons.push('Expected action value exceeds the configured daily automation budget.');
    return { allowed: false, action: 'escalate', reasons };
  }

  reasons.push('Expected value is positive.');
  reasons.push('Estimated recovery exceeds the merchant threshold.');
  reasons.push('Decision is within the daily automation budget.');
  return { allowed: true, action: 'execute', reasons };
}
