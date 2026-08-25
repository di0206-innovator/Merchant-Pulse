import crypto from 'node:crypto';
import { PaymentEntity, OrderEntity } from '../domain/payment';
import { RevenueOpportunity, OpportunityType, OpportunityEvidence } from '../domain/opportunity';
import { calculateExpectedValue } from './expectedValue';
import { RevenueFactStore } from './factStore';

export class RevenueOpportunityDetector {
  constructor(private factStore: RevenueFactStore) {}

  /**
   * Analyzes a failed payment event to identify if an actionable revenue opportunity exists.
   */
  public detectFromPaymentFailure(
    payment: PaymentEntity,
    eventId: string,
    merchantId: string = 'rzp_merchant_main'
  ): RevenueOpportunity | null {
    // Basic criteria: payment must be in failed status and have positive amount
    if (payment.status !== 'failed' || payment.amountPaise <= 0) {
      return null;
    }

    const customerKey = payment.contact || payment.email || '';
    const customer = customerKey ? this.factStore.getCustomer(customerKey) : undefined;
    const consecutiveFailures = customer ? customer.failedOrders : 1;
    const customerLtvPaise = customer ? customer.ltvPaise : 0;

    // Check gateway degradation for this payment's method/bank
    const methodHealth = this.factStore.getMethodHealthStats().find(
      s => s.method === payment.method && (!payment.bank || s.bank === payment.bank)
    );

    const isDegraded = methodHealth?.isDegraded || false;
    const failureCode = payment.error?.code || 'GATEWAY_ERROR';

    // Determine Opportunity Type
    let type: OpportunityType = 'HIGH_VALUE_DROPOFF';
    if (isDegraded) {
      type = 'PAYMENT_METHOD_DEGRADATION';
    } else if (customerLtvPaise >= 500000 && consecutiveFailures >= 2) {
      type = 'CUSTOMER_CHURN_RISK';
    } else if (payment.method === 'card' && consecutiveFailures >= 2) {
      type = 'RETRIED_CARD_FAILURE';
    } else if (payment.amountPaise >= 100000) {
      type = 'HIGH_VALUE_DROPOFF';
    }

    const evidence: OpportunityEvidence = {
      failureCode,
      failureDescription: payment.error?.description || 'Transaction failed during processing',
      paymentMethod: payment.method,
      bankOrIssuer: payment.bank || undefined,
      consecutiveFailures,
      methodDowntimeRatePct: methodHealth?.failureRatePct,
      customerLtvPaise,
      historicalRecoveryRatePct: 62,
      intentScore: 0.85,
    };

    const expectedValue = calculateExpectedValue(payment.amountPaise, {
      failureCode,
      paymentMethod: payment.method,
      consecutiveFailures,
      customerLtvPaise,
      intentScore: 0.85,
    });

    const now = Math.floor(Date.now() / 1000);
    const hash = crypto.createHash('sha256').update(payment.id).digest('hex').slice(0, 14);
    const opportunityId = `opp_${hash}`;

    return {
      id: opportunityId,
      merchantId,
      type,
      status: 'DETECTED',
      triggerEventId: eventId,
      orderId: payment.orderId,
      paymentId: payment.id,
      customerId: customer?.id,
      customerName: undefined,
      customerContact: payment.contact,
      customerEmail: payment.email,
      amountPaise: payment.amountPaise,
      evidence,
      expectedValue,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Detects abandoned checkouts from unfulfilled orders.
   */
  public detectFromAbandonedOrder(
    order: OrderEntity,
    eventId: string,
    customerEmail?: string,
    customerContact?: string,
    merchantId: string = 'rzp_merchant_main'
  ): RevenueOpportunity | null {
    if (order.status !== 'created' || order.amountPaise <= 0) {
      return null;
    }

    const evidence: OpportunityEvidence = {
      failureCode: 'CHECKOUT_ABANDONMENT',
      failureDescription: 'Order created but checkout payment not completed within 30 minutes',
      consecutiveFailures: 1,
      customerLtvPaise: 0,
      historicalRecoveryRatePct: 42,
      intentScore: 0.70,
    };

    const expectedValue = calculateExpectedValue(order.amountPaise, {
      failureCode: 'CHECKOUT_ABANDONMENT',
      consecutiveFailures: 1,
      customerLtvPaise: 0,
      intentScore: 0.70,
    });

    const now = Math.floor(Date.now() / 1000);
    const opportunityId = `opp_${Buffer.from(`${order.id}_${now}`).toString('hex').slice(0, 14)}`;

    return {
      id: opportunityId,
      merchantId,
      type: 'ABANDONED_CHECKOUT',
      status: 'DETECTED',
      triggerEventId: eventId,
      orderId: order.id,
      paymentId: undefined,
      customerId: undefined,
      customerName: undefined,
      customerContact,
      customerEmail,
      amountPaise: order.amountPaise,
      evidence,
      expectedValue,
      createdAt: now,
      updatedAt: now,
    };
  }
}
