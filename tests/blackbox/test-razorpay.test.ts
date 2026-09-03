import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/test-razorpay/route';

describe('POST /api/test-razorpay (Live Razorpay API Integration)', () => {
  it('GET /api/test-razorpay returns configuration status', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.endpoint).toBe('https://api.razorpay.com/v1/payment_links');
    expect(data.adapter).toBe('LiveRazorpayClientAdapter');
  });

  it('POST /api/test-razorpay creates a live payment link on Razorpay servers', async () => {
    const req = new NextRequest('http://localhost:3000/api/test-razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountInr: 500,
        description: 'Automated Vitest Live API Verification',
        customerName: 'Gaurav Kumar',
        customerEmail: 'gaurav.kumar@example.com',
        customerContact: '+919876543210',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.mode).toBe('LIVE_TEST_API');
    expect(data.linkId).toMatch(/^plink_/);
    expect(data.shortUrl).toContain('rzp.io');
    expect(data.amountPaise).toBe(50000);
    expect(data.status).toBe('created');
    expect(data.createdAt).toBeGreaterThan(0);
  }, 15000);
});
