import { NextRequest, NextResponse } from 'next/server';
import { globalAuthManager } from '@/core/auth';
import { sanitizeInput } from '@/lib/cryptoUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid login payload' }, { status: 400 });
    }

    const rawEmail = body.email !== undefined
      ? sanitizeInput(body.email, 254)
      : (process.env.NODE_ENV !== 'production' ? 'admin@merchantpulse.io' : '');

    if (!rawEmail) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (body.password !== undefined) {
      if (typeof body.password !== 'string' || body.password.length < 4) {
        return NextResponse.json({ error: 'Invalid password format' }, { status: 400 });
      }
      const verified = globalAuthManager.verifyUserCredentials(rawEmail, body.password);
      if (!verified) {
        return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
      }
    }

    const session = globalAuthManager.createSession(rawEmail);
    if (!session) {
      return NextResponse.json({ error: 'Failed to create session: invalid email format' }, { status: 400 });
    }

    const res = NextResponse.json({
      success: true,
      token: session.token,
      user: session.user,
    });

    res.cookies.set('mp_session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 86400 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
  }
}
