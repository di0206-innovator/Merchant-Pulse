# BUILD_STATE.md — MerchantPulse Project State

## Project Overview
- **Project**: MerchantPulse
- **Track**: AI Growth & Agentic Commerce (Razorpay Buildathon)
- **Core Thesis**: MerchantPulse is an AI-assisted revenue intelligence system that identifies where a merchant is losing or leaving money on the table, determines which intervention has the highest expected economic value, applies explicit policy constraints, executes only valid actions via real Razorpay primitives, and measures the resulting outcome with a transparent audit trail.
- **Architectural Tenet**: *Code establishes truth. AI reasons over truth. Policy determines whether reasoning may become action. Events prove what happened.*

---

## Current Status
- **Current Phase**: Phase 6 — Event & Razorpay Gateway (Completed)
- **Active Task**: Phase 7 — Execution & Outcome Loop
- **Next Task**: Phase 8 — High-Density Fintech Dashboard

---

## Phase Roadmap & Progress

| Phase | Description | Status | Verification Gate |
|---|---|---|---|
| **Phase 0** | Research & Architecture | **COMPLETED** | Architecture docs, Razorpay capability mapping, evaluation methodology created |
| **Phase 1** | Project Foundation | **COMPLETED** | Next.js 14, TypeScript, Tailwind CSS, Vitest, @google/genai, Zod installed and verified |
| **Phase 2** | Domain Model & Schemas | **COMPLETED** | Zod schemas, payment/merchant/opportunity/policy/event types, unit tests passing |
| **Phase 3** | Deterministic Revenue Engine | **COMPLETED** | Anomaly detection, cohort analysis, opportunity identification, EV math, 100% deterministic tests |
| **Phase 4** | AI Strategy Layer | **COMPLETED** | Provider interface, `@google/genai` provider, Mock provider, strict schema validation, contract tests |
| **Phase 5** | Policy Engine | **COMPLETED** | Multi-rule evaluator (limits, approvals, frequency, permissions, evidence sufficiency), unit tests for every branch |
| **Phase 6** | Event & Razorpay Gateway | **COMPLETED** | Webhook ingestion, HMAC-SHA256 signature verification, idempotency ledger, out-of-order event handler, Razorpay client adapter |
| **Phase 7** | Execution & Outcome Loop | **ACTIVE** | Action dispatcher (Payment Links, Customer Notifications, Routing recommendations), simulated/live outcome recorder, feedback loop |
| **Phase 8** | Dashboard & UX | Queued | Financial terminal aesthetic, Overview KPIs, Opportunity Radar, Detail Drawer, Policy Inspector, Audit Trail, Human Review Queue |
| **Phase 9** | Adversarial QA & Evaluation | Queued | Multi-agent adversarial validation suite, evaluation test matrix execution (`docs/evaluation.md`), Playwright browser tests |
| **Phase 10** | Polish, Documentation & Submission | Queued | Production build, seed scenarios, pitch narrative, demo video walkthrough |

---

## Architectural Decisions Log (ADR)
1. **ADR-001: Financial Truth Isolation** — All GMV, transaction metrics, recovery rates, fees, and EV math must be computed deterministically in TypeScript (`core/revenue/`). LLMs are strictly prohibited from calculating balances or inventing financial totals.
2. **ADR-002: Provider-Pattern AI with Schema Guardrails** — AI strategy logic sits behind `RevenueStrategyProvider` (`integrations/gemini/` and `core/strategy/mock.ts`). AI responses are strictly validated via Zod schemas; malformed responses trigger an automatic graceful fallback or human escalation.
3. **ADR-003: Real Razorpay Capabilities Only** — All executable actions are bounded to verified Razorpay primitives: `Payment Links API` (`POST /v1/payment_links`), `Customer Notifications`, `Order Updates`, and `Payment Retry Configuration`. Refunds are never used as incentives.
4. **ADR-004: Closed-Loop Audit & Idempotency** — Every decision receives an immutable `decision_id` linking incoming `event_id` -> deterministic analysis -> AI proposal -> policy verdict -> executed action -> outcome measurement. Webhooks enforce HMAC-SHA256 signature verification and `x-razorpay-event-id` idempotency.

---

## Known Limitations
- Initial development uses deterministic in-memory / local storage ledger for state and idempotency before optional Supabase/PostgreSQL adapter attachment.
- Razorpay test mode credentials will be supported alongside a 100% offline deterministic mock adapter for standalone demo reliability.

---

## Verified Behavior
- Node.js environment: `v22.23.1`, npm: `10.9.8`
- Research completed for Razorpay Payment Links API, Webhook Signature Verification, and Google Gen AI SDK (`@google/genai`).
