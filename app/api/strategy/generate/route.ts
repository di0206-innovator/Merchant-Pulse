import { NextRequest, NextResponse } from 'next/server';
import { GeminiStrategyProvider } from '@/integrations/gemini/client';
import { MockStrategyProvider } from '@/core/strategy/mock';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { PolicyEngine } from '@/core/policy/evaluator';
import { calculateExpectedValue } from '@/core/revenue/expectedValue';
import { calculatePriorityScore } from '@/core/revenue/prioritizer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amountPaise = body.amountPaise || 850000;
    const failureCode = body.failureCode || 'BANK_TIMEOUT';
    const paymentMethod = body.paymentMethod || 'upi';
    const bankOrIssuer = body.bankOrIssuer || 'HDFC Bank';
    const customerLtvPaise = body.customerLtvPaise || 5000000;
    const failureDescription = body.failureDescription || 'Bank Gateway Timeout (HTTP 504)';
    const opportunityType = body.opportunityType || 'FAILED_PAYMENT';

    // 1. Deterministic EV Calculation
    const expectedValue = calculateExpectedValue(amountPaise, {
      failureCode,
      paymentMethod,
      consecutiveFailures: 0,
      customerLtvPaise,
    });

    // 2. Deterministic Priority Calculation
    const priority = calculatePriorityScore({
      expectedValue,
      evidence: {
        consecutiveFailures: 0,
        intentScore: 0.9,
        historicalRecoveryRatePct: 78,
        paymentMethod,
        customerLtvPaise,
        recentContactCount: 0,
      },
      amountPaise,
    });

    // 3. Construct Opportunity Domain Object
    const opportunity: RevenueOpportunity = {
      id: `opp_live_${Date.now().toString(36)}`,
      merchantId: 'rzp_merchant_main',
      triggerEventId: `evt_live_${Date.now().toString(36)}`,
      type: opportunityType,
      amountPaise,
      evidence: {
        paymentMethod,
        bankOrIssuer,
        failureCode,
        failureDescription,
        consecutiveFailures: 0,
        historicalRecoveryRatePct: 78,
        intentScore: 0.9,
        customerLtvPaise,
        recentContactCount: 0,
      },
      expectedValue,
      priority,
      status: 'DETECTED',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    // 4. Generate AI Strategy (Gemini 2.5 Flash with fallback)
    const provider = new GeminiStrategyProvider();
    const recommendation = await provider.generateStrategy(opportunity);

    // 5. Evaluate Multi-Tier Policy Safety Gate
    const policyEngine = new PolicyEngine();
    const policyResult = policyEngine.evaluate(opportunity, recommendation, {
      merchantId: 'rzp_merchant_main',
      allowedActions: [
        'CREATE_PAYMENT_LINK',
        'SEND_PAYMENT_REMINDER',
        'NOTIFY_ALTERNATIVE_METHOD',
        'RECONCILE_ORDER_STATE',
        'ESCALATE_TO_OPS',
        'NO_ACTION',
      ],
      maxAutoGmvPaise: 2500000,
      minEvPaise: 2000,
      contactCooldownHours: 24,
      requireManualApprovalForDowntimeAlerts: true,
    });

    return NextResponse.json({
      opportunity,
      recommendation,
      policyResult,
    });
  } catch (err: any) {
    console.error('Strategy Generation API Error:', err);
    return NextResponse.json({ error: 'Failed to generate strategy', details: err.message }, { status: 500 });
  }
}
