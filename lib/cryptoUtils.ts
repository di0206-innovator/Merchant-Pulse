/**
 * Universal Cross-Platform Crypto Utilities for Browser & Node.js
 * Prevents Webpack client bundle crashes caused by 'node:crypto'.
 */

/**
 * Computes a deterministic 32-bit hex hash string from input text.
 */
export function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return '00000000';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  const positiveHash = Math.abs(hash).toString(16);
  return positiveHash.padStart(8, '0');
}

/**
 * Generates a random hexadecimal string of given length.
 */
export function generateRandomHex(length: number = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
  }
  
  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
