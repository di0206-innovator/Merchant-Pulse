# Razorpay Capabilities & Integration Mapping

*MerchantPulse Technical Credibility Document — Verified against official Razorpay documentation.*

---

## 1. Architectural Principle
MerchantPulse strictly adheres to official Razorpay capabilities. No hypothetical or hallucinated endpoints are used. 

Financial Truth & Safety Rules:
1. **No Refund-as-Incentive**: Refunds are post-transaction reversals of captured funds, never a recovery mechanism for failed payments.
2. **Subunit Precision**: All Razorpay currency values operate in integer subunits (paise for INR; e.g., ₹1,200.50 is represented as `120050`).
3. **Idempotency & Nonce Checks**: Webhooks and API calls utilize unique identifiers (`x-razorpay-event-id`, `reference_id`, and `idempotency_key`) to prevent double-processing and duplicate charges.

---

## 2. Verified Capabilities Matrix

| Capability | Official Razorpay Endpoint / Event | Purpose in MerchantPulse | Request / Payload Semantics | Response / Event Semantics | Official Docs Source |
|---|---|---|---|---|---|
| **Payment Webhook: Failed** | Event: `payment.failed` | Primary trigger for payment degradation detection & instant recovery interventions | Incoming webhook containing error code, error description, payment method, bank, VPA, customer contact | Normalized into `PaymentFailedEvent` with failure code taxonomy | [Razorpay Webhooks](https://razorpay.com/docs/webhooks/) |
| **Payment Webhook: Captured** | Event: `payment.captured` | Recovery measurement trigger & revenue tracking | Incoming webhook with amount, fee, tax, payment method, order ID | Confirms successful resolution of opportunity or organic revenue | [Razorpay Webhooks](https://razorpay.com/docs/webhooks/) |
| **Payment Webhook: Authorized** | Event: `payment.authorized` | In-flight payment tracking for two-step capture flows | Incoming webhook with authorization state | Recorded in event ledger | [Razorpay Webhooks](https://razorpay.com/docs/webhooks/) |
| **Order Webhook: Paid** | Event: `order.paid` | Checkout funnel completion verification | Incoming webhook linking multi-payment attempts to single order | Resolves open checkout abandonment opportunities | [Razorpay Orders](https://razorpay.com/docs/api/orders/) |
| **Payment Links: Create** | `POST /v1/payment_links` | Dynamic personalized payment link generation for failed payment / checkout recovery | `amount`, `currency`, `accept_partial`, `first_partial_min_amount`, `reference_id`, `description`, `customer` (`name`, `email`, `contact`), `notify` (`sms`, `email`), `reminder_enable`, `notes`, `expire_by`, `callback_url` | `id` (`plink_xxx`), `status`, `short_url`, `amount`, `currency`, `expire_by`, `created_at` | [Razorpay Payment Links](https://razorpay.com/docs/api/payment-links/) |
| **Payment Links: Cancel** | `POST /v1/payment_links/:id/cancel` | Invalidate stale recovery links when policy threshold expires or customer completes via alternative channel | Empty body or cancellation reason in path | Updated link object with `status: "cancelled"` | [Razorpay Payment Links](https://razorpay.com/docs/api/payment-links/) |
| **Payment Links: Send Notification** | `POST /v1/payment_links/:id/notify_by/:medium` | Re-send payment link reminder via SMS or email for high-value cohorts | Medium: `sms` or `email` in path | `{"success": true}` | [Razorpay Payment Links](https://razorpay.com/docs/api/payment-links/) |
| **Payment Link Webhooks** | `payment_link.paid`, `payment_link.partially_paid`, `payment_link.expired`, `payment_link.cancelled` | Closed-loop outcome measurement for executed recovery actions | Webhook payload containing `payment_link` entity and `payment` entity | Updates opportunity status from `EXECUTED` to `RECOVERED` or `EXPIRED` | [Razorpay Webhooks](https://razorpay.com/docs/webhooks/) |
| **Orders: Create** | `POST /v1/orders` | Create re-routed or split-checkout order for degraded payment gateway workarounds | `amount`, `currency`, `receipt`, `notes`, `partial_payment` | `id` (`order_xxx`), `amount`, `currency`, `status`, `created_at` | [Razorpay Orders](https://razorpay.com/docs/api/orders/) |
| **Customers: Fetch / Create** | `GET /v1/customers/:id`, `POST /v1/customers` | Customer cohort analysis (LTV, past payment failure rate, preferred payment method) | `name`, `contact`, `email`, `notes` | `id` (`cust_xxx`), `name`, `email`, `contact`, `created_at` | [Razorpay Customers](https://razorpay.com/docs/api/customers/) |

---

## 3. Webhook Signature Verification Specification

### Cryptographic Contract
Razorpay signs webhook payloads using HMAC-SHA256 with the merchant's configured Webhook Secret.

```typescript
import crypto from 'node:crypto';

export function verifyRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signature || !webhookSecret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}
```

### Safety Requirements
1. **Raw Body Preserved**: Signature verification must occur on unparsed UTF-8 raw request bytes before JSON deserialization.
2. **Timing Safe Comparison**: Use constant-time byte comparison (`crypto.timingSafeEqual`) to prevent timing attack vulnerabilities.
3. **Idempotency Guard**: Webhook event ID (`x-razorpay-event-id` header or `payload.contains.event_id`) is logged to the idempotency table before processing. Duplicate events return HTTP 200 OK immediately without re-triggering analysis or execution.

---

## 4. MerchantPulse Interventions Mapped to Real Razorpay Primitives

| Revenue Opportunity Type | Root Cause / Diagnosis | Safe Razorpay Action Primitive | Policy Guardrails |
|---|---|---|---|
| **High-Value Dropoff Recovery** | UPI / NetBanking network failure during checkout of order > ₹2,000 | `POST /v1/payment_links` with customer contact + SMS/Email notification + 2-hour expiry | Maximum 1 link per customer per 24h; GMV threshold check; Merchant active opt-in |
| **Recurring / Retrying Customer Assist** | Customer has 2+ consecutive bank decline errors on card | `POST /v1/payment_links` offering alternative payment method (UPI / Netbanking pre-selected) with customized note | Frequency cap; No price alteration; EV > ₹50 |
| **Degraded Payment Method Nudge** | Real-time spike in bank downtime (e.g. HDFC Netbanking error rate > 40%) | Dynamic Smart Checkout note / Alternative routing recommendation | Escalation to Merchant Ops if systemic; No automated checkout config change without explicit approval |
| **Abandoned Cart Recovery** | Order created (`order_xxx`) but no payment attempted within 30 minutes | `POST /v1/payment_links` linked to `order_id` with 24-hour expiry | Customer consented to contact; Expiry policy enforced |

---

## 5. Summary
MerchantPulse does not invent imaginary Razorpay APIs. Every action candidate generated by the AI strategy layer maps 1:1 to a strictly typed, policy-checked, and executable Razorpay SDK call.
