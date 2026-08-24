import { RazorpayWebhookEvent, DomainEvent, DomainEventType } from '../domain/events';
import { PaymentEntity } from '../domain/payment';
import { OrderEntity } from '../domain/payment';

export function normalizeRazorpayWebhook(webhook: RazorpayWebhookEvent): DomainEvent | null {
  const eventTypeMap: Record<string, DomainEventType> = {
    'payment.failed': 'PAYMENT_FAILED',
    'payment.captured': 'PAYMENT_CAPTURED',
    'payment.authorized': 'PAYMENT_CAPTURED',
    'order.paid': 'ORDER_PAID',
    'payment_link.paid': 'PAYMENT_LINK_PAID',
    'payment_link.expired': 'PAYMENT_LINK_EXPIRED',
  };

  const domainType = eventTypeMap[webhook.event];
  if (!domainType) {
    return null;
  }

  let payment: PaymentEntity | undefined;
  if (webhook.payload.payment?.entity) {
    const rawPay = webhook.payload.payment.entity as any;
    payment = {
      id: rawPay.id,
      orderId: rawPay.order_id || undefined,
      amountPaise: rawPay.amount,
      currency: 'INR',
      status: rawPay.status,
      method: rawPay.method,
      bank: rawPay.bank || null,
      wallet: rawPay.wallet || null,
      vpa: rawPay.vpa || null,
      email: rawPay.email,
      contact: rawPay.contact,
      error: rawPay.error_code ? {
        code: rawPay.error_code,
        description: rawPay.error_description || 'Payment failed',
        source: rawPay.error_source,
        step: rawPay.error_step,
        reason: rawPay.error_reason,
      } : undefined,
      feePaise: rawPay.fee,
      taxPaise: rawPay.tax,
      createdAt: rawPay.created_at || webhook.created_at,
    };
  }

  let order: OrderEntity | undefined;
  if (webhook.payload.order?.entity) {
    const rawOrder = webhook.payload.order.entity as any;
    order = {
      id: rawOrder.id,
      amountPaise: rawOrder.amount,
      currency: 'INR',
      receipt: rawOrder.receipt,
      status: rawOrder.status,
      attempts: rawOrder.attempts || 0,
      notes: rawOrder.notes,
      createdAt: rawOrder.created_at || webhook.created_at,
    };
  }

  let paymentLinkId: string | undefined;
  if (webhook.payload.payment_link?.entity) {
    const rawPlink = webhook.payload.payment_link.entity as any;
    paymentLinkId = rawPlink.id;
  }

  const uniqueEventId = `evt_${Buffer.from(`${webhook.account_id}_${webhook.created_at}_${payment?.id || order?.id || paymentLinkId || Math.random()}`).toString('hex').slice(0, 16)}`;

  return {
    id: uniqueEventId,
    type: domainType,
    merchantId: webhook.account_id,
    timestamp: webhook.created_at,
    payment,
    order,
    paymentLinkId,
    rawPayload: webhook as unknown as Record<string, unknown>,
  };
}
