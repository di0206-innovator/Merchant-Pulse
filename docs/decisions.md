# MerchantPulse — Architecture Decision Records (ADRs)

---

## ADR-001: Deterministic Financial Truth vs. AI Responsibility Boundary

### Context
Large Language Models excel at contextual reasoning, text generation, and diagnosis, but are fundamentally probabilistic and non-deterministic. In financial systems, arithmetic hallucinations, invalid calculations, or unauthorized executions are catastrophic.

### Decision
MerchantPulse strictly divides responsibilities:
- **Deterministic Code Layer**: Ingests events, computes GMV in integer paise, calculates moving average degradation rates, and computes Expected Economic Value (EV) formulas.
- **AI Strategy Layer (Google Gemini)**: Receives only validated facts and formulates diagnostic hypotheses, personalized customer messaging, and strategy candidate rankings.
- **Policy Engine**: Decides whether reasoning may become executable action.

### Consequences
- **Positive**: 0% mathematical hallucination; 100% reproducible EV calculations; audit compliance.
- **Trade-off**: Requires strict schema marshalling and validation at every boundary.

---

## ADR-002: Real Razorpay Primitives Only (Zero Hallucinated Endpoints)

### Context
Many AI demos invent fictitious APIs (e.g. "instant-charge", "auto-discount", or using refunds as a recovery incentive). In real payment gateways, actions must adhere to strict banking lifecycles.

### Decision
MerchantPulse binds all executable actions to verified Razorpay capabilities:
1. `POST /v1/payment_links` for dynamic recovery links with expiration, custom SMS/Email notifications, and callback redirects.
2. `payment.failed`, `order.paid`, and `payment_link.paid` webhooks for state triggers and outcome measurement.
3. Refunds are explicitly restricted to post-capture reversals and are never used as failed-payment recovery mechanisms.

### Consequences
- **Positive**: Real-world feasibility; genuine merchant value; immediate credibility with Razorpay engineers.

---

## ADR-003: Subunit Integer Arithmetic (Paise Precision)

### Context
Floating point arithmetic in JavaScript (`0.1 + 0.2 === 0.30000000000000004`) causes rounding errors and reconciliation discrepancies in financial systems.

### Decision
All currency values across domain models, schemas, EV math, and APIs operate in integer subunits (paise for INR; e.g. ₹4,500.00 is represented as `450000`). Display formatting to rupees occurs strictly at the presentation UI layer.

### Consequences
- **Positive**: Exact arithmetic precision; aligns 1:1 with Razorpay API currency conventions.

---

## ADR-004: Closed-Loop Decision Provenance & Idempotency

### Context
Webhooks can be delivered out of order or duplicated across network retries. Autonomous systems must never perform double charges or duplicate link generation.

### Decision
1. **Idempotency Guard**: All incoming webhooks are validated against `x-razorpay-event-id` using `IdempotencyLedger`.
2. **Decision Ledger**: Every processed opportunity generates an immutable `DecisionAuditRecord` linking:
   `Trigger Event ID → Deterministic Metrics → AI Recommendation → Policy Results → Razorpay Action ID (plink_xxx) → Outcome Webhook (payment_link.paid)`.

### Consequences
- **Positive**: 100% duplicate protection; complete regulatory explainability; exact closed-loop ROI attribution.

---

## ADR-005: Provider Pattern for AI Strategy with Graceful Fallback

### Context
External AI model APIs may experience network timeouts, rate limits, or produce malformed JSON. A revenue recovery pipeline cannot drop transactions due to AI downtime.

### Decision
`RevenueStrategyProvider` abstraction with `GeminiStrategyProvider` (using `@google/genai`) and `MockStrategyProvider`. If Gemini returns an unparseable response or encounters an API error, the system automatically falls back to the deterministic rule strategy without crashing.

### Consequences
- **Positive**: 100% pipeline uptime; fully testable offline and in CI environments without external API keys.
