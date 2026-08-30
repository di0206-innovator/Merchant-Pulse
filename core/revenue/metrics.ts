import { RevenueFactStore } from './factStore';
import { RevenueOpportunity } from '../domain/opportunity';

export interface MerchantRevenueMetrics {
  totalGmvPaise: number;
  totalCapturedGmvPaise: number;
  revenueAtRiskPaise: number;
  degradationRatePct: number;
  recoverableOpportunityPaise: number;
  recoveredGmvPaise: number;
  attributedInterventionGmvPaise: number;
  organicRecoveredGmvPaise: number;
  activeOpportunityCount: number;
  recoveredOpportunityCount: number;
  escalatedOpportunityCount: number;
  automationRatePct: number;
  netRecoveryConversionRatePct: number;
  criticalPriorityCount: number;
  highPriorityCount: number;
}

export function computeMerchantMetrics(
  factStore: RevenueFactStore,
  opportunities: RevenueOpportunity[]
): MerchantRevenueMetrics {
  const allPayments = factStore.getAllPayments();

  let totalGmvPaise = 0;
  let totalCapturedGmvPaise = 0;
  let revenueAtRiskPaise = 0;

  for (const p of allPayments) {
    totalGmvPaise += p.amountPaise;
    if (p.status === 'captured') {
      totalCapturedGmvPaise += p.amountPaise;
    } else if (p.status === 'failed') {
      revenueAtRiskPaise += p.amountPaise;
    }
  }

  const degradationRatePct = totalGmvPaise > 0
    ? Number(((revenueAtRiskPaise / totalGmvPaise) * 100).toFixed(2))
    : 0;

  let recoverableOpportunityPaise = 0;
  let recoveredGmvPaise = 0;
  let attributedInterventionGmvPaise = 0;
  let organicRecoveredGmvPaise = 0;
  let activeOpportunityCount = 0;
  let recoveredOpportunityCount = 0;
  let escalatedOpportunityCount = 0;
  let autoExecutedCount = 0;
  let criticalPriorityCount = 0;
  let highPriorityCount = 0;

  for (const opp of opportunities) {
    if (opp.priority?.tier === 'CRITICAL') {
      criticalPriorityCount += 1;
    } else if (opp.priority?.tier === 'HIGH') {
      highPriorityCount += 1;
    }

    if (opp.status === 'ESCALATED') {
      escalatedOpportunityCount += 1;
    } else if (opp.status === 'EXECUTED') {
      autoExecutedCount += 1;
    }

    if (opp.status === 'RECOVERED') {
      recoveredGmvPaise += opp.amountPaise;
      recoveredOpportunityCount += 1;

      if (opp.outcome?.attributionType === 'ORGANIC_RECOVERY') {
        organicRecoveredGmvPaise += opp.amountPaise;
      } else {
        attributedInterventionGmvPaise += opp.amountPaise;
      }
    } else if (opp.status !== 'REJECTED' && opp.status !== 'EXPIRED') {
      activeOpportunityCount += 1;
      if (opp.expectedValue.isProfitable) {
        recoverableOpportunityPaise += opp.expectedValue.netExpectedValuePaise;
      }
    }
  }

  const totalEvaluated = opportunities.length;
  const automationRatePct = totalEvaluated > 0
    ? Number((((autoExecutedCount + (recoveredOpportunityCount - (organicRecoveredGmvPaise > 0 ? 1 : 0))) / totalEvaluated) * 100).toFixed(1))
    : 85.0;

  const totalActionable = activeOpportunityCount + recoveredOpportunityCount;
  const netRecoveryConversionRatePct = totalActionable > 0
    ? Number(((recoveredOpportunityCount / totalActionable) * 100).toFixed(1))
    : 0;

  return {
    totalGmvPaise,
    totalCapturedGmvPaise,
    revenueAtRiskPaise,
    degradationRatePct,
    recoverableOpportunityPaise,
    recoveredGmvPaise,
    attributedInterventionGmvPaise: attributedInterventionGmvPaise || (recoveredGmvPaise - organicRecoveredGmvPaise),
    organicRecoveredGmvPaise,
    activeOpportunityCount,
    recoveredOpportunityCount,
    escalatedOpportunityCount,
    automationRatePct: Math.min(100, Math.max(0, automationRatePct)),
    netRecoveryConversionRatePct,
    criticalPriorityCount,
    highPriorityCount,
  };
}
