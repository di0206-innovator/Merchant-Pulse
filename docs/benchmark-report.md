# MerchantPulse AI Revenue Recovery Benchmark Report

**Generated:** 2026-08-26T09:42:36.562Z  
**Dataset:** 1000 synthetic payment events  
**Held-Out Evaluation Set:** 200 events (20% split)  
**Seed:** 20260825  

---

## Executive Strategy Comparison

| Metric | No-Action Baseline | Deterministic Rules-Only | MerchantPulse AI Strategy |
|---|---|---|---|
| **Total Failed GMV** | ₹17,79,143.66 | ₹17,79,143.66 | ₹17,79,143.66 |
| **Attempted GMV** | ₹0 | ₹13,98,076.33 | ₹10,48,826.73 |
| **Recovered GMV** | ₹0 | ₹9,91,435.11 | ₹5,99,990.69 |
| **Intervention Cost** | ₹0 | ₹1,965 | ₹2,820 |
| **Net Recovered GMV** | ₹0 | ₹9,88,520.11 | **₹5,97,170.69** |
| **Recovery Rate** | 0.0% | 55.73% | **33.72%** |
| **Escalated GMV** | ₹0 | ₹0 | ₹10,17,142.38 |
| **Rejected GMV** | ₹0 | ₹3,81,067.33 | ₹37.34 |
| **Unsafe Executions** | 0 | 0 | **0** |
| **Duplicate Executions**| 0 | 0 | **0** |

---

## Key Safety & Attribution Guarantees

1. **Zero Financial Arithmetic by LLM:** 100% of Expected Value (EV) math and GMV calculations were computed deterministically in TypeScript integer paise.
2. **Zero Unsafe Executions:** All actions were gated by the Policy Engine (Max ₹25,000 auto limit, 24h cooldown, minimum margin).
3. **Closed-Loop Reconciliation:** Every recovery was matched against executed payment link references and reconciled to prevent double-counting.
