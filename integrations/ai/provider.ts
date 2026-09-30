import { z } from 'zod';
import type { InterventionOption, StrategyRecommendation } from '@/core/types';

export const StrategyInputSchema = z.object({
  opportunity_title: z.string(),
  opportunity_type: z.string(),
  evidence: z.array(z.string()),
  candidates: z.array(z.custom<InterventionOption>()),
});
export type StrategyInput = z.infer<typeof StrategyInputSchema>;

export interface RevenueStrategyProvider {
  rankInterventions(input: StrategyInput): Promise<StrategyRecommendation>;
}

export class MockRevenueStrategyProvider implements RevenueStrategyProvider {
  async rankInterventions(input: StrategyInput): Promise<StrategyRecommendation> {
    const sorted = [...input.candidates].sort((a, b) => b.expected_value_paise - a.expected_value_paise);
    const [recommendation, ...alternatives] = sorted;
    if (!recommendation) throw new Error('No intervention candidates available');
    return {
      recommendation,
      alternatives,
      strategy_score: Math.min(1, Math.max(0.1, recommendation.expected_recovery_rate)),
      assumptions: input.evidence,
    };
  }
}
