# MerchantPulse — Antigravity Builder Prompt Pack

## Purpose

This document is the canonical instruction set for building MerchantPulse in Google Antigravity or another agentic coding environment.

The objective is **not** to generate a generic AI fintech demo. Build a technically defensible Razorpay Buildathon submission for Track 01: **AI Growth & Agentic Commerce**.

The product thesis is:

> **MerchantPulse finds the highest-value revenue opportunity for a merchant, estimates the economics of possible interventions, lets AI reason over those bounded options, checks deterministic policy before action, executes only valid Razorpay-compatible flows, and measures the result.**

The architecture is:

**Razorpay events → deterministic revenue intelligence → AI strategy → policy gate → valid action → outcome measurement → audit trail**

---

# 0. NON-NEGOTIABLE RULES

You are an autonomous coding agent operating inside an existing repository.

Before changing code:

1. Inspect the repository.
2. Read `README.md`, `BUILD_STATE.md`, `ANTIGRAVITY_BUILDER_PROMPTS.md`, and all existing files under `core/`, `app/`, `lib/`, and `tests/`.
3. Reuse existing abstractions where they are correct.
4. Do not rewrite working code merely to make the architecture look different.
5. Make small, verifiable changes.
6. After each phase, run type-checks/tests available in the environment and report exact failures.

## Hard prohibitions

- Do **not** invent Razorpay API endpoints.
- Do **not** implement a fictional `retryPayment()` API.
- Do **not** treat a refund as an incentive for a failed payment.
- Do **not** claim a capability exists unless confirmed in current Razorpay documentation or the repository's verified integration adapter.
- Do **not** let an LLM calculate money, ROI, payment amounts, limits, or permissions.
- Do **not** let an LLM directly call Razorpay APIs.
- Do **not** put secrets in client-side code.
- Do **not** log secrets, payment signatures, API credentials, or unnecessary PII.
- Do **not** use an LLM confidence score as a calibrated probability.
- Do **not** fabricate business impact numbers as if they were observed results.
- Do **not** add LangGraph, MCP, vector databases, multi-agent choreography, or other fashionable infrastructure unless a concrete requirement justifies it.

## Core principle

> **AI proposes. Deterministic systems validate. Policy decides. Integrations execute. Events prove what happened.**

---

# 1. OPERATING MODE FOR ANTIGRAVITY

Work like a senior staff engineer paired with a product-minded founder.

For every requested change:

### Step A — Understand
State:
- current code involved
- user-facing behavior being changed
- technical risk
- external dependency risk

### Step B — Design
Before coding, define:
- interfaces
- data contracts
- failure states
- test strategy

### Step C — Implement
Prefer:
- pure functions for business logic
- dependency injection for integrations
- Zod validation at trust boundaries
- small composable modules
- explicit state transitions

### Step D — Verify
Run:
- type-check
- unit tests
- lint/build when available
- targeted integration tests

### Step E — Review yourself
Ask:
- Did I invent an API?
- Did I move financial authority into the LLM?
- Can duplicate events create duplicate actions?
- Can an external failure cause an incorrect success state?
- Is the audit trail sufficient to reconstruct the decision?

Only after this review should the task be marked complete.

---

# 2. PRODUCT CONTRACT

MerchantPulse is a merchant-side revenue intelligence system.

It must answer:

> **What revenue opportunity should this merchant act on next, why, what evidence supports it, what action is valid, what policy applies, and what happened afterwards?**

The system should support these opportunity classes:

1. **Recovery** — failed or incomplete payment flows with recoverable economic value.
2. **Conversion** — measurable checkout/payment conversion leakage.
3. **Retention** — repeat-customer or high-value customer conversion opportunities.

Keep the first release narrow enough to finish.

The primary demo should still be one excellent closed loop rather than ten incomplete features.

---

# 3. REPOSITORY ARCHITECTURE

Maintain these boundaries:

```text
merchantpulse/
├── app/                    # Next.js UI and API boundaries
├── core/
│   ├── types/              # Zod schemas + domain types
│   ├── determinism/        # Pure business/revenue calculations
│   ├── strategy/           # AI provider interfaces + implementations
│   ├── execution/          # Policy + valid action orchestration
│   ├── audit/              # Audit events and persistence abstraction
│   ├── pipeline/           # End-to-end orchestration
│   └── events/             # Normalized event/state handling
├── integrations/
│   ├── razorpay/           # Real Razorpay adapter only
│   ├── supabase/           # Persistence adapter
│   └── ai/                 # Gemini/provider adapter
├── lib/                    # Demo fixtures and UI helpers
├── tests/                  # Unit + integration tests
├── docs/                   # ADRs and architecture notes
└── README.md
```

The `core/` package must remain runnable with mocked integrations.

---

# 4. DATA-CONTRACT RULES

Every trust boundary must use Zod.

Required domain concepts:

- Razorpay payment event
- normalized payment state
- merchant profile
- revenue opportunity
- evidence bundle
- intervention option
- strategy recommendation
- policy decision
- execution request
- execution result
- audit event
- webhook receipt / idempotency state
- outcome measurement

Money must be represented in the smallest currency unit, never floating-point rupees.

Use integers for monetary values.

Store currency explicitly.

Every model output that can influence execution must be schema-validated before the policy layer receives it.

---

# 5. DETERMINISTIC REVENUE ENGINE

Implement pure functions for:

### Payment normalization

Convert raw Razorpay payment payloads into a normalized domain object.

### Failure classification

Classify only from actual available fields and documented semantics.

Never infer undocumented meanings from arbitrary strings without labeling the result as heuristic.

### Opportunity detection

Detect revenue opportunities from factual signals such as:
- failed payments
- repeat-customer failures
- abnormal conversion gaps
- repeated payment attempts
- time-based degradation

### Economic estimation

Compute expected economic value from explicit assumptions.

The system must expose the calculation method and assumptions.

Never hide fabricated probabilities inside a variable named `confidence`.

Use names such as:
- `estimated_recovery_probability`
- `strategy_score`
- `expected_value_paise`

If no historical data exists, clearly label the estimate as **scenario-based** or **synthetic-model estimate**.

---

# 6. AI STRATEGY LAYER

Create an interface:

```ts
interface RevenueStrategyProvider {
  rankInterventions(input: StrategyInput): Promise<StrategyRecommendation>;
}
```

Implement:

1. `MockRevenueStrategyProvider`
2. `GeminiRevenueStrategyProvider`

The AI receives deterministic evidence and candidate options.

The AI may:
- interpret context
- rank options
- explain reasoning
- identify assumptions
- identify missing information

The AI may NOT:
- invent payment amounts
- invent policy thresholds
- invent merchant permissions
- calculate authoritative financial totals
- bypass policy
- directly execute actions

If the provider fails or returns invalid JSON, the pipeline must fail closed into an escalation/error state.

---

# 7. POLICY ENGINE

Policy is deterministic.

A policy decision should consider:

- merchant configuration
- action type
- amount limits
- retry/action count limits
- expected value threshold
- required approval level
- event freshness
- idempotency state
- current payment state

Example outcome:

```text
EXECUTE
ESCALATE
REJECT
```

Every rejected/escalated decision must include exact reasons.

Policy rules must be data-driven and testable individually.

---

# 8. RAZORPAY INTEGRATION RULES

Treat Razorpay as an external authority.

The integration layer must use only verified/documented APIs.

Do not assume a failed payment can be retried by a magical API method.

When recovery requires a customer action, model the valid payment flow explicitly:

```text
Opportunity
→ valid follow-up payment/order flow
→ customer action
→ Razorpay payment event
→ measurement
```

The first live integration target should be:

1. webhook verification
2. event normalization
3. idempotent event ingestion
4. payment state reconstruction
5. order/payment reads
6. valid follow-up action flow where supported

Do not call an action complete until a verifiable downstream result exists.

---

# 9. WEBHOOK / EVENT ENGINE

Implement an event gateway that:

1. receives raw webhook body
2. verifies signature before parsing business payload
3. records event ID
4. rejects duplicate event IDs
5. normalizes event type
6. updates deterministic state
7. triggers opportunity evaluation

Support out-of-order events safely.

The event layer must never assume delivery exactly once.

Every event should carry:
- provider event ID
- received timestamp
- provider event timestamp if available
- event type
- normalized entity IDs
- processing state

---

# 10. AUDIT TRAIL

Audit is first-class.

For each decision, be able to reconstruct:

```text
What happened?
What data was used?
What opportunity was detected?
What options were considered?
What did the AI recommend?
What policy rules were checked?
What action was requested?
What action actually occurred?
What external event confirmed the outcome?
```

Use append-only semantics.

Do not call an in-memory array immutable.

Each audit event needs a unique ID and deterministic references to the decision/action context.

---

# 11. TESTING REQUIREMENTS

Before marking a phase complete, test:

### Deterministic logic
- same input → same output
- edge amounts
- empty datasets
- malformed inputs
- zero recovery budget
- max attempts reached

### AI boundary
- valid provider response
- malformed response
- provider timeout/error
- missing fields
- adversarial/irrelevant reasoning

### Policy
- all rules pass
- one rule fails
- multiple rules fail
- duplicate execution request
- stale event

### Webhooks
- valid signature
- invalid signature
- duplicate event
- out-of-order event
- unknown event type

### Execution
- integration success
- integration failure
- timeout
- downstream result mismatch

### End-to-end
At least one fully demonstrable scenario from:

**webhook/event → opportunity → strategy → policy → valid action → result event → audit trail**

---

# 12. UI REQUIREMENTS

The dashboard should feel like a serious merchant operations console, not an AI chat app.

Primary views:

### Overview
- GMV
- revenue at risk
- opportunity count
- estimated recoverable value
- recent outcomes

### Opportunity Radar
For every opportunity:
- type
- amount at risk
- evidence
- estimated value
- recommended intervention

### Decision Detail
Show:
- evidence used
- candidate actions
- strategy recommendation
- deterministic economics
- policy result
- execution result

### Audit Timeline
Show the event chain visually.

### Human Review Queue
Show escalated decisions and exactly why they were escalated.

Avoid decorative complexity.

---

# 13. DEMO-FIRST RULE

The primary five-minute demo must work without hidden steps.

Target flow:

1. Open MerchantPulse.
2. Show merchant baseline.
3. Trigger/import a realistic payment failure event.
4. Event gateway validates and deduplicates it.
5. Revenue engine identifies the opportunity.
6. Strategy layer ranks candidate actions.
7. Policy gate explains why the chosen action is or is not allowed.
8. Execute a valid Razorpay-compatible follow-up flow or simulate only the external boundary with a clearly labelled mock.
9. Feed the resulting event back into the system.
10. Show predicted vs observed outcome.
11. Open the audit trail.
12. Deliberately trigger one failure/escalation path.

The demo must prove the loop rather than merely display the dashboard.

---

# 14. BUILD PHASES

## PHASE 1 — FOUNDATION

Inspect repository and stabilize:
- TypeScript
- Zod types
- deterministic engine
- test harness
- README

Do not redesign the entire app.

## PHASE 2 — EVENT SPINE

Build:
- webhook adapter
- signature verification
- idempotency
- normalized events
- payment state machine

## PHASE 3 — STRATEGY PROVIDER

Build:
- provider interface
- mock provider
- Gemini provider
- strict structured output
- failure handling

## PHASE 4 — POLICY + EXECUTION

Build:
- policy engine
- integration boundary
- valid Razorpay action flow
- no fake endpoints
- execution result contracts

## PHASE 5 — OUTCOME LOOP

Build:
- result event handling
- predicted vs actual
- recovery metrics
- outcome audit

## PHASE 6 — DASHBOARD

Build polished merchant UI around the actual pipeline.

## PHASE 7 — HARDENING

- tests
- security
- idempotency
- error states
- empty states
- accessibility
- performance
- deployment

## PHASE 8 — SUBMISSION

- README
- architecture diagram
- demo script
- 5-minute pitch
- screenshots
- final repo cleanup

---

# 15. ANTIGRAVITY TASK EXECUTION PROMPT

Use this at the beginning of each implementation task:

```text
You are working inside the MerchantPulse repository.

Goal for this task:
[PASTE TASK HERE]

Before editing:
1. Inspect the existing repository and relevant files.
2. Read BUILD_STATE.md.
3. Identify existing abstractions that should be reused.
4. Check the current Razorpay integration assumptions.

Implementation requirements:
- Respect the deterministic → strategy → policy → execution architecture.
- Do not invent Razorpay APIs.
- Do not let the LLM perform authoritative financial calculations.
- Validate all external/model inputs with Zod.
- Keep secrets server-side.
- Make external services injectable/mocked.
- Preserve existing working behavior unless this task explicitly changes it.

Testing requirements:
- Add or update focused tests for every new behavior.
- Test failure paths, not only happy paths.
- Run type-check and tests.
- Report exact results.

At the end:
1. Summarize changed files.
2. Explain architectural decisions.
3. Report tests/build status.
4. Update BUILD_STATE.md with completed work and next recommended slice.
5. Do not start unrelated work.
```

---

# 16. ANTIGRAVITY ARCHITECT REVIEW PROMPT

```text
Review the MerchantPulse repository as a Razorpay fintech engineering reviewer.

Do not write new features yet.

Look specifically for:
- invented or unsupported Razorpay APIs
- unsafe financial logic
- LLM authority over money decisions
- incorrect webhook assumptions
- duplicate-event risks
- idempotency gaps
- misleading metrics
- fabricated probabilities
- client-side secret exposure
- audit gaps
- state-machine inconsistencies
- test gaps
- unnecessary architecture

Classify findings:
P0 = could make demo technically false or unsafe
P1 = could fail the judging/interview review
P2 = quality improvement

Return:
1. findings
2. evidence from code
3. exact fix
4. tests required

Do not modify the repository.
```

---

# 17. ANTIGRAVITY PRODUCT REVIEW PROMPT

```text
Act as a Razorpay product judge evaluating MerchantPulse.

Ignore implementation elegance temporarily.

Ask:
- Is there a real merchant problem?
- Is the value measurable?
- Is this clearly Track 01?
- Does the product do more than analyze dashboards?
- Is there a genuine action loop?
- Is AI adding meaningful value?
- Is the action economically justified?
- Is the system safe?
- Can the entire story be understood in 60 seconds?
- Is the demo memorable?

Give:
- strongest selling point
- weakest point
- one thing to remove
- one thing to add
- one change that would increase hiring signal

Do not praise mediocre work.
```

---

# 18. ANTIGRAVITY DEMO QA PROMPT

```text
Run a demo-readiness review of MerchantPulse.

Start from a clean state.

Verify that the following journey can be demonstrated without hidden manual database changes:

Razorpay-like event
→ validation
→ idempotency
→ normalized state
→ opportunity detection
→ economic estimate
→ AI strategy
→ policy decision
→ action boundary
→ result event
→ measured outcome
→ audit trail

Deliberately test:
- duplicate event
- invalid signature
- AI failure
- policy rejection
- execution failure

The final result should make the safe behavior visible, not merely show an error in the console.

Return:
- pass/fail per step
- exact failure
- severity
- fix recommendation
```

---

# 19. ANTIGRAVITY FINAL SUBMISSION REVIEW PROMPT

```text
You are the final Razorpay Buildathon hiring panel.

Review the complete repository, deployed product, README and demo flow.

Score from 1-10 on:
1. Product insight
2. Razorpay relevance
3. Agentic/AI depth
4. Fintech engineering quality
5. Reliability
6. Safety and governance
7. Measurable value
8. UX
9. Technical originality
10. Interview defensibility

Then answer:

Would you shortlist this builder for an AI Builder internship?

Do not optimize the score to be kind.

List the three strongest reasons to shortlist and the three strongest reasons to reject.

Then specify the single highest-impact change possible before submission.
```

---

# 20. ANTIGRAVITY WORKING STYLE

The builder should prefer **shipping one vertical slice** over generating large skeletons.

The correct sequence is:

```text
real event
→ real state
→ real decision
→ real policy
→ real action boundary
→ real outcome
```

Then expand.

Do not spend three days building an empty architecture that cannot demonstrate a complete loop.

The target is a small but real system with visible engineering depth.

---

# 21. DEFINITION OF DONE

MerchantPulse is ready for submission only when:

- the product is deployed
- a complete happy path works
- a complete failure path works
- webhook validation works
- duplicate events are handled
- AI failures fail closed
- financial arithmetic is deterministic
- policy decisions are deterministic
- no unsupported Razorpay APIs are claimed
- audit trail reconstructs the decision
- predicted vs actual outcome can be demonstrated
- tests cover the critical path
- README explains the architecture honestly
- the five-minute pitch can be delivered without hand-waving

**Do not declare success because the code compiles. Declare success when the product can prove its decisions.**
