import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhook } from '@/lib/webhook';
import { AuditTrail } from '@/core/audit/trail';
import { normalizeRazorpayWebhook, processNormalizedEvent } from '@/core/events/processor';
import { FileBasedEventLedger } from '@/integrations/local/ledger';
import { rateLimit } from '@/lib/rate-limit';

const ledger = new FileBasedEventLedger();
const audit = new AuditTrail();

export async function POST(req: NextRequest) {
  // Rate limiting on webhooks to protect against spam attacks
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'rzp_webhook_peer';
  const limitResult = rateLimit(`webhook:${ip}`, { limit: 120, windowMs: 60_000 });

  if (!limitResult.success) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded on webhook ingestion.' }, { status: 429 });
  }

  // Enforce request size limit (e.g. max 1MB for webhook payloads)
  const rawBody = await req.text();
  if (rawBody.length > 1_000_000) {
    return NextResponse.json({ ok: false, error: 'Payload too large.' }, { status: 413 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ ok: false, error: 'Webhook verification is not configured.' }, { status: 503 });
  }

  if (!verifyRazorpayWebhook(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, error: 'Invalid webhook signature.' }, { status: 401 });
  }

  const eventId = req.headers.get('x-razorpay-event-id');
  if (!eventId) {
    return NextResponse.json({ ok: false, error: 'Missing event id.' }, { status: 400 });
  }

  try {
    const normalized = normalizeRazorpayWebhook(rawBody, eventId);
    const result = await processNormalizedEvent(normalized, ledger, audit);
    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      event: normalized.event_type,
      eventId: normalized.event_id,
      receivedAt: normalized.received_at,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Invalid webhook payload.' },
      { status: 400 }
    );
  }
}
