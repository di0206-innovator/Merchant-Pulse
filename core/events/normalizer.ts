import { hashString, generateRandomHex } from '@/lib/cryptoUtils';
import { RazorpayWebhookEvent, DomainEvent, DomainEventType } from '../domain/events';
import { PaymentEntity, OrderEntity, PaymentMethodSchema, PaymentStatusSchema } from '../domain/payment';

export function normalizeRazorpayWebhook(webhook: RazorpayWebhookEvent): DomainEvent | null {
  const eventTypeMap: Record<string, DomainEventType> = {
    'payment.failed': 'PAYMENT_FAILED',
    'payment.captured': 'PAYMENT_CAPTURED',
    'payment.authorized': 'PAYMENT_CAPTURED',
    'order.paid': 'ORDER_PAID',
    'payment_link.paid': 'PAYMENT_LINK_PAID',
    'payment_link.expired': 'PAYMENT_LINK_EXPIRED',
    'payment_link.cancelled': 'PAYMENT_LINK_CANCELLED',
  };

  if (!Object.prototype.hasOwnProperty.call(eventTypeMap, webhook.event)) {
    return null;
  }

  const domainType = eventTypeMap[webhook.event];

  let payment: PaymentEntity | undefined;
  if (webhook.payload.payment?.entity && typeof webhook.payload.payment.entity === 'object') {
    const rawPay = webhook.payload.payment.entity as Record<string, unknown>;
    const payId = typeof rawPay.id === 'string' && rawPay.id.trim() ? rawPay.id.trim() : undefined;
    const rawAmount = typeof rawPay.amount === 'number' && Number.isFinite(rawPay.amount) && rawPay.amount >= 0
      ? Math.round(rawPay.amount)
      : 0;

    if (payId) {
      const parsedStatus = PaymentStatusSchema.safeParse(rawPay.status);
      const parsedMethod = PaymentMethodSchema.safeParse(rawPay.method);

      payment = {
        id: payId,
        orderId: typeof rawPay.order_id === 'string' && rawPay.order_id.trim() ? rawPay.order_id.trim() : undefined,
        amountPaise: rawAmount,
        currency: 'INR',
        status: parsedStatus.success ? parsedStatus.data : (domainType === 'PAYMENT_FAILED' ? 'failed' : 'captured'),
        method: parsedMethod.success ? parsedMethod.data : undefined,
        bank: typeof rawPay.bank === 'string' ? rawPay.bank.slice(0, 64) : null,
        wallet: typeof rawPay.wallet === 'string' ? rawPay.wallet.slice(0, 64) : null,
        vpa: typeof rawPay.vpa === 'string' ? rawPay.vpa.slice(0, 128) : null,
        email: typeof rawPay.email === 'string' ? rawPay.email.trim().slice(0, 254) : undefined,
        contact: typeof rawPay.contact === 'string' ? rawPay.contact.trim().slice(0, 32) : undefined,
        error: typeof rawPay.error_code === 'string' && rawPay.error_code.trim() ? {
          code: rawPay.error_code.trim().slice(0, 64),
          description: typeof rawPay.error_description === 'string'
            ? rawPay.error_description.slice(0, 500)
            : 'Payment failed',
          source: typeof rawPay.error_source === 'string' ? rawPay.error_source.slice(0, 64) : undefined,
          step: typeof rawPay.error_step === 'string' ? rawPay.error_step.slice(0, 64) : undefined,
          reason: typeof rawPay.error_reason === 'string' ? rawPay.error_reason.slice(0, 128) : undefined,
        } : undefined,
        feePaise: typeof rawPay.fee === 'number' && Number.isFinite(rawPay.fee) && rawPay.fee >= 0
          ? Math.round(rawPay.fee)
          : undefined,
        taxPaise: typeof rawPay.tax === 'number' && Number.isFinite(rawPay.tax) && rawPay.tax >= 0
          ? Math.round(rawPay.tax)
          : undefined,
        createdAt: typeof rawPay.created_at === 'number' && Number.isFinite(rawPay.created_at) && rawPay.created_at > 0
          ? Math.floor(rawPay.created_at)
          : webhook.created_at,
      };
    }
  }

  let order: OrderEntity | undefined;
  if (webhook.payload.order?.entity && typeof webhook.payload.order.entity === 'object') {
    const rawOrder = webhook.payload.order.entity as Record<string, unknown>;
    const orderId = typeof rawOrder.id === 'string' && rawOrder.id.trim() ? rawOrder.id.trim() : undefined;
    const orderAmount = typeof rawOrder.amount === 'number' && Number.isFinite(rawOrder.amount) && rawOrder.amount > 0
      ? Math.round(rawOrder.amount)
      : 0;

    if (orderId && orderAmount > 0) {
      const orderStatus = rawOrder.status === 'paid' || rawOrder.status === 'attempted' || rawOrder.status === 'created'
        ? rawOrder.status
        : 'created';
      order = {
        id: orderId,
        amountPaise: orderAmount,
        currency: 'INR',
        receipt: typeof rawOrder.receipt === 'string' ? rawOrder.receipt.slice(0, 128) : undefined,
        status: orderStatus,
        attempts: typeof rawOrder.attempts === 'number' && Number.isFinite(rawOrder.attempts) && rawOrder.attempts >= 0
          ? Math.floor(rawOrder.attempts)
          : 0,
        notes: rawOrder.notes && typeof rawOrder.notes === 'object' && !Array.isArray(rawOrder.notes)
          ? (rawOrder.notes as Record<string, string>)
          : undefined,
        createdAt: typeof rawOrder.created_at === 'number' && Number.isFinite(rawOrder.created_at) && rawOrder.created_at > 0
          ? Math.floor(rawOrder.created_at)
          : webhook.created_at,
      };
    }
  }

  let paymentLinkId: string | undefined;
  if (webhook.payload.payment_link?.entity && typeof webhook.payload.payment_link.entity === 'object') {
    const rawPlink = webhook.payload.payment_link.entity as Record<string, unknown>;
    if (typeof rawPlink.id === 'string' && rawPlink.id.trim()) {
      paymentLinkId = rawPlink.id.trim();
    }
  }

  const entityKey = payment?.id || order?.id || paymentLinkId || generateRandomHex(8);
  const uniqueEventId = `evt_${hashString(`${webhook.account_id}_${webhook.event}_${webhook.created_at}_${entityKey}`)}`;

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
