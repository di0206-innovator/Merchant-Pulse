import { z } from 'zod';
import type { AuditTrail } from '@/core/audit/trail';

export const NormalizedPaymentEventSchema = z.object({
  provider: z.literal('razorpay'),
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  received_at: z.number().int().positive(),
  provider_created_at: z.number().int().nonnegative().optional(),
  payment_id: z.string().optional(),
  order_id: z.string().optional(),
  payment_status: z.enum(['created', 'authorized', 'captured', 'failed', 'refunded']).optional(),
  amount_paise: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
});
export type NormalizedPaymentEvent = z.infer<typeof NormalizedPaymentEventSchema>;

const RazorpayWebhookEnvelopeSchema = z.object({
  event: z.string(),
  created_at: z.number().int().nonnegative().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

function extractPayment(payload: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  const payment = payload?.payment;
  if (!payment || typeof payment !== 'object' || payment === null) return undefined;
  const entity = (payment as Record<string, unknown>).entity;
  return entity && typeof entity === 'object' && entity !== null ? (entity as Record<string, unknown>) : undefined;
}

export function normalizeRazorpayWebhook(rawBody: string, eventId: string, receivedAt = Date.now()): NormalizedPaymentEvent {
  const envelope = RazorpayWebhookEnvelopeSchema.parse(JSON.parse(rawBody));
  const payment = extractPayment(envelope.payload);
  const rawStatus = payment?.status;
  const status = rawStatus === 'created' || rawStatus === 'authorized' || rawStatus === 'captured' || rawStatus === 'failed' || rawStatus === 'refunded'
    ? rawStatus
    : undefined;

  return NormalizedPaymentEventSchema.parse({
    provider: 'razorpay',
    event_id: eventId,
    event_type: envelope.event,
    received_at: receivedAt,
    provider_created_at: envelope.created_at,
    payment_id: typeof payment?.id === 'string' ? payment.id : undefined,
    order_id: typeof payment?.order_id === 'string' ? payment.order_id : undefined,
    payment_status: status,
    amount_paise: typeof payment?.amount === 'number' ? payment.amount : undefined,
    currency: typeof payment?.currency === 'string' ? payment.currency : undefined,
  });
}

import type { EventLedger } from './ledger';
import { transitionPaymentState, type PaymentRecord } from './state';

export async function processNormalizedEvent(
  event: NormalizedPaymentEvent,
  ledger: EventLedger,
  audit: AuditTrail,
  currentState: PaymentRecord | null = null
): Promise<{ duplicate: boolean; event: NormalizedPaymentEvent; state?: PaymentRecord }> {
  const recorded = await ledger.record(event.event_id);
  if (!recorded) {
    audit.append({
      actor: 'system',
      action: 'duplicate_event_ignored',
      metadata: { event_id: event.event_id, event_type: event.event_type },
    });
    return { duplicate: true, event };
  }

  const newState = transitionPaymentState(currentState, event);

  audit.append({
    actor: 'system',
    action: 'webhook_event_accepted',
    metadata: {
      event_id: event.event_id,
      event_type: event.event_type,
      payment_id: event.payment_id ?? null,
      order_id: event.order_id ?? null,
      previous_state: currentState?.status ?? null,
      new_state: newState.status,
    },
  });

  return { duplicate: false, event, state: newState };
}
