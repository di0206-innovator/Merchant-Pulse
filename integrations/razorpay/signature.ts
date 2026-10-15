/**
 * Cryptographically verifies Razorpay webhook signatures using HMAC-SHA256.
 * MUST use unparsed raw request body bytes to prevent whitespace/encoding alterations.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || typeof signature !== 'string' || typeof webhookSecret !== 'string') {
    return false;
  }

  const rawBuffer = typeof rawBody === 'string'
    ? Buffer.from(rawBody, 'utf8')
    : Buffer.isBuffer(rawBody)
      ? rawBody
      : null;

  if (!rawBuffer || rawBuffer.length === 0) {
    return false;
  }

  const normalizedSignature = signature.trim().toLowerCase();
  // SHA-256 hex digest is strictly 64 hexadecimal characters
  if (!/^[0-9a-f]{64}$/.test(normalizedSignature)) {
    return false;
  }

  try {
    // Require Node crypto dynamically to protect client-side webpack builds
    const crypto = require('crypto');
    const signatureBuffer = Buffer.from(normalizedSignature, 'hex');

    // Support zero-downtime secret rotation by accepting comma-separated secrets
    const secrets = webhookSecret.split(',').map((s) => s.trim()).filter(Boolean);
    if (secrets.length === 0) {
      return false;
    }

    for (const secret of secrets) {
      const expectedBuffer: Buffer = crypto
        .createHmac('sha256', secret)
        .update(rawBuffer)
        .digest();

      if (
        expectedBuffer.length === signatureBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
      ) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[verifyRazorpayWebhookSignature] Signature verification error:', err);
    return false;
  }
}
