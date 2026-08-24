import { NextRequest, NextResponse } from 'next/server';
import { globalAuthManager, PRESET_USERS } from '@/core/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : '';

  const user = globalAuthManager.authenticateSession(token);
  return NextResponse.json({
    user,
    availablePresets: Object.values(PRESET_USERS),
  });
}
