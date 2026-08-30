import { z } from 'zod';

export const ActionTypeSchema = z.enum([
  'CREATE_PAYMENT_LINK',
  'SEND_PAYMENT_REMINDER',
  'NOTIFY_ALTERNATIVE_METHOD',
  'RECONCILE_ORDER_STATE',
  'ESCALATE_TO_OPS',
  'NO_ACTION',
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const CustomerMessagingSchema = z.object({
  smsText: z.string().optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
});
export type CustomerMessaging = z.infer<typeof CustomerMessagingSchema>;

export const StrategyProviderNameSchema = z.enum([
  'GeminiStrategyProvider',
  'MockStrategyProvider',
  'MockFallback',
]);
export type StrategyProviderName = z.infer<typeof StrategyProviderNameSchema>;

export const StrategyTelemetrySchema = z.object({
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  strategySchemaVersion: z.string().default('v1.0.0'),
  contextHash: z.string(),
  latencyMs: z.number(),
  validationStatus: z.enum(['PASSED', 'FALLBACK_USED']),
  fallbackReason: z.string().optional(),
});
export type StrategyTelemetry = z.infer<typeof StrategyTelemetrySchema>;

export const StrategyRecommendationSchema = z.object({
  opportunityId: z.string(),
  diagnosis: z.string().min(5).max(500),
  recommendedActionType: ActionTypeSchema,
  actionPayload: z.record(z.unknown()).default({}),
  confidenceScore: z.number().min(0).max(1),
  rationale: z.string().min(5).max(1000),
  suggestedExpiryMinutes: z.number().int().positive().default(120),
  customerMessaging: CustomerMessagingSchema.optional(),
  telemetry: StrategyTelemetrySchema.optional(),
});
export type StrategyRecommendation = z.infer<typeof StrategyRecommendationSchema>;

export const StrategyInputContextSchema = z.object({
  opportunityId: z.string(),
  opportunityType: z.string(),
  amountInr: z.number(),
  paymentMethod: z.string().optional(),
  bankOrIssuer: z.string().optional(),
  failureCode: z.string().optional(),
  failureDescription: z.string().optional(),
  customerPastLtvInr: z.number(),
  consecutiveFailures: z.number(),
  gatewayDowntimeRatePct: z.number().optional(),
  calculatedEvInr: z.number(),
  maxAutoGmvInr: z.number(),
});
export type StrategyInputContext = z.infer<typeof StrategyInputContextSchema>;
