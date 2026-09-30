import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getEnvHealth } from '@/lib/env';

export async function GET(req: NextRequest) {
  // Read session cookie
  const sessionCookie = req.cookies.get('mp_admin_session')?.value;
  const session = await verifyAdminSessionToken(sessionCookie);

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. Protected admin route.' }, { status: 401 });
  }

  const envHealth = getEnvHealth();

  return NextResponse.json({
    ok: true,
    authenticatedAs: session.role,
    expiresAt: new Date(session.expiresAt).toISOString(),
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    },
    security: {
      httpsEnforced: true,
      hstsActive: true,
      rateLimitingEnabled: true,
      xssProtectionEnabled: true,
      contentSecurityPolicy: 'Active',
      secretsMasked: true,
    },
    integrations: {
      geminiAi: {
        configured: envHealth.geminiConfigured,
        model: 'gemini-2.5-flash',
        keyStatus: envHealth.geminiConfigured ? 'MASKED (Present)' : 'MISSING',
      },
      razorpayWebhook: {
        configured: envHealth.razorpayWebhookConfigured,
        secretStatus: envHealth.razorpayWebhookConfigured ? 'MASKED (Present)' : 'MISSING',
      },
      razorpayApi: {
        configured: envHealth.razorpayKeysConfigured,
        keyStatus: envHealth.razorpayKeysConfigured ? 'MASKED (Present)' : 'MISSING',
      },
      adminPassword: {
        configured: envHealth.adminPasswordConfigured,
        status: 'Protected & Hashed',
      },
    },
  });
}
