import {
  ExpectedValueMetrics,
  OpportunityEvidence,
  PriorityMetrics,
  PriorityTier,
} from '../domain/opportunity';

export interface PrioritizationInput {
  amountPaise: number;
  expectedValue: ExpectedValueMetrics;
  evidence: OpportunityEvidence;
  createdAtSeconds?: number;
}

/**
 * Deterministically computes a 0-100 Recovery Priority Score.
 * Zero LLM arithmetic: transparent weighted linear/bounded formula.
 *
 * Formula:
 * Priority = (0.35 * EconomicScore) + (0.30 * ProbabilityScore) +
 *            (0.20 * CustomerValueScore) + (0.15 * UrgencyScore) - FatiguePenalty
 */
export function calculatePriorityScore(input: PrioritizationInput): PriorityMetrics {
  const { expectedValue, evidence, amountPaise } = input;
  const netEvInr = Math.max(0, expectedValue.netExpectedValuePaise / 100);

  // 1. Economic Value Score (0 - 100)
  // Maps Net EV: ₹0 -> 0, ₹1,000 -> 50, ₹5,000 -> 75, ₹25,000 -> 90, ₹50,000+ -> 100
  let economicScore = 0;
  if (expectedValue.isProfitable && netEvInr > 0) {
    if (netEvInr >= 50000) {
      economicScore = 100;
    } else if (netEvInr >= 25000) {
      economicScore = 90 + ((netEvInr - 25000) / 25000) * 10;
    } else if (netEvInr >= 5000) {
      economicScore = 75 + ((netEvInr - 5000) / 20000) * 15;
    } else if (netEvInr >= 1000) {
      economicScore = 50 + ((netEvInr - 1000) / 4000) * 25;
    } else {
      economicScore = (netEvInr / 1000) * 50;
    }
  }

  // 2. Recovery Probability Score (0 - 100)
  const probabilityScore = Math.round(expectedValue.pSuccess * 100);

  // 3. Customer Value / Loyalty Score (0 - 100)
  const ltvInr = (evidence.customerLtvPaise || 0) / 100;
  let customerScore = 40; // baseline for new customer
  if (ltvInr >= 50000) {
    customerScore = 100;
  } else if (ltvInr >= 20000) {
    customerScore = 85;
  } else if (ltvInr >= 5000) {
    customerScore = 70;
  } else if (ltvInr > 0) {
    customerScore = 55;
  }

  // 4. Urgency Score (0 - 100)
  // Highest urgency when failure is fresh (< 30 min), decaying as age increases
  let ageMinutes = evidence.checkoutAgeMinutes ?? 10;
  if (input.createdAtSeconds) {
    const elapsedSeconds = Math.max(0, Math.floor(Date.now() / 1000) - input.createdAtSeconds);
    ageMinutes = Math.floor(elapsedSeconds / 60);
  }

  let urgencyScore = 90;
  if (ageMinutes <= 15) {
    urgencyScore = 100;
  } else if (ageMinutes <= 60) {
    urgencyScore = 85;
  } else if (ageMinutes <= 180) {
    urgencyScore = 70;
  } else if (ageMinutes <= 720) {
    urgencyScore = 50;
  } else {
    urgencyScore = 30;
  }

  // 5. Contact Fatigue Penalty (0 - 30 deduction)
  const recentContacts = evidence.recentContactCount || 0;
  const fatiguePenalty = Math.min(35, recentContacts * 15);

  // Weighted aggregation
  const rawScore =
    0.35 * economicScore +
    0.30 * probabilityScore +
    0.20 * customerScore +
    0.15 * urgencyScore -
    fatiguePenalty;

  // If Net EV is negative or zero, cap priority score at 20
  const finalScore = !expectedValue.isProfitable
    ? Math.min(20, Math.max(0, Math.round(rawScore * 0.2)))
    : Math.min(100, Math.max(5, Math.round(rawScore)));

  let tier: PriorityTier = 'LOW';
  if (finalScore >= 85) {
    tier = 'CRITICAL';
  } else if (finalScore >= 70) {
    tier = 'HIGH';
  } else if (finalScore >= 45) {
    tier = 'MEDIUM';
  } else {
    tier = 'LOW';
  }

  return {
    score: finalScore,
    tier,
    components: {
      economicWeight: Number(economicScore.toFixed(1)),
      probabilityWeight: Number(probabilityScore.toFixed(1)),
      customerValueWeight: Number(customerScore.toFixed(1)),
      urgencyWeight: Number(urgencyScore.toFixed(1)),
      fatiguePenalty: Number(fatiguePenalty.toFixed(1)),
    },
  };
}
