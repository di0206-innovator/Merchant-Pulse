# MerchantPulse Architecture & System Pipeline

MerchantPulse is an **AI Revenue Recovery Agent for Razorpay Merchants** designed for Track 03 of the Razorpay AI Buildathon 2026.

## System Architecture Overview

```
Observed Payment Event ──► Deterministic Analysis ──► AI Strategy ──► Policy Validation ──► Valid Execution ──► Closed-Loop Reconciliation ──► Audit Ledger
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MERCHANTPULSE CREED                             │
│                                                                             │
│  "Code establishes truth.                                                   │
│   AI reasons over truth.                                                    │
│   Policy determines whether reasoning may become action.                    │
│   Valid code executes real Razorpay primitives.                             │
│   Events prove what actually happened."                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data & Logic Flow

1. **Event Gateway**: Ingests Razorpay webhooks (`payment.failed`, `order.paid`, `payment_link.paid`). Validates HMAC-SHA256 signature, deduplicates via idempotency key, parses payload using Zod schemas, and normalizes into standard `DomainEvent` objects.
2. **Deterministic Revenue Engine**: Records events into `RevenueFactStore`. Detects failure anomalies and opportunity types. Calculates Expected Economic Value (EV) in integer paise using:
   $$\text{EV} = (P_{\text{success}} \times \text{Recoverable GMV}) - \text{Intervention Cost} - \text{Fatigue Penalty}$$
3. **AI Strategy Reasoning Layer**: Formulates recovery diagnosis, strategy selection, confidence score, and custom SMS/Email copy using `@google/genai` (Gemini 2.5 Flash). Strict Zod schema validation intercepts malformed output and triggers a deterministic fallback.
4. **Policy Engine (Guardrails)**: Evaluates 6 policy gates (State Consistency, Action Allowlist, Positive Net EV, 24h Contact Cooldown, Evidence Sufficiency, Max ₹25,000 Auto-GMV Threshold).
5. **Execution & Razorpay Integration**: Registers execution-intent idempotency (`EXECUTION_IN_FLIGHT`, `EXECUTION_SUCCEEDED`) before invoking Razorpay REST APIs (`POST /v1/payment_links`).
6. **Closed-Loop Attribution & Reconciliation**: Matches incoming `payment_link.paid` webhooks back to original `decision_id` and checks for duplicate payments or organic recovery.
