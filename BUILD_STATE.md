# BUILD_STATE.md — MerchantPulse Project State

## Project Overview
- **Project**: MerchantPulse
- **Track**: Track 03 — AI Revenue Recovery (Razorpay Buildathon 2026)
- **Product Promise**: MerchantPulse finds failed payment revenue that is recoverable, chooses the highest-value bounded intervention, executes it through Razorpay primitives, and proves whether the intervention recovered money.
- **Architectural Tenet**: *Code establishes truth. AI reasons over truth. Policy determines whether reasoning may become action. Events prove what happened.*

---

## Current Status
- **Current Phase**: Finalist Submission Transformation (45-Phase Upgrade Completed)
- **Active Task**: Benchmark & Submission Verification
- **Next Task**: Buildathon Submission Ready

---

## Key Finalist System Features
1. **Reproducible 1,000+ Event Batch Benchmark**: `npm run benchmark` with seeded PRNG (`--seed 20260825`) and 80/20 held-out split.
2. **3-Way Strategy Baseline Comparison**: Evaluates No-Action vs. Deterministic Rules vs. MerchantPulse AI Strategy on identical held-out datasets.
3. **Financial Truth Isolation**: Integer paise EV calculations in code, zero LLM arithmetic.
4. **Execution Idempotency State Machine**: Distributed `EXECUTION_IN_FLIGHT` intent keying preventing duplicate Razorpay link creations.
5. **Closed-Loop Reconciliation Engine**: Verified outcome attribution matching `payment_link.paid` to `decision_id` with zero double-counting.
6. **32-Scenario Adversarial Safety Matrix**: 100% passing test matrix for AI failures, timeouts, duplicate webhooks, and rate limits.
7. **Operator Command Center**: Interactive batch replay, AI-vs-rules comparison, and trust guardrail panel.

