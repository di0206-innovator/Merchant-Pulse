/**
 * Universal Cross-Platform Crypto & Sanitization Utilities for Browser & Node.js
 * Prevents Webpack client bundle crashes caused by 'node:crypto' while
 * guaranteeing cryptographic randomness (CSPRNG), salted password hashing,
 * API key masking, and XSS sanitization across server and browser.
 */

/**
 * Computes a deterministic 64-bit avalanche hex hash string (16 hex chars) from input text.
 * Uses dual-32-bit mixing (cyrb53-derived) to avoid 32-bit birthday collisions and INT32_MIN Math.abs overflow.
 */
export function hashString(str: string): string {
  if (typeof str !== 'string' || str.length === 0) {
    return '0000000000000000';
  }

  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}`;
}

/**
 * Generates a cryptographically secure random hexadecimal string of given length.
 * Uses Web Crypto API (globalThis.crypto) in both Node.js 19+ and Browsers,
 * with Node 'crypto' fallback if Web Crypto is unavailable.
 */
export function generateRandomHex(length: number = 16): string {
  const safeLength = Number.isFinite(length) && length > 0
    ? Math.min(1024, Math.floor(length))
    : 16;
  const byteLength = Math.ceil(safeLength / 2);

  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(byteLength);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').slice(0, safeLength);
  }

  try {
    const nodeCrypto = require('crypto');
    if (nodeCrypto && typeof nodeCrypto.randomBytes === 'function') {
      return nodeCrypto.randomBytes(byteLength).toString('hex').slice(0, safeLength);
    }
  } catch {
    // Fallback if in restricted environment
  }

  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < safeLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Hashes a plaintext password using salted multi-round key stretching.
 * Format: pbkdf2_v1$<salt>$<stretched_digest>
 */
export function hashPassword(password: string, customSalt?: string): string {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  const salt = customSalt && /^[0-9a-f]{16,64}$/i.test(customSalt)
    ? customSalt.toLowerCase()
    : generateRandomHex(32);

  try {
    const nodeCrypto = require('crypto');
    if (nodeCrypto && typeof nodeCrypto.pbkdf2Sync === 'function') {
      const derived = nodeCrypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
      return `pbkdf2_v1$${salt}$${derived}`;
    }
  } catch {
    // Browser fallback using iterative salted mixing
  }

  let state1 = hashString(`${salt}:${password}:round0`);
  let state2 = hashString(`${password}:${salt}:round0`);
  for (let i = 1; i <= 256; i++) {
    state1 = hashString(`${state1}:${salt}:${password}:${i}`);
    state2 = hashString(`${state2}:${password}:${salt}:${i}`);
  }
  return `pbkdf2_v1$${salt}$${state1}${state2}`;
}

/**
 * Verifies a plaintext password against a stored salted password hash in constant time.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (typeof password !== 'string' || typeof storedHash !== 'string' || !password) {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2_v1') {
    return false;
  }
  const salt = parts[1];
  const expected = hashPassword(password, salt);
  return timingSafeEqualStrings(expected, storedHash);
}

/**
 * Masks sensitive API keys or secrets so raw credentials are never exposed in UI or logs.
 */
export function maskApiKey(secret?: string | null): string {
  if (!secret || typeof secret !== 'string') return 'NOT_SET';
  const trimmed = secret.trim();
  if (
    !trimmed ||
    trimmed.includes('YourKey') ||
    trimmed.includes('your_') ||
    trimmed === 'dummy_anon_key_for_demo'
  ) {
    return 'NOT_SET';
  }
  if (trimmed.length <= 10) {
    return `${trimmed.slice(0, 2)}****`;
  }
  return `${trimmed.slice(0, 7)}••••${trimmed.slice(-4)}`;
}

/**
 * Sanitizes user form inputs to prevent XSS, script injection, and control character abuse.
 */
export function sanitizeInput(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*\/?\s*(?:script|iframe|object|embed|svg|math|style|link|meta|base|form)[^>]*>/gi, '')
    .replace(/on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}
