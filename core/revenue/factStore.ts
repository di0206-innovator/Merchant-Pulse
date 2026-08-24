import { PaymentEntity, OrderEntity, CustomerProfile } from '../domain/payment';

export interface MethodHealthStats {
  method: string;
  bank?: string;
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  failureRatePct: number;
  isDegraded: boolean;
}

export class RevenueFactStore {
  private payments: Map<string, PaymentEntity> = new Map();
  private orders: Map<string, OrderEntity> = new Map();
  private customers: Map<string, CustomerProfile> = new Map();
  private processedEventIds: Set<string> = new Set();

  /**
   * Registers a payment and updates related customer and order stats.
   */
  public recordPayment(payment: PaymentEntity): void {
    this.payments.set(payment.id, payment);

    // Update customer stats if contact/email present
    const customerKey = payment.contact || payment.email;
    if (customerKey) {
      let customer = this.customers.get(customerKey);
      if (!customer) {
        customer = {
          id: `cust_${Buffer.from(customerKey).toString('hex').slice(0, 12)}`,
          email: payment.email,
          contact: payment.contact,
          totalOrders: 0,
          failedOrders: 0,
          ltvPaise: 0,
        };
      }

      if (payment.status === 'captured') {
        customer.totalOrders += 1;
        customer.ltvPaise += payment.amountPaise;
      } else if (payment.status === 'failed') {
        customer.failedOrders += 1;
      }

      this.customers.set(customerKey, customer);
    }
  }

  public recordOrder(order: OrderEntity): void {
    this.orders.set(order.id, order);
  }

  public getPayment(paymentId: string): PaymentEntity | undefined {
    return this.payments.get(paymentId);
  }

  public getOrder(orderId: string): OrderEntity | undefined {
    return this.orders.get(orderId);
  }

  public getCustomer(customerKey: string): CustomerProfile | undefined {
    return this.customers.get(customerKey);
  }

  public getAllPayments(): PaymentEntity[] {
    return Array.from(this.payments.values());
  }

  public getAllOrders(): OrderEntity[] {
    return Array.from(this.orders.values());
  }

  /**
   * Checks if an event ID has already been processed (Idempotency).
   */
  public hasEvent(eventId: string): boolean {
    return this.processedEventIds.has(eventId);
  }

  public markEventProcessed(eventId: string): void {
    this.processedEventIds.add(eventId);
  }

  /**
   * Calculates real-time gateway/method health degradation metrics.
   */
  public getMethodHealthStats(): MethodHealthStats[] {
    const buckets: Map<string, { total: number; success: number; failed: number; method: string; bank?: string }> = new Map();

    for (const p of this.payments.values()) {
      const key = p.bank ? `${p.method || 'unknown'}:${p.bank}` : (p.method || 'unknown');
      let b = buckets.get(key);
      if (!b) {
        b = { total: 0, success: 0, failed: 0, method: p.method || 'unknown', bank: p.bank || undefined };
        buckets.set(key, b);
      }

      b.total += 1;
      if (p.status === 'captured') {
        b.success += 1;
      } else if (p.status === 'failed') {
        b.failed += 1;
      }
    }

    const stats: MethodHealthStats[] = [];
    for (const b of buckets.values()) {
      const failureRatePct = b.total > 0 ? Number(((b.failed / b.total) * 100).toFixed(1)) : 0;
      // Mark degraded if >= 4 attempts and failure rate > 30%
      const isDegraded = b.total >= 4 && failureRatePct >= 30;

      stats.push({
        method: b.method,
        bank: b.bank,
        totalAttempts: b.total,
        successfulAttempts: b.success,
        failedAttempts: b.failed,
        failureRatePct,
        isDegraded,
      });
    }

    return stats;
  }

  /**
   * Resets the in-memory store (for test suites and deterministic demo restarts).
   */
  public clear(): void {
    this.payments.clear();
    this.orders.clear();
    this.customers.clear();
    this.processedEventIds.clear();
  }
}
