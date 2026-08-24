import { NextRequest, NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';
import { ConcurrentEventEngine } from '@/core/concurrency/workerPool';
import { PaymentEntity, PaymentMethod } from '@/core/domain/payment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let count = 500;
    try {
      const body = await req.json();
      if (body.count && typeof body.count === 'number') {
        count = Math.min(1000, Math.max(50, body.count));
      }
    } catch {}

    const pipeline = getGlobalPipeline();
    const concurrentEngine = new ConcurrentEventEngine(pipeline);

    const methods: PaymentMethod[] = ['upi', 'card', 'netbanking', 'subscription', 'emi', 'wallet'];
    const banks = ['HDFC', 'ICICI', 'SBIN', 'AXIS', 'KKBK'];
    const failureCodes = ['BANK_TIMEOUT', 'GATEWAY_ERROR', 'AUTHENTICATION_ERROR', 'INSUFFICIENT_FUNDS', 'UPI_APP_TIMEOUT'];

    const syntheticEvents: Array<{ payment: PaymentEntity; eventId: string }> = [];
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < count; i++) {
      const method = methods[i % methods.length];
      const bank = method === 'netbanking' ? banks[i % banks.length] : undefined;
      const isFailure = i % 3 !== 0; // 66% failure rate to stress test detector & EV math
      const amountPaise = (Math.floor(Math.random() * 450) + 20) * 10000; // ₹2,000 to ₹47,000

      const payment: PaymentEntity = {
        id: `pay_stress_${now}_${i.toString().padStart(4, '0')}`,
        orderId: `order_stress_${now}_${i.toString().padStart(4, '0')}`,
        amountPaise,
        currency: 'INR',
        status: isFailure ? 'failed' : 'captured',
        method,
        bank,
        contact: `+91980000${(i % 100).toString().padStart(4, '0')}`,
        email: `stress_user_${i}@merchant.test`,
        error: isFailure ? {
          code: failureCodes[i % failureCodes.length],
          description: `Simulated high concurrency failure on ${method.toUpperCase()}`,
        } : undefined,
        createdAt: now,
      };

      syntheticEvents.push({
        payment,
        eventId: `evt_stress_${now}_${i}`,
      });
    }

    const metrics = await concurrentEngine.executeConcurrentBatch(syntheticEvents, 500);

    return NextResponse.json({
      success: true,
      concurrencyMetrics: metrics,
      pipelineSnapshot: {
        totalOpportunities: pipeline.getOpportunities().length,
        metrics: pipeline.getMetrics(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Stress test execution failed' }, { status: 500 });
  }
}
