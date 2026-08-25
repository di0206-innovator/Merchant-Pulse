# MerchantPulse AI Revenue Recovery Benchmark Report

**Generated:** 2026-08-25T05:05:31.871Z  
**Dataset:** 5000 synthetic payment events  
**Held-Out Evaluation Set:** 1000 events (20% split)  
**Seed:** 20260825  

---

## Executive Strategy Comparison

| Metric | No-Action Baseline | Deterministic Rules-Only | MerchantPulse AI Strategy |
|---|---|---|---|
| **Total Failed GMV** | ₹96,50,565.35 | ₹96,50,565.35 | ₹96,50,565.35 |
| **Attempted GMV** | ₹0 | ₹74,82,098.26 | ₹66,93,427.96 |
| **Recovered GMV** | ₹0 | ₹41,56,226.22 | ₹32,95,319.71 |
| **Intervention Cost** | ₹0 | ₹10,080 | ₹14,220 |
| **Net Recovered GMV** | ₹0 | ₹41,46,146.22 | **₹32,81,099.71** |
| **Recovery Rate** | 0.0% | 43.07% | **34.15%** |
| **Escalated GMV** | ₹0 | ₹0 | ₹58,43,199.51 |
| **Rejected GMV** | ₹0 | ₹21,68,467.09 | ₹136.6 |
| **Unsafe Executions** | 0 | 0 | **0** |
| **Duplicate Executions**| 0 | 0 | **0** |

---

## Key Safety & Attribution Guarantees

1. **Zero Financial Arithmetic by LLM:** 100% of Expected Value (EV) math and GMV calculations were computed deterministically in TypeScript integer paise.
2. **Zero Unsafe Executions:** All actions were gated by the Policy Engine (Max ₹25,000 auto limit, 24h cooldown, minimum margin).
3. **Closed-Loop Reconciliation:** Every recovery was matched against executed payment link references and reconciled to prevent double-counting.
