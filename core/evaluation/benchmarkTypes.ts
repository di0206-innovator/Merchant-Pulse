import { PaymentEntity } from '../domain/payment';

export interface BatchConfig {
  batchSize: number;
  seed: number;
  splitRatio: number; // e.g. 0.8 for 80/20 train/held-out split
  merchantId: string;
  useGeminiAi?: boolean;
}

export interface SyntheticPaymentEvent {
  eventIndex: number;
  isHeldOut: boolean;
  payment: PaymentEntity;
  eventId: string;
  customerLtvPaise: number;
  retryCount: number;
  intentScore: number;
  isDegraded: boolean;
  contactable: boolean;
  simulatedOutcome: 'paid' | 'expired' | 'failed' | 'ignored' | 'partial' | 'late-paid';
}

export interface StrategyMetrics {
  strategyName: string;
  totalEvents: number;
  totalFailedGmvPaise: number;
  totalAddressableGmvPaise: number;
  
  // Non-overlapping primary accounting buckets
  totalRejectedGmvPaise: number;
  pendingEscalationGmvPaise: number;
  humanApprovedAttemptGmvPaise: number;
  totalEscalatedGmvPaise: number; // = pendingEscalationGmvPaise + humanApprovedAttemptGmvPaise
  autonomousAttemptGmvPaise: number;
  totalAttemptedGmvPaise: number; // = autonomousAttemptGmvPaise + humanApprovedAttemptGmvPaise

  totalRecoveredGmvPaise: number;
  netRecoveredGmvPaise: number;
  
  recoveryRatePct: number;
  attemptSuccessRatePct: number;
  autonomousRecoveryRatePct: number;
  
  totalInterventionCostPaise: number;
  totalFatigueCostPaise: number;
  medianTimeToRecoveryMinutes: number;
  
  duplicateExecutionCount: number;
  unsafeExecutionCount: number;
  unattributedRecoveryCount: number;
  
  attemptCount: number;
  rejectionCount: number;
  escalationCount: number;
  humanApprovedCount: number;
  contactCount: number;
}

export interface StrategyComparisonResult {
  seed: number;
  batchSize: number;
  heldOutCount: number;
  noActionBaseline: StrategyMetrics;
  rulesOnlyBaseline: StrategyMetrics;
  merchantPulseMock: StrategyMetrics;
  merchantPulseAi: StrategyMetrics;
  merchantPulseGemini?: StrategyMetrics;
  generatedAt: string;
}
