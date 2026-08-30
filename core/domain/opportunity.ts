import { z } from 'zod';

export const OpportunityTypeSchema = z.enum([
  'FAILED_PAYMENT',
  'ABANDONED_CHECKOUT',
  'STATE_MISMATCH',
  'HIGH_VALUE_DROPOFF',
  'PAYMENT_METHOD_DEGRADATION',
  'RETRIED_CARD_FAILURE',
  'CUSTOMER_CHURN_RISK',
]);
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

export const PriorityTierSchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
export type PriorityTier = z.infer<typeof PriorityTierSchema>;

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

export const AttributionTypeSchema = z.enum([
  'ATTRIBUTED_INTERVENTION',
  'ORGANIC_RECOVERY',
  'UNRESOLVED',
  'DUPLICATE_RECOVERY_EVENT',
  'AMOUNT_MISMATCH',
]);
export type AttributionType = z.infer<typeof AttributionTypeSchema>;

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
  checkoutAgeMinutes: z.number().nonnegative().optional(),
  orderState: z.string().optional(),
  paymentState: z.string().optional(),
  recentContactCount: z.number().int().nonnegative().default(0),
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

export const PriorityMetricsSchema = z.object({
  score: z.number().min(0).max(100),
  tier: PriorityTierSchema,
  components: z.object({
    economicWeight: z.number().min(0).max(100),
    probabilityWeight: z.number().min(0).max(100),
    customerValueWeight: z.number().min(0).max(100),
    urgencyWeight: z.number().min(0).max(100),
    fatiguePenalty: z.number().min(0).max(100),
  }).optional(),
});
export type PriorityMetrics = z.infer<typeof PriorityMetricsSchema>;

export const OpportunityOutcomeSchema = z.object({
  actionExecuted: z.string().optional(),
  executionReference: z.string().optional(),
  verified: z.boolean().default(false),
  recoveredAmountPaise: z.number().int().nonnegative().optional(),
  attributionType: AttributionTypeSchema.optional(),
  resolutionEventId: z.string().optional(),
  resolvedAt: z.number().int().positive().optional(),
});
export type OpportunityOutcome = z.infer<typeof OpportunityOutcomeSchema>;

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
  priority: PriorityMetricsSchema.optional(),
  outcome: OpportunityOutcomeSchema.optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type RevenueOpportunity = z.infer<typeof RevenueOpportunitySchema>;
