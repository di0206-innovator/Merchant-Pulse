import { RevenuePipelineOrchestrator } from './orchestrator';
import { RevenueFactStore } from '../revenue/factStore';
import { RevenueOpportunityDetector } from '../revenue/detector';
import { getStrategyProvider } from '../strategy';
import { PolicyEngine } from '../policy/evaluator';
import { ActionDispatcher } from '../execution/dispatcher';
import { MockRazorpayClientAdapter, LiveRazorpayClientAdapter } from '../../integrations/razorpay/client';
import { globalAuditLedger } from '../audit/ledger';
import { MerchantPolicyConfig } from '../domain/policy';

export * from './orchestrator';

let globalPipelineInstance: RevenuePipelineOrchestrator | null = null;

export function getGlobalPipeline(policyConfig?: Partial<MerchantPolicyConfig>): RevenuePipelineOrchestrator {
  if (!globalPipelineInstance) {
    const factStore = new RevenueFactStore();
    const detector = new RevenueOpportunityDetector(factStore);
    const strategyProvider = getStrategyProvider(true);
    const policyEngine = new PolicyEngine();

    // Use Live adapter if keys are configured, otherwise Mock adapter
    const razorpayAdapter = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_YourKeyIdHere'
      ? new LiveRazorpayClientAdapter()
      : new MockRazorpayClientAdapter();

    const dispatcher = new ActionDispatcher(razorpayAdapter);

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

    globalPipelineInstance = new RevenuePipelineOrchestrator({
      factStore,
      detector,
      strategyProvider,
      policyEngine,
      dispatcher,
      auditLedger: globalAuditLedger,
      policyConfig: defaultConfig,
    });
  }

  return globalPipelineInstance;
}
