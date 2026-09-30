'use client';

import React, { useState } from 'react';

interface AIStrategyScreenProps {
  merchantName: string;
  onOpenRecovery: () => void;
}

export function AIStrategyScreen({
  merchantName,
  onOpenRecovery,
}: AIStrategyScreenProps) {
  const [selectedCase, setSelectedCase] = useState<'CASE_01' | 'CASE_02' | 'CASE_03'>('CASE_01');

  const cases = {
    CASE_01: {
      id: 'CASE-2026-09-HDFC-UPI',
      title: 'HDFC UPI Timeout Clustering in High-AOV Festive Baskets',
      impact: '₹6,40,000 GMV At Risk · 410 Transactions Impacted',
      problem:
        'A sharp 4.8x spike in BAD_REQUEST_PAYMENT_TIMED_OUT errors was detected between 14:00 and 16:30 IST, localized to HDFC Bank UPI handles (@okhdfcbank, @hdfcbank). Transactions exceeding ₹2,500 experienced an 18.2% drop-off due to NPCI switch throttling during peak checkout volume.',
      evidence: [
        { label: 'Observed Error Rate', value: '18.2%', baseline: '2.1% nominal baseline' },
        { label: 'Mean Acquirer Latency', value: '42.8s', baseline: 'Exceeded 45s gateway timeout' },
        { label: 'Affected Merchant Corridor', value: 'High-Value D2C Checkout', baseline: 'AOV ₹3,850' },
        { label: 'Cluster Concentration', value: '88.4%', baseline: 'HDFC / Google Pay UPI VPAs' },
      ],
      rootCause:
        'Root Cause Analysis (Level 4 Diagnostic): Issuer Switch Concurrency Saturation. HDFC Bank Core Banking switch rate-limited secondary UPI validation callbacks under heavy festive load, causing Razorpay gateway intent listeners to hit the 45-second statutory timeout before acknowledgment.',
      aiAnalysis:
        'Causal inference modeling indicates a 94.2% buyer intent retention within 15 minutes of checkout failure. Buyers did not abandon due to price sensitivity or lack of funds, but rather technical timeout friction. Standard blind auto-retries against the same degraded switch will exacerbate failures (82% secondary decline rate).',
      confidence: 94.2,
      suggestedAction:
        'Deploy dynamic fallback routing: Send an automated, brand-verified WhatsApp Smart Recovery Link containing dual payment choices: (1) Direct Intent trigger to alternate UPI app (PhonePe / Paytm via ICICI switch), and (2) Zero-friction Saved Card 3DS2 checkout.',
      expectedRecovery: '₹5,18,000 net recovered GMV (81% recovery rate within 20-minute window)',
      riskAssessment: {
        customerFatigueRisk: 'Low (< 0.8%) — Single verified notification with immediate opt-out',
        unitEconomicsRisk: 'Negligible — Cost of recovery message is ₹0.48 vs ₹3,850 recovered basket',
        complianceRisk: 'Zero — Fully compliant with DPDP Act 2023 and TRAI commercial communication rules',
      },
      policyValidation: [
        { rule: 'RULE_MAX_VELOCITY', verdict: 'PASSED', detail: 'Attempt 1 of 2 maximum permitted' },
        { rule: 'RULE_FATIGUE_COOLDOWN', verdict: 'PASSED', detail: 'Current time within allowed business hours (16:48 IST)' },
        { rule: 'RULE_MARGIN_HURDLE', verdict: 'PASSED', detail: 'Recoverable margin ₹3,850 exceeds threshold ₹500' },
        { rule: 'RULE_IDEMPOTENCY_SIGNATURE', verdict: 'PASSED', detail: 'Cryptographic nonce verified against ledger' },
      ],
    },
    CASE_02: {
      id: 'CASE-2026-09-RECURRING-MANDATE',
      title: 'UPI Autopay Mandate Execution Failure on Renewal Cycle',
      impact: '₹2,84,000 MRR At Risk · 98 Subscription Accounts Impacted',
      problem:
        'Recurring SaaS subscription charges failed due to PRE_DEBIT_NOTIFICATION_NOT_ACKNOWLEDGED. Razorpay mandate execution attempted debits without recorded receipt of the mandatory RBI 24-hour pre-debit advisory message.',
      evidence: [
        { label: 'Mandate Decline Code', value: 'U69_PREDEBIT_MISSING', baseline: 'RBI Master Direction' },
        { label: 'Impacted Subscriptions', value: '98 Accounts', baseline: 'Enterprise Tier' },
        { label: 'Renewal Churn Risk', value: '14.5%', baseline: 'If unaddressed for > 48h' },
        { label: 'Customer Corridor', value: 'B2B Software Subscriptions', baseline: 'AOV ₹8,900' },
      ],
      rootCause:
        'Notification Gateway Delivery Latency: The third-party SMS aggregator experienced an 8-hour downstream queue backup, preventing timely receipt confirmation before the automated debit execution job was triggered.',
      aiAnalysis:
        'Subscription subscribers possess an active contractual relationship with 98% intent. Immediate re-triggering of debit without pre-debit notification will trigger regulatory failure and customer dispute penalties. A scheduled staggered notification workflow will achieve 92% successful debit on the subsequent banking window.',
      confidence: 96.0,
      suggestedAction:
        'Reschedule mandate debit execution for T+24h. Concurrently dispatch instant multi-channel pre-debit advisory via email and WhatsApp with registered Razorpay mandate reference number.',
      expectedRecovery: '₹2,61,000 recurring MRR preserved with 0 churn',
      riskAssessment: {
        customerFatigueRisk: 'Zero — Regulatory requirement mandatory notice',
        unitEconomicsRisk: 'Zero — No additional payment processing surcharge',
        complianceRisk: 'Mitigated — Full compliance with RBI Circular RBI/2020-21/74',
      },
      policyValidation: [
        { rule: 'RULE_RBI_PREDEBIT_TIMING', verdict: 'PASSED', detail: 'T+24h scheduled window strictly enforced' },
        { rule: 'RULE_MANDATE_VALIDITY', verdict: 'PASSED', detail: 'Customer e-mandate status active on NPCI hub' },
        { rule: 'RULE_DUPLICATE_DEBIT_PREVENTION', verdict: 'PASSED', detail: 'State lock placed on subscription ID' },
      ],
    },
    CASE_03: {
      id: 'CASE-2026-09-CARD-3DS2-DROP',
      title: 'International Card Acquirer Authentication Drop-off',
      impact: '₹4,12,000 Cross-Border GMV · 24 High-Value Orders Impacted',
      problem:
        'Cross-border credit card payments from EU and US buyers on Kolkata Artisans Co. failed at the 3DS2 challenge step due to localized friction with 3D Secure fallback iframe loading.',
      evidence: [
        { label: 'Failure Reason', value: 'AUTHENTICATION_ABANDONED', baseline: 'Cardholder closed challenge window' },
        { label: 'Average Ticket Size', value: '₹17,160 ($205 USD)', baseline: 'Export Artisanal Guilds' },
        { label: '3DS Latency Over International Hops', value: '14.2s', baseline: 'Caused browser timeout' },
        { label: 'Payment Gateway', value: 'Razorpay Global Currency Switch', baseline: 'USD / EUR' },
      ],
      rootCause:
        'Cross-Border ACS Iframe Rejection: Foreign issuing banks (Chase, Barclays) enforced strict CSP frame-ancestors headers that conflicted with embedded mobile checkout drawers, forcing users to an unrendered blank screen.',
      aiAnalysis:
        'High-value international collectors demonstrate strong purchase conviction. Friction is entirely confined to iframe rendering mechanics. Providing a dedicated hosted payment redirect link completely circumvents the iframe CSP conflict and yields an 86% immediate completion rate.',
      confidence: 89.5,
      suggestedAction:
        'Dispatch autonomous Razorpay Hosted Invoice Link with frictionless 3DS redirect directly to cardholder email with localized currency conversion guaranteed.',
      expectedRecovery: '₹3,54,000 export GMV salvaged across 21 orders',
      riskAssessment: {
        customerFatigueRisk: 'Low — Premium white-glove transactional communication',
        unitEconomicsRisk: 'Low — High margin export basket easily absorbs FX fees',
        complianceRisk: 'Zero — 3DS2 liability shift maintained for fraud protection',
      },
      policyValidation: [
        { rule: 'RULE_CROSS_BORDER_FX_LOCK', verdict: 'PASSED', detail: 'Guaranteed exchange rate locked for 2 hours' },
        { rule: 'RULE_3DS_LIABILITY_PROTECTION', verdict: 'PASSED', detail: 'Full 3DS authentication enforced' },
        { rule: 'RULE_EXPORT_INVOICE_CLEARANCE', verdict: 'PASSED', detail: 'IEC and FIRC paperwork auto-attached' },
      ],
    },
  };

  const currentCase = cases[selectedCase];

  return (
    <section className="ai-strategy-section" id="strategy" aria-label="AI Strategy Screen">
      <div className="strategy-executive-header">
        <div className="strategy-eyebrow">
          <span className="eyebrow-tag">EXECUTIVE INTELLIGENCE</span>
          <span className="eyebrow-id">{currentCase.id}</span>
        </div>
        <h2 className="strategy-headline">Autonomous Strategy Report</h2>
        <p className="strategy-deck">
          Causal diagnostic synthesis and recovery strategy formulated for {merchantName}.
        </p>

        {/* Case selector tabs */}
        <div className="strategy-case-tabs">
          <button
            type="button"
            className={`case-tab ${selectedCase === 'CASE_01' ? 'active' : ''}`}
            onClick={() => setSelectedCase('CASE_01')}
          >
            <span className="case-tab-num">01</span>
            <span className="case-tab-name">HDFC UPI Timeout Clustering</span>
          </button>
          <button
            type="button"
            className={`case-tab ${selectedCase === 'CASE_02' ? 'active' : ''}`}
            onClick={() => setSelectedCase('CASE_02')}
          >
            <span className="case-tab-num">02</span>
            <span className="case-tab-name">UPI Autopay Renewal Mandate</span>
          </button>
          <button
            type="button"
            className={`case-tab ${selectedCase === 'CASE_03' ? 'active' : ''}`}
            onClick={() => setSelectedCase('CASE_03')}
          >
            <span className="case-tab-num">03</span>
            <span className="case-tab-name">Cross-Border 3DS2 Challenge Drop</span>
          </button>
        </div>
      </div>

      {/* McKinsey-Grade Dossier Layout */}
      <div className="strategy-dossier">
        {/* Dossier Header Banner */}
        <div className="dossier-banner">
          <div>
            <div className="dossier-case-title">{currentCase.title}</div>
            <div className="dossier-case-impact">{currentCase.impact}</div>
          </div>
          <div className="dossier-confidence-badge">
            <span className="confidence-label">AI CONFIDENCE SCORE</span>
            <span className="confidence-score font-mono">{currentCase.confidence}%</span>
            <span className="confidence-sub">Empirically Calibrated</span>
          </div>
        </div>

        {/* Section 1: Problem Definition */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">I.</span> Problem Statement & Financial Impact
          </div>
          <div className="dossier-narrative">
            {currentCase.problem}
          </div>
        </div>

        {/* Section 2: Empirical Evidence Grid */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">II.</span> Empirical Telemetry Evidence
          </div>
          <div className="evidence-grid">
            {currentCase.evidence.map((ev, i) => (
              <div key={i} className="evidence-cell">
                <span className="evidence-label">{ev.label}</span>
                <span className="evidence-value font-mono">{ev.value}</span>
                <span className="evidence-baseline">{ev.baseline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Root Cause Analysis */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">III.</span> Deterministic Root Cause Analysis
          </div>
          <div className="dossier-narrative highlight-box">
            {currentCase.rootCause}
          </div>
        </div>

        {/* Section 4: AI Causal Analysis */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">IV.</span> Causal Behavioral Analysis
          </div>
          <div className="dossier-narrative">
            {currentCase.aiAnalysis}
          </div>
        </div>

        {/* Section 5: Suggested Action & Expected Recovery */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">V.</span> Recommended Remediation Workflow
          </div>
          <div className="action-proposal-card">
            <div className="proposal-body">
              <div className="proposal-action font-semibold text-primary">
                {currentCase.suggestedAction}
              </div>
              <div className="proposal-expected-recovery">
                <span className="expected-label">Projected Net Salvage:</span>
                <span className="expected-val font-mono font-bold text-success">
                  {currentCase.expectedRecovery}
                </span>
              </div>
            </div>
            <div className="proposal-btn-box">
              <button
                type="button"
                className="btn-execute-proposal"
                onClick={onOpenRecovery}
              >
                Execute Recommended Action →
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Risk Assessment */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">VI.</span> Risk & Governance Assessment
          </div>
          <div className="risk-assessment-grid">
            <div className="risk-cell">
              <div className="risk-header">
                <span className="risk-icon">🛡</span>
                <span className="risk-title">Customer Fatigue Risk</span>
              </div>
              <p className="risk-desc">{currentCase.riskAssessment.customerFatigueRisk}</p>
            </div>
            <div className="risk-cell">
              <div className="risk-header">
                <span className="risk-icon">⚖</span>
                <span className="risk-title">Unit Economics Margin Risk</span>
              </div>
              <p className="risk-desc">{currentCase.riskAssessment.unitEconomicsRisk}</p>
            </div>
            <div className="risk-cell">
              <div className="risk-header">
                <span className="risk-icon">📜</span>
                <span className="risk-title">Regulatory Compliance Risk</span>
              </div>
              <p className="risk-desc">{currentCase.riskAssessment.complianceRisk}</p>
            </div>
          </div>
        </div>

        {/* Section 7: Policy Guardrail Validation */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <span className="sec-num">VII.</span> Policy Guardrail Validation Verdicts
          </div>
          <div className="policy-validation-table">
            {currentCase.policyValidation.map((pv, idx) => (
              <div key={idx} className="policy-validation-row">
                <span className="font-mono text-accent">{pv.rule}</span>
                <span className="policy-verdict-tag success">
                  <span className="dot success" />
                  {pv.verdict}
                </span>
                <span className="policy-detail-text">{pv.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
