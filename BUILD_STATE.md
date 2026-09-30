# MerchantPulse Build State

## Current slice: Day 2 / Phase 2 (Event Spine)

### Implemented
- Strict Zod domain contracts
- Deterministic payment parsing and failure classification
- Revenue opportunity detection
- Deterministic expected-value recommendation model
- Policy gate before execution
- Append-only in-process audit trail prototype
- Razorpay webhook signature verification boundary
- Demo merchant data and analysis API
- Merchant dashboard for opportunity radar, strategy, policy and audit
- **[Phase 2]** Formal `EventLedger` interface with `FileBasedEventLedger` for durability
- **[Phase 2]** Deterministic Payment State Machine with precedence logic and out-of-order event handling
- Core tests (webhook boundary, deterministic state transitions)

### Intentionally NOT implemented yet
- Live Razorpay transaction ingestion
- Live Gemini strategy calls
- Supabase persistence (currently using local file-based ledger)
- Actual customer communication channel
- Automatic live payment collection
- Authentication

### Verified
- All TypeScript/TSX source files transpile successfully with TypeScript 5.8 syntax validation.
- All vitest unit tests passing.

## Next build slice
1. Add Gemini structured strategy provider behind an interface (Phase 3).
2. Add a real valid recovery action flow using Razorpay Orders/Checkout rather than a fictitious retry API (Phase 4).
3. Add outcome measurement and predicted-vs-actual evaluation (Phase 5).
