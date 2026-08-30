import { RevenueStrategyProvider } from './provider';
import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation, StrategyRecommendationSchema } from '../domain/strategy';
import { hashString } from '@/lib/cryptoUtils';

export class MockStrategyProvider implements RevenueStrategyProvider {
  public readonly name = 'MockStrategyProvider';
  private readonly promptVersion = 'v2.1.0';
  private readonly schemaVersion = 'v1.0.0';

  public async generateStrategy(opportunity: RevenueOpportunity): Promise<StrategyRecommendation> {
    const startTime = performance.now();
    const amountInr = (opportunity.amountPaise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });

    let recommendation: StrategyRecommendation;

    // 1. Economic / Safety Check: If Net EV is negative, choose NO_ACTION
    if (!opportunity.expectedValue.isProfitable || opportunity.expectedValue.netExpectedValuePaise < 0) {
      recommendation = {
        opportunityId: opportunity.id,
        diagnosis: `Transaction of ₹${amountInr} has negative expected recovery value after fees and fatigue penalties.`,
        recommendedActionType: 'NO_ACTION',
        actionPayload: {},
        confidenceScore: 0.95,
        rationale: `Intervention cost and customer fatigue exceed expected recovery return. Automated suppression preserves merchant ROI and customer trust.`,
        suggestedExpiryMinutes: 60,
      };
      const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
      recommendation.telemetry = {
        provider: 'MockStrategyProvider',
        model: 'deterministic-rules-engine',
        promptVersion: this.promptVersion,
        strategySchemaVersion: this.schemaVersion,
        contextHash: hashString(opportunity.id),
        latencyMs,
        validationStatus: 'PASSED',
      };
      return StrategyRecommendationSchema.parse(recommendation);
    }

    switch (opportunity.type) {
      case 'STATE_MISMATCH': {
        recommendation = {
          opportunityId: opportunity.id,
          diagnosis: `Payment ${opportunity.paymentId || 'authorized'} is confirmed on Razorpay gateway but order state is missing or pending in merchant store.`,
          recommendedActionType: 'RECONCILE_ORDER_STATE',
          actionPayload: {
            orderId: opportunity.orderId,
            paymentId: opportunity.paymentId,
            amountPaise: opportunity.amountPaise,
            reconciliationTarget: 'PAID',
          },
          confidenceScore: 0.98,
          rationale: `Gateway financial truth confirms funds received. Synchronizing merchant order status recovers revenue and prevents customer support escalation.`,
          suggestedExpiryMinutes: 30,
        };
        break;
      }

      case 'FAILED_PAYMENT':
      case 'HIGH_VALUE_DROPOFF': {
        recommendation = {
          opportunityId: opportunity.id,
          diagnosis: `Transaction of ₹${amountInr} failed due to ${opportunity.evidence.failureCode || 'GATEWAY_ERROR'}. High purchase intent detected.`,
          recommendedActionType: 'CREATE_PAYMENT_LINK',
          actionPayload: {
            amountPaise: opportunity.amountPaise,
            expireByMinutes: 120,
            notifyMedium: ['sms', 'email'],
            preselectedMethod: opportunity.evidence.paymentMethod === 'upi' ? 'upi' : 'cards_netbanking',
          },
          confidenceScore: 0.89,
          rationale: `Customer attempted a ₹${amountInr} checkout. Generating a 2-hour expedited Razorpay Payment Link with auto-retry instructions has an estimated success probability of ${Math.round(opportunity.expectedValue.pSuccess * 100)}%.`,
          suggestedExpiryMinutes: 120,
          customerMessaging: {
            smsText: `Your payment of ₹${amountInr} for Order #${opportunity.orderId || 'Checkout'} timed out. Tap here to complete securely: {short_url}`,
            emailSubject: `Complete your order (₹${amountInr})`,
            emailBody: `We noticed your payment didn't go through due to a temporary bank timeout. Click below to retry securely via UPI or Card.`,
          },
        };
        break;
      }

      case 'PAYMENT_METHOD_DEGRADATION': {
        const bankName = opportunity.evidence.bankOrIssuer || 'Issuer Bank';
        recommendation = {
          opportunityId: opportunity.id,
          diagnosis: `${bankName} is experiencing elevated failure rates (${opportunity.evidence.methodDowntimeRatePct || 45}%). User payment stalled.`,
          recommendedActionType: 'NOTIFY_ALTERNATIVE_METHOD',
          actionPayload: {
            amountPaise: opportunity.amountPaise,
            suggestedMethod: 'upi',
            fallbackBank: 'Alternative UPI / Instant NetBanking',
          },
          confidenceScore: 0.84,
          rationale: `Direct routing to ${bankName} is degraded. Recommending a switch to UPI or Card bypasses the failing bank node without checkout abandonment.`,
          suggestedExpiryMinutes: 60,
          customerMessaging: {
            smsText: `${bankName} servers are temporarily slow. Retry seamlessly using any UPI app or credit card: {short_url}`,
            emailSubject: `Quick checkout update: Try UPI for your order`,
          },
        };
        break;
      }

      case 'CUSTOMER_CHURN_RISK': {
        const ltvInr = (opportunity.evidence.customerLtvPaise / 100).toLocaleString('en-IN');
        recommendation = {
          opportunityId: opportunity.id,
          diagnosis: `High-value loyal customer (LTV: ₹${ltvInr}) failed payment twice consecutively. High churn risk.`,
          recommendedActionType: 'CREATE_PAYMENT_LINK',
          actionPayload: {
            amountPaise: opportunity.amountPaise,
            priorityTier: 'VIP',
            expireByMinutes: 240,
          },
          confidenceScore: 0.94,
          rationale: `Customer has significant historical value (₹${ltvInr}). Immediate proactive recovery prevents defection to competitor.`,
          suggestedExpiryMinutes: 240,
          customerMessaging: {
            smsText: `Hi from Merchant! We noticed your ₹${amountInr} payment was interrupted. We saved your cart here: {short_url}`,
          },
        };
        break;
      }

      case 'ABANDONED_CHECKOUT': {
        recommendation = {
          opportunityId: opportunity.id,
          diagnosis: `Customer initiated order #${opportunity.orderId || 'Cart'} of ₹${amountInr} but left checkout before completing authorization.`,
          recommendedActionType: 'SEND_PAYMENT_REMINDER',
          actionPayload: {
            amountPaise: opportunity.amountPaise,
            expireByMinutes: 720,
          },
          confidenceScore: 0.76,
          rationale: `Cart abandonment detected within SLA. A single polite nudge recovers ~42% of high-intent buyers without discounting.`,
          suggestedExpiryMinutes: 720,
          customerMessaging: {
            smsText: `Still interested in your order of ₹${amountInr}? Complete your purchase in one tap: {short_url}`,
          },
        };
        break;
      }

      default: {
        recommendation = {
          opportunityId: opportunity.id,
          diagnosis: `General payment dropoff for ₹${amountInr}.`,
          recommendedActionType: 'CREATE_PAYMENT_LINK',
          actionPayload: {
            amountPaise: opportunity.amountPaise,
            expireByMinutes: 120,
          },
          confidenceScore: 0.75,
          rationale: `Standard recovery protocol for verified opportunity with positive expected value (₹${(opportunity.expectedValue.netExpectedValuePaise / 100).toFixed(2)}).`,
          suggestedExpiryMinutes: 120,
        };
        break;
      }
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    recommendation.telemetry = {
      provider: 'MockStrategyProvider',
      model: 'deterministic-rules-engine',
      promptVersion: this.promptVersion,
      strategySchemaVersion: this.schemaVersion,
      contextHash: hashString(opportunity.id),
      latencyMs,
      validationStatus: 'PASSED',
    };

    return StrategyRecommendationSchema.parse(recommendation);
  }
}
