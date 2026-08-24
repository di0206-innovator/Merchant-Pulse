# MerchantPulse — 5-Minute Pitch & Presentation Narrative

> **Track**: AI Growth & Agentic Commerce | Razorpay Buildathon

---

## 1. The Hook (Minute 1: The Problem)
"Every month, Indian merchants on Razorpay lose billions of rupees to failed payments, bank downtime spikes, and abandoned checkouts. 

Today, merchants face a painful choice:
1. Either manually inspect payment logs when it's already too late.
2. Or build dumb automated rules that spam customers with generic links, driving customer fatigue and high churn.
3. Or deploy hype-driven 'AI agents' that hallucinate financial numbers, make unauthorized refunds, or break gateway policies.

We asked: **What if an AI revenue system knew where AI belongs, and more importantly, where AI does NOT belong?**"

---

## 2. The Solution (Minute 2: The Architecture)
"Introducing **MerchantPulse** — an autonomous revenue intelligence engine built natively on Razorpay payment infrastructure.

MerchantPulse operates on a single core architectural axiom:
> *Code establishes truth. AI reasons over truth. Policy determines whether reasoning may become action. Valid code executes real Razorpay primitives. Events prove what actually happened.*

Here is how the closed loop works:
1. **Event Gateway**: Ingests Razorpay webhooks (`payment.failed`, `order.paid`) with cryptographic HMAC-SHA256 signature verification and event idempotency.
2. **Deterministic Revenue Engine**: Computes exact GMV in integer paise, detects issuer degradations, and calculates Expected Economic Value (EV) before AI is ever touched.
3. **AI Strategy Layer (Google Gemini)**: Formulates personalized recovery diagnoses and customer messaging grounded strictly in verified transaction facts.
4. **Policy Engine**: Enforces 6 strict guardrails (action allowlists, EV profitability gates, 24-hour customer contact cooldowns, and a ₹25,000 auto-execution threshold).
5. **Execution & Outcome Loop**: Automatically dispatches verified Razorpay Payment Links (`POST /v1/payment_links`), escalates high-value cases to the merchant Human Review Queue, and tracks the resulting `payment_link.paid` webhook back to the exact decision audit trail."

---

## 3. Live Demo Walkthrough (Minute 3 & 4: The Product)
"Let's see MerchantPulse in action for a merchant processing ₹1.24 Cr monthly GMV:
1. **Overview Radar**: We see real-time GMV, ₹4.82L of Revenue at Risk, and ₹3.18L of actionable Recoverable EV across 6 prioritized leaks.
2. **Deterministic EV Math**: In the Opportunity Drawer, we see the mathematical formula: 74% probability × ₹65,000 GMV − ₹1.30 cost − ₹5.00 fatigue penalty = ₹48,158 net EV. Zero LLM arithmetic.
3. **Policy Over-Limit Escalation**: For an ₹85,000 enterprise transaction, the Policy Engine prevents automated execution and routes it to the **Human Review Queue**. With one click, the merchant operator approves it, immediately creating a live Razorpay link.
4. **Closed-Loop Reconciliation**: When the customer pays, MerchantPulse attributes the ₹65,000 recovered GMV directly to the initial `decision_id` in the immutable audit ledger."

---

## 4. Engineering & Safety Rigor (Minute 5: Why This Wins)
"MerchantPulse was built with production-grade engineering rigor:
- **Zero Hallucinated APIs**: Built 100% on real Razorpay REST endpoints and webhooks. Refunds are never misused as fake recovery incentives.
- **Subunit Precision**: All money math is calculated in integer paise.
- **10-Scenario Adversarial Benchmark**: 100% pass rate across signature tampering, replay attacks, micro-transaction negative EV suppression, customer fatigue caps, and malformed AI outputs.
- **41 Tests & Strict Type Safety**: 0 TypeScript errors, clean production Next.js build, and instant response times.

MerchantPulse turns lost payments into recovered revenue safely, predictably, and autonomously."
