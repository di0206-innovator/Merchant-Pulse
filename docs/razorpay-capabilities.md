# Razorpay Capabilities & Primitive Mapping
**MerchantPulse Implementation Guide — Razorpay Buildathon 2026**

---

## 💳 Razorpay Primitives Leveraged

MerchantPulse does not invent proprietary payment rails; it turns existing Razorpay primitives into an autonomous revenue recovery engine.

### 1. Ingestion: Webhook Events (`POST /api/webhooks/razorpay`)
- **`payment.failed`:** Instant trigger for dropoff analysis. Carries error codes (`BAD_REQUEST_PAYMENT_TIMEDOUT`, `GATEWAY_ERROR`), payment method (`upi`, `card`, `netbanking`), customer email/contact, and amount in paise.
- **`payment.captured`:** Ingests organic revenue facts and reconciles organic recoveries without AI attribution.
- **`payment_link.paid`:** Closed-loop recovery verification. Carries `plink_id`, payment ID, and captured amount.
- **`payment_link.expired` / `payment_link.cancelled`:** Closes out open intervention decisions in the audit ledger.

---

### 2. Execution: Payment Links API (`POST /v1/payment_links`)
Used by `ActionDispatcher` (`core/execution/dispatcher.ts`) to generate bounded recovery links:
- **`amount`:** Exact failed transaction amount in integer paise.
- **`currency`:** `INR`.
- **`accept_partial`:** `false` (enforces exact order settlement).
- **`reference_id`:** Cryptographic idempotency key (`mp_rec_<opp_id>`).
- **`description`:** Contextual order recovery note.
- **`customer`:** Name, contact, email from original checkout session.
- **`notify`:** Configurable `{ sms: true, email: true }`.
- **`expire_by`:** Dynamic timestamp (typically 2 to 24 hours based on EV strategy).

---

### 3. Security: Webhook HMAC-SHA256 Signature Verification
Implemented in `integrations/razorpay/client.ts`:
- Validates `x-razorpay-signature` against raw request payload and `RAZORPAY_WEBHOOK_SECRET`.
- Uses `crypto.timingSafeEqual` to prevent timing side-channel attacks.

---

### 4. Idempotency & Concurrency Latching
- In-memory and persistent `ExecutionIntentStore` tracks intent keys before API dispatch.
- Synchronously latches active execution promises so 100 simultaneous concurrent webhooks result in exactly **one** Razorpay Payment Link creation.
