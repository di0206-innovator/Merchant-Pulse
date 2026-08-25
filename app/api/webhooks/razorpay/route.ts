import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';
import { normalizeRazorpayWebhook } from '@/core/events/normalizer';
import { globalIdempotencyLedger } from '@/core/events/idempotency';
import { RazorpayWebhookEventSchema } from '@/core/domain/events';
import { getGlobalPipeline } from '@/core/pipeline';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const eventIdHeader = req.headers.get('x-razorpay-event-id');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // In production or when webhook secret is configured, enforce strict signature verification
    if (webhookSecret && webhookSecret !== 'YourWebhookSecretHere') {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing x-razorpay-signature header' },
          { status: 400 }
        );
      }

      const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    // Idempotency check
    const dedupKey = globalIdempotencyLedger.generateKey(eventIdHeader || undefined, rawBody);
    if (globalIdempotencyLedger.isDuplicate(dedupKey)) {
      return NextResponse.json({
        status: 'DUPLICATE_IGNORED',
        message: 'Event has already been processed idempotently.',
      }, { status: 200 });
    }

    // Parse and validate JSON structure
    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const parseResult = RazorpayWebhookEventSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Schema validation failed for webhook event',
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const domainEvent = normalizeRazorpayWebhook(parseResult.data);
    if (!domainEvent) {
      return NextResponse.json({
        status: 'UNHANDLED_EVENT_TYPE',
        event: parseResult.data.event,
      }, { status: 200 });
    }

    // Record in idempotency ledger
    globalIdempotencyLedger.record(dedupKey, { processedAt: Date.now(), domainEventId: domainEvent.id });

    // Route domain event to the Revenue Pipeline Orchestrator
    const pipeline = getGlobalPipeline();
    let opportunityResult = null;
    let outcomeAttributed = false;

    if (domainEvent.payment) {
      opportunityResult = await pipeline.handlePaymentEvent(domainEvent.payment, domainEvent.id);
    } else if (domainEvent.paymentLinkId) {
      const outcomeStatus = domainEvent.type === 'PAYMENT_LINK_PAID' ? 'paid' : 'expired';
      const amountPaise = (domainEvent as any).payment?.amountPaise;
      outcomeAttributed = pipeline.handlePaymentLinkOutcome(
        domainEvent.paymentLinkId,
        outcomeStatus,
        amountPaise,
        domainEvent.id
      );
    }

    return NextResponse.json({
      status: 'ACCEPTED',
      eventId: domainEvent.id,
      type: domainEvent.type,
      timestamp: domainEvent.timestamp,
      opportunityId: opportunityResult?.id || undefined,
      opportunityStatus: opportunityResult?.status || undefined,
      outcomeAttributed,
    }, { status: 200 });
  } catch (err) {
    console.error('[Webhook Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
