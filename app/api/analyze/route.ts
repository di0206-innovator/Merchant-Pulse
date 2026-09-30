import { NextRequest, NextResponse } from 'next/server';
import { analyzeMerchant } from '@/core/pipeline/analyze';
import { demoMerchant, demoPayments } from '@/lib/demo-data';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { RazorpayPaymentSchema, MerchantProfileSchema } from '@/core/types';

// Request schema: allows running either default demo dataset or custom payment simulation
const AnalyzeRequestSchema = z.object({
  payments: z.array(RazorpayPaymentSchema).optional(),
  merchant: MerchantProfileSchema.optional(),
}).optional();

export async function POST(req: NextRequest) {
  // Apply rate limiting: 40 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous_client';
  const limitResult = rateLimit(`analyze:${ip}`, { limit: 40, windowMs: 60_000 });

  if (!limitResult.success) {
    return NextResponse.json(
      { ok: false, error: 'Too many analysis requests. Please try again in a moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limitResult.reset),
          'X-RateLimit-Limit': String(limitResult.limit),
          'X-RateLimit-Remaining': String(limitResult.remaining),
        },
      }
    );
  }

  try {
    let payload = null;
    const bodyText = await req.text();
    if (bodyText && bodyText.trim().length > 0) {
      payload = JSON.parse(bodyText);
    }

    const validated = AnalyzeRequestSchema.safeParse(payload);
    const paymentsToAnalyze = validated.success && validated.data?.payments ? validated.data.payments : demoPayments;
    const merchantToAnalyze = validated.success && validated.data?.merchant ? validated.data.merchant : demoMerchant;

    const result = analyzeMerchant(paymentsToAnalyze, merchantToAnalyze);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-RateLimit-Remaining': String(limitResult.remaining),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal analysis pipeline error',
      },
      { status: 500 }
    );
  }
}
