import { NextRequest, NextResponse } from 'next/server';
import { BatchRunner } from '@/core/evaluation/batchRunner';

export const dynamic = 'force-dynamic';

const MIN_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 5000;
const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_SEED = 20260825;

function parseBoundedSize(raw: unknown): number {
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return DEFAULT_BATCH_SIZE;
  }
  return Math.min(MAX_BATCH_SIZE, Math.max(MIN_BATCH_SIZE, Math.floor(num)));
}

function parseBoundedSeed(raw: unknown): number {
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return DEFAULT_SEED;
  }
  return Math.floor(num);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seed = parseBoundedSeed(searchParams.get('seed'));
    const size = parseBoundedSize(searchParams.get('size'));
    const useGeminiAi = searchParams.get('ai') === 'true';

    const runner = new BatchRunner();
    const results = await runner.runBenchmark({
      batchSize: size,
      seed,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_dashboard_benchmark',
      useGeminiAi,
    });

    return NextResponse.json({ results, metrics: results.merchantPulseMock });
  } catch (err) {
    console.error('Benchmark GET Error:', err);
    return NextResponse.json({ error: 'Failed to execute benchmark' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      // Use defaults if empty body
    }

    const size = parseBoundedSize(body.totalEvents ?? body.batchSize);
    const seed = parseBoundedSeed(body.seed);
    const useGeminiAi = Boolean(body.useGeminiAi);

    const runner = new BatchRunner();
    const results = await runner.runBenchmark({
      batchSize: size,
      seed,
      splitRatio: 0.8,
      merchantId: 'rzp_merchant_dashboard_benchmark',
      useGeminiAi,
    });

    const metrics = {
      totalEventsProcessed: results.heldOutCount,
      totalRevenueAtRiskPaise: results.merchantPulseMock.totalAddressableGmvPaise,
      netRecoveredPaise: results.merchantPulseMock.netRecoveredGmvPaise,
      attributedRecoveryRatePct: results.merchantPulseMock.recoveryRatePct,
      heldOutEventsCount: results.heldOutCount,
      heldOutSplitPct: 20,
      escalatedCount: results.merchantPulseMock.escalationCount,
    };

    return NextResponse.json({ results, metrics });
  } catch (err) {
    console.error('Benchmark POST Error:', err);
    return NextResponse.json({ error: 'Failed to execute benchmark' }, { status: 500 });
  }
}
