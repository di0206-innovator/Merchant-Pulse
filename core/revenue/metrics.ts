import { RevenueFactStore } from './factStore';
import { RevenueOpportunity } from '../domain/opportunity';

export interface MerchantRevenueMetrics {
  totalGmvPaise: number;
  totalCapturedGmvPaise: number;
  revenueAtRiskPaise: number;
  degradationRatePct: number;
  recoverableOpportunityPaise: number;
  recoveredGmvPaise: number;
  activeOpportunityCount: number;
  recoveredOpportunityCount: number;
  netRecoveryConversionRatePct: number;
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
  let activeOpportunityCount = 0;
  let recoveredOpportunityCount = 0;

  for (const opp of opportunities) {
    if (opp.status === 'RECOVERED') {
      recoveredGmvPaise += opp.amountPaise;
      recoveredOpportunityCount += 1;
    } else if (opp.status !== 'REJECTED' && opp.status !== 'EXPIRED') {
      activeOpportunityCount += 1;
      if (opp.expectedValue.isProfitable) {
        recoverableOpportunityPaise += opp.expectedValue.netExpectedValuePaise;
      }
    }
  }

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
    activeOpportunityCount,
    recoveredOpportunityCount,
    netRecoveryConversionRatePct,
  };
}
