import { RevenueOpportunity } from '../domain/opportunity';
import { DecisionAuditRecord } from '../domain/audit';
import { ExecutionIntent, ExecutionRecord } from '../domain/execution';
import { PaymentEntity } from '../domain/payment';
import { StrategyRecommendation } from '../domain/strategy';
import { PolicyEvaluationResult } from '../domain/policy';

export interface WebhookEventRecord {
  id: string;
  eventId: string;
  eventType: string;
  merchantId: string;
  rawPayload: Record<string, unknown>;
  signature?: string;
  signatureVerified: boolean;
  processedStatus: 'PENDING' | 'ACCEPTED' | 'DUPLICATE_IGNORED' | 'UNHANDLED_EVENT_TYPE' | 'FAILED';
  errorMessage?: string;
  receivedAt: number;
}

export interface RecoveryOutcomeRecord {
  decisionId: string;
  opportunityId: string;
  merchantId: string;
  attributionType: 'ATTRIBUTED_INTERVENTION' | 'ORGANIC_RECOVERY' | 'REJECTED_UNATTRIBUTED';
  status: 'RECOVERED' | 'EXPIRED' | 'PENDING' | 'REJECTED';
  reconciledAmountPaise: number;
  resolutionEventId?: string;
  reconciledPaymentId?: string;
  notes?: string;
  reconciledAt: number;
}

export interface WebhookEventStore {
  recordEvent(event: WebhookEventRecord): Promise<void>;
  getEventByEventId(eventId: string): Promise<WebhookEventRecord | null>;
  isDuplicate(eventIdOrKey: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface OpportunityStore {
  saveOpportunity(opp: RevenueOpportunity): Promise<void>;
  getOpportunity(id: string): Promise<RevenueOpportunity | null>;
  getOpportunities(merchantId?: string): Promise<RevenueOpportunity[]>;
  getOpportunityByOrderId(orderId: string): Promise<RevenueOpportunity | null>;
  clear(): Promise<void>;
}

export interface AuditStore {
  recordDecision(record: DecisionAuditRecord): Promise<void>;
  getRecordByDecisionId(decisionId: string): Promise<DecisionAuditRecord | null>;
  getRecordByOpportunityId(opportunityId: string): Promise<DecisionAuditRecord | null>;
  getRecordByPaymentLinkId(paymentLinkId: string): Promise<DecisionAuditRecord | null>;
  getAllRecords(merchantId?: string): Promise<DecisionAuditRecord[]>;
  updateOutcome(decisionId: string, outcome: DecisionAuditRecord['outcome']): Promise<void>;
  clear(): Promise<void>;
}

export interface ExecutionIntentStore {
  getIntent(intentKey: string): Promise<ExecutionIntent | null>;
  registerIntent(intent: ExecutionIntent): Promise<void>;
  updateIntentState(
    intentKey: string,
    state: ExecutionIntent['state'],
    record?: ExecutionRecord
  ): Promise<void>;
  clear(): Promise<void>;
}

export interface ReconciliationStore {
  recordOutcome(outcome: RecoveryOutcomeRecord): Promise<void>;
  getOutcomeByDecisionId(decisionId: string): Promise<RecoveryOutcomeRecord | null>;
  getOutcomes(merchantId?: string): Promise<RecoveryOutcomeRecord[]>;
  isDecisionReconciled(decisionId: string): Promise<boolean>;
  isPaymentReconciled(paymentId: string): Promise<boolean>;
  clear(): Promise<void>;
}
