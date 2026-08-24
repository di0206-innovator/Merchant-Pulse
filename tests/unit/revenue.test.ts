import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateRecoveryProbability,
  calculateExpectedValue,
  RevenueFactStore,
  RevenueOpportunityDetector,
  computeMerchantMetrics,
} from '@/core/revenue';
import { PaymentEntity } from '@/core/domain';

describe('Deterministic Revenue Engine Unit Tests', () => {
  let factStore: RevenueFactStore;
  let detector: RevenueOpportunityDetector;

  beforeEach(() => {
    factStore = new RevenueFactStore();
    detector = new RevenueOpportunityDetector(factStore);
  });

  describe('Expected Value Math', () => {
    it('calculates expected value accurately for high-value failed payment', () => {
      const amountPaise = 500000; // ₹5,000.00
      const factors = {
        failureCode: 'GATEWAY_ERROR', // Base 0.65
        consecutiveFailures: 1,
        customerLtvPaise: 0,
        intentScore: 0.85,
      };

      const ev = calculateExpectedValue(amountPaise, factors);
      expect(ev.recoverableGmvPaise).toBe(500000);
      expect(ev.pSuccess).toBeGreaterThan(0.6);
      expect(ev.estimatedInterventionCostPaise).toBe(130); // 25 + 5 + 100
      expect(ev.customerFatiguePenaltyPaise).toBe(500);
      expect(ev.netExpectedValuePaise).toBeGreaterThan(300000);
      expect(ev.isProfitable).toBe(true);
    });

    it('boosts probability for high-LTV loyal customers', () => {
      const pNewCustomer = calculateRecoveryProbability({
        failureCode: 'BANK_TIMEOUT',
        customerLtvPaise: 0,
      });

      const pLoyalCustomer = calculateRecoveryProbability({
        failureCode: 'BANK_TIMEOUT',
        customerLtvPaise: 1500000, // ₹15,000 LTV
      });

      expect(pLoyalCustomer).toBeGreaterThan(pNewCustomer);
      expect(pLoyalCustomer - pNewCustomer).toBeCloseTo(0.08, 2);
    });

    it('penalizes probability for multiple consecutive payment failures', () => {
      const pFirstFailure = calculateRecoveryProbability({
        failureCode: 'GATEWAY_ERROR',
        consecutiveFailures: 1,
      });

      const pThirdFailure = calculateRecoveryProbability({
        failureCode: 'GATEWAY_ERROR',
        consecutiveFailures: 3,
      });

      expect(pThirdFailure).toBeLessThan(pFirstFailure);
    });

    it('correctly flags negative EV for unprofitably small transactions', () => {
      const amountPaise = 5000; // ₹50.00
      const factors = {
        failureCode: 'INVALID_DETAILS', // Low recovery rate (0.12)
        consecutiveFailures: 3, // Heavy penalty
      };

      const ev = calculateExpectedValue(amountPaise, factors, true);
      expect(ev.isProfitable).toBe(false);
      expect(ev.netExpectedValuePaise).toBeLessThan(0);
    });
  });

  describe('Fact Store & Degradation Detection', () => {
    it('records payments and updates customer LTV and failure counts', () => {
      const payment1: PaymentEntity = {
        id: 'pay_1',
        amountPaise: 200000,
        currency: 'INR',
        status: 'captured',
        email: 'user@example.com',
        contact: '+919999999999',
        createdAt: 1724500100,
      };

      const payment2: PaymentEntity = {
        id: 'pay_2',
        amountPaise: 150000,
        currency: 'INR',
        status: 'failed',
        email: 'user@example.com',
        contact: '+919999999999',
        createdAt: 1724500200,
      };

      factStore.recordPayment(payment1);
      factStore.recordPayment(payment2);

      const customer = factStore.getCustomer('+919999999999');
      expect(customer).toBeDefined();
      expect(customer?.totalOrders).toBe(1);
      expect(customer?.failedOrders).toBe(1);
      expect(customer?.ltvPaise).toBe(200000);
    });

    it('detects method degradation when failure rate exceeds 30%', () => {
      // Simulate 5 attempts on HDFC Netbanking with 3 failures (60% failure rate)
      for (let i = 0; i < 5; i++) {
        factStore.recordPayment({
          id: `pay_hdfc_${i}`,
          amountPaise: 100000,
          currency: 'INR',
          status: i < 2 ? 'captured' : 'failed',
          method: 'netbanking',
          bank: 'HDFC',
          createdAt: 1724500000 + i,
        });
      }

      const health = factStore.getMethodHealthStats();
      const hdfcStats = health.find(s => s.bank === 'HDFC');
      expect(hdfcStats).toBeDefined();
      expect(hdfcStats?.totalAttempts).toBe(5);
      expect(hdfcStats?.failedAttempts).toBe(3);
      expect(hdfcStats?.failureRatePct).toBe(60);
      expect(hdfcStats?.isDegraded).toBe(true);
    });
  });

  describe('Opportunity Detection & Metrics Aggregation', () => {
    it('detects HIGH_VALUE_DROPOFF from failed payment', () => {
      const payment: PaymentEntity = {
        id: 'pay_test_dropoff',
        orderId: 'order_123',
        amountPaise: 350000, // ₹3,500
        currency: 'INR',
        status: 'failed',
        method: 'upi',
        contact: '+919876543210',
        error: {
          code: 'BANK_TIMEOUT',
          description: 'Bank servers timed out',
        },
        createdAt: 1724500000,
      };

      factStore.recordPayment(payment);
      const opportunity = detector.detectFromPaymentFailure(payment, 'evt_123');

      expect(opportunity).not.toBeNull();
      expect(opportunity?.type).toBe('HIGH_VALUE_DROPOFF');
      expect(opportunity?.amountPaise).toBe(350000);
      expect(opportunity?.expectedValue.isProfitable).toBe(true);
      expect(opportunity?.evidence.failureCode).toBe('BANK_TIMEOUT');
    });

    it('computes merchant-level revenue and recovery metrics', () => {
      factStore.recordPayment({
        id: 'pay_success_1',
        amountPaise: 1000000, // ₹10,000
        currency: 'INR',
        status: 'captured',
        createdAt: 1724500000,
      });

      const failedPayment: PaymentEntity = {
        id: 'pay_fail_1',
        amountPaise: 400000, // ₹4,000
        currency: 'INR',
        status: 'failed',
        createdAt: 1724500010,
      };
      factStore.recordPayment(failedPayment);

      const opp = detector.detectFromPaymentFailure(failedPayment, 'evt_999')!;
      const metrics = computeMerchantMetrics(factStore, [opp]);

      expect(metrics.totalGmvPaise).toBe(1400000); // 10k + 4k
      expect(metrics.totalCapturedGmvPaise).toBe(1000000);
      expect(metrics.revenueAtRiskPaise).toBe(400000);
      expect(metrics.degradationRatePct).toBeCloseTo(28.57, 1);
      expect(metrics.recoverableOpportunityPaise).toBe(opp.expectedValue.netExpectedValuePaise);
    });
  });
});
