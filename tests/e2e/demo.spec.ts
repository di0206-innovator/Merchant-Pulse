import { describe, it, expect } from 'vitest';
import { BatchRunner } from '@/core/evaluation/batchRunner';
import { RevenuePipelineOrchestrator } from '@/core/pipeline/orchestrator';

describe('MerchantPulse Golden-Path Reviewer E2E Test', () => {
  it('E2E-GOLDEN-PATH: Executes 1,000 event synthetic benchmark and verifies non-overlapping accounting invariants', async () => {
    const runner = new BatchRunner();
    const result = await runner.runBenchmark({
      batchSize: 1000,
      seed: 20260825,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_e2e_golden',
    });

    expect(result.heldOutCount).toBe(200);
    expect(result.merchantPulseMock.totalEvents).toBe(200);

    const m = result.merchantPulseMock;

    // 1. Accounting Partition Invariant
    const partitionSum = m.totalRejectedGmvPaise + m.pendingEscalationGmvPaise + m.totalAttemptedGmvPaise;
    expect(partitionSum).toBe(m.totalAddressableGmvPaise);

    // 2. Recovery Invariant
    expect(m.totalRecoveredGmvPaise).toBeLessThanOrEqual(m.totalAttemptedGmvPaise);

    // 3. Positive Net EV Economics
    expect(m.netRecoveredGmvPaise).toBeGreaterThan(0);

    // 4. Duplicate Execution Protection
    expect(m.duplicateExecutionCount).toBe(0);
  });
});
