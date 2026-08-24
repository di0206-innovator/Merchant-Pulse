import { PaymentEntity } from '../domain/payment';
import { RevenuePipelineOrchestrator } from '../pipeline/orchestrator';

export interface ConcurrencyMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  concurrencyLevel: number;
  totalDurationMs: number;
  throughputRps: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  maxLatencyMs: number;
  zeroDropGuarantee: boolean;
}

export class ConcurrentEventEngine {
  constructor(private pipeline: RevenuePipelineOrchestrator) {}

  /**
   * Executes a high-concurrency batch simulation with N concurrent workers/users.
   */
  public async executeConcurrentBatch(
    events: Array<{ payment: PaymentEntity; eventId: string }>,
    concurrencyLimit: number = 500
  ): Promise<ConcurrencyMetrics> {
    const startTime = performance.now();
    const latencies: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Worker pool execution
    const chunks: Array<Array<{ payment: PaymentEntity; eventId: string }>> = [];
    for (let i = 0; i < events.length; i += concurrencyLimit) {
      chunks.push(events.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async item => {
        const itemStart = performance.now();
        try {
          await this.pipeline.handlePaymentEvent(item.payment, item.eventId);
          const duration = performance.now() - itemStart;
          latencies.push(duration);
          successfulRequests++;
        } catch (err) {
          console.error('[ConcurrentEventEngine] Request error:', err);
          failedRequests++;
        }
      });

      await Promise.all(promises);
    }

    const totalDurationMs = performance.now() - startTime;
    latencies.sort((a, b) => a - b);

    const getPercentile = (p: number) => {
      if (latencies.length === 0) return 0;
      const index = Math.min(latencies.length - 1, Math.floor((p / 100) * latencies.length));
      return Number(latencies[index].toFixed(2));
    };

    const throughputRps = totalDurationMs > 0
      ? Number(((events.length / (totalDurationMs / 1000))).toFixed(1))
      : 0;

    return {
      totalRequests: events.length,
      successfulRequests,
      failedRequests,
      concurrencyLevel: concurrencyLimit,
      totalDurationMs: Number(totalDurationMs.toFixed(2)),
      throughputRps,
      latencyP50Ms: getPercentile(50),
      latencyP95Ms: getPercentile(95),
      latencyP99Ms: getPercentile(99),
      maxLatencyMs: latencies.length > 0 ? Number(latencies[latencies.length - 1].toFixed(2)) : 0,
      zeroDropGuarantee: failedRequests === 0 && successfulRequests === events.length,
    };
  }
}
