# ADR 003: Distributed Execution Idempotency

## Context & Problem
In distributed webhook processing, network retries or process crashes can cause duplicate payment link creations for the same payment opportunity, annoying customers and inflating dispatch costs.

## Decision
Implement an `ActionDispatcher` execution-intent state machine (`EXECUTION_REQUESTED`, `EXECUTION_IN_FLIGHT`, `EXECUTION_SUCCEEDED`, `EXECUTION_FAILED`) with composite keys (`merchant_id:opp_id:action_type`).

## Consequences
- Guaranteed zero duplicate payment links generated for the same opportunity.
- Concurrent requests safely return in-flight or existing execution records.
