import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/integrations/razorpay/signature';
import { normalizeRazorpayWebhook } from '@/core/events/normalizer';
import { globalIdempotencyLedger } from '@/core/events/idempotency';
import { RazorpayWebhookEventSchema } from '@/core/domain/events';
import { getGlobalPipeline } from '@/core/pipeline';
import { getGlobalRepositories } from '@/core/storage';

const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024; // 1 MB limit
const MAX_STALE_AGE_SECONDS = 86400; // 24 hours
const MAX_FUTURE_SKEW_SECONDS = 300; // 5 minutes clock skew tolerance

export async function POST(req: NextRequest) {
  let dedupKey: string | null = null;
  let lockCommitted = false;

  try {
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Webhook payload exceeds maximum allowed size (1MB)' },
        { status: 413 }
      );
    }

    const signature = req.headers.get('x-razorpay-signature');
    const eventIdHeader = req.headers.get('x-razorpay-event-id');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const storage = getGlobalRepositories();

    // 1. Signature Verification with Fail-Closed Production Guard
    let signatureVerified = false;
    const hasConfiguredSecret = Boolean(webhookSecret && webhookSecret !== 'YourWebhookSecretHere');

    if (hasConfiguredSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing x-razorpay-signature header' },
          { status: 400 }
        );
      }

      signatureVerified = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret!);
      if (!signatureVerified) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[Webhook Gateway]: RAZORPAY_WEBHOOK_SECRET is missing in production environment.');
      return NextResponse.json(
        { error: 'Webhook verification secret is not configured' },
        { status: 500 }
      );
    } else {
      // Offline Demo / Hermetic Testing Mode
      console.warn('[Webhook Gateway]: RAZORPAY_WEBHOOK_SECRET is not configured. Ingesting event in HERMETIC_DEMO_MODE.');
    }

    // 2. Parse and validate JSON structure before locking idempotency key
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

    // 3. Timestamp Freshness & Clock-Skew Window (Replay & Stale Event Attack Prevention)
    const eventCreatedAt = parseResult.data.created_at;
    if (typeof eventCreatedAt === 'number') {
      const currentSeconds = Math.floor(Date.now() / 1000);
      if (currentSeconds - eventCreatedAt > MAX_STALE_AGE_SECONDS) {
        return NextResponse.json({
          status: 'STALE_EVENT_REJECTED',
          message: `Webhook event created_at (${eventCreatedAt}) exceeds 24-hour freshness window.`,
        }, { status: 410 });
      }
      if (eventCreatedAt - currentSeconds > MAX_FUTURE_SKEW_SECONDS) {
        return NextResponse.json({
          status: 'FUTURE_TIMESTAMP_REJECTED',
          message: `Webhook event created_at (${eventCreatedAt}) exceeds allowed clock skew tolerance.`,
        }, { status: 400 });
      }
    }

    // 4. Atomic Idempotency check & lock acquisition across store & ledger
    dedupKey = globalIdempotencyLedger.generateKey(eventIdHeader || undefined, rawBody);
    const lockAcquired = globalIdempotencyLedger.acquireLock(dedupKey);
    const isDupInStorage = !lockAcquired || (await storage.webhookEvents.isDuplicate(dedupKey));

    if (!lockAcquired || isDupInStorage) {
      if (lockAcquired) {
        // Was already in persistent storage; mark committed in memory ledger
        globalIdempotencyLedger.record(dedupKey, { duplicateFromStorage: true });
        lockCommitted = true;
      }
      return NextResponse.json({
        status: 'DUPLICATE_IGNORED',
        message: 'Event has already been processed idempotently.',
      }, { status: 200 });
    }

    const domainEvent = normalizeRazorpayWebhook(parseResult.data);
    if (!domainEvent) {
      globalIdempotencyLedger.record(dedupKey, { processedAt: Date.now(), unhandled: true });
      lockCommitted = true;

      await storage.webhookEvents.recordEvent({
        id: `we_${Date.now()}`,
        eventId: dedupKey,
        eventType: parseResult.data.event,
        merchantId: parseResult.data.account_id,
        rawPayload: jsonBody as Record<string, unknown>,
        signature: signature || undefined,
        signatureVerified,
        processedStatus: 'UNHANDLED_EVENT_TYPE',
        receivedAt: Date.now(),
      });

      return NextResponse.json({
        status: 'UNHANDLED_EVENT_TYPE',
        event: parseResult.data.event,
      }, { status: 200 });
    }

    // 5. Record in idempotency ledger & storage
    globalIdempotencyLedger.record(dedupKey, { processedAt: Date.now(), domainEventId: domainEvent.id });
    lockCommitted = true;

    await storage.webhookEvents.recordEvent({
      id: domainEvent.id,
      eventId: dedupKey,
      eventType: domainEvent.type,
      merchantId: domainEvent.merchantId,
      rawPayload: jsonBody as Record<string, unknown>,
      signature: signature || undefined,
      signatureVerified,
      processedStatus: 'ACCEPTED',
      receivedAt: Date.now(),
    });

    // 6. Route domain event to the Revenue Pipeline Orchestrator
    const pipeline = getGlobalPipeline();
    let opportunityResult = null;
    let outcomeAttributed = false;

    if (domainEvent.payment) {
      opportunityResult = await pipeline.handlePaymentEvent(domainEvent.payment, domainEvent.id);
    } else if (domainEvent.paymentLinkId) {
      let outcomeStatus: 'paid' | 'expired' | 'cancelled' = 'expired';
      if (domainEvent.type === 'PAYMENT_LINK_PAID') {
        outcomeStatus = 'paid';
      } else if (domainEvent.type === 'PAYMENT_LINK_CANCELLED') {
        outcomeStatus = 'cancelled';
      }

      const rawPayAmount = (domainEvent.rawPayload as any)?.payload?.payment?.entity?.amount;
      const rawPlinkAmount = (domainEvent.rawPayload as any)?.payload?.payment_link?.entity?.amount;
      const amountPaise = typeof rawPayAmount === 'number'
        ? rawPayAmount
        : (typeof rawPlinkAmount === 'number' ? rawPlinkAmount : undefined);
      const paymentId = (domainEvent.rawPayload as any)?.payload?.payment?.entity?.id;

      outcomeAttributed = pipeline.handlePaymentLinkOutcome(
        domainEvent.paymentLinkId,
        outcomeStatus,
        amountPaise,
        domainEvent.id,
        typeof paymentId === 'string' ? paymentId : undefined
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
    if (dedupKey && !lockCommitted) {
      globalIdempotencyLedger.releaseLock(dedupKey);
    }
    console.error('[Webhook Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
