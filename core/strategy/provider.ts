import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation, StrategyInputContext } from '../domain/strategy';

export interface RevenueStrategyProvider {
  name: string;
  generateStrategy(
    opportunity: RevenueOpportunity,
    context?: Partial<StrategyInputContext>
  ): Promise<StrategyRecommendation>;
}
