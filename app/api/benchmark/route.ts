import { NextRequest, NextResponse } from 'next/server';
import { BatchRunner } from '@/core/evaluation/batchRunner';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seed = parseInt(searchParams.get('seed') || '20260825', 10);
  const size = parseInt(searchParams.get('size') || '1000', 10);
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
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const size = body.totalEvents || body.batchSize || 1000;
    const seed = body.seed || 20260825;
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
