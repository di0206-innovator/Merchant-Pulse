# MerchantPulse — Evaluation & Verification Framework

> **Measurable Evidence, Safety Benchmark & Scenario Matrix**

---

## 1. Evaluation Philosophy

MerchantPulse is evaluated on its ability to make **safe, economically sound, and policy-compliant decisions** rather than raw text generation fluency.

Our evaluation benchmarks verify five dimensions:
1. **Financial Correctness**: 0% arithmetic hallucination; all EV and metric calculations are strictly deterministic.
2. **Policy Safety & Rejection Precision**: 100% interception of out-of-bounds, high-risk, or policy-violating recommendations before execution.
3. **Webhook Robustness & Idempotency**: 100% duplicate rejection and signature tampering resistance.
4. **AI Output Conformance**: 100% schema compliance via Zod, with deterministic fallbacks on malformed responses.
5. **Economic ROI**: Positive net expected value across all executed recovery interventions.

---

## 2. Evaluation Scenario Matrix (Synthetic Benchmarks)

| Scenario ID | Scenario Name | Ingested Trigger Event | Expected Deterministic Output | Expected Policy Decision | Expected Execution Action | Outcome Verification Metric |
|---|---|---|---|---|---|---|
| `SCEN-001` | **High-Value Dropoff Recovery** | `payment.failed` on ₹4,500 order due to bank timeout; customer has 0 recent contacts | EV = +₹2,850; Opportunity flagged | **PASS** (Within limit, EV > ₹20, frequency OK) | `POST /v1/payment_links` with SMS notify + 2h expiry | Link created (`plink_xxx`); Outcome tracked to `RECOVERED` on simulated capture |
| `SCEN-002` | **Policy Threshold Over-Limit** | `payment.failed` on ₹85,000 order (Exceeds auto-limit ₹25,000) | EV = +₹48,000; Opportunity flagged | **ESCALATE_HUMAN** (Rule `MAX_AUTO_GMV` triggered) | No automated API call; Queued in `HumanReviewQueue` | Action blocked until manual merchant approval |
| `SCEN-003` | **Negative EV Suppression** | `payment.failed` on ₹49 order; processing + SMS cost = ₹15, P(success) = 10% | EV = -₹10.10; Opportunity detected | **REJECT** (Rule `POSITIVE_EV_REQUIRED` triggered) | Suppressed (`NO_ACTION`) | Unprofitable intervention prevented |
| `SCEN-004` | **Customer Fatigue Protection** | `payment.failed` on customer who already received recovery link 3 hours ago | Anomaly detected | **REJECT** (Rule `CONTACT_FREQUENCY_CAP` triggered) | Suppressed | Customer spam prevented; Audit logged |
| `SCEN-005` | **Duplicate Webhook Delivery** | Webhook with identical `x-razorpay-event-id` delivered twice within 200ms | First event processed | N/A | Ignored / HTTP 200 returned immediately | Zero duplicate API calls or double links created |
| `SCEN-006` | **Webhook Signature Tampering** | Webhook payload with altered payload or invalid signature header | Immediate 400/401 HTTP response | N/A | Terminated at Event Gateway | Zero processing of unverified data |
| `SCEN-007` | **Malformed AI Output Resiliency** | Model returns invalid JSON or unapproved action type | Fallback rule engine activates | Evaluated against fallback policy | Safe fallback or human escalation | System never crashes; Zero invalid API calls |
| `SCEN-008` | **Gateway Degradation Detection** | 15 HDFC netbanking failures in 5 min window (>35% failure rate) | Anomaly: `METHOD_DEGRADATION` with severity `HIGH` | **PASS / ALERT** | Merchant advisory generated; Routing recommendation | Alert rendered in dashboard |
| `SCEN-009` | **Closed-Loop Outcome Attribution** | Customer opens generated payment link and completes payment | `payment_link.paid` received with `reference_id` | N/A | Opportunity marked `RECOVERED` | Exact recovered revenue paides attributed to `decision_id` |
| `SCEN-010` | **Expired Link Lifecycle** | Customer ignores payment link past 2-hour SLA | `payment_link.expired` received | N/A | Opportunity marked `EXPIRED` | Finalized in audit ledger |

---

## 3. Measurable Metrics & KPIs

```typescript
export interface SystemEvaluationReport {
  timestamp: string;
  totalScenariosRun: number;
  results: {
    financialAccuracyRate: number;      // Target: 100.0%
    policyEnforcementRate: number;      // Target: 100.0%
    falseExecutionRate: number;         // Target: 0.0%
    signatureVerificationAccuracy: number; // Target: 100.0%
    idempotencyPassRate: number;        // Target: 100.0%
    aiSchemaConformanceRate: number;    // Target: 100.0%
    meanDecisionLatencyMs: number;      // Target: < 450ms
    simulatedGmvRecoveredPaise: number; // Target: > 0
  };
  passed: boolean;
}
```

---

## 4. Automated Test Harness Execution Command
The evaluation suite runs deterministically via Vitest:
```bash
npm run test:eval
```
This executes all synthetic scenarios and generates a machine-readable JSON evaluation report and Markdown summary in `docs/evaluation-results.md`.
