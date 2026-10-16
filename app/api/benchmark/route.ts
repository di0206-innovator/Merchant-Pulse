import { NextRequest, NextResponse } from 'next/server';
import { BatchRunner } from '@/core/evaluation/batchRunner';

export const dynamic = 'force-dynamic';

const MIN_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 10000;

function sanitizeBatchSize(raw: unknown): number {
  const parsed = typeof raw === 'number' ? raw : parseInt(String(raw || '1000'), 10);
  if (!Number.isFinite(parsed)) return 1000;
  return Math.min(MAX_BATCH_SIZE, Math.max(MIN_BATCH_SIZE, Math.floor(parsed)));
}

function sanitizeSeed(raw: unknown): number {
  const parsed = typeof raw === 'number' ? raw : parseInt(String(raw || '20260825'), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20260825;
  return Math.floor(parsed);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seed = sanitizeSeed(searchParams.get('seed'));
    const size = sanitizeBatchSize(searchParams.get('size'));
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
    const body = await req.json();
    const size = sanitizeBatchSize(body?.totalEvents ?? body?.batchSize ?? 1000);
    const seed = sanitizeSeed(body?.seed ?? 20260825);
    const useGeminiAi = Boolean(body?.useGeminiAi);

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
