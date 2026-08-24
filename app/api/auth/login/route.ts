import { NextRequest, NextResponse } from 'next/server';
import { globalAuthManager } from '@/core/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || 'admin@merchantpulse.io';

    const session = globalAuthManager.createSession(email);
    if (!session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      token: session.token,
      user: session.user,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
  }
}
