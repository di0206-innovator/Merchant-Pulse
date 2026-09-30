import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/security';

const ContactFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Please enter a valid business email address').max(100),
  merchantName: z.string().min(2, 'Merchant or brand name is required').max(100),
  monthlyVolume: z.string().min(1, 'Please select your estimated monthly volume'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(1000),
  // Honeypot field: must remain empty; bots typically fill all fields
  website_url_hp: z.string().max(0, 'Spam detected').optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous_contact';
  // Strict rate limit: 5 contact requests per 10 minutes per IP to prevent spam abuse
  const limitResult = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60_000 });

  if (!limitResult.success) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions. Please wait a few minutes before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limitResult.reset),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const result = ContactFormSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid form input';
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    // Double-check honeypot field
    if (result.data.website_url_hp && result.data.website_url_hp.length > 0) {
      // Silently discard spam submission
      return NextResponse.json({ ok: true, message: 'Message received.' });
    }

    // Sanitize user inputs to protect against stored XSS
    const sanitizedSubmission = {
      fullName: sanitizeText(result.data.fullName, 80),
      email: sanitizeText(result.data.email, 100),
      merchantName: sanitizeText(result.data.merchantName, 100),
      monthlyVolume: sanitizeText(result.data.monthlyVolume, 50),
      message: sanitizeText(result.data.message, 1000),
      receivedAt: new Date().toISOString(),
    };

    // Log internally for developer visibility in test/production
    // eslint-disable-next-line no-console
    console.info('[Contact Inquiry Received]:', {
      merchant: sanitizedSubmission.merchantName,
      email: sanitizedSubmission.email,
    });

    return NextResponse.json({
      ok: true,
      message: 'Thank you! Your inquiry has been safely received. Our fintech team will contact you shortly.',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request payload.' }, { status: 400 });
  }
}
