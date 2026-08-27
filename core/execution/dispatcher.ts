import { RazorpayClientAdapter } from '../../integrations/razorpay/client';
import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation } from '../domain/strategy';
import {
  ExecutionRecord,
  ExecutionRecordSchema,
  ExecutionIntent,
  ExecutionIntentState,
} from '../domain/execution';
import { ExecutionIntentStore } from '../storage/interfaces';

export class ActionDispatcher {
  private inFlightPromises: Map<string, Promise<ExecutionRecord>> = new Map();
  private inMemoryIntents: Map<string, ExecutionIntent> = new Map();

  constructor(
    private razorpayClient: RazorpayClientAdapter,
    private intentStore?: ExecutionIntentStore
  ) {}

  public async execute(
    opportunity: RevenueOpportunity,
    recommendation: StrategyRecommendation
  ): Promise<ExecutionRecord> {
    const intentKey = `intent_${opportunity.merchantId}_${opportunity.id}_${recommendation.recommendedActionType}`;

    // 1. If an execution promise is currently active, return it immediately so all concurrent callers share the result
    const activePromise = this.inFlightPromises.get(intentKey);
    if (activePromise) {
      return activePromise;
    }

    // 2. Check existing in-memory completed intent
    const existingIntent = this.inMemoryIntents.get(intentKey);
    if (existingIntent && existingIntent.state === 'EXECUTION_SUCCEEDED' && existingIntent.record) {
      return existingIntent.record;
    }

    // 3. Create and register in-flight promise synchronously before yielding event loop
    const executionPromise = this.performExecution(opportunity, recommendation, intentKey);
    this.inFlightPromises.set(intentKey, executionPromise);

    try {
      const record = await executionPromise;
      return record;
    } finally {
      this.inFlightPromises.delete(intentKey);
    }
  }

  private async performExecution(
    opportunity: RevenueOpportunity,
    recommendation: StrategyRecommendation,
    intentKey: string
  ): Promise<ExecutionRecord> {
    const now = Math.floor(Date.now() / 1000);

    // Register initial IN_FLIGHT intent
    const initialIntent: ExecutionIntent = {
      intentKey,
      opportunityId: opportunity.id,
      merchantId: opportunity.merchantId,
      actionType: recommendation.recommendedActionType,
      state: 'EXECUTION_IN_FLIGHT',
      createdAt: now,
      updatedAt: now,
    };
    this.inMemoryIntents.set(intentKey, initialIntent);
    if (this.intentStore) {
      this.intentStore.registerIntent(initialIntent).catch(err => {
        console.error('[ActionDispatcher] Register intent store error:', err);
      });
    }

    const executionId = `exec_${Buffer.from(`${opportunity.id}_${now}`).toString('hex').slice(0, 14)}`;

    if (recommendation.recommendedActionType === 'NO_ACTION' || recommendation.recommendedActionType === 'ESCALATE_TO_OPS') {
      const record = ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        status: 'SKIPPED',
        payloadSent: {},
        executedAt: now,
      });

      this.finalizeIntent(intentKey, 'EXECUTION_SUCCEEDED', record);
      return record;
    }

    try {
      if (
        recommendation.recommendedActionType === 'CREATE_PAYMENT_LINK' ||
        recommendation.recommendedActionType === 'SEND_PAYMENT_REMINDER' ||
        recommendation.recommendedActionType === 'NOTIFY_ALTERNATIVE_METHOD'
      ) {
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

        this.finalizeIntent(intentKey, 'EXECUTION_SUCCEEDED', record);
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

      this.finalizeIntent(intentKey, 'EXECUTION_SUCCEEDED', record);
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

      this.finalizeIntent(intentKey, 'EXECUTION_FAILED', record);
      return record;
    }
  }

  private finalizeIntent(
    intentKey: string,
    state: ExecutionIntentState,
    record: ExecutionRecord
  ): void {
    const memory = this.inMemoryIntents.get(intentKey);
    if (memory) {
      memory.state = state;
      memory.record = record;
      memory.updatedAt = Math.floor(Date.now() / 1000);
      this.inMemoryIntents.set(intentKey, memory);
    }

    if (this.intentStore) {
      this.intentStore.updateIntentState(intentKey, state, record).catch(err => {
        console.error('[ActionDispatcher] Update intent store error:', err);
      });
    }
  }

  public clear(): void {
    this.inFlightPromises.clear();
    this.inMemoryIntents.clear();
  }
}
