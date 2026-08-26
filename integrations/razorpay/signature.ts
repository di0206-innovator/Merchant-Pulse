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
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBuffer)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[verifyRazorpayWebhookSignature] Signature verification error:', err);
    return false;
  }
}
