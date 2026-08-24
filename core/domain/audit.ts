import { z } from 'zod';
import { StrategyRecommendationSchema } from './strategy';
import { PolicyEvaluationResultSchema } from './policy';

export const DecisionAuditRecordSchema = z.object({
  decisionId: z.string().startsWith('dec_'),
  eventId: z.string(),
  merchantId: z.string(),
  opportunityId: z.string(),
  timestamp: z.number().int().positive(),
  deterministicMetrics: z.object({
    amountPaise: z.number().int().nonnegative(),
    recoverableGmvPaise: z.number().int().nonnegative(),
    expectedValuePaise: z.number().int(),
    failureCode: z.string().optional(),
    customerLtvPaise: z.number().int().nonnegative().optional(),
  }),
  aiRecommendation: StrategyRecommendationSchema,
  policyResult: PolicyEvaluationResultSchema,
  actionStatus: z.enum(['AUTO_EXECUTED', 'ESCALATED', 'REJECTED', 'FAILED', 'MANUALLY_APPROVED']),
  executedActionId: z.string().optional(),
  outcome: z.object({
    status: z.enum(['RECOVERED', 'EXPIRED', 'CANCELLED', 'PENDING']),
    recoveredAmountPaise: z.number().int().nonnegative().optional(),
    resolvedAt: z.number().int().positive().optional(),
    resolutionEventId: z.string().optional(),
  }).optional(),
});
export type DecisionAuditRecord = z.infer<typeof DecisionAuditRecordSchema>;
