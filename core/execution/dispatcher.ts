import { RazorpayClientAdapter } from '../../integrations/razorpay/client';
import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation } from '../domain/strategy';
import { ExecutionRecord, ExecutionRecordSchema } from '../domain/execution';

export type ExecutionIntentState = 
  | 'EXECUTION_REQUESTED'
  | 'EXECUTION_IN_FLIGHT'
  | 'EXECUTION_SUCCEEDED'
  | 'EXECUTION_FAILED';

export interface ExecutionIntent {
  intentKey: string;
  opportunityId: string;
  actionType: string;
  state: ExecutionIntentState;
  record?: ExecutionRecord;
  updatedAt: number;
}

export class ActionDispatcher {
  private executionIntents: Map<string, ExecutionIntent> = new Map();

  constructor(private razorpayClient: RazorpayClientAdapter) {}

  public async execute(
    opportunity: RevenueOpportunity,
    recommendation: StrategyRecommendation
  ): Promise<ExecutionRecord> {
    const now = Math.floor(Date.now() / 1000);
    const intentKey = `intent_${opportunity.merchantId}_${opportunity.id}_${recommendation.recommendedActionType}`;

    // 1. Execution Intent Idempotency Check
    const existingIntent = this.executionIntents.get(intentKey);
    if (existingIntent) {
      if (existingIntent.state === 'EXECUTION_SUCCEEDED' && existingIntent.record) {
        return existingIntent.record;
      }
      if (existingIntent.state === 'EXECUTION_IN_FLIGHT') {
        // Prevent concurrent execution loop
        return ExecutionRecordSchema.parse({
          id: `exec_in_flight_${existingIntent.intentKey}`,
          opportunityId: opportunity.id,
          actionType: recommendation.recommendedActionType,
          status: 'SKIPPED',
          payloadSent: {},
          errorMessage: 'Execution already in-flight for this opportunity.',
          executedAt: now,
        });
      }
    }

    // 2. Register IN_FLIGHT Intent
    this.executionIntents.set(intentKey, {
      intentKey,
      opportunityId: opportunity.id,
      actionType: recommendation.recommendedActionType,
      state: 'EXECUTION_IN_FLIGHT',
      updatedAt: now,
    });

    const executionId = `exec_${Buffer.from(`${opportunity.id}_${now}`).toString('hex').slice(0, 14)}`;

    if (recommendation.recommendedActionType === 'NO_ACTION') {
      const record = ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: 'NO_ACTION',
        status: 'SKIPPED',
        payloadSent: {},
        executedAt: now,
      });
      this.executionIntents.set(intentKey, {
        intentKey,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        state: 'EXECUTION_SUCCEEDED',
        record,
        updatedAt: now,
      });
      return record;
    }

    try {
      if (recommendation.recommendedActionType === 'CREATE_PAYMENT_LINK' ||
          recommendation.recommendedActionType === 'SEND_PAYMENT_REMINDER' ||
          recommendation.recommendedActionType === 'NOTIFY_ALTERNATIVE_METHOD') {
        
        const referenceId = `mp_rec_${opportunity.id.slice(4)}`;
        const amountInr = (opportunity.amountPaise / 100).toFixed(2);
        const description = recommendation.customerMessaging?.smsText
          ? `Order Recovery: ₹${amountInr}`
          : `Recovery for Order #${opportunity.orderId || 'Checkout'}`;

        const payloadSent = {
          amountPaise: opportunity.amountPaise,
          referenceId,
          description,
          customer: {
            name: opportunity.customerName,
            email: opportunity.customerEmail,
            contact: opportunity.customerContact,
          },
          notify: {
            sms: Boolean(opportunity.customerContact),
            email: Boolean(opportunity.customerEmail),
          },
          expireByMinutes: recommendation.suggestedExpiryMinutes || 120,
        };

        const linkResponse = await this.razorpayClient.createPaymentLink(payloadSent);

        const record = ExecutionRecordSchema.parse({
          id: executionId,
          opportunityId: opportunity.id,
          actionType: recommendation.recommendedActionType,
          status: 'SUCCESS',
          razorpayReferenceId: linkResponse.id,
          razorpayShortUrl: linkResponse.shortUrl,
          payloadSent,
          responseReceived: linkResponse as unknown as Record<string, unknown>,
          executedAt: now,
        });

        this.executionIntents.set(intentKey, {
          intentKey,
          opportunityId: opportunity.id,
          actionType: recommendation.recommendedActionType,
          state: 'EXECUTION_SUCCEEDED',
          record,
          updatedAt: now,
        });

        return record;
      }

      const record = ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        status: 'SKIPPED',
        payloadSent: {},
        executedAt: now,
      });
      this.executionIntents.set(intentKey, {
        intentKey,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        state: 'EXECUTION_SUCCEEDED',
        record,
        updatedAt: now,
      });
      return record;
    } catch (err: any) {
      console.error('[ActionDispatcher] Execution failure:', err);
      const record = ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        status: 'FAILED',
        payloadSent: {},
        errorMessage: err?.message || 'Unknown Razorpay execution failure',
        executedAt: now,
      });
      this.executionIntents.set(intentKey, {
        intentKey,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        state: 'EXECUTION_FAILED',
        record,
        updatedAt: now,
      });
      return record;
    }
  }

  public clear(): void {
    this.executionIntents.clear();
  }
}
