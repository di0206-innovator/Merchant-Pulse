import { describe, it, expect } from 'vitest';
import { BatchRunner } from '../../../core/evaluation/batchRunner';

describe('Held-Out Benchmark Reproducibility Tests', () => {
  it('guarantees 100% identical evaluation metrics across identical seed executions', async () => {
    const runner = new BatchRunner();

    const run1 = await runner.runBenchmark({
      batchSize: 500,
      seed: 20260825,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_reproducibility',
    });

    const run2 = await runner.runBenchmark({
      batchSize: 500,
      seed: 20260825,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_reproducibility',
    });

    expect(run1.heldOutCount).toBe(run2.heldOutCount);
    expect(run1.merchantPulseAi.totalFailedGmvPaise).toBe(run2.merchantPulseAi.totalFailedGmvPaise);
    expect(run1.merchantPulseAi.totalRecoveredGmvPaise).toBe(run2.merchantPulseAi.totalRecoveredGmvPaise);
    expect(run1.merchantPulseAi.netRecoveredGmvPaise).toBe(run2.merchantPulseAi.netRecoveredGmvPaise);
    expect(run1.merchantPulseAi.recoveryRatePct).toBe(run2.merchantPulseAi.recoveryRatePct);
  });
});
