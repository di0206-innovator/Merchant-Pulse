import type { NormalizedPaymentEvent } from './processor';

export type PaymentState = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'unknown';

export interface PaymentRecord {
  id: string;
  order_id?: string;
  status: PaymentState;
  amount_paise: number;
  currency: string;
  created_at: number;
  last_updated_at: number;
  failed_reason?: string;
}

const STATUS_PRECEDENCE: Record<PaymentState, number> = {
  created: 1,
  authorized: 2,
  captured: 3,
  failed: 4,     // Both captured and failed are terminal-ish, but let's say failed is final for this transaction attempt
  refunded: 5,   // Only happens after captured
  unknown: 0,
};

export function transitionPaymentState(
  current: PaymentRecord | null,
  event: NormalizedPaymentEvent
): PaymentRecord {
  const eventStatus = event.payment_status ?? 'unknown';
  const eventTimestamp = event.provider_created_at ?? event.received_at;

  if (!current) {
    return {
      id: event.payment_id ?? `unknown_${event.event_id}`,
      order_id: event.order_id,
      status: eventStatus,
      amount_paise: event.amount_paise ?? 0,
      currency: event.currency ?? 'INR',
      created_at: eventTimestamp,
      last_updated_at: eventTimestamp,
      failed_reason: eventStatus === 'failed' ? event.event_type : undefined,
    };
  }

  // Idempotency / Stale event check
  // If we already have a status that's strictly "higher" precedence, we don't downgrade it unless it's genuinely newer and valid.
  // Actually, Razorpay events can arrive out of order. If the new event has a newer provider_created_at, we update.
  // If the new event is older than our last update, we only update if the precedence is higher (e.g. we somehow missed capture but got refund)
  
  let newStatus = current.status;
  if (eventTimestamp >= current.last_updated_at) {
    newStatus = eventStatus;
  } else if (STATUS_PRECEDENCE[eventStatus] > STATUS_PRECEDENCE[current.status]) {
    newStatus = eventStatus;
  }

  return {
    ...current,
    order_id: event.order_id ?? current.order_id,
    status: newStatus,
    amount_paise: event.amount_paise ?? current.amount_paise,
    currency: event.currency ?? current.currency,
    last_updated_at: Math.max(current.last_updated_at, eventTimestamp),
    failed_reason: newStatus === 'failed' ? (current.failed_reason ?? event.event_type) : current.failed_reason,
  };
}
