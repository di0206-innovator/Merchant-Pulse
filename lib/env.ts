import { z } from 'zod';
import { maskApiKey } from './cryptoUtils';

/**
 * 1. Environment Variable Schema Validation & Secret Masking
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  DEFAULT_MAX_AUTO_GMV_INR: z.coerce.number().positive().default(25000),
  DEFAULT_MIN_EV_INR: z.coerce.number().default(20),
  CONTACT_COOLDOWN_HOURS: z.coerce.number().positive().default(24),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export interface EnvValidationReport {
  valid: boolean;
  environment: string;
  debugModeEnabled: boolean;
  maskedKeys: {
    razorpayKeyId: string;
    razorpayWebhookSecret: string;
    geminiApiKey: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey: string;
  };
  warnings: string[];
}

export function validateEnv(): EnvValidationReport {
  const parsed = EnvSchema.safeParse(process.env);
  const warnings: string[] = [];
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!parsed.success) {
    warnings.push(`Environment schema warnings: ${parsed.error.issues.map(i => i.path.join('.')).join(', ')}`);
  }

  if (nodeEnv === 'production') {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET === 'YourWebhookSecretHere') {
      warnings.push('RAZORPAY_WEBHOOK_SECRET is required in production.');
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      warnings.push('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET should be configured in production.');
    }
  }

  return {
    valid: parsed.success && (nodeEnv !== 'production' || warnings.length === 0),
    environment: nodeEnv,
    // Debug mode is strictly disabled in production
    debugModeEnabled: nodeEnv !== 'production' && process.env.DEBUG === 'true',
    maskedKeys: {
      razorpayKeyId: maskApiKey(process.env.RAZORPAY_KEY_ID),
      razorpayWebhookSecret: maskApiKey(process.env.RAZORPAY_WEBHOOK_SECRET),
      geminiApiKey: maskApiKey(process.env.GEMINI_API_KEY),
      supabaseAnonKey: maskApiKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: maskApiKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    warnings,
  };
}

/**
 * 2. Sliding-Window Rate Limiter for API Endpoints & Middleware
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
  headers: Record<string, string>;
}

const rateLimitStore = new Map<string, { count: number; resetAtMs: number }>();
const MAX_RATE_LIMIT_KEYS = 20000;

export function checkRateLimit(
  identifier: string,
  limit: number = 120,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  const safeKey = (identifier || 'anonymous').slice(0, 128);
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindow = Math.max(1000, Math.floor(windowMs));

  if (rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now >= v.resetAtMs) rateLimitStore.delete(k);
    }
    if (rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) {
      const oldest = rateLimitStore.keys().next().value;
      if (oldest) rateLimitStore.delete(oldest);
    }
  }

  let bucket = rateLimitStore.get(safeKey);
  if (!bucket || now >= bucket.resetAtMs) {
    bucket = { count: 0, resetAtMs: now + safeWindow };
  }

  bucket.count += 1;
  rateLimitStore.set(safeKey, bucket);

  const allowed = bucket.count <= safeLimit;
  const remaining = Math.max(0, safeLimit - bucket.count);
  const resetSeconds = Math.max(1, Math.ceil((bucket.resetAtMs - now) / 1000));

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(safeLimit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(bucket.resetAtMs / 1000)),
  };

  if (!allowed) {
    headers['Retry-After'] = String(resetSeconds);
  }

  return {
    allowed,
    limit: safeLimit,
    remaining,
    resetAtMs: bucket.resetAtMs,
    headers,
  };
}

export function resetRateLimiter(): void {
  rateLimitStore.clear();
}

/**
 * 3. Privacy-Aware Product Analytics & Funnel Telemetry
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

const recentAnalyticsEvents: AnalyticsEvent[] = [];

export function trackAnalyticsEvent(name: string, properties?: Record<string, unknown>): void {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
  };

  recentAnalyticsEvents.push(event);
  if (recentAnalyticsEvents.length > 200) {
    recentAnalyticsEvents.shift();
  }

  if (typeof window !== 'undefined') {
    try {
      const consentRaw = window.localStorage.getItem('mp_cookie_consent');
      if (consentRaw) {
        const consent = JSON.parse(consentRaw);
        if (consent.analytics === false) {
          return;
        }
      }
      const win = window as unknown as {
        gtag?: (...args: unknown[]) => void;
        posthog?: { capture?: (evt: string, props?: Record<string, unknown>) => void };
      };
      if (typeof win.gtag === 'function') {
        win.gtag('event', name, properties || {});
      }
      if (win.posthog && typeof win.posthog.capture === 'function') {
        win.posthog.capture(name, properties);
      }
    } catch {
      // Ignore storage or blocked third-party tracker errors
    }
  }
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return [...recentAnalyticsEvents];
}
