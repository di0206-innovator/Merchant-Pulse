# MerchantPulse 5-Minute Pitch & Reviewer Q&A Guide

**Track 03:** AI Revenue Recovery (Razorpay Buildathon 2026)  

---

## 5-Minute Pitch Script

### 0:00 – 0:30 | Problem & Solution (The Hook)
> *"Digital merchants lose 3% to 7% of GMV to payment dropoffs and bank timeouts. Existing dashboards only report what was lost, while naive LLMs hallucinate numbers or risk money movement. **MerchantPulse** is an AI Revenue Recovery Agent for Razorpay merchants that finds recoverable payment failures, calculates expected economic value in code, enforces policy guardrails, executes bounded Razorpay payment links, and proves net recovered GMV."*

### 0:30 – 1:30 | Live One-Click Demo
> *"Let's open the Merchant Terminal and click **RUN FULL DEMO**. Watch as a failed ₹8,500 UPI transaction is ingested, evaluated for net EV, validated against policy rules, dispatched as a Razorpay Payment Link, and reconciled upon payment."*

### 1:30 – 2:15 | Batch Recovery Results & Reproducible Benchmark
> *"Don't just take our word for a single transaction. We built a 1,000-event synthetic batch evaluation engine with an 80/20 held-out split (`npx benchmark`). Across identical held-out data, MerchantPulse AI outperforms the deterministic rules-only baseline by optimizing recovery timing and customer messaging without unsafe actions."*

### 2:15 – 3:00 | AI vs Deterministic Boundary
> *"Here is why this is safe: Code establishes financial truth in integer paise. AI reasons over facts to select strategy and copy. Policy determines whether reasoning may become action. AI can never alter balances or execute APIs directly."*

### 3:00 – 4:00 | Guardrails & Compliant Escalation
> *"When a ₹65,000 transaction fails, the policy engine triggers `MAX_AUTO_GMV_LIMIT` (capped at ₹25,000) and routes it to the **Human Review Queue**. Ops managers see the exact GMV at risk, AI recommendation, policy rule, and approve it with one click."*

### 4:00 – 4:40 | Razorpay Capability Mapping
> *"Built 1:1 on official Razorpay primitives: `POST /v1/payment_links`, Webhook HMAC-SHA256 signature verification (`payment.failed`, `payment_link.paid`), and idempotency headers."*

### 4:40 – 5:00 | Conclusion & Impact
> *"MerchantPulse transforms payment recovery from passive reporting into a safe, policy-gated revenue engine for Razorpay merchants."*

---

## Reviewer Attack Questions & Answers

### Q1: Why is AI needed if policy rules do the execution?
**A:** Deterministic rules are rigid (e.g. attempt everything > ₹1,000). AI optimizes contextual strategy selection (Payment Link vs. Alternative Method vs. Escalation) and tailors empathetic, personalized SMS/Email copy to maximize customer recovery probability.

### Q2: What stops AI from hallucinating financial numbers or sending duplicate links?
**A:** 100% of financial math (EV, GMV, fees) is computed deterministically in TypeScript integer paise. AI output is parsed via Zod schemas, and an execution-intent state machine (`EXECUTION_IN_FLIGHT`) blocks duplicate Razorpay API calls.

### Q3: How do you know a payment was recovered because of MerchantPulse?
**A:** Financial reconciliation matches incoming `payment_link.paid` webhooks back to the original `decision_id` and checks for organic conversion or duplicate payment IDs.
