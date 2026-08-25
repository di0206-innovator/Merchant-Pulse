# MerchantPulse Current Architecture Audit & Execution Trace

**Document Version:** 1.0.0  
**Audit Date:** August 25, 2026  
**Target:** Razorpay AI Buildathon 2026 — Track 03: AI Revenue Recovery  

---

## Executive Summary

MerchantPulse is built on a sound architectural thesis: **Code establishes financial truth; AI reasons over context; Policy gates actions; Events prove outcomes.** 

This audit evaluates the codebase to trace execution paths, identify what is live-capable vs. simulated, highlight technical debt and disconnects, and outline the precise roadmap required to elevate MerchantPulse to a Buildathon finalist-quality submission.

---

## 1. Execution Path Trace

```
Webhook (POST /api/webhooks/razorpay)
 └─► HMAC-SHA256 Verification (integrations/razorpay/signature.ts)
 └─► Idempotency Deduplication (core/events/idempotency.ts)
 └─► Schema Validation (core/domain/events.ts)
 └─► Domain Normalization (core/events/normalizer.ts)
 └─► [GAP DETECTED] → Domain event returned, but NOT piped to Orchestrator!
      │ (Fix: Connect normalized event directly to RevenuePipelineOrchestrator)
      ▼
 Revenue Pipeline Orchestrator (core/pipeline/orchestrator.ts)
 ├─► Fact Store Updates (core/revenue/factStore.ts)
 ├─► Opportunity Detection (core/revenue/detector.ts)
 ├─► EV Calculation (core/revenue/expectedValue.ts)
 ├─► AI Strategy Reasoning (integrations/gemini/client.ts)
 │    └─► Zod Output Validation & Mock Fallback (core/domain/strategy.ts)
 ├─► Policy Guardrail Evaluation (core/policy/evaluator.ts)
 │    └─► 6 Multi-Rule Checks (core/policy/rules.ts)
 ├─► Decision Router
 │    ├─► AUTO_EXECUTE ──► Action Dispatcher (core/execution/dispatcher.ts)
 │    │                     └─► Razorpay Adapter (integrations/razorpay/client.ts)
 │    ├─► ESCALATE_HUMAN ─► Human Review Queue
 │    └─► REJECT ─────────► Safe Suppression
 ├─► Decision Audit Ledger (core/audit/ledger.ts)
 └─► Dashboard UI Synchronization (app/page.tsx, app/api/opportunities)
```

---

## 2. Component-by-Component Audit

### 2.1 Event Gateway Layer
- **Files:** [`app/api/webhooks/razorpay/route.ts`](file:///Users/divyanshusinha/RazorPay/app/api/webhooks/razorpay/route.ts), [`integrations/razorpay/signature.ts`](file:///Users/divyanshusinha/RazorPay/integrations/razorpay/signature.ts), [`core/events/idempotency.ts`](file:///Users/divyanshusinha/RazorPay/core/events/idempotency.ts), [`core/events/normalizer.ts`](file:///Users/divyanshusinha/RazorPay/core/events/normalizer.ts)
- **Status:** **Incomplete Disconnect**
- **What Works:** Cryptographic HMAC signature verification with timing-safe comparison, idempotency hashing by `x-razorpay-event-id`, Zod schema parsing for webhooks (`payment.failed`, `payment.captured`, `payment_link.paid`, `payment_link.expired`).
- **Gap:** The webhook route parses and acknowledges webhooks with HTTP 200 `ACCEPTED`, but **does not invoke the orchestrator** `handlePaymentEvent` or `handlePaymentLinkOutcome`. Incoming webhooks are dropped after parsing.
- **Remediation:** Wire `domainEvent` directly to `getGlobalPipeline()`.

### 2.2 Deterministic Revenue Engine
- **Files:** [`core/revenue/factStore.ts`](file:///Users/divyanshusinha/RazorPay/core/revenue/factStore.ts), [`core/revenue/detector.ts`](file:///Users/divyanshusinha/RazorPay/core/revenue/detector.ts), [`core/revenue/expectedValue.ts`](file:///Users/divyanshusinha/RazorPay/core/revenue/expectedValue.ts), [`core/revenue/metrics.ts`](file:///Users/divyanshusinha/RazorPay/core/revenue/metrics.ts)
- **Status:** **Live-Capable (In-Memory)**
- **What Works:** Deterministic EV calculations (`EV = (pSuccess * GMV) - Cost - Fatigue`), integer paise accuracy, failure pattern classification (High-Value Dropoff, Bank Downtime, Churn Risk, Card Failures).
- **Gap:** Probabilities (`pSuccess`) are hardcoded constants per failure code rather than being derived from observed historical outcomes. No calibration module exists yet.
- **Remediation:** Build empirical calibration module (`core/revenue/calibration.ts`) to compute observed recovery rates.

### 2.3 AI Strategy Layer (Gemini)
- **Files:** [`integrations/gemini/client.ts`](file:///Users/divyanshusinha/RazorPay/integrations/gemini/client.ts), [`core/strategy/mock.ts`](file:///Users/divyanshusinha/RazorPay/core/strategy/mock.ts), [`core/domain/strategy.ts`](file:///Users/divyanshusinha/RazorPay/core/domain/strategy.ts)
- **Status:** **Live-Capable**
- **What Works:** Integration with `@google/genai` SDK using `gemini-2.5-flash`, strict Zod schema validation of AI JSON output, instant fallback to `MockStrategyProvider` on API key absence, malformed output, or timeout.
- **Gap:** Needs explicit provider telemetry: prompt version, strategy version, context hash, latency, and token usage metadata.

### 2.4 Policy Engine (Guardrails)
- **Files:** [`core/policy/evaluator.ts`](file:///Users/divyanshusinha/RazorPay/core/policy/evaluator.ts), [`core/policy/rules.ts`](file:///Users/divyanshusinha/RazorPay/core/policy/rules.ts)
- **Status:** **Fully Functional**
- **What Works:** 6 deterministic rule evaluators (State Consistency, Action Allowlist, Positive EV, 24h Contact Cooldown, Evidence Sufficiency, Max ₹25,000 Auto-GMV Threshold).
- **Gap:** Needs explicit stopping rule categorization (`STOP_AFTER_SUCCESS`, `STOP_AFTER_CONTACT_COOLDOWN`, `STOP_AFTER_MAX_GMV`, etc.) with auditable reason codes.

### 2.5 Execution & Razorpay Integration
- **Files:** [`core/execution/dispatcher.ts`](file:///Users/divyanshusinha/RazorPay/core/execution/dispatcher.ts), [`integrations/razorpay/client.ts`](file:///Users/divyanshusinha/RazorPay/integrations/razorpay/client.ts)
- **Status:** **Live-Capable & Mock-Supported**
- **What Works:** `MockRazorpayClientAdapter` for offline demo, `LiveRazorpayClientAdapter` calling Razorpay REST API `/v1/payment_links`.
- **Gap:** Missing execution-intent idempotency state machine (`EXECUTION_REQUESTED`, `EXECUTION_IN_FLIGHT`, `EXECUTION_SUCCEEDED`) to prevent duplicate link generation during network retries or concurrent requests.

### 2.6 Closed-Loop Audit & Attribution
- **Files:** [`core/audit/ledger.ts`](file:///Users/divyanshusinha/RazorPay/core/audit/ledger.ts)
- **Status:** **Live-Capable (In-Memory)**
- **What Works:** Maps decisions by `decision_id`, `opportunity_id`, and `payment_link_id`. Records outcome state transition when links are paid or expired.
- **Gap:** Lacks strict reconciliation engine (`core/revenue/reconciliation.ts`) to differentiate organic recoveries from intervention-attributed recoveries and prevent double-counting.

### 2.7 UI & Dashboard Experience
- **Files:** [`app/page.tsx`](file:///Users/divyanshusinha/RazorPay/app/page.tsx), [`components/`](file:///Users/divyanshusinha/RazorPay/components/)
- **Status:** **Live-Capable**
- **What Works:** Terminal-inspired dashboard layout, real-time KPI metrics, Opportunity Radar, Detail Drawer, Policy Inspector, Audit Trail, Human Review Queue.
- **Gap:** Missing Batch Recovery Benchmark view, AI-vs-Rules Experiment comparison view, and One-Click Demo execution.

---

## 3. Risk & Technical Debt Inventory

| Category | Issue / Risk | Severity | Required Mitigation |
|---|---|---|---|
| **Data Flow** | Webhooks normalized but disconnected from pipeline | **CRITICAL** | Connect webhook route to `RevenuePipelineOrchestrator` |
| **Execution** | Potential duplicate payment links during concurrent retries | **HIGH** | Implement distributed execution-intent state machine |
| **Evaluation** | Small 10-scenario benchmark without batch volume or baselines | **HIGH** | Build 1,000+ synthetic batch benchmark with held-out split & baseline comparison |
| **Attribution** | Organic payment completion could be misattributed as AI recovery | **HIGH** | Create explicit financial reconciliation engine |
| **Calibration** | Recovery probabilities hardcoded in `detector.ts` | **MEDIUM** | Implement empirical cohort frequency calibration module |
| **State** | In-memory maps reset on server restart | **MEDIUM** | Maintain in-memory for demo speed, add persistence interface |

---

## 4. Architectural Target State

```
                  ┌──────────────────────────────────────────┐
                  │        RAZORPAY PAYMENT LAYER            │
                  │   Webhooks (payment.failed, etc.)      │
                  │   REST API (/v1/payment_links)           │
                  └────────────────────┬─────────────────────┘
                                       │ Webhook POST
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │            EVENT GATEWAY                 │
                  │   HMAC Verification (Constant-Time)     │
                  │   Deduplication (EventId / SHA256)       │
                  │   Zod Event Normalization                │
                  └────────────────────┬─────────────────────┘
                                       │ DomainEvent
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │    REVENUE PIPELINE ORCHESTRATOR         │
                  │   Fact Store Updates                     │
                  │   Reconciliation Check                   │
                  └────────────────────┬─────────────────────┘
                                       │ Fact Context
                                       ▼
┌──────────────────────────────────────┴─────────────────────────────────────┐
│                       REVENUE ENGINE & AI STRATEGY                         │
│  1. Anomaly & Opportunity Detection                                        │
│  2. Deterministic Expected Value Math: EV = (p * GMV) - Cost - Penalty      │
│  3. Empirical Cohort Calibration (Observed vs Predicted)                   │
│  4. Gemini 2.5 Flash Strategy Reasoning (Bounded Prompts)                  │
│  5. Strict Zod Response Validation (Deterministic Fallback on error)        │
└──────────────────────────────────────┬─────────────────────────────────────┘
                                       │ Recommendation
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │            POLICY ENGINE                 │
                  │  1. State Consistency                    │
                  │  2. Action Allowlist                     │
                  │  3. Min Profitability Margin             │
                  │  4. 24h Contact Cooldown                 │
                  │  5. Evidence Sufficiency                 │
                  │  6. Max ₹25,000 Autonomous GMV Limit     │
                  │  7. Auditable Stopping Rules             │
                  └────────────────────┬─────────────────────┘
                                       │ Policy Verdict
                   ┌───────────────────┼───────────────────┐
                   │                   │                   │
            AUTO_EXECUTE        ESCALATE_HUMAN          REJECT
                   │                   │                   │
                   ▼                   ▼                   ▼
     ┌───────────────────────────┐ ┌───────────────┐ ┌───────────────┐
     │ Execution-Intent State    │ │ Human Review  │ │ Suppressed    │
     │ (Idempotency Key Check)   │ │ Queue         │ │ (Audit Log)   │
     └─────────────┬─────────────┘ └───────┬───────┘ └───────────────┘
                   │                       │ Approved
                   ▼                       ▼
     ┌─────────────────────────────────────────────┐
     │ Razorpay Dispatcher (Live / Mock Adapter)   │
     └─────────────────────┬───────────────────────┘
                           │ Webhook Outcome Callback
                           ▼
     ┌─────────────────────────────────────────────┐
     │ Closed-Loop Reconciliation & Audit Ledger   │
     └─────────────────────────────────────────────┘
```
