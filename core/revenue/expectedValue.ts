import { ExpectedValueMetrics } from '../domain/opportunity';

export interface ProbabilityFactors {
  failureCode?: string;
  paymentMethod?: string;
  consecutiveFailures?: number;
  customerLtvPaise?: number;
  intentScore?: number;
}

// Calibrated empirical baseline recovery probabilities based on payment failure reasons
export const BASE_RECOVERY_PROBABILITIES: Record<string, number> = {
  GATEWAY_ERROR: 0.65,
  BANK_TIMEOUT: 0.68,
  NETWORK_ERROR: 0.65,
  UPI_APP_TIMEOUT: 0.62,
  AUTHENTICATION_ERROR: 0.70,
  OTP_NOT_ENTERED: 0.58,
  INSUFFICIENT_FUNDS: 0.28,
  LIMIT_EXCEEDED: 0.25,
  CARD_EXPIRED: 0.15,
  INVALID_DETAILS: 0.12,
  CHECKOUT_ABANDONMENT: 0.42,
  DEFAULT: 0.50,
};

// Fixed intervention and channel costs in paise
export const INTERVENTION_COSTS = {
  SMS_NOTIFICATION_PAISE: 25, // ₹0.25
  EMAIL_NOTIFICATION_PAISE: 5,  // ₹0.05
  RAZORPAY_LINK_OVERHEAD_PAISE: 100, // ₹1.00 platform allocation
  FATIGUE_PENALTY_PAISE: 500, // ₹5.00 customer attention cost
};

/**
 * Deterministically calculates the expected recovery probability (P_success)
 * between 0.05 and 0.95 based on objective payment and customer facts.
 */
export function calculateRecoveryProbability(factors: ProbabilityFactors): number {
  let baseP = factors.failureCode && BASE_RECOVERY_PROBABILITIES[factors.failureCode]
    ? BASE_RECOVERY_PROBABILITIES[factors.failureCode]
    : BASE_RECOVERY_PROBABILITIES.DEFAULT;

  // Repeat loyal customer boost (+0.08 if LTV > ₹10,000)
  if (factors.customerLtvPaise && factors.customerLtvPaise >= 1000000) {
    baseP += 0.08;
  }

  // Consecutive failure penalty (-0.10 for each failure beyond the 1st)
  if (factors.consecutiveFailures && factors.consecutiveFailures > 1) {
    baseP -= Math.min(0.25, (factors.consecutiveFailures - 1) * 0.10);
  }

  // Intent modifier
  if (factors.intentScore !== undefined) {
    baseP = baseP * (0.8 + (0.4 * factors.intentScore));
  }

  // Bound probability between 5% and 95%
  return Math.min(0.95, Math.max(0.05, Number(baseP.toFixed(4))));
}

/**
 * Computes the complete deterministic Expected Value metrics in integer paise.
 * EV = (P_success * Recoverable_GMV) - Intervention_Cost - Fatigue_Penalty
 */
export function calculateExpectedValue(
  amountPaise: number,
  factors: ProbabilityFactors,
  includeFatiguePenalty: boolean = true
): ExpectedValueMetrics {
  const pSuccess = calculateRecoveryProbability(factors);
  
  const estimatedCost = INTERVENTION_COSTS.SMS_NOTIFICATION_PAISE +
    INTERVENTION_COSTS.EMAIL_NOTIFICATION_PAISE +
    INTERVENTION_COSTS.RAZORPAY_LINK_OVERHEAD_PAISE;

  const fatiguePenalty = includeFatiguePenalty ? INTERVENTION_COSTS.FATIGUE_PENALTY_PAISE : 0;

  const grossExpectedRecoveryPaise = Math.round(amountPaise * pSuccess);
  const netExpectedValuePaise = grossExpectedRecoveryPaise - estimatedCost - fatiguePenalty;

  return {
    recoverableGmvPaise: amountPaise,
    pSuccess,
    estimatedInterventionCostPaise: estimatedCost,
    customerFatiguePenaltyPaise: fatiguePenalty,
    netExpectedValuePaise,
    isProfitable: netExpectedValuePaise > 0,
  };
}
