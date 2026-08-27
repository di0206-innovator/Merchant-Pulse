# MerchantPulse Security & Secret Architecture

## 1. Executive Security Principles

MerchantPulse operates as financial revenue recovery infrastructure for Razorpay merchants. It adheres to strict zero-trust security invariants:

1. **Financial Truth Isolation:** Financial calculations (GMV, Recoverable EV, Margins, Fees) are computed deterministically on the server in 64-bit integer paise. The LLM has zero arithmetic capability.
2. **Server-Only Secret Containment:** All private keys (`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are exclusively accessible to server runtime environments (`Node.js`/Next.js API routes). They are never bundled into client bundles or sent over the wire to browsers.
3. **Strict Webhook Authentication & Idempotency:** Every inbound Razorpay webhook is cryptographically verified using HMAC-SHA256 and checked against an append-only idempotency ledger before processing.
4. **Principle of Least Privilege:** Frontend clients communicate with public Supabase endpoints using `NEXT_PUBLIC_SUPABASE_ANON_KEY` constrained by Row Level Security (RLS) policies scoped strictly to the authenticated `merchant_id`.

---

## 2. Environment Variables & Secret Classification

| Secret / Config Key | Scope | Security Level | Purpose |
|---|---|---|---|
| `RAZORPAY_KEY_ID` | Server | Restricted | Razorpay API Basic Auth username |
| `RAZORPAY_KEY_SECRET` | Server Only | **CRITICAL** | Razorpay API Basic Auth password |
| `RAZORPAY_WEBHOOK_SECRET` | Server Only | **CRITICAL** | HMAC-SHA256 secret for webhook validation |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client & Server | Public Safe | Key ID for Razorpay Standard Checkout SDK popup |
| `GEMINI_API_KEY` | Server Only | **HIGH** | Google GenAI API key for bounded copy reasoning |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Public Safe | Supabase Project Gateway URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public Safe | Supabase client anon key (gated by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | **CRITICAL** | Backend service role key for ledger writes |

---

## 3. Webhook Authentication & Replay Prevention

### Cryptographic Signature Verification
Razorpay signs all webhook event payloads using an HMAC-SHA256 digest calculated over the raw request payload:

```typescript
// integrations/razorpay/signature.ts
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signature || !webhookSecret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
```

- **Timing-Attack Resistance:** `crypto.timingSafeEqual` prevents side-channel timing attacks on secret comparison.
- **Raw Body Preservation:** Next.js raw request body text is captured before JSON parsing to avoid whitespace/canonicalization mismatches.
- **Idempotency Keying:** Webhook events are keyed by `x-razorpay-event-id` or SHA-256 hash of `rawBody`. Replayed events return `HTTP 200 { status: 'DUPLICATE_IGNORED' }` without triggering duplicate recovery actions.

---

## 4. Razorpay Client Adapter Security

- `LiveRazorpayClientAdapter` strictly requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. If either is missing, instantiation throws an explicit configuration error rather than falling back to unauthenticated or hardcoded keys.
- Basic Authentication headers are constructed in-memory and never logged to console or telemetry.
- Supported Razorpay API mutations are restricted to standard, non-destructive endpoints:
  - `POST /v1/payment_links` (Create recovery link)
  - `POST /v1/payment_links/:id/cancel` (Cancel expired recovery link)
  - `POST /v1/payment_links/:id/notify_by/:medium` (Resend notification)

---

## 5. Row Level Security (RLS) & Multi-Tenant Isolation

Supabase tables implement Row Level Security:
- `auth.jwt() -> app_metadata -> merchant_id` guarantees that merchants can only read their own opportunities, audit logs, and metrics.
- Ledger modifications are restricted to backend services using the server service role key.

---

## 6. Auditability & Incident Response

- Every decision evaluated by the Policy Engine creates an immutable `DecisionAuditRecord`.
- The audit record includes:
  - `decisionId` and source `eventId`
  - Exact input metrics (Paise integer values)
  - AI reasoning copy and context hash
  - Policy rules evaluated and pass/fail reasons
  - Final execution reference ID
- If a security anomaly is suspected, audit records provide a verifiable, non-repudiable trace of every autonomous action.
