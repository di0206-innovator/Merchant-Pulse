/**
 * Security utilities: input sanitization, XSS escaping, and cryptographic hashing.
 */

/**
 * Escapes common HTML special characters to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips script tags, javascript: pseudo-protocols, and inline event handlers.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input) return '';
  const trimmed = input.trim().slice(0, maxLength);
  // Strip control chars, null bytes, and dangerous tags
  return trimmed
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Hashes a plaintext password using SHA-256 with a salt via standard Web Crypto API.
 */
export async function hashPassword(password: string, salt = 'merchantpulse_fintech_salt_2026'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Timing-safe string comparison to protect against timing attacks on tokens and secrets.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
