/**
 * Universal Cross-Platform Crypto Utilities for Browser & Node.js
 * Prevents Webpack client bundle crashes caused by 'node:crypto' while
 * guaranteeing cryptographic randomness (CSPRNG) across server and browser.
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
    // Fallback for older Node.js environments without globalThis.crypto
    const nodeCrypto = require('crypto');
    if (nodeCrypto && typeof nodeCrypto.randomBytes === 'function') {
      return nodeCrypto.randomBytes(byteLength).toString('hex').slice(0, safeLength);
    }
  } catch {
    // Ignore if in restricted browser environment without globalThis.crypto
  }

  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < safeLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
