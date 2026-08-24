import { z } from 'zod';
import { PaymentEntitySchema, OrderEntitySchema } from './payment';

export const RazorpayWebhookEventSchema = z.object({
  entity: z.literal('event'),
  account_id: z.string(),
  event: z.enum([
    'payment.authorized',
    'payment.failed',
    'payment.captured',
    'order.paid',
    'payment_link.paid',
    'payment_link.partially_paid',
    'payment_link.expired',
    'payment_link.cancelled'
  ]),
  contains: z.array(z.string()),
  payload: z.object({
    payment: z.object({
      entity: z.record(z.unknown())
    }).optional(),
    order: z.object({
      entity: z.record(z.unknown())
    }).optional(),
    payment_link: z.object({
      entity: z.record(z.unknown())
    }).optional(),
  }),
  created_at: z.number().int().positive(),
});
export type RazorpayWebhookEvent = z.infer<typeof RazorpayWebhookEventSchema>;

export const DomainEventTypeSchema = z.enum([
  'PAYMENT_FAILED',
  'PAYMENT_CAPTURED',
  'ORDER_CREATED',
  'ORDER_PAID',
  'PAYMENT_LINK_PAID',
  'PAYMENT_LINK_EXPIRED',
]);
export type DomainEventType = z.infer<typeof DomainEventTypeSchema>;

export const DomainEventSchema = z.object({
  id: z.string(), // event id from webhook or internal
  type: DomainEventTypeSchema,
  merchantId: z.string(),
  timestamp: z.number().int().positive(),
  payment: PaymentEntitySchema.optional(),
  order: OrderEntitySchema.optional(),
  paymentLinkId: z.string().optional(),
  rawPayload: z.record(z.unknown()).optional(),
});
export type DomainEvent = z.infer<typeof DomainEventSchema>;
