# MerchantPulse ⚡

> **MerchantPulse finds failed payment revenue that is recoverable, chooses the highest-value bounded intervention, executes it through Razorpay primitives, and proves whether the intervention recovered money.**

*Razorpay Buildathon 2026 Submission — Track 03: AI Revenue Recovery*

---

## ⚡ 30-Second Demo & Quickstart

```bash
git clone https://github.com/di0206-innovator/Merchant-Pulse.git
cd Merchant-Pulse
npm install

# Run the reproducible 1,000-event batch recovery benchmark
npm run benchmark

# Launch the interactive Merchant Revenue Command Center
npm run dev
# Open http://localhost:3000 in your browser and click "RUN FULL DEMO"
```

---

## 🎯 The Problem

Digital merchants lose between 3% to 7% of gross merchandise value (GMV) to payment failures, bank timeouts, and checkout dropoffs. Existing dashboards only report what was lost, while generic LLM chatbots hallucinate accounting numbers or trigger unconstrained financial actions.

---

## 💳 Why Razorpay

Razorpay provides dynamic primitives (`POST /v1/payment_links`, `payment.failed` webhooks, customer messaging endpoints) that allow digital merchants to re-engage customers with zero friction. MerchantPulse turns these raw primitives into an autonomous, policy-gated revenue recovery engine.

---

## 🏗️ What Was Built

- **Event Gateway:** HMAC-SHA256 signature verification, event deduplication, Zod schema validation, and normalization for Razorpay webhooks.
- **Deterministic Revenue Engine:** Integer paise EV math, failure code classification, and empirical cohort calibration.
- **AI Strategy Layer:** Gemini 2.5 Flash reasoning for diagnosis, strategy ranking, and messaging copy with Zod output validation and fallback protection.
- **Policy Guardrails:** 6 policy rules enforcing ₹25,000 max auto-GMV threshold, 24h contact cooldown, minimum EV margin, and human review escalation.
- **Execution & Outcome Loop:** Idempotent Razorpay Payment Link dispatcher, closed-loop webhook outcome tracking, and financial reconciliation.
- **Batch Evaluation Engine:** Reproducible 1,000+ synthetic event benchmark (`npx benchmark`) comparing AI against No-Action and Rules-Only baselines.

---

## 📊 Batch Benchmark Results (Synthetic Data)

*Generated via `npm run benchmark:heldout` (Seed: 20260825, Batch: 1,000 events, 20% held-out split)*

| Metric | No-Action Baseline | Deterministic Rules-Only | MerchantPulse AI Strategy |
|---|---|---|---|
| **Total Failed GMV** | ₹34,20,500 | ₹34,20,500 | ₹34,20,500 |
| **Attempted Recovery GMV** | ₹0 | ₹28,45,000 | ₹19,80,000 |
| **Gross Recovered GMV** | ₹0 | ₹9,50,000 | ₹14,20,000 |
| **Intervention Fees** | ₹0 | ₹42,600 | ₹16,500 |
| **Net Recovered GMV** | ₹0 | ₹9,07,400 | **₹14,03,500** |
| **Net Recovery Rate** | 0.0% | 26.5% | **41.0%** |
| **Human Escalated GMV** | ₹0 | ₹0 | ₹7,50,000 |
| **Unsafe Executions** | 0 | 14 | **0 (Guaranteed)** |

---

## 🤖 AI Contribution & Strategy Selection

Gemini 2.5 Flash receives read-only deterministic facts (failure code, bank downtime, customer LTV, EV math) and provides:
1. Concise technical failure diagnosis.
2. Ranking of bounded recovery actions (`CREATE_PAYMENT_LINK`, `SEND_PAYMENT_REMINDER`, `NOTIFY_ALTERNATIVE_METHOD`, `ESCALATE_TO_OPS`, `NO_ACTION`).
3. Empathetic, personalized customer messaging copy.
4. Business justification for human ops review.

---

## 🛡️ Safety Boundary & Financial Truth Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SAFETY BOUNDARY                                 │
│                                                                             │
│  "Code establishes truth.                                                   │
│   AI reasons over truth.                                                    │
│   Policy determines whether reasoning may become action.                    │
│   Valid code executes real Razorpay primitives.                             │
│   Events prove what actually happened."                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Zero LLM Arithmetic:** All GMV, balances, fees, and EV math are calculated in TypeScript integer paise.
- **Schema Validation:** Malformed AI outputs automatically fall back to deterministic mock recommendations.
- **Policy Enforcement:** Autonomous execution is blocked for transactions > ₹25,000 or negative EV.

---

## 📐 Pipeline Architecture

```
Observed Payment Event ──► Deterministic Analysis ──► AI Strategy ──► Policy Validation ──► Valid Execution ──► Closed-Loop Reconciliation ──► Audit Ledger
```

*Full architecture documentation: [`docs/architecture.md`](./docs/architecture.md)*

---

## ⚡ Razorpay Integration

| Primitive | Endpoint / Webhook | Purpose in MerchantPulse |
|---|---|---|
| **Payment Failed** | `payment.failed` | Instant trigger for recovery analysis |
| **Payment Captured** | `payment.captured` | Baseline GMV tracking & organic resolution |
| **Payment Links API** | `POST /v1/payment_links` | Dynamic link generation with custom expiry |
| **Payment Link Paid** | `payment_link.paid` | Closed-loop outcome attribution |
| **HMAC Verification** | `x-razorpay-signature` | Timing-safe raw body validation |

---

## 🔄 Recovery Attribution & Reconciliation

MerchantPulse uses `FinancialReconciliationEngine` ([`core/revenue/reconciliation.ts`](./core/revenue/reconciliation.ts)) to enforce:
- Zero double-counting of payment decisions or payment IDs.
- Matching incoming paid payment link references against original `decision_id` records.
- Explicit separation of organic recoveries vs. intervention-attributed recoveries.

---

## 🧪 Evaluation Test Harness

Run the verification test matrix:

```bash
npm test             # Unit & Integration tests (41 tests passing)
npm run test:eval    # 10-scenario evaluation benchmark matrix
npm run benchmark:safety # 32-scenario adversarial safety matrix
npm run type-check   # Strict TypeScript verification
npm run build        # Production Next.js build verification
```

---

## 🛡️ Failure-Safe Behaviors

- **Gemini Unavailable:** Instant fallback to `MockStrategyProvider`.
- **Razorpay API Error:** Execution recorded as `FAILED`, opportunity preserved for retry.
- **Duplicate Webhooks:** Filtered via `x-razorpay-event-id` idempotency ledger.

---

## 💻 Local Setup

1. **Clone repo:** `git clone https://github.com/di0206-innovator/Merchant-Pulse.git`
2. **Install:** `npm install`
3. **Environment:** `cp .env.example .env.local` (Optional keys for live Razorpay & Gemini)
4. **Run Dev:** `npm run dev`

---

## 🔑 Razorpay Test Mode Setup

To run against live Razorpay Test Mode:
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in `.env.local`. MerchantPulse automatically switches from `MockRazorpayClientAdapter` to `LiveRazorpayClientAdapter`.

---

## 🔁 Reproducibility

To reproduce identical benchmark metrics:
```bash
npx tsx scripts/runBenchmark.ts --size=1000 --seed=20260825
```

---

## ⚠️ Known Limitations & Synthetic Data Disclosure

- Development uses deterministic in-memory ledgers for demo speed.
- All benchmark results reported in `docs/benchmark-report.md` are derived from synthetic payment datasets generated with PRNG seed 20260825.

---

## 📄 License
Licensed under the [MIT License](./LICENSE). Built by Divyanshu Sinha for Razorpay Buildathon 2026.
