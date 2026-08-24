import { RazorpayClientAdapter } from '../../integrations/razorpay/client';
import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation } from '../domain/strategy';
import { ExecutionRecord, ExecutionRecordSchema } from '../domain/execution';

export class ActionDispatcher {
  constructor(private razorpayClient: RazorpayClientAdapter) {}

  public async execute(
    opportunity: RevenueOpportunity,
    recommendation: StrategyRecommendation
  ): Promise<ExecutionRecord> {
    const now = Math.floor(Date.now() / 1000);
    const executionId = `exec_${Buffer.from(`${opportunity.id}_${now}`).toString('hex').slice(0, 14)}`;

    if (recommendation.recommendedActionType === 'NO_ACTION') {
      return ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: 'NO_ACTION',
        status: 'SKIPPED',
        payloadSent: {},
        executedAt: now,
      });
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

        return ExecutionRecordSchema.parse({
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
      }

      // Default skip for non-API actions
      return ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        status: 'SKIPPED',
        payloadSent: {},
        executedAt: now,
      });
    } catch (err: any) {
      console.error('[ActionDispatcher] Execution failure:', err);
      return ExecutionRecordSchema.parse({
        id: executionId,
        opportunityId: opportunity.id,
        actionType: recommendation.recommendedActionType,
        status: 'FAILED',
        payloadSent: {},
        errorMessage: err?.message || 'Unknown Razorpay execution failure',
        executedAt: now,
      });
    }
  }
}
