import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/env';

const PROTECTED_ADMIN_PREFIXES = [
  '/overview',
  '/dashboard',
  '/reviewer',
  '/audit',
  '/history',
  '/knowledge',
  '/benchmark',
  '/strategy',
];

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://merchantpulse.io',
  'https://app.merchantpulse.io',
]);

function applySecurityAndCorsHeaders(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  // CORS Headers
  res.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature, X-Razorpay-Event-Id');
  res.headers.set('Access-Control-Max-Age', '86400');
  res.headers.set('Vary', 'Origin');

  // Security Headers (XSS, Clickjacking, MIME sniffing, Isolation)
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.supabase.co https://generativelanguage.googleapis.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');

  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Handle CORS Preflight Requests
  if (req.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    return applySecurityAndCorsHeaders(req, preflight);
  }

  // 2. Enforce Rate Limiting on API Endpoints
  if (pathname.startsWith('/api/')) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const isWebhook = pathname.startsWith('/api/webhooks/');
    const limit = isWebhook ? 300 : 120;
    const rateResult = checkRateLimit(`${ip}:${pathname}`, limit, 60_000);

    if (!rateResult.allowed && process.env.NODE_ENV !== 'test') {
      const rateLimitRes = NextResponse.json(
        {
          error: 'Too Many Requests: Rate limit exceeded. Please retry after the cooldown window.',
          retryAfterSeconds: rateResult.headers['Retry-After'],
        },
        { status: 429 }
      );
      for (const [k, v] of Object.entries(rateResult.headers)) {
        rateLimitRes.headers.set(k, v);
      }
      return applySecurityAndCorsHeaders(req, rateLimitRes);
    }

    const res = NextResponse.next();
    for (const [k, v] of Object.entries(rateResult.headers)) {
      res.headers.set(k, v);
    }
    return applySecurityAndCorsHeaders(req, res);
  }

  // 3. Protect Admin Routes in Strict Production Mode
  const isProtectedAdminRoute = PROTECTED_ADMIN_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedAdminRoute && process.env.NODE_ENV === 'production' && process.env.ENFORCE_STRICT_ADMIN_COOKIE === 'true') {
    const sessionCookie = req.cookies.get('mp_session')?.value;
    const sbAccessToken = req.cookies.getAll().some(c => c.name.includes('auth-token'));
    if (!sessionCookie && !sbAccessToken) {
      const loginUrl = new URL('/auth', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();
  return applySecurityAndCorsHeaders(req, res);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|og-image.svg|robots.txt|sitemap.xml|manifest.json|sw.js).*)',
  ],
};
