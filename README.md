# MerchantPulse

MerchantPulse is an AI-assisted revenue intelligence prototype for Razorpay merchants.

## Core thesis

**Deterministic facts → AI strategy → policy gate → valid payment action → measured outcome.**

The project deliberately does not let an LLM perform financial arithmetic or directly execute arbitrary payment actions.

## Current build slice

- Deterministic payment parsing and failure classification
- Revenue opportunity detection
- Economic recommendation layer
- Policy gate before execution
- Append-only in-process audit trail for the prototype
- Razorpay webhook verification boundary
- Merchant dashboard with demo data
- Vitest coverage for the core decision path

## Razorpay integration principle

Razorpay's Payments API can retrieve payment details and capture authorised payments, but it is not a generic payment-collection/retry endpoint. MerchantPulse therefore models recovery as a valid follow-up payment flow and listens for the resulting Razorpay webhooks rather than inventing a `retryPayment` endpoint.

Razorpay webhook verification uses the raw request body and `X-Razorpay-Signature`; duplicate events should be de-duplicated using `x-razorpay-event-id` in the persistence layer.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 and click **Run revenue analysis**.

## Environment

```bash
GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

The current UI runs on deterministic demo data. Live Razorpay ingestion and Gemini strategy calls are intentionally isolated behind boundaries so the core does not depend on external services.
