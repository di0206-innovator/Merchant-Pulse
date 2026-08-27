import {
  WebhookEventStore,
  WebhookEventRecord,
  OpportunityStore,
  AuditStore,
  ExecutionIntentStore,
  ReconciliationStore,
  RecoveryOutcomeRecord,
} from './interfaces';
import { RevenueOpportunity } from '../domain/opportunity';
import { DecisionAuditRecord } from '../domain/audit';
import { ExecutionIntent, ExecutionRecord } from '../domain/execution';

export class InMemoryWebhookEventStore implements WebhookEventStore {
  private events: Map<string, WebhookEventRecord> = new Map();
  private processedKeys: Set<string> = new Set();

  public async recordEvent(event: WebhookEventRecord): Promise<void> {
    this.events.set(event.eventId, event);
    this.processedKeys.add(event.eventId);
  }

  public async getEventByEventId(eventId: string): Promise<WebhookEventRecord | null> {
    return this.events.get(eventId) || null;
  }

  public async isDuplicate(eventIdOrKey: string): Promise<boolean> {
    return this.processedKeys.has(eventIdOrKey);
  }

  public async clear(): Promise<void> {
    this.events.clear();
    this.processedKeys.clear();
  }
}

export class InMemoryOpportunityStore implements OpportunityStore {
  private opportunities: Map<string, RevenueOpportunity> = new Map();

  public async saveOpportunity(opp: RevenueOpportunity): Promise<void> {
    this.opportunities.set(opp.id, { ...opp });
  }

  public async getOpportunity(id: string): Promise<RevenueOpportunity | null> {
    const opp = this.opportunities.get(id);
    return opp ? { ...opp } : null;
  }

  public async getOpportunities(merchantId?: string): Promise<RevenueOpportunity[]> {
    const list = Array.from(this.opportunities.values());
    if (merchantId) {
      return list.filter(o => o.merchantId === merchantId).sort((a, b) => b.createdAt - a.createdAt);
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  public async getOpportunityByOrderId(orderId: string): Promise<RevenueOpportunity | null> {
    const opp = Array.from(this.opportunities.values()).find(o => o.orderId === orderId);
    return opp ? { ...opp } : null;
  }

  public async clear(): Promise<void> {
    this.opportunities.clear();
  }
}

export class InMemoryAuditStore implements AuditStore {
  private records: Map<string, DecisionAuditRecord> = new Map();

  public async recordDecision(record: DecisionAuditRecord): Promise<void> {
    this.records.set(record.decisionId, { ...record });
  }

  public async getRecordByDecisionId(decisionId: string): Promise<DecisionAuditRecord | null> {
    const r = this.records.get(decisionId);
    return r ? { ...r } : null;
  }

  public async getRecordByOpportunityId(opportunityId: string): Promise<DecisionAuditRecord | null> {
    const r = Array.from(this.records.values()).find(rec => rec.opportunityId === opportunityId);
    return r ? { ...r } : null;
  }

  public async getRecordByPaymentLinkId(paymentLinkId: string): Promise<DecisionAuditRecord | null> {
    const r = Array.from(this.records.values()).find(rec => rec.executedActionId === paymentLinkId);
    return r ? { ...r } : null;
  }

  public async getAllRecords(merchantId?: string): Promise<DecisionAuditRecord[]> {
    const list = Array.from(this.records.values());
    if (merchantId) {
      return list.filter(r => r.merchantId === merchantId).sort((a, b) => b.timestamp - a.timestamp);
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  public async updateOutcome(decisionId: string, outcome: DecisionAuditRecord['outcome']): Promise<void> {
    const record = this.records.get(decisionId);
    if (record) {
      record.outcome = outcome;
      this.records.set(decisionId, record);
    }
  }

  public async clear(): Promise<void> {
    this.records.clear();
  }
}

export class InMemoryExecutionIntentStore implements ExecutionIntentStore {
  private intents: Map<string, ExecutionIntent> = new Map();

  public async getIntent(intentKey: string): Promise<ExecutionIntent | null> {
    const intent = this.intents.get(intentKey);
    return intent ? { ...intent } : null;
  }

  public async registerIntent(intent: ExecutionIntent): Promise<void> {
    this.intents.set(intent.intentKey, { ...intent });
  }

  public async updateIntentState(
    intentKey: string,
    state: ExecutionIntent['state'],
    record?: ExecutionRecord
  ): Promise<void> {
    const intent = this.intents.get(intentKey);
    if (intent) {
      intent.state = state;
      if (record) intent.record = record;
      intent.updatedAt = Math.floor(Date.now() / 1000);
      this.intents.set(intentKey, intent);
    }
  }

  public async clear(): Promise<void> {
    this.intents.clear();
  }
}

export class InMemoryReconciliationStore implements ReconciliationStore {
  private outcomes: Map<string, RecoveryOutcomeRecord> = new Map();
  private reconciledDecisions: Set<string> = new Set();
  private reconciledPayments: Set<string> = new Set();

  public async recordOutcome(outcome: RecoveryOutcomeRecord): Promise<void> {
    this.outcomes.set(outcome.decisionId, { ...outcome });
    if (outcome.status === 'RECOVERED') {
      this.reconciledDecisions.add(outcome.decisionId);
      if (outcome.reconciledPaymentId) {
        this.reconciledPayments.add(outcome.reconciledPaymentId);
      }
    }
  }

  public async getOutcomeByDecisionId(decisionId: string): Promise<RecoveryOutcomeRecord | null> {
    const outcome = this.outcomes.get(decisionId);
    return outcome ? { ...outcome } : null;
  }

  public async getOutcomes(merchantId?: string): Promise<RecoveryOutcomeRecord[]> {
    const list = Array.from(this.outcomes.values());
    if (merchantId) {
      return list.filter(o => o.merchantId === merchantId).sort((a, b) => b.reconciledAt - a.reconciledAt);
    }
    return list.sort((a, b) => b.reconciledAt - a.reconciledAt);
  }

  public async isDecisionReconciled(decisionId: string): Promise<boolean> {
    return this.reconciledDecisions.has(decisionId);
  }

  public async isPaymentReconciled(paymentId: string): Promise<boolean> {
    return this.reconciledPayments.has(paymentId);
  }

  public async clear(): Promise<void> {
    this.outcomes.clear();
    this.reconciledDecisions.clear();
    this.reconciledPayments.clear();
  }
}
