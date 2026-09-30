/**
 * Environment configuration validator.
 * Ensures secrets stay server-side only and provides clear status for diagnostic health checks.
 */

export interface EnvHealthStatus {
  geminiConfigured: boolean;
  razorpayKeysConfigured: boolean;
  razorpayWebhookConfigured: boolean;
  adminPasswordConfigured: boolean;
  isProduction: boolean;
}

export function getEnvHealth(): EnvHealthStatus {
  return {
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    razorpayKeysConfigured: Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_SECRET.length > 5
    ),
    razorpayWebhookConfigured: Boolean(
      process.env.RAZORPAY_WEBHOOK_SECRET &&
      process.env.RAZORPAY_WEBHOOK_SECRET.length > 5
    ),
    adminPasswordConfigured: Boolean(
      process.env.ADMIN_ACCESS_PASSWORD &&
      process.env.ADMIN_ACCESS_PASSWORD.length >= 8
    ),
    isProduction: process.env.NODE_ENV === 'production',
  };
}

export const ADMIN_PASSWORD_FALLBACK = 'admin_demo_secure_pass_2026';

export function getAdminPassword(): string {
  return process.env.ADMIN_ACCESS_PASSWORD || ADMIN_PASSWORD_FALLBACK;
}
