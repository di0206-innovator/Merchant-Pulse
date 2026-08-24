import { DecisionAuditRecord, DecisionAuditRecordSchema } from '../domain/audit';

export class AuditLedger {
  private records: Map<string, DecisionAuditRecord> = new Map();
  private recordsByOpportunityId: Map<string, string> = new Map();
  private recordsByPaymentLinkId: Map<string, string> = new Map();

  public recordDecision(record: DecisionAuditRecord): void {
    const validated = DecisionAuditRecordSchema.parse(record);
    this.records.set(validated.decisionId, validated);
    this.recordsByOpportunityId.set(validated.opportunityId, validated.decisionId);

    if (validated.executedActionId) {
      this.recordsByPaymentLinkId.set(validated.executedActionId, validated.decisionId);
    }
  }

  public getRecord(decisionId: string): DecisionAuditRecord | undefined {
    return this.records.get(decisionId);
  }

  public getRecordByOpportunityId(opportunityId: string): DecisionAuditRecord | undefined {
    const decisionId = this.recordsByOpportunityId.get(opportunityId);
    return decisionId ? this.records.get(decisionId) : undefined;
  }

  public getRecordByPaymentLinkId(paymentLinkId: string): DecisionAuditRecord | undefined {
    const decisionId = this.recordsByPaymentLinkId.get(paymentLinkId);
    return decisionId ? this.records.get(decisionId) : undefined;
  }

  public updateOutcome(
    decisionId: string,
    outcome: {
      status: 'RECOVERED' | 'EXPIRED' | 'CANCELLED';
      recoveredAmountPaise?: number;
      resolvedAt?: number;
      resolutionEventId?: string;
    }
  ): boolean {
    const record = this.records.get(decisionId);
    if (!record) return false;

    record.outcome = {
      status: outcome.status,
      recoveredAmountPaise: outcome.recoveredAmountPaise,
      resolvedAt: outcome.resolvedAt || Math.floor(Date.now() / 1000),
      resolutionEventId: outcome.resolutionEventId,
    };

    this.records.set(decisionId, record);
    return true;
  }

  public getAllRecords(): DecisionAuditRecord[] {
    return Array.from(this.records.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public clear(): void {
    this.records.clear();
    this.recordsByOpportunityId.clear();
    this.recordsByPaymentLinkId.clear();
  }
}

export const globalAuditLedger = new AuditLedger();
