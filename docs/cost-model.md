# 💰 MerchantPulse Unit Economics & Cost Model

**Executive Summary:** An intervention costing **₹0.15 (SMS)** or **₹0.52 (WhatsApp)** generates a minimum return of **₹300 – ₹1,500+** on typical Indian e-commerce carts, delivering **45x to 150x ROI** even at a conservative **2% recovery rate**.

---

## 1. Granular Cost per Intervention Breakdown

| Cost Component | Provider / Infrastructure | Cost (INR) | Notes |
|---|---|---|---|
| **Transactional SMS** | TRAI DLT Registered Gateway (e.g. Gupshup / ValueFirst) | **₹0.120** | Regulatory transactional DLT route with high deliverability. |
| **WhatsApp Business API** | Meta Graph API (Service / Utility Conversation) | **₹0.480** | Optional premium channel for high-LTV VIP carts. |
| **AI Strategy Reasoning** | Google Gemini 2.5 Flash via `@google/genai` | **₹0.008** | ~600 tokens in, ~150 tokens out (~$0.0001 USD @ ₹84/USD). |
| **Compute & Ingestion** | Serverless Next.js API route + Vercel / Cloud Run | **₹0.005** | Sub-100ms execution time per webhook. |
| **Ledger Storage** | PostgreSQL / Supabase append-only audit event | **₹0.002** | ~1 KB row indexed in Postgres. |
| **Blended Cost (SMS)** | **Single Standard Intervention** | **₹0.135** | **Budgeted conservative cost: ₹0.150** |
| **Blended Cost (WhatsApp)** | **Single High-Value WhatsApp Intervention** | **₹0.495** | **Budgeted conservative cost: ₹0.520** |

---

## 2. Margin Math & Merchant ROI at Different Recovery Rates

Assume a typical mid-market Indian D2C merchant with:
- **Average Order Value (AOV):** ₹1,800
- **Monthly Failed GMV:** ₹20,00,000 (~1,111 failed orders/month)
- **Merchant Gross Margin:** 25% (₹450 margin per recovered order)
- **Razorpay PG Processing Fee:** 2.0% (₹36 per recovered order)
- **Intervention Dispatch Mix:** 80% SMS (₹0.15), 20% WhatsApp (₹0.52) $\rightarrow$ Blended intervention cost: **₹0.224**

### Scenario Analysis:

| Metric | Conservative (2% Lift) | Realistic (5% Lift) | High-Intent (10% Lift) |
|---|---|---|---|
| **Failed Orders Target** | 1,111 orders | 1,111 orders | 1,111 orders |
| **Recovered Orders** | **22 orders** | **55 orders** | **111 orders** |
| **Recovered GMV** | **₹39,600** | **₹99,000** | **₹1,99,800** |
| **Merchant Gross Profit** (25%) | ₹9,900 | ₹24,750 | ₹49,950 |
| **Total Intervention Cost** (1,111 × ₹0.224) | ₹249 | ₹249 | ₹249 |
| **Razorpay 2% PG Fees** | ₹792 | ₹1,980 | ₹3,996 |
| **MerchantPulse 1.25% Fee** | ₹495 | ₹1,238 | ₹2,498 |
| **Net Merchant Cash Generated** | **₹8,364** | **₹21,283** | **₹43,207** |
| **Return on Ad/Tool Spend (ROAS)** | **33.6x ROI** | **85.5x ROI** | **173.5x ROI** |

> [!TIP]
> **Key Finding:** Even if recovery rate drops to an ultra-pessimistic **1.0%** (only 11 orders recovered out of 1,111 failures), the merchant generates **₹4,182 net profit** on just **₹249 of tool spend** (16.8x ROI). The economics are overwhelmingly asymmetric.

---

## 3. Pricing Model for MerchantPulse

1. **Pure Performance Tier (Zero Risk):**
   - ₹0 Monthly Platform Fee.
   - **1.25% of Verified Attributed Recovered GMV** (Organic retries are free).
2. **Growth Tier (₹25L+ Monthly GMV):**
   - ₹3,999 / month flat.
   - **0.75% of Verified Attributed Recovered GMV**.
   - Includes custom WhatsApp business template integration & priority Slack alert queue.
3. **Enterprise Tier (₹1 Cr+ Monthly GMV):**
   - Custom annual contract.
   - Dedicated VPC deployment, SSO, and custom webhook secret rotation.
