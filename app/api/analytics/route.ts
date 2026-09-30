import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon_telemetry';
  const limitResult = rateLimit(`telemetry:${ip}`, { limit: 100, windowMs: 60_000 });

  if (!limitResult.success) {
    return new NextResponse(null, { status: 429 });
  }

  try {
    const raw = await req.text();
    if (raw && raw.length < 5000) {
      const parsed = JSON.parse(raw);
      // In production, send to privacy-preserving sink / BigQuery
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[Server Ingest Telemetry]:', parsed?.name);
      }
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
