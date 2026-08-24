import { z } from 'zod';

export const OpportunityTypeSchema = z.enum([
  'HIGH_VALUE_DROPOFF',
  'PAYMENT_METHOD_DEGRADATION',
  'ABANDONED_CHECKOUT',
  'RETRIED_CARD_FAILURE',
  'CUSTOMER_CHURN_RISK',
]);
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

export const OpportunityStatusSchema = z.enum([
  'DETECTED',
  'STRATEGY_GENERATED',
  'POLICY_EVALUATED',
  'EXECUTING',
  'EXECUTED',
  'RECOVERED',
  'EXPIRED',
  'REJECTED',
  'ESCALATED',
]);
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;

export const OpportunityEvidenceSchema = z.object({
  failureCode: z.string().optional(),
  failureDescription: z.string().optional(),
  paymentMethod: z.string().optional(),
  bankOrIssuer: z.string().optional(),
  consecutiveFailures: z.number().int().nonnegative().default(1),
  methodDowntimeRatePct: z.number().min(0).max(100).optional(),
  customerLtvPaise: z.number().int().nonnegative().default(0),
  historicalRecoveryRatePct: z.number().min(0).max(100).default(50),
  intentScore: z.number().min(0).max(1).default(0.8),
});
export type OpportunityEvidence = z.infer<typeof OpportunityEvidenceSchema>;

export const ExpectedValueMetricsSchema = z.object({
  recoverableGmvPaise: z.number().int().positive(),
  pSuccess: z.number().min(0).max(1),
  estimatedInterventionCostPaise: z.number().int().nonnegative(),
  customerFatiguePenaltyPaise: z.number().int().nonnegative(),
  netExpectedValuePaise: z.number().int(),
  isProfitable: z.boolean(),
});
export type ExpectedValueMetrics = z.infer<typeof ExpectedValueMetricsSchema>;

export const RevenueOpportunitySchema = z.object({
  id: z.string().startsWith('opp_'),
  merchantId: z.string(),
  type: OpportunityTypeSchema,
  status: OpportunityStatusSchema.default('DETECTED'),
  triggerEventId: z.string(),
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  customerEmail: z.string().optional(),
  amountPaise: z.number().int().positive(),
  evidence: OpportunityEvidenceSchema,
  expectedValue: ExpectedValueMetricsSchema,
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type RevenueOpportunity = z.infer<typeof RevenueOpportunitySchema>;
