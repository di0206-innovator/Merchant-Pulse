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

    const isLiveConfigured =
      Boolean(process.env.RAZORPAY_KEY_ID) &&
      Boolean(process.env.RAZORPAY_KEY_SECRET) &&
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_YourKeyIdHere' &&
      process.env.RAZORPAY_KEY_SECRET !== 'YourKeySecretHere';

    // Use Live adapter if keys are configured, otherwise Mock adapter
    const razorpayAdapter = isLiveConfigured
      ? new LiveRazorpayClientAdapter()
      : new MockRazorpayClientAdapter();

    const dispatcher = new ActionDispatcher(razorpayAdapter, storage.executionIntents);

    const defaultConfig: MerchantPolicyConfig = {
      merchantId: 'rzp_merchant_pulse',
      allowedActions: [
        'CREATE_PAYMENT_LINK',
        'SEND_PAYMENT_REMINDER',
        'NOTIFY_ALTERNATIVE_METHOD',
        'ESCALATE_TO_OPS',
        'NO_ACTION'
      ],
      maxAutoGmvPaise: 2500000, // ₹25,000 auto limit
      minEvPaise: 2000, // ₹20 min EV
      contactCooldownHours: 24,
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
