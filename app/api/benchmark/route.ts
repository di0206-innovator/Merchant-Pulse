import { NextRequest, NextResponse } from 'next/server';
import { BatchRunner } from '@/core/evaluation/batchRunner';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seed = parseInt(searchParams.get('seed') || '20260825', 10);
  const size = parseInt(searchParams.get('size') || '1000', 10);

  const runner = new BatchRunner();
  const results = await runner.runBenchmark({
    batchSize: size,
    seed,
    splitRatio: 0.8,
    merchantId: 'rzp_merchant_dashboard_benchmark',
  });

  return NextResponse.json({ results });
}
