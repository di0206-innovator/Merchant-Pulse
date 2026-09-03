/**
 * Cryptographically verifies Razorpay webhook signatures using HMAC-SHA256.
 * MUST use unparsed raw request body bytes to prevent whitespace/encoding alterations.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signature || !webhookSecret) {
    return false;
  }

  try {
    // Require Node crypto dynamically to protect client-side webpack builds
    const crypto = require('crypto');
    const rawBuffer = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
    const signatureBuffer = Buffer.from(signature, 'utf8');

    // Support zero-downtime secret rotation by accepting comma-separated secrets
    const secrets = webhookSecret.split(',').map((s) => s.trim()).filter(Boolean);

    for (const secret of secrets) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBuffer)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      if (expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[verifyRazorpayWebhookSignature] Signature verification error:', err);
    return false;
  }
}
