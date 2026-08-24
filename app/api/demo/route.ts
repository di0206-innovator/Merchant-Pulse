import { NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';
import { PaymentEntity } from '@/core/domain';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pipeline = getGlobalPipeline();
  const metrics = pipeline.getMetrics();
  const opportunities = pipeline.getOpportunities();
  const auditTrail = pipeline.getAuditTrail();
  const health = pipeline.getFactStore().getMethodHealthStats();

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

  // 2. Scenario 1: High-Value UPI Dropoff (₹8,500) -> Auto-Executed
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
  await pipeline.handlePaymentEvent(opp1Payment, 'evt_wh_dropoff_001');

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

  // 4. Scenario 3: Bank Downtime Degradation on HDFC NetBanking (Multiple failures)
  for (let i = 1; i <= 4; i++) {
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

  // 5. Scenario 4: Churn Risk on VIP Customer with ₹25,000 past LTV
  const vipContact = '+919876500099';
  pipeline.getFactStore().recordPayment({
    id: 'pay_vip_past',
    amountPaise: 2500000, // ₹25,000 prior spend
    currency: 'INR',
    status: 'captured',
    contact: vipContact,
    email: 'kavita.patel@example.com',
    createdAt: now - 86400 * 10,
  });

  const vipFailed: PaymentEntity = {
    id: 'pay_vip_failed_now',
    orderId: 'order_vip_301',
    amountPaise: 950000, // ₹9,500
    currency: 'INR',
    status: 'failed',
    method: 'card',
    contact: vipContact,
    email: 'kavita.patel@example.com',
    error: {
      code: 'AUTHENTICATION_ERROR',
      description: 'Customer abandoned OTP screen after 2 retries',
    },
    createdAt: now - 300,
  };
  await pipeline.handlePaymentEvent(vipFailed, 'evt_vip_fail');

  // 6. Scenario 5: Already-Recovered Opportunity (Closed-Loop Evidence)
  const recoveredPay: PaymentEntity = {
    id: 'pay_recovered_past',
    orderId: 'order_rec_past_401',
    amountPaise: 520000, // ₹5,200
    currency: 'INR',
    status: 'failed',
    method: 'upi',
    contact: '+919876500044',
    email: 'meera.joshi@example.com',
    error: {
      code: 'UPI_APP_TIMEOUT',
      description: 'Customer UPI app response delayed',
    },
    createdAt: now - 3600,
  };
  const oppRecovered = await pipeline.handlePaymentEvent(recoveredPay, 'evt_rec_past');
  if (oppRecovered) {
    const decision = pipeline.getAuditTrail().find(d => d.opportunityId === oppRecovered.id);
    if (decision?.executedActionId) {
      pipeline.handlePaymentLinkOutcome(decision.executedActionId, 'paid', 520000, 'evt_paid_webhook_sim');
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Seeded realistic MerchantPulse scenario with active opportunities, degradation, and closed-loop recoveries.',
    metrics: pipeline.getMetrics(),
    opportunityCount: pipeline.getOpportunities().length,
    auditTrailCount: pipeline.getAuditTrail().length,
  });
}
