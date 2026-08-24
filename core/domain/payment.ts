import { z } from 'zod';

export const CurrencySchema = z.literal('INR');
export type Currency = z.infer<typeof CurrencySchema>;

export const PaymentMethodSchema = z.enum([
  'upi',
  'card',
  'netbanking',
  'wallet',
  'emi',
  'subscription',
  'bank_transfer',
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const CardNetworkSchema = z.enum([
  'visa',
  'mastercard',
  'rupay',
  'amex',
  'diners',
  'maestro',
  'unknown'
]);
export type CardNetwork = z.infer<typeof CardNetworkSchema>;

export const PaymentStatusSchema = z.enum([
  'created',
  'authorized',
  'captured',
  'refunded',
  'failed'
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentFailureDetailsSchema = z.object({
  code: z.string(),
  description: z.string(),
  source: z.string().optional(),
  step: z.string().optional(),
  reason: z.string().optional(),
  declineCode: z.string().optional(),
});
export type PaymentFailureDetails = z.infer<typeof PaymentFailureDetailsSchema>;

export const PaymentEntitySchema = z.object({
  id: z.string().startsWith('pay_'),
  orderId: z.string().startsWith('order_').optional(),
  amountPaise: z.number().int().nonnegative(),
  currency: CurrencySchema.default('INR'),
  status: PaymentStatusSchema,
  method: PaymentMethodSchema.optional(),
  cardNetwork: CardNetworkSchema.optional(),
  cardType: z.enum(['credit', 'debit', 'prepaid']).optional(),
  bank: z.string().nullable().optional(),
  wallet: z.string().nullable().optional(),
  vpa: z.string().nullable().optional(),
  upiApp: z.string().optional(), // gpay, phonepe, paytm, cred
  email: z.string().email().optional().or(z.string()),
  contact: z.string().optional(),
  error: PaymentFailureDetailsSchema.optional(),
  feePaise: z.number().int().nonnegative().optional(),
  taxPaise: z.number().int().nonnegative().optional(),
  createdAt: z.number().int().positive(), // UNIX timestamp in seconds
});
export type PaymentEntity = z.infer<typeof PaymentEntitySchema>;

export const OrderEntitySchema = z.object({
  id: z.string().startsWith('order_'),
  amountPaise: z.number().int().positive(),
  currency: CurrencySchema.default('INR'),
  receipt: z.string().optional(),
  status: z.enum(['created', 'attempted', 'paid']),
  attempts: z.number().int().nonnegative().default(0),
  notes: z.record(z.string()).optional(),
  createdAt: z.number().int().positive(),
});
export type OrderEntity = z.infer<typeof OrderEntitySchema>;

export const CustomerProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  contact: z.string().optional(),
  totalOrders: z.number().int().nonnegative().default(0),
  failedOrders: z.number().int().nonnegative().default(0),
  ltvPaise: z.number().int().nonnegative().default(0),
  lastContactedAt: z.number().int().optional(),
  preferredMethod: PaymentMethodSchema.optional(),
});
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
