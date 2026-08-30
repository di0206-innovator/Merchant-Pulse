import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation } from '../domain/strategy';
import { MerchantPolicyConfig, PolicyRuleResult } from '../domain/policy';
import { CustomerProfile } from '../domain/payment';

export interface PolicyRule {
  id: string;
  name: string;
  evaluate(
    opportunity: RevenueOpportunity,
    recommendation: StrategyRecommendation,
    config: MerchantPolicyConfig,
    customer?: CustomerProfile
  ): PolicyRuleResult;
}

export const ActionAllowlistRule: PolicyRule = {
  id: 'ACTION_ALLOWLIST',
  name: 'Permitted Razorpay Action Allowlist',
  evaluate(opportunity, recommendation, config) {
    const isAllowed = config.allowedActions.includes(recommendation.recommendedActionType);
    return {
      ruleId: 'ACTION_ALLOWLIST',
      ruleName: 'Permitted Razorpay Action Allowlist',
      passed: isAllowed,
      severity: 'BLOCKER',
      reason: isAllowed
        ? `Action '${recommendation.recommendedActionType}' is enabled in merchant policy.`
        : `Action '${recommendation.recommendedActionType}' is disabled in merchant policy settings.`,
    };
  },
};

export const MaxAutoGmvRule: PolicyRule = {
  id: 'MAX_AUTO_GMV_THRESHOLD',
  name: 'Maximum Autonomous GMV Threshold',
  evaluate(opportunity, recommendation, config) {
    const withinLimit = opportunity.amountPaise <= config.maxAutoGmvPaise;
    const limitInr = (config.maxAutoGmvPaise / 100).toLocaleString('en-IN');
    const amountInr = (opportunity.amountPaise / 100).toLocaleString('en-IN');

    return {
      ruleId: 'MAX_AUTO_GMV_THRESHOLD',
      ruleName: 'Maximum Autonomous GMV Threshold',
      passed: withinLimit,
      severity: 'WARNING', // Causes escalation to human queue rather than hard rejection
      reason: withinLimit
        ? `Transaction amount (₹${amountInr}) is within autonomous execution limit (₹${limitInr}).`
        : `Transaction amount (₹${amountInr}) exceeds autonomous execution limit (₹${limitInr}). Escalation required.`,
      metadata: { amountPaise: opportunity.amountPaise, limitPaise: config.maxAutoGmvPaise },
    };
  },
};

export const PositiveEvRule: PolicyRule = {
  id: 'POSITIVE_EV_REQUIRED',
  name: 'Economic Value Profitability Gate',
  evaluate(opportunity, recommendation, config) {
    const evPaise = opportunity.expectedValue.netExpectedValuePaise;
    const isProfitable = evPaise >= config.minEvPaise;
    const evInr = (evPaise / 100).toFixed(2);
    const minEvInr = (config.minEvPaise / 100).toFixed(2);

    return {
      ruleId: 'POSITIVE_EV_REQUIRED',
      ruleName: 'Economic Value Profitability Gate',
      passed: isProfitable,
      severity: 'BLOCKER',
      reason: isProfitable
        ? `Net expected recovery value (₹${evInr}) meets minimum threshold (₹${minEvInr}). Action is economically justified.`
        : `Net expected recovery value (₹${evInr}) is below minimum threshold (₹${minEvInr}). Negative or negligible EV.`,
      metadata: { expectedValuePaise: evPaise, minEvPaise: config.minEvPaise },
    };
  },
};

export const ContactFrequencyCapRule: PolicyRule = {
  id: 'CONTACT_FREQUENCY_CAP',
  name: 'Customer Contact Frequency Cap',
  evaluate(opportunity, recommendation, config, customer) {
    if (!customer?.lastContactedAt) {
      return {
        ruleId: 'CONTACT_FREQUENCY_CAP',
        ruleName: 'Customer Contact Frequency Cap',
        passed: true,
        severity: 'BLOCKER',
        reason: 'Customer has not been contacted recently.',
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const cooldownSeconds = config.contactCooldownHours * 3600;
    const elapsedSeconds = now - customer.lastContactedAt;
    const withinCooldown = elapsedSeconds < cooldownSeconds;

    return {
      ruleId: 'CONTACT_FREQUENCY_CAP',
      ruleName: 'Customer Contact Frequency Cap',
      passed: !withinCooldown,
      severity: 'BLOCKER',
      reason: withinCooldown
        ? `Customer was contacted ${Math.round(elapsedSeconds / 3600)}h ago. Cooldown period is ${config.contactCooldownHours}h.`
        : `Customer contact cooldown period (${config.contactCooldownHours}h) has passed.`,
      metadata: { lastContactedAt: customer.lastContactedAt, cooldownSeconds },
    };
  },
};

export const StateConsistencyRule: PolicyRule = {
  id: 'STATE_CONSISTENCY',
  name: 'Opportunity State Consistency',
  evaluate(opportunity) {
    const validStates = ['DETECTED', 'STRATEGY_GENERATED', 'POLICY_EVALUATED', 'ESCALATED'];
    const isValid = validStates.includes(opportunity.status);

    return {
      ruleId: 'STATE_CONSISTENCY',
      ruleName: 'Opportunity State Consistency',
      passed: isValid,
      severity: 'BLOCKER',
      reason: isValid
        ? `Opportunity is in valid state '${opportunity.status}' for policy evaluation.`
        : `Opportunity is in terminal or in-flight state '${opportunity.status}'. Further action blocked.`,
    };
  },
};

export const EvidenceSufficiencyRule: PolicyRule = {
  id: 'EVIDENCE_SUFFICIENCY',
  name: 'Action Evidence & Dispatch Sufficiency',
  evaluate(opportunity, recommendation) {
    if (recommendation.recommendedActionType === 'NO_ACTION' || recommendation.recommendedActionType === 'ESCALATE_TO_OPS') {
      return {
        ruleId: 'EVIDENCE_SUFFICIENCY',
        ruleName: 'Action Evidence & Dispatch Sufficiency',
        passed: true,
        severity: 'BLOCKER',
        reason: 'Action does not require customer contact parameters.',
      };
    }

    const hasContact = Boolean(opportunity.customerContact || opportunity.customerEmail || opportunity.orderId);
    return {
      ruleId: 'EVIDENCE_SUFFICIENCY',
      ruleName: 'Action Evidence & Dispatch Sufficiency',
      passed: hasContact,
      severity: 'BLOCKER',
      reason: hasContact
        ? 'Customer contact information or Order ID is available for Razorpay dispatch.'
        : 'Missing customer contact information (email or phone) to send recovery link.',
    };
  },
};
