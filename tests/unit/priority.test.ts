import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, PrioritizationInput } from '@/core/revenue/prioritizer';

describe('Deterministic Priority Scoring Engine', () => {
  it('assigns CRITICAL or HIGH priority to fresh, high-value, high-intent transactions', () => {
    const input: PrioritizationInput = {
      expectedValue: {
        pSuccess: 0.85,
        recoverableGmvPaise: 850000,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: 722370,
        isProfitable: true,
      },
      evidence: {
        consecutiveFailures: 1,
        intentScore: 0.85,
        historicalRecoveryRatePct: 75,
        paymentMethod: 'upi',
        customerLtvPaise: 5000000, // ₹50,000 past LTV
        recentContactCount: 0,
      },
      amountPaise: 850000,
      createdAtSeconds: Math.floor(Date.now() / 1000) - 120, // 2 mins ago (fresh)
    };

    const result = calculatePriorityScore(input);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['HIGH', 'CRITICAL']).toContain(result.tier);
    expect(result.components?.urgencyWeight).toBeGreaterThan(80);
    expect(result.components?.customerValueWeight).toBeGreaterThan(80);
  });

  it('assigns LOW tier and score < 35 to negative or negligible EV opportunities', () => {
    const input: PrioritizationInput = {
      expectedValue: {
        pSuccess: 0.12,
        recoverableGmvPaise: 19900,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: 500, // ₹5 net EV
        isProfitable: false,
      },
      evidence: {
        consecutiveFailures: 3,
        intentScore: 0.2,
        historicalRecoveryRatePct: 15,
        paymentMethod: 'card',
        customerLtvPaise: 0,
        recentContactCount: 1,
      },
      amountPaise: 19900,
      createdAtSeconds: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    };

    const result = calculatePriorityScore(input);

    expect(result.score).toBeLessThan(35);
    expect(result.tier).toBe('LOW');
    expect(result.components?.fatiguePenalty).toBeGreaterThan(0);
  });

  it('penalizes fatigued customers when multiple recent contacts occurred', () => {
    const freshInput: PrioritizationInput = {
      expectedValue: {
        pSuccess: 0.75,
        recoverableGmvPaise: 200000,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: 150000,
        isProfitable: true,
      },
      evidence: {
        consecutiveFailures: 1,
        intentScore: 0.75,
        historicalRecoveryRatePct: 65,
        paymentMethod: 'upi',
        customerLtvPaise: 1000000,
        recentContactCount: 0,
      },
      amountPaise: 200000,
      createdAtSeconds: Math.floor(Date.now() / 1000) - 300,
    };

    const fatiguedInput: PrioritizationInput = {
      ...freshInput,
      evidence: {
        ...freshInput.evidence,
        recentContactCount: 3,
      },
    };

    const freshScore = calculatePriorityScore(freshInput);
    const fatiguedScore = calculatePriorityScore(fatiguedInput);

    expect(fatiguedScore.score).toBeLessThan(freshScore.score);
    expect(fatiguedScore.components?.fatiguePenalty).toBeGreaterThan(0);
  });

  it('decays urgency as time passes', () => {
    const justNowInput: PrioritizationInput = {
      expectedValue: {
        pSuccess: 0.8,
        recoverableGmvPaise: 500000,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: 400000,
        isProfitable: true,
      },
      evidence: {
        consecutiveFailures: 1,
        intentScore: 0.8,
        historicalRecoveryRatePct: 70,
        paymentMethod: 'upi',
        customerLtvPaise: 2000000,
        recentContactCount: 0,
      },
      amountPaise: 500000,
      createdAtSeconds: Math.floor(Date.now() / 1000) - 60, // 1 min ago
    };

    const sixHoursAgoInput: PrioritizationInput = {
      ...justNowInput,
      createdAtSeconds: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    };

    const scoreJustNow = calculatePriorityScore(justNowInput);
    const scoreSixHours = calculatePriorityScore(sixHoursAgoInput);

    expect(scoreSixHours.score).toBeLessThan(scoreJustNow.score);
    expect(scoreSixHours.components?.urgencyWeight).toBeLessThan(scoreJustNow.components?.urgencyWeight || 100);
  });

  it('guarantees bounds between 0 and 100 integer for extreme inputs', () => {
    const extremeHigh: PrioritizationInput = {
      expectedValue: {
        pSuccess: 0.99,
        recoverableGmvPaise: 100000000, // ₹10,00,000
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: 99000000,
        isProfitable: true,
      },
      evidence: {
        consecutiveFailures: 1,
        intentScore: 0.99,
        historicalRecoveryRatePct: 95,
        paymentMethod: 'upi',
        customerLtvPaise: 50000000,
        recentContactCount: 0,
      },
      amountPaise: 100000000,
      createdAtSeconds: Math.floor(Date.now() / 1000),
    };

    const extremeLow: PrioritizationInput = {
      expectedValue: {
        pSuccess: 0.01,
        recoverableGmvPaise: 10000,
        estimatedInterventionCostPaise: 130,
        customerFatiguePenaltyPaise: 2000,
        netExpectedValuePaise: -50000, // Negative EV
        isProfitable: false,
      },
      evidence: {
        consecutiveFailures: 5,
        intentScore: 0.05,
        historicalRecoveryRatePct: 5,
        paymentMethod: 'card',
        customerLtvPaise: 0,
        recentContactCount: 10,
      },
      amountPaise: 10000,
      createdAtSeconds: Math.floor(Date.now() / 1000) - 86400 * 5,
    };

    const highRes = calculatePriorityScore(extremeHigh);
    const lowRes = calculatePriorityScore(extremeLow);

    expect(highRes.score).toBe(100);
    expect(highRes.tier).toBe('CRITICAL');

    expect(lowRes.score).toBeLessThanOrEqual(20);
    expect(lowRes.tier).toBe('LOW');
  });
});
