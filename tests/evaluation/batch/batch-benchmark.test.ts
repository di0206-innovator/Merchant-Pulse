import { describe, it, expect } from 'vitest';
import { BatchRunner } from '../../../core/evaluation/batchRunner';

describe('Batch Recovery Evaluation Harness', () => {
  it('runs 1,000 synthetic event batch evaluation and measures positive net recovered GMV', async () => {
    const runner = new BatchRunner();
    const results = await runner.runBenchmark({
      batchSize: 1000,
      seed: 20260825,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_test_batch',
    });

    expect(results).toBeDefined();
    expect(results.heldOutCount).toBe(200);
    expect(results.merchantPulseAi.totalFailedGmvPaise).toBeGreaterThan(0);
    expect(results.merchantPulseAi.totalRecoveredGmvPaise).toBeGreaterThan(0);
    expect(results.merchantPulseAi.netRecoveredGmvPaise).toBeGreaterThan(0);
    expect(results.merchantPulseAi.recoveryRatePct).toBeGreaterThan(0);
    expect(results.merchantPulseAi.unsafeExecutionCount).toBe(0);
    expect(results.merchantPulseAi.duplicateExecutionCount).toBe(0);
  });
});
