import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, createAdminSessionToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'admin_ip';
  // Strict rate limit: max 5 login attempts per 5 minutes to prevent brute-forcing
  const limitResult = rateLimit(`admin_login:${ip}`, { limit: 5, windowMs: 300_000 });

  if (!limitResult.success) {
    return NextResponse.json(
      { ok: false, error: `Too many login attempts. Please wait ${limitResult.reset} seconds.` },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false, error: 'Password is required' }, { status: 400 });
    }

    const isValid = await validateAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: 'Invalid administrator credentials.' }, { status: 401 });
    }

    const token = await createAdminSessionToken('admin');
    const response = NextResponse.json({
      ok: true,
      message: 'Admin session authenticated successfully.',
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'mp_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }
}
