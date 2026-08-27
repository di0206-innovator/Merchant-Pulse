# MerchantPulse ⚡

> **MerchantPulse finds recoverable failed-payment revenue, calculates expected economic value deterministically, asks Gemini only for bounded strategy reasoning and customer copy, enforces merchant policy guardrails, executes valid Razorpay Payment Link primitives, and proves recovery through webhook-based reconciliation.**

*Razorpay Buildathon 2026 Submission — Track 03: AI Revenue Recovery Agent*  
**Built with strict zero-trust financial invariants: Code establishes truth. AI reasons over facts. Policy decides action. Razorpay executes. Webhooks prove.**

---

## ⚡ 60-Second Demo & Quickstart

```bash
git clone https://github.com/divyanshusinha/Merchant-Pulse.git
cd Merchant-Pulse
npm install

# 1. Run Complete Test Suite (60/60 passing tests)
npm test

# 2. Run Reproducible 1,000-Event Held-Out Recovery Benchmark
npm run benchmark:heldout

# 3. Launch Interactive Reviewer Cockpit & Merchant Dashboard
npm run dev
# Open http://localhost:3000/reviewer in your browser and click "RUN 1-CLICK GOLDEN DEMO"
```

---

## 🧭 Reviewer Evaluation Guide

For judges and reviewers evaluating this submission:

1. **Reviewer Cockpit (`/reviewer`):**
   - **System Readiness Panel:** Immediate visual feedback on Razorpay Adapter (Live vs Mock), Gemini Provider (Live vs Deterministic Fallback), Persistence Store (Supabase vs In-Memory), and HMAC Webhook Verification.
   - **Live 7-Stage Pipeline Trace:** Step-by-step visual execution from `payment.failed` to `payment_link.paid` closed-loop reconciliation.
   - **Financial Truth Proofs:** Demonstrates zero LLM arithmetic, zero double-counting, organic separation, and cryptographic audit records.
2. **Merchant Command Center (`/dashboard`):**
   - Live revenue leak monitoring, EV metrics, human escalation review queue, and verified ledger logs.
3. **Reproducible Evaluation Suite (`/benchmark`):**
   - 1,000-event held-out evaluation comparing MerchantPulse against Rules-Only and No-Action baselines.

---

## 🎯 The Core Financial Problem

Digital merchants lose between 3% and 7% of Gross Merchandise Value (GMV) to payment failures, bank timeouts, and checkout dropoffs. Existing systems suffer from two fatal extremes:
1. **Dumb Blast-and-Spam:** Blindly messaging every failed payment burns customer goodwill, incurs intervention fees, and discounts transactions that would have converted organically.
2. **Unconstrained LLM Chatbots:** Hallucinating financial numbers, making up accounting ledger math, and triggering unauthorized payment actions.

**MerchantPulse solves this through bounded architectural separation:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SAFETY BOUNDARY                                 │
│                                                                             │
│  1. Code establishes financial truth (Integer paise deterministic EV).      │
│  2. AI reasons over verified facts (Bounded strategy & empathetic copy).   │
│  3. Policy decides whether AI recommendations may become action.            │
│  4. Razorpay executes real primitives (/v1/payment_links).                  │
│  5. Webhook events prove what actually happened (Zero double-counting).    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Technical Architecture & Pipeline

MerchantPulse executes a 7-stage deterministic pipeline:

```
[payment.failed Webhook] 
       │ (HMAC-SHA256 Ingestion)
       ▼
[1. Revenue Fact Store] ──► Ingests customer LTV, gateway uptime & failure codes
       │
       ▼
[2. Deterministic EV Calculator] ──► Net EV = (P(success) × Recoverable GMV) - Cost - Fatigue
       │
       ▼
[3. Bounded AI Strategy (Gemini 2.5)] ──► Diagnoses failure, selects action from allowlist
       │
       ▼
[4. Policy Guardrails Engine] ──► Checks ₹25,000 auto-cap, 24h cooldown, positive EV margin
       │
   ┌───┴─────────────────────────┐
   ▼                             ▼
[AUTO_EXECUTE]             [ESCALATE_HUMAN]
   │                             │ (Merchant One-Click Review)
   ▼                             │
[5. Action Dispatcher] ◄─────────┘
   │ (Idempotent Promise Latching)
   ▼
[6. Razorpay Payment Links API] ──► Generates https://rzp.io/i/... with dynamic expiry
       │
       ▼
[7. Financial Reconciliation] ──► Matches payment_link.paid, verifies amount & zero double-counting
       │
       ▼
[Append-Only Audit Ledger] ──► Cryptographic record with SHA256 decision hashes
```

---

## 📊 Held-Out Benchmark Results (1,000 Synthetic Events)

*Executed via `npm run benchmark:heldout` (PRNG Seed: `20260825`, 80% Train / 20% Held-Out Split)*

| Metric | No-Action Baseline | Deterministic Rules-Only | MerchantPulse AI Strategy |
|---|---|---|---|
| **Total Failed GMV** | ₹17,73,500.00 | ₹17,73,500.00 | ₹17,73,500.00 |
| **Attempted Interventions** | 0 | 185 | 114 |
| **Gross Recovered GMV** | ₹0.00 | ₹10,12,500.00 | ₹6,18,500.00 |
| **Intervention Fees & Fatigue** | ₹0.00 | ₹23,979.89 | ₹21,329.31 |
| **Net Recovered GMV** | ₹0.00 | ₹9,88,520.11 | **₹5,97,170.69** |
| **Customer Contact Fatigue Violations** | 0 | 38 | **0 (Guaranteed)** |
| **Unsafe / Negative-EV Executions** | 0 | 21 | **0 (Guaranteed)** |
| **Double-Counting Violations** | 0 | 0 | **0 (Guaranteed)** |

> *Note: All benchmark datasets are generated from synthetic payment events calibrated to empirical Razorpay checkout distributions.*

---

## ⚡ Razorpay Integration Primitives

| Primitive | Endpoint / Webhook | Purpose in MerchantPulse |
|---|---|---|
| **Payment Failed** | `payment.failed` | Instant ingestion trigger for revenue leak evaluation |
| **Payment Captured** | `payment.captured` | Baseline GMV tracking & organic resolution matching |
| **Payment Links API** | `POST /v1/payment_links` | Dynamic recovery link generation with custom expiry |
| **Payment Link Paid** | `payment_link.paid` | Closed-loop outcome attribution and reconciliation |
| **HMAC Signature** | `x-razorpay-signature` | Timing-safe raw webhook body cryptographic verification |

---

## 🧪 Comprehensive Test & Quality Verification

Run all test suites locally:

```bash
# 1. Unit, Stress & Integration Tests (15 files, 60 tests)
npm test

# 2. Evaluation Scenario Benchmarks (17 tests)
npm run test:eval

# 3. Adversarial Policy Safety Benchmark
npm run benchmark:safety

# 4. Held-Out 1,000-Event Dataset Simulation
npm run benchmark:heldout

# 5. Strict TypeScript Compilation Check
npm run type-check

# 6. ESLint Production Verification
npm run lint

# 7. Production Bundle Build
npm run build
```

---

## 🔒 Security & Credential Hygiene

- **Zero Hardcoded Secrets:** No API keys or webhook secrets are stored in code, tests, or fallback constructors.
- **Server-Side Isolation:** `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `GEMINI_API_KEY`, and Supabase service keys are strictly isolated to server runtimes and never exposed to the client bundle.
- **Safe Hermetic Fallback:** In the absence of live API keys, MerchantPulse operates transparently in deterministic mock mode with honest status labels.
- Read full security documentation in [`docs/security.md`](./docs/security.md).

---

## 📂 Repository Structure

```
├── app/                        # Next.js App Router
│   ├── reviewer/               # Reviewer cockpit with 1-click golden demo
│   ├── dashboard/              # Live merchant terminal & recovery cockpit
│   ├── audit/                  # Append-only cryptographic audit trail
│   ├── benchmark/              # Batch evaluation harness UI
│   └── api/webhooks/razorpay/  # Hardened HMAC webhook receiver
├── core/                       # Pure TypeScript Domain & Business Engine
│   ├── domain/                 # Zod schemas (Payment, Opportunity, Policy, Strategy, Audit)
│   ├── revenue/                # FactStore, Detector, Metrics, FinancialReconciliationEngine
│   ├── strategy/               # Prompt v2.1.0, AI & Deterministic Providers, Telemetry
│   ├── policy/                 # PolicyEngine (6 safety guardrails)
│   ├── execution/              # ActionDispatcher (Concurrency & State Machine)
│   ├── storage/                # Repository Abstractions (InMemory & Supabase PostgreSQL)
│   └── pipeline/               # RevenuePipelineOrchestrator
├── integrations/               # External Service Adapters
│   ├── razorpay/               # Live & Mock RazorpayClientAdapter with HMAC validation
│   └── gemini/                 # GeminiStrategyProvider with strict JSON schema parsing
├── supabase/                   # PostgreSQL Schema & SQL Migrations
│   └── migrations/             # Idempotent DDL with RLS policies & indexes
├── docs/                       # Architecture, Security, Pitch, and Runbook Documentation
└── tests/                      # Vitest Unit, Integration, Stress, and Safety Tests
```

---

## 📄 License & Attribution

Built for the **Razorpay Buildathon 2026** by **Divyanshu Sinha**.  
Licensed under the [MIT License](./LICENSE).
