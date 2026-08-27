import { SupabaseClient } from '@supabase/supabase-js';
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

export class SupabaseWebhookEventStore implements WebhookEventStore {
  constructor(private client: SupabaseClient) {}

  public async recordEvent(event: WebhookEventRecord): Promise<void> {
    const { error } = await this.client.from('webhook_events').insert({
      event_id: event.eventId,
      event_type: event.eventType,
      merchant_id: event.merchantId,
      raw_payload: event.rawPayload,
      signature: event.signature,
      signature_verified: event.signatureVerified,
      processed_status: event.processedStatus,
      error_message: event.errorMessage,
      received_at: new Date(event.receivedAt).toISOString(),
    });
    if (error && error.code !== '23505') {
      console.error('[SupabaseWebhookEventStore] Insert error:', error);
    }
  }

  public async getEventByEventId(eventId: string): Promise<WebhookEventRecord | null> {
    const { data, error } = await this.client
      .from('webhook_events')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      eventId: data.event_id,
      eventType: data.event_type,
      merchantId: data.merchant_id,
      rawPayload: data.raw_payload,
      signature: data.signature,
      signatureVerified: data.signature_verified,
      processedStatus: data.processed_status,
      errorMessage: data.error_message,
      receivedAt: new Date(data.received_at).getTime(),
    };
  }

  public async isDuplicate(eventIdOrKey: string): Promise<boolean> {
    const existing = await this.getEventByEventId(eventIdOrKey);
    return existing !== null;
  }

  public async clear(): Promise<void> {
    await this.client.from('webhook_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}

export class SupabaseOpportunityStore implements OpportunityStore {
  constructor(private client: SupabaseClient) {}

  public async saveOpportunity(opp: RevenueOpportunity): Promise<void> {
    const { error } = await this.client.from('revenue_opportunities').upsert({
      id: opp.id,
      merchant_id: opp.merchantId,
      order_id: opp.orderId,
      amount_paise: opp.amountPaise,
      type: opp.type,
      status: opp.status,
      customer_name: opp.customerName,
      customer_contact: opp.customerContact,
      customer_email: opp.customerEmail,
      p_success: opp.expectedValue.pSuccess,
      recoverable_gmv_paise: opp.expectedValue.recoverableGmvPaise,
      intervention_cost_paise: opp.expectedValue.estimatedInterventionCostPaise,
      net_expected_value_paise: opp.expectedValue.netExpectedValuePaise,
      evidence: opp.evidence as any,
      created_at: new Date(opp.createdAt * 1000).toISOString(),
      updated_at: new Date(opp.updatedAt * 1000).toISOString(),
    });

    if (error) {
      console.error('[SupabaseOpportunityStore] Save error:', error);
    }
  }

  public async getOpportunity(id: string): Promise<RevenueOpportunity | null> {
    const { data, error } = await this.client
      .from('revenue_opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToOpportunity(data);
  }

  public async getOpportunities(merchantId?: string): Promise<RevenueOpportunity[]> {
    let query = this.client.from('revenue_opportunities').select('*').order('created_at', { ascending: false });
    if (merchantId) {
      query = query.eq('merchant_id', merchantId);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(row => this.mapRowToOpportunity(row));
  }

  public async getOpportunityByOrderId(orderId: string): Promise<RevenueOpportunity | null> {
    const { data, error } = await this.client
      .from('revenue_opportunities')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToOpportunity(data);
  }

  public async clear(): Promise<void> {
    await this.client.from('revenue_opportunities').delete().neq('id', '');
  }

  private mapRowToOpportunity(data: any): RevenueOpportunity {
    return {
      id: data.id,
      merchantId: data.merchant_id,
      orderId: data.order_id,
      amountPaise: Number(data.amount_paise),
      type: data.type,
      status: data.status,
      triggerEventId: `evt_${data.id}`,
      customerName: data.customer_name,
      customerContact: data.customer_contact,
      customerEmail: data.customer_email,
      expectedValue: {
        pSuccess: Number(data.p_success),
        recoverableGmvPaise: Number(data.recoverable_gmv_paise),
        estimatedInterventionCostPaise: Number(data.intervention_cost_paise || 130),
        customerFatiguePenaltyPaise: 0,
        netExpectedValuePaise: Number(data.net_expected_value_paise),
        isProfitable: Number(data.net_expected_value_paise) > 0,
      },
      evidence: {
        consecutiveFailures: 1,
        customerLtvPaise: 0,
        historicalRecoveryRatePct: 50,
        intentScore: 0.8,
        ...(data.evidence || {}),
      },
      createdAt: Math.floor(new Date(data.created_at).getTime() / 1000),
      updatedAt: Math.floor(new Date(data.updated_at).getTime() / 1000),
    };
  }
}

export class SupabaseAuditStore implements AuditStore {
  constructor(private client: SupabaseClient) {}

  public async recordDecision(record: DecisionAuditRecord): Promise<void> {
    const { error } = await this.client.from('audit_events').insert({
      decision_id: record.decisionId,
      opportunity_id: record.opportunityId,
      event_id: record.eventId,
      merchant_id: record.merchantId,
      action_status: record.actionStatus,
      executed_action_id: record.executedActionId,
      deterministic_metrics: record.deterministicMetrics,
      ai_recommendation: record.aiRecommendation,
      policy_result: record.policyResult,
      outcome: record.outcome,
      recorded_at: new Date(record.timestamp * 1000).toISOString(),
    });

    if (error) {
      console.error('[SupabaseAuditStore] Insert error:', error);
    }
  }

  public async getRecordByDecisionId(decisionId: string): Promise<DecisionAuditRecord | null> {
    const { data, error } = await this.client
      .from('audit_events')
      .select('*')
      .eq('decision_id', decisionId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToAudit(data);
  }

  public async getRecordByOpportunityId(opportunityId: string): Promise<DecisionAuditRecord | null> {
    const { data, error } = await this.client
      .from('audit_events')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToAudit(data);
  }

  public async getRecordByPaymentLinkId(paymentLinkId: string): Promise<DecisionAuditRecord | null> {
    const { data, error } = await this.client
      .from('audit_events')
      .select('*')
      .eq('executed_action_id', paymentLinkId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToAudit(data);
  }

  public async getAllRecords(merchantId?: string): Promise<DecisionAuditRecord[]> {
    let query = this.client.from('audit_events').select('*').order('recorded_at', { ascending: false });
    if (merchantId) {
      query = query.eq('merchant_id', merchantId);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(r => this.mapRowToAudit(r));
  }

  public async updateOutcome(decisionId: string, outcome: DecisionAuditRecord['outcome']): Promise<void> {
    const { error } = await this.client
      .from('audit_events')
      .update({ outcome })
      .eq('decision_id', decisionId);

    if (error) {
      console.error('[SupabaseAuditStore] Update outcome error:', error);
    }
  }

  public async clear(): Promise<void> {
    await this.client.from('audit_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  private mapRowToAudit(data: any): DecisionAuditRecord {
    return {
      decisionId: data.decision_id,
      opportunityId: data.opportunity_id,
      eventId: data.event_id,
      merchantId: data.merchant_id,
      timestamp: Math.floor(new Date(data.recorded_at).getTime() / 1000),
      deterministicMetrics: data.deterministic_metrics,
      aiRecommendation: data.ai_recommendation,
      policyResult: data.policy_result,
      actionStatus: data.action_status,
      executedActionId: data.executed_action_id,
      outcome: data.outcome,
    };
  }
}

export class SupabaseExecutionIntentStore implements ExecutionIntentStore {
  constructor(private client: SupabaseClient) {}

  public async getIntent(intentKey: string): Promise<ExecutionIntent | null> {
    const { data, error } = await this.client
      .from('execution_intents')
      .select('*')
      .eq('intent_key', intentKey)
      .maybeSingle();

    if (error || !data) return null;

    let record: ExecutionRecord | undefined;
    if (data.execution_record_id) {
      const { data: recData } = await this.client
        .from('execution_records')
        .select('*')
        .eq('id', data.execution_record_id)
        .maybeSingle();

      if (recData) {
        record = {
          id: recData.id,
          opportunityId: recData.opportunity_id,
          actionType: recData.action_type,
          status: recData.status,
          razorpayReferenceId: recData.razorpay_reference_id,
          razorpayShortUrl: recData.razorpay_short_url,
          payloadSent: recData.payload_sent,
          responseReceived: recData.response_received,
          errorMessage: recData.error_message,
          executedAt: Math.floor(new Date(recData.executed_at).getTime() / 1000),
        };
      }
    }

    return {
      intentKey: data.intent_key,
      opportunityId: data.opportunity_id,
      merchantId: data.merchant_id,
      actionType: data.action_type,
      state: data.state,
      record,
      createdAt: Math.floor(new Date(data.created_at).getTime() / 1000),
      updatedAt: Math.floor(new Date(data.updated_at).getTime() / 1000),
    };
  }

  public async registerIntent(intent: ExecutionIntent): Promise<void> {
    const { error } = await this.client.from('execution_intents').upsert({
      intent_key: intent.intentKey,
      opportunity_id: intent.opportunityId,
      merchant_id: intent.merchantId,
      action_type: intent.actionType,
      state: intent.state,
      created_at: new Date(intent.createdAt * 1000).toISOString(),
      updated_at: new Date(intent.updatedAt * 1000).toISOString(),
    });

    if (error) {
      console.error('[SupabaseExecutionIntentStore] Register intent error:', error);
    }
  }

  public async updateIntentState(
    intentKey: string,
    state: ExecutionIntent['state'],
    record?: ExecutionRecord
  ): Promise<void> {
    let executionRecordId: string | undefined;

    if (record) {
      executionRecordId = record.id;
      await this.client.from('execution_records').upsert({
        id: record.id,
        opportunity_id: record.opportunityId,
        merchant_id: 'rzp_merchant_main',
        action_type: record.actionType,
        status: record.status,
        razorpay_reference_id: record.razorpayReferenceId,
        razorpay_short_url: record.razorpayShortUrl,
        payload_sent: record.payloadSent,
        response_received: record.responseReceived || {},
        error_message: record.errorMessage,
        executed_at: new Date(record.executedAt * 1000).toISOString(),
      });
    }

    const { error } = await this.client
      .from('execution_intents')
      .update({
        state,
        execution_record_id: executionRecordId,
        updated_at: new Date().toISOString(),
      })
      .eq('intent_key', intentKey);

    if (error) {
      console.error('[SupabaseExecutionIntentStore] Update intent state error:', error);
    }
  }

  public async clear(): Promise<void> {
    await this.client.from('execution_intents').delete().neq('intent_key', '');
    await this.client.from('execution_records').delete().neq('id', '');
  }
}

export class SupabaseReconciliationStore implements ReconciliationStore {
  constructor(private client: SupabaseClient) {}

  public async recordOutcome(outcome: RecoveryOutcomeRecord): Promise<void> {
    const { error } = await this.client.from('recovery_outcomes').upsert({
      decision_id: outcome.decisionId,
      opportunity_id: outcome.opportunityId,
      merchant_id: outcome.merchantId,
      attribution_type: outcome.attributionType,
      status: outcome.status,
      reconciled_amount_paise: outcome.reconciledAmountPaise,
      resolution_event_id: outcome.resolutionEventId,
      reconciled_payment_id: outcome.reconciledPaymentId,
      notes: outcome.notes,
      reconciled_at: new Date(outcome.reconciledAt * 1000).toISOString(),
    });

    if (error) {
      console.error('[SupabaseReconciliationStore] Record outcome error:', error);
    }
  }

  public async getOutcomeByDecisionId(decisionId: string): Promise<RecoveryOutcomeRecord | null> {
    const { data, error } = await this.client
      .from('recovery_outcomes')
      .select('*')
      .eq('decision_id', decisionId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      decisionId: data.decision_id,
      opportunityId: data.opportunity_id,
      merchantId: data.merchant_id,
      attributionType: data.attribution_type,
      status: data.status,
      reconciledAmountPaise: Number(data.reconciled_amount_paise),
      resolutionEventId: data.resolution_event_id,
      reconciledPaymentId: data.reconciled_payment_id,
      notes: data.notes,
      reconciledAt: Math.floor(new Date(data.reconciled_at).getTime() / 1000),
    };
  }

  public async getOutcomes(merchantId?: string): Promise<RecoveryOutcomeRecord[]> {
    let query = this.client.from('recovery_outcomes').select('*').order('reconciled_at', { ascending: false });
    if (merchantId) {
      query = query.eq('merchant_id', merchantId);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(d => ({
      decisionId: d.decision_id,
      opportunityId: d.opportunity_id,
      merchantId: d.merchant_id,
      attributionType: d.attribution_type,
      status: d.status,
      reconciledAmountPaise: Number(d.reconciled_amount_paise),
      resolutionEventId: d.resolution_event_id,
      reconciledPaymentId: d.reconciled_payment_id,
      notes: d.notes,
      reconciledAt: Math.floor(new Date(d.reconciled_at).getTime() / 1000),
    }));
  }

  public async isDecisionReconciled(decisionId: string): Promise<boolean> {
    const { data } = await this.client
      .from('recovery_outcomes')
      .select('id')
      .eq('decision_id', decisionId)
      .eq('status', 'RECOVERED')
      .maybeSingle();
    return Boolean(data);
  }

  public async isPaymentReconciled(paymentId: string): Promise<boolean> {
    const { data } = await this.client
      .from('recovery_outcomes')
      .select('id')
      .eq('reconciled_payment_id', paymentId)
      .eq('status', 'RECOVERED')
      .maybeSingle();
    return Boolean(data);
  }

  public async clear(): Promise<void> {
    await this.client.from('recovery_outcomes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}
