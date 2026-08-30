import { hashString, generateRandomHex } from '@/lib/cryptoUtils';
import { PaymentEntity, OrderEntity } from '../domain/payment';
import { RevenueOpportunity, OpportunityType, OpportunityEvidence } from '../domain/opportunity';
import { calculateExpectedValue } from './expectedValue';
import { calculatePriorityScore } from './prioritizer';
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
    let type: OpportunityType = 'FAILED_PAYMENT';
    if (isDegraded) {
      type = 'PAYMENT_METHOD_DEGRADATION';
    } else if (customerLtvPaise >= 500000 && consecutiveFailures >= 2) {
      type = 'CUSTOMER_CHURN_RISK';
    } else if (payment.method === 'card' && consecutiveFailures >= 2) {
      type = 'RETRIED_CARD_FAILURE';
    } else if (payment.amountPaise >= 100000) {
      type = 'HIGH_VALUE_DROPOFF';
    }

    const now = Math.floor(Date.now() / 1000);
    const checkoutAgeMinutes = payment.createdAt ? Math.max(0, Math.round((now - payment.createdAt) / 60)) : 5;

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
      checkoutAgeMinutes,
      orderState: 'PENDING',
      paymentState: 'FAILED',
      recentContactCount: customer?.lastContactedAt && (now - customer.lastContactedAt < 86400) ? 1 : 0,
    };

    const expectedValue = calculateExpectedValue(payment.amountPaise, {
      failureCode,
      paymentMethod: payment.method,
      consecutiveFailures,
      customerLtvPaise,
      intentScore: 0.85,
    });

    const priority = calculatePriorityScore({
      amountPaise: payment.amountPaise,
      expectedValue,
      evidence,
      createdAtSeconds: now,
    });

    const hash = hashString(`${payment.id}_${now}`);
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
      priority,
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

    const now = Math.floor(Date.now() / 1000);
    const checkoutAgeMinutes = order.createdAt ? Math.max(0, Math.round((now - order.createdAt) / 60)) : 30;

    const evidence: OpportunityEvidence = {
      failureCode: 'CHECKOUT_ABANDONMENT',
      failureDescription: 'Order created but checkout payment not completed within 30 minutes',
      consecutiveFailures: 1,
      customerLtvPaise: 0,
      historicalRecoveryRatePct: 42,
      intentScore: 0.70,
      checkoutAgeMinutes,
      orderState: 'CREATED_UNPAID',
      paymentState: 'NOT_ATTEMPTED',
      recentContactCount: 0,
    };

    const expectedValue = calculateExpectedValue(order.amountPaise, {
      failureCode: 'CHECKOUT_ABANDONMENT',
      consecutiveFailures: 1,
      customerLtvPaise: 0,
      intentScore: 0.70,
    });

    const priority = calculatePriorityScore({
      amountPaise: order.amountPaise,
      expectedValue,
      evidence,
      createdAtSeconds: now,
    });

    const hash = hashString(`${order.id}_${now}`);
    const opportunityId = `opp_${hash}`;

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
      priority,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Detects payment/order state mismatches (e.g. payment authorized/captured but merchant order missing or pending).
   */
  public detectFromStateMismatch(
    payment: PaymentEntity,
    order: OrderEntity | undefined,
    eventId: string,
    merchantId: string = 'rzp_merchant_main'
  ): RevenueOpportunity | null {
    // Only applies if payment is financially successful (captured/authorized) but order is missing or not marked paid
    const isPaymentSuccess = payment.status === 'captured' || payment.status === 'authorized';
    const isOrderMissingOrUnpaid = !order || order.status !== 'paid';

    if (!isPaymentSuccess || !isOrderMissingOrUnpaid || payment.amountPaise <= 0) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const evidence: OpportunityEvidence = {
      failureCode: 'STATE_MISMATCH',
      failureDescription: `Payment ${payment.id} succeeded (${payment.status}) but order ${payment.orderId || 'UNKNOWN'} is unconfirmed in merchant store`,
      paymentMethod: payment.method,
      bankOrIssuer: payment.bank || undefined,
      consecutiveFailures: 0,
      customerLtvPaise: 0,
      historicalRecoveryRatePct: 95,
      intentScore: 1.0,
      checkoutAgeMinutes: 5,
      orderState: order ? order.status : 'MISSING_IN_MERCHANT_SYSTEM',
      paymentState: payment.status.toUpperCase(),
      recentContactCount: 0,
    };

    const expectedValue = calculateExpectedValue(payment.amountPaise, {
      failureCode: 'STATE_MISMATCH',
      consecutiveFailures: 0,
      customerLtvPaise: 0,
      intentScore: 1.0,
    });

    const priority = calculatePriorityScore({
      amountPaise: payment.amountPaise,
      expectedValue,
      evidence,
      createdAtSeconds: now,
    });

    const hash = hashString(`${payment.id}_mismatch_${now}`);
    const opportunityId = `opp_${hash}`;

    return {
      id: opportunityId,
      merchantId,
      type: 'STATE_MISMATCH',
      status: 'DETECTED',
      triggerEventId: eventId,
      orderId: payment.orderId,
      paymentId: payment.id,
      customerId: undefined,
      customerName: undefined,
      customerContact: payment.contact,
      customerEmail: payment.email,
      amountPaise: payment.amountPaise,
      evidence,
      expectedValue,
      priority,
      createdAt: now,
      updatedAt: now,
    };
  }
}
