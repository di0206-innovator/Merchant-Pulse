import { StrategyMetrics } from './benchmarkTypes';

export function createEmptyMetrics(strategyName: string): StrategyMetrics {
  return {
    strategyName,
    totalEvents: 0,
    totalFailedGmvPaise: 0,
    totalAddressableGmvPaise: 0,
    
    totalRejectedGmvPaise: 0,
    pendingEscalationGmvPaise: 0,
    humanApprovedAttemptGmvPaise: 0,
    totalEscalatedGmvPaise: 0,
    autonomousAttemptGmvPaise: 0,
    totalAttemptedGmvPaise: 0,
    
    totalRecoveredGmvPaise: 0,
    netRecoveredGmvPaise: 0,
    
    recoveryRatePct: 0,
    attemptSuccessRatePct: 0,
    autonomousRecoveryRatePct: 0,
    
    totalInterventionCostPaise: 0,
    totalFatigueCostPaise: 0,
    medianTimeToRecoveryMinutes: 0,
    
    duplicateExecutionCount: 0,
    unsafeExecutionCount: 0,
    unattributedRecoveryCount: 0,
    
    attemptCount: 0,
    rejectionCount: 0,
    escalationCount: 0,
    humanApprovedCount: 0,
    contactCount: 0,
  };
}

export function finalizeMetrics(metrics: StrategyMetrics): StrategyMetrics {
  // Ensure helper fields match non-overlapping partitions
  metrics.totalAttemptedGmvPaise = metrics.autonomousAttemptGmvPaise + metrics.humanApprovedAttemptGmvPaise;
  metrics.totalEscalatedGmvPaise = metrics.pendingEscalationGmvPaise + metrics.humanApprovedAttemptGmvPaise;

  // Invariant verification check
  const totalAccountedGmv = metrics.totalRejectedGmvPaise + metrics.pendingEscalationGmvPaise + metrics.totalAttemptedGmvPaise;
  if (metrics.totalAddressableGmvPaise > 0 && Math.abs(totalAccountedGmv - metrics.totalAddressableGmvPaise) > 100) {
    console.warn(`[Accounting Warning] Non-partitioned GMV discrepancy detected for ${metrics.strategyName}: Accounted=${totalAccountedGmv}, Addressable=${metrics.totalAddressableGmvPaise}`);
  }

  metrics.recoveryRatePct = metrics.totalAddressableGmvPaise > 0
    ? Number(((metrics.totalRecoveredGmvPaise / metrics.totalAddressableGmvPaise) * 100).toFixed(2))
    : 0;

  metrics.attemptSuccessRatePct = metrics.totalAttemptedGmvPaise > 0
    ? Number(((metrics.totalRecoveredGmvPaise / metrics.totalAttemptedGmvPaise) * 100).toFixed(2))
    : 0;

  metrics.autonomousRecoveryRatePct = metrics.totalAddressableGmvPaise > 0
    ? Number(((metrics.totalRecoveredGmvPaise / metrics.totalAddressableGmvPaise) * 100).toFixed(2))
    : 0;

  metrics.netRecoveredGmvPaise = Math.max(
    0,
    metrics.totalRecoveredGmvPaise - metrics.totalInterventionCostPaise - metrics.totalFatigueCostPaise
  );

  return metrics;
}
