import { describe, expect, it } from 'vitest';
import { transitionPaymentState, type PaymentRecord } from '@/core/events/state';
import type { NormalizedPaymentEvent } from '@/core/events/processor';

describe('Payment State Machine', () => {
  it('creates a new record from a created event', () => {
    const event: NormalizedPaymentEvent = {
      provider: 'razorpay',
      event_id: 'evt_1',
      event_type: 'payment.created',
      received_at: 1000,
      provider_created_at: 900,
      payment_id: 'pay_1',
      order_id: 'order_1',
      payment_status: 'created',
      amount_paise: 10000,
      currency: 'INR',
    };

    const nextState = transitionPaymentState(null, event);
    expect(nextState).toMatchObject({
      id: 'pay_1',
      order_id: 'order_1',
      status: 'created',
      amount_paise: 10000,
      currency: 'INR',
      created_at: 900,
      last_updated_at: 900,
    });
  });

  it('updates state to authorized on newer event', () => {
    const current: PaymentRecord = {
      id: 'pay_1',
      order_id: 'order_1',
      status: 'created',
      amount_paise: 10000,
      currency: 'INR',
      created_at: 900,
      last_updated_at: 900,
    };

    const event: NormalizedPaymentEvent = {
      provider: 'razorpay',
      event_id: 'evt_2',
      event_type: 'payment.authorized',
      received_at: 1100,
      provider_created_at: 1050,
      payment_id: 'pay_1',
      order_id: 'order_1',
      payment_status: 'authorized',
      amount_paise: 10000,
      currency: 'INR',
    };

    const nextState = transitionPaymentState(current, event);
    expect(nextState.status).toBe('authorized');
    expect(nextState.last_updated_at).toBe(1050);
  });

  it('protects against stale events downgrading state unless precedence is higher', () => {
    const current: PaymentRecord = {
      id: 'pay_1',
      status: 'captured',
      amount_paise: 10000,
      currency: 'INR',
      created_at: 900,
      last_updated_at: 1200,
    };

    const staleEvent: NormalizedPaymentEvent = {
      provider: 'razorpay',
      event_id: 'evt_old',
      event_type: 'payment.authorized',
      received_at: 1300,
      provider_created_at: 1050, // older than current last_updated_at (1200)
      payment_id: 'pay_1',
      payment_status: 'authorized', // lower precedence than captured
    };

    const nextState = transitionPaymentState(current, staleEvent);
    expect(nextState.status).toBe('captured'); // state is preserved
    expect(nextState.last_updated_at).toBe(1200);
  });

  it('allows out-of-order terminal states if they have higher precedence', () => {
    const current: PaymentRecord = {
      id: 'pay_1',
      status: 'authorized',
      amount_paise: 10000,
      currency: 'INR',
      created_at: 900,
      last_updated_at: 1200,
    };

    const refundEvent: NormalizedPaymentEvent = {
      provider: 'razorpay',
      event_id: 'evt_refund',
      event_type: 'payment.refunded',
      received_at: 1300,
      provider_created_at: 1150, // slightly out of order
      payment_id: 'pay_1',
      payment_status: 'refunded', // higher precedence than authorized
    };

    const nextState = transitionPaymentState(current, refundEvent);
    expect(nextState.status).toBe('refunded'); // refunded wins due to higher precedence
    expect(nextState.last_updated_at).toBe(1200); // last updated remains at the max timestamp
  });
});
