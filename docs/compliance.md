# 📜 Regulatory & Data Compliance Specification: TRAI (DLT) & DPDP Act 2023

**Governing Frameworks:**
1. Telecom Regulatory Authority of India (TRAI) TCCCPR 2018 Regulations (DLT Architecture).
2. Digital Personal Data Protection (DPDP) Act, 2023 (Government of India).

---

## 1. TRAI Commercial Communication Compliance (TCCCPR 2018)

Automated SMS and messaging in India is heavily regulated. MerchantPulse adheres strictly to the Distributed Ledger Technology (DLT) registration and category guidelines.

### A. DLT Routing Classification: "Service Implicit" (Transactional)
- **Legal Justification:** Under TRAI guidelines, communications sent to a consumer regarding an active, initiated transaction or order request are classified as **Service Implicit**.
- **Impact on Delivery:** Service Implicit messages are delivered 24/7 to both DND (National Do Not Call Registry) and Non-DND numbers without promotional scrubbing, as they contain critical transactional status updates.

### B. Pre-Approved DLT Sender Headers & Templates
MerchantPulse routes through verified 6-character alphabetic headers registered on telecom DLT portals (Vilpower, Jio DLT, Airtel DLT):
- **Registered Header:** `RZPPLS` / `MRCHNT`
- **Registered Entity ID:** Principal Entity registered under telecommunication guidelines.
- **Approved DLT Template Example:**
  ```text
  Dear Customer, your payment of Rs. {#var#} for Order #{#var#} was interrupted due to a bank timeout. Tap {#var#} to resume and complete your order securely. - {#var#}
  ```

### C. Consent Flow & Customer Opt-Out Guarantee
1. **Implied Consent at Checkout:** When a consumer enters their phone number and initiates a Razorpay checkout session, consent is established under the merchant's Terms of Service for transaction-related communications.
2. **Instant Opt-Out (Unsubscribe):** Customers can reply `STOP` or click the opt-out link on any hosted payment link page. This immediately adds the phone number to `public.customer_suppression_list`, permanently blocking automated recovery dispatches.

---

## 2. Digital Personal Data Protection (DPDP) Act 2023 Compliance

### A. Data Classification & Processing Boundary

| Data Attribute | DPDP Classification | Storage Policy | Purpose Limitation |
|---|---|---|---|
| **Customer Contact / Phone** | Personal Data (PII) | Encrypted at rest (AES-256) | SMS/WhatsApp link dispatch only. |
| **Customer Email** | Personal Data (PII) | Encrypted at rest (AES-256) | Email recovery reminder only. |
| **Order Value & Method** | Financial Meta | Plain integer paise in ledger | EV calculation & reconciliation. |
| **Card Numbers / CVV / PIN** | Sensitive Financial Data | **NEVER STORED OR PROCESSED** | Handled 100% within Razorpay PCI-DSS Level 1 vault. |

### B. Core DPDP Principles Enforced

1. **Purpose Limitation:**
   - Customer phone numbers and email addresses are used exclusively for fulfilling the transaction initiated by the customer. They are **never** monetized, shared across merchants, or used for cross-promotional marketing.
2. **Data Minimization:**
   - MerchantPulse stores only the minimal attributes necessary to diagnose the payment failure and dispatch the recovery link (`contact`, `amount`, `failure_code`).
3. **Data Retention & Right to be Forgotten:**
   - Active payment links expire within a maximum of 120 minutes.
   - PII fields (`customer_contact`, `customer_email`, `customer_name`) in `revenue_opportunities` are automatically masked/pseudonymized after **30 days**.
   - Audit ledger entries retain cryptographic hashes (`context_hash`) and anonymized transaction IDs for tax and accounting compliance without storing raw phone numbers.
4. **Data Fiduciary vs. Data Processor:**
   - The Merchant operates as the **Data Fiduciary**.
   - MerchantPulse operates as a **Data Processor** acting strictly on behalf of and under instructions from the merchant.
