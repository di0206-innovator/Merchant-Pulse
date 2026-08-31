# MerchantPulse ⚡

> **Autonomous AI Revenue Recovery Agent for Indian Merchants.**  
> MerchantPulse continuously monitors transaction lifecycles, detects revenue leakage, computes deterministic expected economic value and recovery priority, prompts Gemini only for bounded strategy reasoning within a strict action allowlist, enforces multi-tier merchant policy guardrails, dispatches idempotent Razorpay API primitives, and verifies financial recovery through cryptographic webhook reconciliation with strict organic attribution segregation.

*Razorpay Buildathon 2026 Submission — Track 03: AI Revenue Recovery*  
**Core Thesis: Code establishes financial truth. AI reasons over verified facts. Policy decides whether an action is allowed. Razorpay executes. Webhooks prove recovery.**

---

## ⚡ 60-Second Quickstart & Golden Demo

```bash
git clone https://github.com/divyanshusinha/Merchant-Pulse.git
cd Merchant-Pulse
npm install

# 1. Run Complete Test Suite (18 test files, 85/85 passing tests)
npm test

# 2. Run Reproducible Evaluation Benchmark Suite
npm run test:eval

# 3. Verify TypeScript Type Safety & Production Next.js Build
npm run type-check
npm run build

# 4. Launch Interactive Merchant & Reviewer Cockpit
npm run dev
# Open http://localhost:3000/reviewer in your browser and click "Run Golden Demo (Auto Recovery)"
```

---

## 🧭 Reviewer Evaluation Guide

For judges and reviewers evaluating this submission:

1. **Reviewer Cockpit (`/reviewer`):**
   - **System Readiness Panel:** Live verification for Razorpay Adapter (Live vs Mock), Gemini Provider (Live vs Deterministic Fallback), Persistence Store (Supabase Postgres vs In-Memory), and Webhook HMAC-SHA256 Auth.
   - **Interactive Scenario 1 (Live Auto-Recovery):** High-Value ₹8,500 UPI failure → AI diagnostic reasoning → Net EV & Priority scoring → Policy Auto-Pass → Razorpay Payment Link dispatch → Webhook paid verification → Reconciled & Attributed.
   - **Interactive Scenario 2 (Adversarial Policy Escalation):** High-Value ₹65,000 transaction → Exceeds ₹25,000 auto-cap → Guardrail blocks automated dispatch → Routes to Human Escalation Queue → 1-Click Merchant Authorization & Verification.
   - **Hero Metric Indicators:** Revenue at Risk, Total Recovered GMV, Attributed Intervention GMV, Organic Recovery GMV, Automation Rate, and Human Escalation Queue counter.

2. **Merchant Command Center (`/dashboard`):**
   - **Recovery Opportunity Queue:** Priority-ranked leaks (0-100 score, CRITICAL / HIGH / MEDIUM / LOW tiers) with filters for High Priority, Escalated, Dispatched, Recovered, Organic, and Suppressed.
   - **Incident Detail Drawer:** Full 10-step decision trail answering *WHO, WHAT HAPPENED, HOW MUCH IS AT RISK, WHY RECOVERABLE, HOW IMPORTANT (PRIORITY), WHAT TO DO, WHY, IS IT SAFE, WHAT HAPPENED AFTERWARD, and ATTRIBUTION*.
   - **Gateway Health Radar:** Real-time bank downtime and method degradation tracking across UPI, NetBanking, and Cards.

3. **Cryptographic Audit Ledger (`/audit`):**
   - Immutable append-only audit trail logging input facts, LLM prompt/response metadata, rule-by-rule policy checks, executed references, and webhook verification receipts with zero double-counting guarantees.

4. **Comparative Benchmark Suite (`/benchmark`):**
   - Reproducible batch evaluation against 1,000 held-out payment events proving recovery lift over naive blast-and-spam and no-action baselines.

---

## 🎯 The Core Financial Problem

Indian digital merchants lose between 3% and 7% of Gross Merchandise Value (GMV) to payment failures, checkout abandonment, bank downtime, and order state synchronization issues. Existing solutions fail in two distinct ways:

1. **Dumb Blast-and-Spam Automation:** Blindly messaging every failed customer with fixed discounts burns merchant margins, spams users (triggering fatigue and opt-outs), incurs wasted WhatsApp/SMS gateway fees, and gives away margin on transactions that would have converted organically.
2. **Unconstrained LLM Chatbots:** Hallucinating financial arithmetic, making up discount percentages, leaking internal state, and triggering unvalidated execution primitives without policy checks.

### The MerchantPulse Solution: Strict Architectural Separation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MERCHANTPULSE ENGINE                             │
│                                                                             │
│  1. Code establishes financial truth (Integer paise arithmetic, Net EV).    │
│  2. AI reasons over verified facts (Bounded strategy & empathetic copy).   │
│  3. Policy decides whether AI recommendations may become action.            │
│  4. Razorpay executes real primitives (/v1/payment_links, order sync).      │
│  5. Webhooks verify and attribute recovery (Zero double-counting).         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The 10-Step Closed Loop

```
[1. INBOUND EVENT] ──► Webhook (payment.failed, order.created, etc.) HMAC verified
       │
       ▼
[2. DETECTION] ──────► Classifies failure type & extracts customer / gateway evidence
       │
       ▼
[3. DIAGNOSIS] ──────► Reasons over technical failure modes (bank timeout, limit, etc.)
       │
       ▼
[4. ECONOMIC MATH] ──► Net EV = (P(success) × Recoverable GMV) - Intervention Cost - Fatigue
       │
       ▼
[5. PRIORITIZATION] ─► Deterministic 0-100 score (EV × P(success) × Urgency × LTV)
       │
       ▼
[6. ACTION DECISION] ► Bounded selection: CREATE_PAYMENT_LINK, SEND_PAYMENT_REMINDER,
       │               NOTIFY_ALTERNATIVE_METHOD, RECONCILE_ORDER_STATE, NO_ACTION
       ▼
[7. POLICY GATE] ────► Multi-tier safety rules: Auto-Cap (₹25k), Cooldown, Positive EV
       │
    ┌──┴─────────────────────────┐
    ▼ (PASS)                     ▼ (VIOLATION / OVER-LIMIT)
[8a. AUTO-DISPATCH]        [8b. HUMAN REVIEW QUEUE] ──► Merchant 1-Click Approval
    │                            │
    ▼                            ▼
[Idempotent Dispatcher] ──► Razorpay API (/v1/payment_links, order reconciliation)
       │
       ▼
[9. OUTCOME VERIFICATION] ► Ingests payment_link.paid webhook with cryptographic matching
       │
       ▼
[10. ATTRIBUTION & LEDGER]► Segregates ATTRIBUTED_INTERVENTION vs ORGANIC_RECOVERY.
                            Appends immutable decision record to audit ledger.
```

---

## 📐 Deterministic Financial Invariants

MerchantPulse is engineered with hard mathematical and architectural guarantees:

1. **Zero LLM Arithmetic:** All currency values, fees, probabilities, Net Expected Values, and Priority Scores are calculated strictly in TypeScript integer paise. The LLM has zero arithmetic agency.
2. **Deterministic Priority Engine:** Priority scores are computed transparently:
   $$\text{Priority} = 0.35 \times \text{EV} + 0.30 \times P(\text{success}) + 0.20 \times \text{LTV} + 0.15 \times \text{Urgency} - \text{Fatigue}$$
   Bounded deterministically between 0 and 100 integer.
3. **Bounded Action Universe:** Strategy reasoning is strictly constrained to 6 allowlisted actions:
   `CREATE_PAYMENT_LINK`, `SEND_PAYMENT_REMINDER`, `NOTIFY_ALTERNATIVE_METHOD`, `RECONCILE_ORDER_STATE`, `ESCALATE_TO_OPS`, `NO_ACTION`.
4. **Multi-Tier Policy Safety Gate:**
   - **Low Risk:** Automatically executed if Net EV is positive, under ₹25,000, and customer contact cooldown is satisfied.
   - **Medium Risk:** Routed to Human Escalation Queue for explicit merchant approval.
   - **High Risk / Negative EV:** Hard rejection and suppression to preserve merchant margins and customer trust.
5. **Zero Double-Counting Guarantee:** Re-delivered or duplicate webhooks return idempotent HTTP 200 without duplicate attribution or re-execution.
6. **Strict Organic Attribution:** Customers who recover independently on alternative payment methods without using a MerchantPulse link are classified as `ORGANIC_RECOVERY` and strictly segregated from agent-attributed GMV.

---

## 🧪 Comprehensive Test & Evaluation Suite

MerchantPulse includes 18 test suites covering 85+ automated tests:

| Test Suite | Focus Area | Status |
| :--- | :--- | :--- |
| `tests/unit/priority.test.ts` | Deterministic 0-100 Priority Scoring Math | ✅ PASS |
| `tests/unit/reconciliation.test.ts` | Organic vs Attributed Closed-Loop Proofs | ✅ PASS |
| `tests/unit/policy.test.ts` | Multi-tier Guardrail Enforcement & Suppression | ✅ PASS |
| `tests/unit/revenue.test.ts` | Net EV & Integer Paise Economics | ✅ PASS |
| `tests/unit/gateway.test.ts` | Bank Health Degradation & Method Routing | ✅ PASS |
| `tests/unit/strategy.test.ts` | Gemini Prompt Contract & Deterministic Fallback | ✅ PASS |
| `tests/stress/concurrency.test.ts` | 500-User Concurrent Load & Idempotency Latching | ✅ PASS |
| `tests/evaluation/benchmark.test.ts` | 10-Scenario Adversarial Benchmark | ✅ PASS |
| `tests/evaluation/batch/*.test.ts` | 1,000-Event Held-Out Batch Evaluation | ✅ PASS |

To run the complete test suite:
```bash
npm test
```

---

## 🛠️ Environment Configuration

MerchantPulse operates in dual modes:
1. **Zero-Config Offline Mode:** Uses `MockRazorpayClientAdapter` and deterministic rule fallbacks. Fully functional out-of-the-box for instant reviewer evaluation.
2. **Live Production / Test Mode:** Connects to live Razorpay Test API, Gemini 2.5 Flash, and Supabase Postgres.

```env
# Optional Live API Keys (.env.local)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
```

---

## 🏆 Razorpay Buildathon 2026 Track 03 Alignment

- **Product:** MerchantPulse
- **Track:** Track 03 — AI Revenue Recovery
- **Architecture:** Autonomous Closed-Loop AI Revenue Recovery Agent
- **Execution Primitives:** Razorpay Payment Links API (`/v1/payment_links`), Order State Reconciliation, Webhook HMAC Verification (`/api/webhooks/razorpay`).
