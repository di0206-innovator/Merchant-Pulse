# AI Strategy Boundary & Financial Isolation

MerchantPulse strictly separates financial truth from AI strategy reasoning.

## Financial Isolation Principles

1. **Deterministic Financial Math:** The LLM NEVER calculates balances, fees, transaction totals, or Expected Value (EV). All numbers are computed in TypeScript using integer paise.
2. **Read-Only Context Injection:** Gemini receives read-only JSON context containing pre-computed deterministic facts.
3. **Strict Schema Validation:** AI responses are parsed with Zod (`StrategyRecommendationSchema`). Malformed JSON, extra fields, or unexpected types trigger an instant fallback to `MockStrategyProvider`.
4. **No Direct Execution Authority:** Gemini recommends actions from an explicit allowlist. It cannot invoke Razorpay APIs directly or bypass policy thresholds.
