import { RevenuePipelineOrchestrator } from './orchestrator';
import { RevenueFactStore } from '../revenue/factStore';
import { RevenueOpportunityDetector } from '../revenue/detector';
import { getStrategyProvider } from '../strategy';
import { PolicyEngine } from '../policy/evaluator';
import { ActionDispatcher } from '../execution/dispatcher';
import { MockRazorpayClientAdapter, LiveRazorpayClientAdapter } from '../../integrations/razorpay/client';
import { globalAuditLedger } from '../audit/ledger';
import { MerchantPolicyConfig } from '../domain/policy';
import { getGlobalRepositories } from '../storage';

export * from './orchestrator';

const globalForPipeline = globalThis as unknown as {
  __merchantPulsePipeline?: RevenuePipelineOrchestrator;
};

export function getGlobalPipeline(policyConfig?: Partial<MerchantPolicyConfig>): RevenuePipelineOrchestrator {
  if (!globalForPipeline.__merchantPulsePipeline) {
    const storage = getGlobalRepositories();
    const factStore = new RevenueFactStore();
    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = getStrategyProvider(true);
    const policyEngine = new PolicyEngine();

    const isTestEnv =
      (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST)) &&
      process.env.ENABLE_LIVE_RAZORPAY_IN_TESTS !== 'true';

    const isLiveConfigured =
      !isTestEnv &&
      Boolean(process.env.RAZORPAY_KEY_ID) &&
      Boolean(process.env.RAZORPAY_KEY_SECRET) &&
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_YourKeyIdHere' &&
      process.env.RAZORPAY_KEY_SECRET !== 'YourKeySecretHere';

    // Use Live adapter if keys are configured (and not in hermetic test run), otherwise Mock adapter
    const razorpayAdapter = isLiveConfigured
      ? new LiveRazorpayClientAdapter()
      : new MockRazorpayClientAdapter();

    const dispatcher = new ActionDispatcher(razorpayAdapter, storage.executionIntents);

    const envMaxAutoGmvInr = Number(process.env.DEFAULT_MAX_AUTO_GMV_INR);
    const envMinEvInr = Number(process.env.DEFAULT_MIN_EV_INR);
    const envCooldownHours = Number(process.env.CONTACT_COOLDOWN_HOURS);

    const defaultConfig: MerchantPolicyConfig = {
      merchantId: 'rzp_merchant_pulse',
      allowedActions: [
        'CREATE_PAYMENT_LINK',
        'SEND_PAYMENT_REMINDER',
        'NOTIFY_ALTERNATIVE_METHOD',
        'RECONCILE_ORDER_STATE',
        'ESCALATE_TO_OPS',
        'NO_ACTION'
      ],
      maxAutoGmvPaise: Number.isFinite(envMaxAutoGmvInr) && envMaxAutoGmvInr > 0
        ? Math.round(envMaxAutoGmvInr * 100)
        : 2500000, // ₹25,000 auto limit
      minEvPaise: Number.isFinite(envMinEvInr)
        ? Math.round(envMinEvInr * 100)
        : 2000, // ₹20 min EV
      contactCooldownHours: Number.isFinite(envCooldownHours) && envCooldownHours > 0
        ? Math.round(envCooldownHours)
        : 24,
      requireManualApprovalForDowntimeAlerts: true,
      ...policyConfig,
    };

    globalForPipeline.__merchantPulsePipeline = new RevenuePipelineOrchestrator({
      factStore,
      detector,
      strategyProvider,
      policyEngine,
      dispatcher,
      auditLedger: globalAuditLedger,
      policyConfig: defaultConfig,
      storage,
    });
  }

  return globalForPipeline.__merchantPulsePipeline;
}
