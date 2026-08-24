import { RevenueStrategyProvider } from './provider';
import { RevenueOpportunity } from '../domain/opportunity';
import { StrategyRecommendation, StrategyRecommendationSchema } from '../domain/strategy';

export class MockStrategyProvider implements RevenueStrategyProvider {
  public readonly name = 'MockStrategyProvider';

  public async generateStrategy(opportunity: RevenueOpportunity): Promise<StrategyRecommendation> {
    const amountInr = (opportunity.amountPaise / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });

    switch (opportunity.type) {
      case 'HIGH_VALUE_DROPOFF': {
        const recommendation: StrategyRecommendation = {
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
        return StrategyRecommendationSchema.parse(recommendation);
      }

      case 'PAYMENT_METHOD_DEGRADATION': {
        const bankName = opportunity.evidence.bankOrIssuer || 'Issuer Bank';
        const recommendation: StrategyRecommendation = {
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
        return StrategyRecommendationSchema.parse(recommendation);
      }

      case 'CUSTOMER_CHURN_RISK': {
        const ltvInr = (opportunity.evidence.customerLtvPaise / 100).toLocaleString('en-IN');
        const recommendation: StrategyRecommendation = {
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
        return StrategyRecommendationSchema.parse(recommendation);
      }

      case 'ABANDONED_CHECKOUT': {
        const recommendation: StrategyRecommendation = {
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
        return StrategyRecommendationSchema.parse(recommendation);
      }

      default: {
        const recommendation: StrategyRecommendation = {
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
        return StrategyRecommendationSchema.parse(recommendation);
      }
    }
  }
}
