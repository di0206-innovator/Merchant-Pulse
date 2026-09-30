import { z } from 'zod';

export const PaymentStatusSchema = z.enum(['created', 'authorized', 'captured', 'failed', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const RazorpayPaymentSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  amount: z.number().int().nonnegative(),
  currency: z.string().default('INR'),
  status: PaymentStatusSchema,
  method: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
  created_at: z.number().int(),
  attempts: z.number().int().nonnegative().default(0),
  customer_id: z.string().optional(),
});
export type RazorpayPayment = z.infer<typeof RazorpayPaymentSchema>;

export const MerchantProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthly_gmv_paise: z.number().int().nonnegative(),
  daily_action_budget_paise: z.number().int().nonnegative(),
  max_payment_attempts: z.number().int().positive().default(3),
  auto_execute_threshold: z.number().min(0).max(1).default(0.65),
});
export type MerchantProfile = z.infer<typeof MerchantProfileSchema>;

export const ParsedPaymentSchema = z.object({
  payment_id: z.string(),
  order_id: z.string(),
  amount_paise: z.number().int().nonnegative(),
  status: PaymentStatusSchema,
  failure_category: z.enum(['network', 'customer_declined', 'authentication', 'merchant_config', 'unknown']).nullable(),
  retryable: z.boolean(),
  attempt_count: z.number().int().nonnegative(),
  repeat_customer: z.boolean(),
  created_at: z.number().int(),
});
export type ParsedPayment = z.infer<typeof ParsedPaymentSchema>;

export const OpportunitySchema = z.object({
  type: z.enum(['recovery', 'conversion', 'retention']),
  title: z.string(),
  description: z.string(),
  affected_transactions: z.number().int().nonnegative(),
  revenue_at_risk_paise: z.number().int().nonnegative(),
  evidence_score: z.number().min(0).max(1),
  recommended_action: z.enum(['create_payment_recovery_flow', 'create_follow_up_order', 'escalate']),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export const InterventionOptionSchema = z.object({
  type: z.enum(['create_payment_recovery_flow', 'create_follow_up_order', 'escalate']),
  expected_recovery_rate: z.number().min(0).max(1),
  expected_value_paise: z.number().int(),
  execution_cost_paise: z.number().int().nonnegative(),
  rationale: z.string(),
});
export type InterventionOption = z.infer<typeof InterventionOptionSchema>;

export const StrategyRecommendationSchema = z.object({
  recommendation: InterventionOptionSchema,
  alternatives: z.array(InterventionOptionSchema),
  strategy_score: z.number().min(0).max(1),
  assumptions: z.array(z.string()),
});
export type StrategyRecommendation = z.infer<typeof StrategyRecommendationSchema>;

export const PolicyDecisionSchema = z.object({
  allowed: z.boolean(),
  action: z.enum(['execute', 'escalate', 'reject']),
  reasons: z.array(z.string()),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const AuditEventSchema = z.object({
  id: z.string(),
  actor: z.enum(['system', 'strategy', 'policy', 'executor', 'human']),
  action: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  timestamp: z.number(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const AnalysisResultSchema = z.object({
  merchant: MerchantProfileSchema,
  payments_processed: z.number().int().nonnegative(),
  opportunities: z.array(OpportunitySchema),
  recommendation: StrategyRecommendationSchema,
  policy: PolicyDecisionSchema,
  audit: z.array(AuditEventSchema),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
