import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation } from '../domain/strategy';
import {
  MerchantPolicyConfig,
  PolicyEvaluationResult,
  PolicyEvaluationVerdict,
  PolicyRuleResult,
  PolicyEvaluationResultSchema,
} from '../domain/policy';
import { CustomerProfile } from '../domain/payment';
import {
  ActionAllowlistRule,
  MaxAutoGmvRule,
  PositiveEvRule,
  ContactFrequencyCapRule,
  StateConsistencyRule,
  EvidenceSufficiencyRule,
  PolicyRule,
} from './rules';

export class PolicyEngine {
  private rules: PolicyRule[];

  constructor(customRules?: PolicyRule[]) {
    this.rules = customRules || [
      StateConsistencyRule,
      ActionAllowlistRule,
      PositiveEvRule,
      ContactFrequencyCapRule,
      EvidenceSufficiencyRule,
      MaxAutoGmvRule, // Checked last for escalation vs execution
    ];
  }

  public evaluate(
    opportunity: RevenueOpportunity,
    recommendation: StrategyRecommendation,
    config: MerchantPolicyConfig,
    customer?: CustomerProfile
  ): PolicyEvaluationResult {
    const ruleResults: PolicyRuleResult[] = [];
    let hasBlockerFailure = false;
    let hasEscalationTrigger = false;
    const failureReasons: string[] = [];

    for (const rule of this.rules) {
      const result = rule.evaluate(opportunity, recommendation, config, customer);
      ruleResults.push(result);

      if (!result.passed) {
        if (result.severity === 'BLOCKER') {
          hasBlockerFailure = true;
          failureReasons.push(`[${result.ruleId}] ${result.reason}`);
        } else if (result.severity === 'WARNING') {
          hasEscalationTrigger = true;
          failureReasons.push(`[${result.ruleId}] ${result.reason}`);
        }
      }
    }

    let verdict: PolicyEvaluationVerdict = 'AUTO_EXECUTE';
    let riskClass: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' = 'LOW_RISK';

    if (recommendation.recommendedActionType === 'NO_ACTION') {
      verdict = 'REJECT';
      riskClass = 'HIGH_RISK';
    } else if (recommendation.recommendedActionType === 'ESCALATE_TO_OPS') {
      verdict = 'ESCALATE_HUMAN';
      riskClass = 'MEDIUM_RISK';
    } else if (hasBlockerFailure) {
      verdict = 'REJECT';
      riskClass = 'HIGH_RISK';
    } else if (hasEscalationTrigger) {
      verdict = 'ESCALATE_HUMAN';
      riskClass = 'MEDIUM_RISK';
    }

    const now = Math.floor(Date.now() / 1000);
    const evaluationResult: PolicyEvaluationResult = {
      opportunityId: opportunity.id,
      verdict,
      riskClass,
      ruleResults,
      evaluatedAt: now,
      overrideAllowed: true,
      notes: failureReasons.length > 0 ? failureReasons.join(' | ') : undefined,
    };

    return PolicyEvaluationResultSchema.parse(evaluationResult);
  }
}
