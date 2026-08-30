import { NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';
import { PaymentEntity } from '@/core/domain';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pipeline = getGlobalPipeline();
  const metrics = pipeline.getMetrics();
  const health = pipeline.getFactStore().getMethodHealthStats();
  const opportunities = pipeline.getOpportunities();
  const auditTrail = pipeline.getAuditTrail();

  return NextResponse.json({
    metrics,
    opportunities,
    auditTrail,
    gatewayHealth: health,
  });
}

// POST /api/demo: Seeds a deterministic realistic ₹1.24 Cr GMV merchant scenario
export async function POST() {
  const pipeline = getGlobalPipeline();
  pipeline.clear();

  const now = Math.floor(Date.now() / 1000);

  // 1. Seed baseline captured GMV transactions (to establish normal baseline health & customer profiles)
  const baseCaptured: PaymentEntity[] = [
    {
      id: 'pay_base_001',
      orderId: 'order_base_001',
      amountPaise: 4500000, // ₹45,000
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      contact: '+919811223344',
      email: 'ananya.s@example.com',
      createdAt: now - 3600 * 5,
    },
    {
      id: 'pay_base_002',
      orderId: 'order_base_002',
      amountPaise: 2800000, // ₹28,000
      currency: 'INR',
      status: 'captured',
      method: 'card',
      contact: '+919822334455',
      email: 'rohit.k@example.com',
      createdAt: now - 3600 * 4,
    },
    {
      id: 'pay_base_003',
      orderId: 'order_base_003',
      amountPaise: 1250000, // ₹12,500
      currency: 'INR',
      status: 'captured',
      method: 'netbanking',
      bank: 'HDFC',
      contact: '+919833445566',
      email: 'priya.m@example.com',
      createdAt: now - 3600 * 3,
    },
    {
      id: 'pay_base_004',
      orderId: 'order_base_004',
      amountPaise: 3800000, // ₹38,000
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      contact: '+919844556677',
      email: 'vikram.r@example.com',
      createdAt: now - 3600 * 2,
    },
  ];

  for (const p of baseCaptured) {
    await pipeline.handlePaymentEvent(p, `evt_seed_${p.id}`);
  }

  // 2. Scenario 1: High-Value UPI Dropoff (₹8,500) -> Auto-Executed & Recovered via Webhook
  const opp1Payment: PaymentEntity = {
    id: 'pay_dropoff_001',
    orderId: 'order_rec_101',
    amountPaise: 850000, // ₹8,500
    currency: 'INR',
    status: 'failed',
    method: 'upi',
    vpa: 'arjun.nair@okhdfcbank',
    contact: '+919876500001',
    email: 'arjun.nair@example.com',
    error: {
      code: 'BANK_TIMEOUT',
      description: 'UPI transaction timed out at issuing bank node',
      source: 'bank',
      step: 'payment_authentication',
    },
    createdAt: now - 1800,
  };
  const opp1 = await pipeline.handlePaymentEvent(opp1Payment, 'evt_wh_dropoff_001');
  if (opp1) {
    const decision = pipeline.getAuditTrail().find(d => d.opportunityId === opp1.id);
    if (decision?.executedActionId) {
      pipeline.handlePaymentLinkOutcome(decision.executedActionId, 'paid', 850000, 'evt_wh_paid_001', 'pay_rec_proof_001');
    }
  }

  // 3. Scenario 2: High-Value Over-Limit Dropoff (₹65,000) -> ESCALATED TO HUMAN REVIEW
  const opp2Payment: PaymentEntity = {
    id: 'pay_escalate_002',
    orderId: 'order_rec_102',
    amountPaise: 6500000, // ₹65,000 (Exceeds ₹25k auto limit)
    currency: 'INR',
    status: 'failed',
    method: 'card',
    contact: '+919876500002',
    email: 'siddharth.m@enterprise.in',
    error: {
      code: 'GATEWAY_ERROR',
      description: 'Gateway communication failure during 3DS challenge',
    },
    createdAt: now - 1200,
  };
  await pipeline.handlePaymentEvent(opp2Payment, 'evt_wh_escalate_002');

  // 4. Scenario 3: Low-Value Negative EV Dropoff (₹199) -> Suppressed (NO_ACTION)
  const opp3Payment: PaymentEntity = {
    id: 'pay_lowval_003',
    orderId: 'order_rec_103',
    amountPaise: 19900, // ₹199
    currency: 'INR',
    status: 'failed',
    method: 'card',
    contact: '+919876500003',
    email: 'test_low@example.com',
    error: {
      code: 'CARD_EXPIRED',
      description: 'Card expired error returned by network',
    },
    createdAt: now - 900,
  };
  await pipeline.handlePaymentEvent(opp3Payment, 'evt_wh_lowval_003');

  // 5. Scenario 4: Abandoned Checkout (₹14,500) -> SEND_PAYMENT_REMINDER
  const abandonedOrder = {
    id: 'order_aband_104',
    amountPaise: 1450000, // ₹14,500
    currency: 'INR' as const,
    status: 'created' as const,
    attempts: 0,
    createdAt: now - 2100,
  };
  const oppAbandoned = pipeline.getFactStore(); // record
  const opp4 = pipeline['detector'].detectFromAbandonedOrder(
    abandonedOrder,
    'evt_cart_abandoned_004',
    'neha.gupta@lifestyle.in',
    '+919876500004',
    'rzp_merchant_main'
  );
  if (opp4) {
    pipeline['opportunities'].set(opp4.id, opp4);
    const rec4 = await pipeline['strategyProvider'].generateStrategy(opp4);
    pipeline['recommendations'].set(opp4.id, rec4);
    const pol4 = pipeline['policyEngine'].evaluate(opp4, rec4, pipeline['policyConfig']);
    const exec4 = await pipeline['dispatcher'].execute(opp4, rec4);
    opp4.status = 'EXECUTED';
    pipeline['opportunities'].set(opp4.id, opp4);
    pipeline['auditLedger'].recordDecision({
      decisionId: `dec_aband_004`,
      eventId: 'evt_cart_abandoned_004',
      merchantId: 'rzp_merchant_main',
      opportunityId: opp4.id,
      timestamp: now - 1800,
      deterministicMetrics: {
        amountPaise: opp4.amountPaise,
        recoverableGmvPaise: opp4.expectedValue.recoverableGmvPaise,
        expectedValuePaise: opp4.expectedValue.netExpectedValuePaise,
        failureCode: opp4.evidence.failureCode,
        customerLtvPaise: opp4.evidence.customerLtvPaise,
      },
      aiRecommendation: rec4,
      policyResult: pol4,
      actionStatus: 'AUTO_EXECUTED',
      executedActionId: exec4.razorpayReferenceId,
      outcome: { status: 'PENDING' },
    });
  }

  // 6. Scenario 5: Payment/Order State Mismatch (₹22,000) -> RECONCILE_ORDER_STATE
  const mismatchPayment: PaymentEntity = {
    id: 'pay_mismatch_005',
    orderId: 'order_sync_105',
    amountPaise: 2200000, // ₹22,000
    currency: 'INR',
    status: 'captured',
    method: 'upi',
    contact: '+919876500005',
    email: 'karan.sharma@techcorp.in',
    createdAt: now - 600,
  };
  const opp5 = pipeline['detector'].detectFromStateMismatch(
    mismatchPayment,
    undefined, // merchant order state missing
    'evt_mismatch_005',
    'rzp_merchant_main'
  );
  if (opp5) {
    pipeline['opportunities'].set(opp5.id, opp5);
    const rec5 = await pipeline['strategyProvider'].generateStrategy(opp5);
    pipeline['recommendations'].set(opp5.id, rec5);
    const pol5 = pipeline['policyEngine'].evaluate(opp5, rec5, pipeline['policyConfig']);
    const exec5 = await pipeline['dispatcher'].execute(opp5, rec5);
    opp5.status = 'RECOVERED';
    opp5.outcome = {
      actionExecuted: 'RECONCILE_ORDER_STATE',
      executionReference: exec5.razorpayReferenceId,
      verified: true,
      recoveredAmountPaise: 2200000,
      attributionType: 'ATTRIBUTED_INTERVENTION',
      resolutionEventId: 'evt_sync_verified_005',
      resolvedAt: now - 300,
    };
    pipeline['opportunities'].set(opp5.id, opp5);
    pipeline['auditLedger'].recordDecision({
      decisionId: `dec_mismatch_005`,
      eventId: 'evt_mismatch_005',
      merchantId: 'rzp_merchant_main',
      opportunityId: opp5.id,
      timestamp: now - 600,
      deterministicMetrics: {
        amountPaise: opp5.amountPaise,
        recoverableGmvPaise: opp5.expectedValue.recoverableGmvPaise,
        expectedValuePaise: opp5.expectedValue.netExpectedValuePaise,
        failureCode: opp5.evidence.failureCode,
        customerLtvPaise: opp5.evidence.customerLtvPaise,
      },
      aiRecommendation: rec5,
      policyResult: pol5,
      actionStatus: 'AUTO_EXECUTED',
      executedActionId: exec5.razorpayReferenceId,
      outcome: {
        status: 'RECOVERED',
        recoveredAmountPaise: 2200000,
        resolutionEventId: 'evt_sync_verified_005',
        resolvedAt: now - 300,
      },
    });
  }

  // 7. Scenario 6: Bank Downtime Degradation on HDFC NetBanking (Multiple failures)
  for (let i = 1; i <= 3; i++) {
    const p: PaymentEntity = {
      id: `pay_hdfc_downtime_${i}`,
      orderId: `order_nb_${i}`,
      amountPaise: 420000, // ₹4,200
      currency: 'INR',
      status: 'failed',
      method: 'netbanking',
      bank: 'HDFC',
      contact: `+91987650001${i}`,
      email: `customer${i}@example.com`,
      error: {
        code: 'GATEWAY_ERROR',
        description: 'HDFC NetBanking host unreachable (HTTP 504)',
      },
      createdAt: now - 600 - (i * 60),
    };
    await pipeline.handlePaymentEvent(p, `evt_hdfc_${i}`);
  }

  // 8. Scenario 7: VIP Loyal Customer Dropoff (₹18,999, ₹50,000 past spend)
  const vipContact = '+919876500099';
  pipeline.getFactStore().recordPayment({
    id: 'pay_vip_past',
    amountPaise: 5000000, // ₹50,000 prior spend
    currency: 'INR',
    status: 'captured',
    contact: vipContact,
    email: 'kavita.patel@example.com',
    createdAt: now - 86400 * 10,
  });

  const vipFailed: PaymentEntity = {
    id: 'pay_vip_failed_now',
    orderId: 'order_vip_301',
    amountPaise: 1899900, // ₹18,999
    currency: 'INR',
    status: 'failed',
    method: 'card',
    contact: vipContact,
    email: 'kavita.patel@example.com',
    error: {
      code: 'AUTHENTICATION_ERROR',
      description: 'Customer OTP input session timed out',
    },
    createdAt: now - 180,
  };
  await pipeline.handlePaymentEvent(vipFailed, 'evt_vip_fail');

  // 9. Scenario 8: Organic Recovery (₹28,000 recovered without MerchantPulse intervention)
  const organicPayFailed: PaymentEntity = {
    id: 'pay_organic_fail_008',
    orderId: 'order_org_108',
    amountPaise: 2800000, // ₹28,000
    currency: 'INR',
    status: 'failed',
    method: 'upi',
    contact: '+919876500088',
    email: 'rajesh.menon@direct.in',
    error: {
      code: 'LIMIT_EXCEEDED',
      description: 'Daily UPI limit exceeded',
    },
    createdAt: now - 7200,
  };
  // We handle failure, but don't auto-execute or simulate direct capture without link
  const oppOrganic = await pipeline.handlePaymentEvent(organicPayFailed, 'evt_org_fail');
  if (oppOrganic) {
    // Customer retried organically and captured on different method
    const organicCaptured: PaymentEntity = {
      id: 'pay_organic_success_008',
      orderId: 'order_org_108',
      amountPaise: 2800000,
      currency: 'INR',
      status: 'captured',
      method: 'card',
      contact: '+919876500088',
      email: 'rajesh.menon@direct.in',
      createdAt: now - 3600,
    };
    await pipeline.handlePaymentEvent(organicCaptured, 'evt_org_captured');
  }

  return NextResponse.json({
    success: true,
    message: 'Seeded comprehensive realistic MerchantPulse recovery scenarios.',
    metrics: pipeline.getMetrics(),
    opportunities: pipeline.getOpportunities(),
    auditTrail: pipeline.getAuditTrail(),
    opportunityCount: pipeline.getOpportunities().length,
    auditTrailCount: pipeline.getAuditTrail().length,
  });
}
