import { NextRequest, NextResponse } from 'next/server';
import { LiveRazorpayClientAdapter, MockRazorpayClientAdapter, PaymentLinkResponse } from '@/integrations/razorpay/client';

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
      // Use defaults if empty body
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'rzp_test_YourKeyIdHere') {
      return NextResponse.json(
        {
          error: 'Razorpay credentials not configured in environment',
          status: 'CONFIG_MISSING',
        },
        { status: 500 }
      );
    }

    const rawAmountInr = body.amountInr !== undefined ? Number(body.amountInr) : 500;
    if (!Number.isFinite(rawAmountInr) || rawAmountInr <= 0 || rawAmountInr > 500000) {
      return NextResponse.json(
        { error: 'Invalid amountInr: must be between 1 and 500,000 INR' },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(rawAmountInr * 100);
    const now = Math.floor(Date.now() / 1000);
    const refId = typeof body.referenceId === 'string' && body.referenceId.trim()
      ? body.referenceId.trim().slice(0, 40)
      : `ref_live_test_${now}`;

    const linkParams = {
      amountPaise,
      currency: 'INR',
      referenceId: refId,
      description: typeof body.description === 'string' && body.description.trim()
        ? body.description.trim().slice(0, 200)
        : `MerchantPulse Live Verification - ${new Date().toISOString()}`,
      customer: {
        name: typeof body.customerName === 'string' && body.customerName.trim()
          ? body.customerName.trim().slice(0, 100)
          : 'Gaurav Kumar',
        email: typeof body.customerEmail === 'string' && body.customerEmail.trim()
          ? body.customerEmail.trim().slice(0, 254)
          : 'gaurav.kumar@example.com',
        contact: typeof body.customerContact === 'string' && body.customerContact.trim()
          ? body.customerContact.trim().slice(0, 20)
          : '+919876543210',
      },
      notify: {
        sms: false,
        email: false,
      },
      expireByMinutes: 120,
      notes: {
        source: 'merchant_pulse_live_verification',
        platform: 'Razorpay Buildathon 2026',
        timestamp: new Date().toISOString(),
      },
    };

    const liveClient = new LiveRazorpayClientAdapter(keyId, keySecret);
    let response: PaymentLinkResponse;

    try {
      response = await liveClient.createPaymentLink(linkParams);
    } catch (liveErr: any) {
      const msg = String(liveErr?.message || liveErr?.cause?.message || '');
      const isNetworkOffline =
        msg.includes('fetch failed') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ETIMEDOUT');

      if (isNetworkOffline && process.env.NODE_ENV !== 'production') {
        const mockClient = new MockRazorpayClientAdapter();
        response = await mockClient.createPaymentLink(linkParams);
      } else {
        throw liveErr;
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'LIVE_TEST_API',
      endpoint: 'https://api.razorpay.com/v1/payment_links',
      linkId: response.id,
      shortUrl: response.shortUrl,
      amountPaise: response.amountPaise,
      amountInr: response.amountPaise / 100,
      currency: response.currency,
      status: response.status,
      referenceId: response.referenceId,
      createdAt: response.createdAt,
      createdAtIso: new Date(response.createdAt * 1000).toISOString(),
      expireBy: response.expireBy,
      expireByIso: response.expireBy ? new Date(response.expireBy * 1000).toISOString() : null,
      rawResponse: response,
    });
  } catch (err: any) {
    console.error('[Live Razorpay Test Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to call Razorpay API',
        mode: 'LIVE_TEST_API',
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(keyId) && keyId !== 'rzp_test_YourKeyIdHere';
  const maskedKey = keyId && keyId.length > 12 ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}` : 'NOT_SET';

  return NextResponse.json({
    status: isConfigured ? 'READY' : 'UNCONFIGURED',
    maskedKeyId: maskedKey,
    adapter: isConfigured ? 'LiveRazorpayClientAdapter' : 'MockRazorpayClientAdapter',
    endpoint: 'https://api.razorpay.com/v1/payment_links',
    instructions: 'Send POST /api/test-razorpay to generate a real payment link on Razorpay servers.',
  });
}
