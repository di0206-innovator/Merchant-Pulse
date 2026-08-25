import { StrategyMetrics } from './benchmarkTypes';

export function createEmptyMetrics(strategyName: string): StrategyMetrics {
  return {
    strategyName,
    totalEvents: 0,
    totalFailedGmvPaise: 0,
    totalAddressableGmvPaise: 0,
    totalRejectedGmvPaise: 0,
    totalEscalatedGmvPaise: 0,
    totalAttemptedGmvPaise: 0,
    totalRecoveredGmvPaise: 0,
    netRecoveredGmvPaise: 0,
    recoveryRatePct: 0,
    attemptSuccessRatePct: 0,
    autonomousRecoveryRatePct: 0,
    humanApprovedRecoveryGmvPaise: 0,
    totalInterventionCostPaise: 0,
    totalFatigueCostPaise: 0,
    medianTimeToRecoveryMinutes: 0,
    duplicateExecutionCount: 0,
    unsafeExecutionCount: 0,
    unattributedRecoveryCount: 0,
    attemptCount: 0,
    rejectionCount: 0,
    escalationCount: 0,
    contactCount: 0,
  };
}

export function finalizeMetrics(metrics: StrategyMetrics): StrategyMetrics {
  metrics.recoveryRatePct = metrics.totalFailedGmvPaise > 0
    ? Number(((metrics.totalRecoveredGmvPaise / metrics.totalFailedGmvPaise) * 100).toFixed(2))
    : 0;

  metrics.attemptSuccessRatePct = metrics.attemptCount > 0
    ? Number(((metrics.totalRecoveredGmvPaise / (metrics.totalAttemptedGmvPaise || 1)) * 100).toFixed(2))
    : 0;

  metrics.autonomousRecoveryRatePct = metrics.totalEvents > 0
    ? Number(((metrics.totalRecoveredGmvPaise / (metrics.totalFailedGmvPaise || 1)) * 100).toFixed(2))
    : 0;

  metrics.netRecoveredGmvPaise = Math.max(
    0,
    metrics.totalRecoveredGmvPaise - metrics.totalInterventionCostPaise - metrics.totalFatigueCostPaise
  );

  return metrics;
}
