import { z } from 'zod';
import { ActionTypeSchema } from './strategy';

export const PolicyRuleIdSchema = z.enum([
  'ACTION_ALLOWLIST',
  'MAX_AUTO_GMV_THRESHOLD',
  'CONTACT_FREQUENCY_CAP',
  'POSITIVE_EV_REQUIRED',
  'STATE_CONSISTENCY',
  'EVIDENCE_SUFFICIENCY',
]);
export type PolicyRuleId = z.infer<typeof PolicyRuleIdSchema>;

export const PolicyEvaluationVerdictSchema = z.enum([
  'AUTO_EXECUTE',
  'ESCALATE_HUMAN',
  'REJECT',
]);
export type PolicyEvaluationVerdict = z.infer<typeof PolicyEvaluationVerdictSchema>;

export const PolicyRuleResultSchema = z.object({
  ruleId: PolicyRuleIdSchema,
  ruleName: z.string(),
  passed: z.boolean(),
  severity: z.enum(['BLOCKER', 'WARNING', 'INFO']),
  reason: z.string(),
  metadata: z.record(z.unknown()).optional(),
});
export type PolicyRuleResult = z.infer<typeof PolicyRuleResultSchema>;

export const RiskClassSchema = z.enum(['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK']);
export type RiskClass = z.infer<typeof RiskClassSchema>;

export const PolicyEvaluationResultSchema = z.object({
  opportunityId: z.string(),
  verdict: PolicyEvaluationVerdictSchema,
  riskClass: RiskClassSchema.default('LOW_RISK'),
  ruleResults: z.array(PolicyRuleResultSchema),
  evaluatedAt: z.number().int().positive(),
  overrideAllowed: z.boolean().default(true),
  notes: z.string().optional(),
});
export type PolicyEvaluationResult = z.infer<typeof PolicyEvaluationResultSchema>;

export const MerchantPolicyConfigSchema = z.object({
  merchantId: z.string(),
  allowedActions: z.array(ActionTypeSchema).default([
    'CREATE_PAYMENT_LINK',
    'SEND_PAYMENT_REMINDER',
    'NOTIFY_ALTERNATIVE_METHOD',
    'RECONCILE_ORDER_STATE',
    'ESCALATE_TO_OPS',
    'NO_ACTION'
  ]),
  maxAutoGmvPaise: z.number().int().positive().default(2500000), // ₹25,000 in paise
  minEvPaise: z.number().int().default(2000), // ₹20 in paise
  contactCooldownHours: z.number().int().positive().default(24),
  requireManualApprovalForDowntimeAlerts: z.boolean().default(true),
});
export type MerchantPolicyConfig = z.infer<typeof MerchantPolicyConfigSchema>;
