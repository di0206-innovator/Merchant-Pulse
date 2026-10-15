import { NextRequest, NextResponse } from 'next/server';
import { GeminiStrategyProvider } from '@/integrations/gemini/client';
import { RevenueOpportunity, OpportunityTypeSchema } from '@/core/domain/opportunity';
import { PolicyEngine } from '@/core/policy/evaluator';
import { calculateExpectedValue } from '@/core/revenue/expectedValue';
import { calculatePriorityScore } from '@/core/revenue/prioritizer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
    }

    const rawAmountPaise = body.amountPaise !== undefined ? Number(body.amountPaise) : 850000;
    if (!Number.isFinite(rawAmountPaise) || rawAmountPaise <= 0 || rawAmountPaise > 1000000000) {
      return NextResponse.json(
        { error: 'Invalid amountPaise: must be a positive integer.' },
        { status: 400 }
      );
    }
    const amountPaise = Math.round(rawAmountPaise);

    const rawLtvPaise = body.customerLtvPaise !== undefined ? Number(body.customerLtvPaise) : 5000000;
    const customerLtvPaise = Number.isFinite(rawLtvPaise) && rawLtvPaise >= 0
      ? Math.round(rawLtvPaise)
      : 5000000;

    const failureCode = typeof body.failureCode === 'string' && body.failureCode.trim()
      ? body.failureCode.trim().slice(0, 64)
      : 'BANK_TIMEOUT';
    const paymentMethod = typeof body.paymentMethod === 'string' && body.paymentMethod.trim()
      ? body.paymentMethod.trim().toLowerCase().slice(0, 32)
      : 'upi';
    const bankOrIssuer = typeof body.bankOrIssuer === 'string' && body.bankOrIssuer.trim()
      ? body.bankOrIssuer.trim().slice(0, 64)
      : 'HDFC Bank';
    const failureDescription = typeof body.failureDescription === 'string' && body.failureDescription.trim()
      ? body.failureDescription.trim().slice(0, 300)
      : 'Bank Gateway Timeout (HTTP 504)';

    const parsedOppType = OpportunityTypeSchema.safeParse(body.opportunityType);
    const opportunityType = parsedOppType.success ? parsedOppType.data : 'FAILED_PAYMENT';

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

    const now = Math.floor(Date.now() / 1000);

    // 3. Construct Opportunity Domain Object
    const opportunity: RevenueOpportunity = {
      id: `opp_live_${Date.now().toString(36)}`,
      merchantId: 'rzp_merchant_main',
      triggerEventId: `evt_live_${Date.now().toString(36)}`,
      type: opportunityType,
      orderId: `order_live_${Date.now().toString(36)}`,
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
      createdAt: now,
      updatedAt: now,
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
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
  }
}
