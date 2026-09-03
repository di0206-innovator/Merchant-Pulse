import { NextRequest, NextResponse } from 'next/server';
import { LiveRazorpayClientAdapter } from '@/integrations/razorpay/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
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

    const liveClient = new LiveRazorpayClientAdapter(keyId, keySecret);
    const amountInr = body.amountInr || 500; // Default ₹500
    const now = Math.floor(Date.now() / 1000);
    const refId = body.referenceId || `ref_live_test_${now}`;

    const response = await liveClient.createPaymentLink({
      amountPaise: amountInr * 100,
      currency: 'INR',
      referenceId: refId,
      description: body.description || `MerchantPulse Live Verification - ${new Date().toISOString()}`,
      customer: {
        name: body.customerName || 'Gaurav Kumar',
        email: body.customerEmail || 'gaurav.kumar@example.com',
        contact: body.customerContact || '+919876543210',
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
    });

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
        error: err?.message || 'Failed to call Razorpay API',
        mode: 'LIVE_TEST_API',
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(keyId) && keyId !== 'rzp_test_YourKeyIdHere';
  const maskedKey = keyId ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}` : 'NOT_SET';

  return NextResponse.json({
    status: isConfigured ? 'READY' : 'UNCONFIGURED',
    maskedKeyId: maskedKey,
    adapter: isConfigured ? 'LiveRazorpayClientAdapter' : 'MockRazorpayClientAdapter',
    endpoint: 'https://api.razorpay.com/v1/payment_links',
    instructions: 'Send POST /api/test-razorpay to generate a real payment link on Razorpay servers.',
  });
}
