import type { AnalysisResult, MerchantProfile, RazorpayPayment } from '@/core/types';
import { detectOpportunities, parsePayment } from '@/core/determinism/engine';
import { recommendDeterministically } from '@/core/strategy/recommend';
import { evaluatePolicy } from '@/core/execution/policy';
import { AuditTrail } from '@/core/audit/trail';

export function analyzeMerchant(payments: RazorpayPayment[], merchant: MerchantProfile): AnalysisResult {
  const customerIds = new Set(payments.flatMap((p) => (p.customer_id ? [p.customer_id] : [])));
  const parsed = payments.map((p) => parsePayment(p, customerIds));
  const opportunities = detectOpportunities(parsed);
  const trail = new AuditTrail();

  trail.append({ actor: 'system', action: 'ingest', metadata: { payments: payments.length } });
  trail.append({ actor: 'system', action: 'detect_opportunities', metadata: { count: opportunities.length } });

  const opportunity = opportunities[0];
  if (!opportunity) {
    const emptyRecommendation = {
      recommendation: {
        type: 'escalate' as const,
        expected_recovery_rate: 0,
        expected_value_paise: 0,
        execution_cost_paise: 0,
        rationale: 'No actionable revenue opportunity was found.',
      },
      alternatives: [],
      strategy_score: 0,
      assumptions: ['No opportunity detected.'],
    };
    return {
      merchant,
      payments_processed: payments.length,
      opportunities: [],
      recommendation: emptyRecommendation,
      policy: { allowed: false, action: 'reject', reasons: ['No actionable revenue opportunity was found.'] },
      audit: trail.all(),
    };
  }

  const recommendation = recommendDeterministically(opportunity, parsed, merchant);
  trail.append({ actor: 'strategy', action: 'rank_interventions', metadata: { recommendation: recommendation.recommendation.type, strategy_score: recommendation.strategy_score } });
  const policy = evaluatePolicy(recommendation, merchant);
  trail.append({ actor: 'policy', action: policy.action, metadata: { reasons: policy.reasons } });

  return {
    merchant,
    payments_processed: payments.length,
    opportunities,
    recommendation,
    policy,
    audit: trail.all(),
  };
}
