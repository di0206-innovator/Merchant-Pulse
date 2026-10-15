import { NextRequest, NextResponse } from 'next/server';
import { globalAuthManager, PRESET_USERS } from '@/core/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  const user = globalAuthManager.authenticateSession(token);
  if (authHeader && !user) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or expired session token', user: null },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user,
    availablePresets: Object.values(PRESET_USERS),
  });
}
