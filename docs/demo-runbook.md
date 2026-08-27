# MerchantPulse Demo & Evaluation Runbook
**Razorpay Buildathon 2026 Submission — Track 03: AI Revenue Recovery Agent**

---

## 🎯 Reviewer Quickstart (Under 2 Minutes)

MerchantPulse works **100% out of the box** in hermetic Deterministic Mode without needing external API keys, while also supporting full live test mode when credentials are provided.

### 1. Launch the Application Locally
```bash
git clone https://github.com/divyanshusinha/Merchant-Pulse.git
cd Merchant-Pulse
npm install
npm run dev
```
Open **[http://localhost:3000/reviewer](http://localhost:3000/reviewer)** in your browser.

---

## 🧭 Evaluation Journeys

### Path A: Reviewer Cockpit (Recommended for Shortlisting)
1. Navigate to **`/reviewer`**.
2. Review the **System Readiness Panel** (indicates live vs mock adapter states).
3. Click **"Run 1-Click Golden Demo"**.
4. Observe the live 7-stage execution trace:
   - **Step 1:** Ingests simulated `payment.failed` webhook (HMAC verified).
   - **Step 2:** Fact store classifies failure as `HIGH_VALUE_DROPOFF`.
   - **Step 3:** Deterministic Expected Value calculated in integer paise.
   - **Step 4:** Bounded strategy generated with strict JSON schema.
   - **Step 5:** Policy engine checks 6 merchant safety guardrails (`AUTO_EXECUTE`).
   - **Step 6:** Dispatches to Razorpay `/v1/payment_links` primitive.
   - **Step 7:** Closed-loop webhook reconciles decision with zero double-counting.

---

### Path B: Live Merchant Dashboard
1. Navigate to **`/dashboard`**.
2. Click **"Run Scenario (₹1.24 Cr)"** to populate the live terminal with simulated real-world transactions.
3. Inspect:
   - **Financial Metric Cards:** Total GMV, Revenue at Risk, Recoverable EV, Attributed Recovered GMV.
   - **Opportunity Action Table:** Live opportunities with failure codes, LTV, and action buttons.
   - **Human Escalation Queue:** High-risk dropoffs requiring manual one-click merchant approval.
   - **System Logs:** Cryptographic audit trail with verified decision IDs.

---

### Path C: Razorpay Test Mode Setup (Optional Live Execution)
To test with real Razorpay Test Mode credentials:

1. Create or open `.env.local`:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_yourKeyId
   RAZORPAY_KEY_SECRET=yourKeySecret
   RAZORPAY_WEBHOOK_SECRET=yourWebhookSecret
   GEMINI_API_KEY=yourGeminiApiKey
   ```
2. Trigger an automated payment link creation through the dashboard or webhook:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: <hmac_signature>" \
     -d @fixtures/payment_failed.json
   ```
3. A genuine Razorpay Payment Link (`https://rzp.io/i/...`) will be created in your Razorpay Test Dashboard.

---

## 🧪 Automated Test & Benchmark Verification Commands

Verify all production invariants via terminal:

```bash
# 1. Run Complete Unit, Stress, and Integration Test Suite (60/60 tests)
npm test

# 2. Run Benchmark & Evaluation Suite
npm run test:eval

# 3. Run Safety Guardrail Benchmark
npm run benchmark:safety

# 4. Run 1,000-Event Held-Out Evaluation Simulation
npm run benchmark:heldout

# 5. Verify TypeScript Zero-Error Strict Compilation
npm run type-check

# 6. Verify ESLint Code Standards
npm run lint

# 7. Production Build Verification
npm run build
```

---

## 🔒 Financial Safety & Audit Invariants

1. **Zero LLM Math:** All EV calculations ($P(success) \times GMV - Cost - Fatigue$) happen in TypeScript integer paise.
2. **Zero Double-Counting:** `FinancialReconciliationEngine` tracks unique decision IDs and payment IDs.
3. **Organic Separation:** Payments completed organically without active MerchantPulse payment links are flagged as `ORGANIC_RECOVERY` and never attributed to AI.
4. **Idempotent Execution:** 100 concurrent race-condition attempts resolve to exactly one Razorpay Payment Link.
