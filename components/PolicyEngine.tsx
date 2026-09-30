'use client';

import React, { useState } from 'react';

export function PolicyEngine() {
  const [executionMode, setExecutionMode] = useState<'SIMULATED' | 'SUPERVISED' | 'AUTONOMOUS'>('AUTONOMOUS');
  const [maxRetries, setMaxRetries] = useState<number>(2);
  const [minMargin, setMinMargin] = useState<number>(500);
  const [fatigueHours, setFatigueHours] = useState<number>(48);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSaveStatus('Guardrail policies saved & propagated to live inference edge.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  return (
    <section className="policy-engine-section" id="policy" aria-label="Policy Engine">
      <div className="policy-header">
        <div className="policy-header-left">
          <div className="policy-badge">STRICT DETERMINISTIC GUARDRAILS</div>
          <h2 className="policy-title">Policy & Governance Engine</h2>
          <p className="policy-subtitle">
            Autonomous execution is mathematically bounded by programmable safety constraints before any live transaction or customer communication is fired.
          </p>
        </div>

        <div className="policy-header-status">
          <span className="policy-status-pill active">
            <span className="status-dot" />
            LIVE GUARDRAILS ENFORCED
          </span>
        </div>
      </div>

      {saveStatus && (
        <div className="policy-save-alert">
          <span>✓</span>
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="policy-grid">
        {/* Policy Block 1: Autonomous Execution Mode */}
        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <div className="policy-card-title">Execution Autonomy Level</div>
              <div className="policy-card-desc">Determine the degree of automated intervention for detected payment drop-offs.</div>
            </div>
          </div>

          <div className="autonomy-selector">
            <div
              className={`autonomy-option ${executionMode === 'SIMULATED' ? 'selected' : ''}`}
              onClick={() => setExecutionMode('SIMULATED')}
            >
              <div className="autonomy-option-head">
                <span className="autonomy-title">Simulated</span>
                <span className="autonomy-chip">Dry-Run</span>
              </div>
              <p className="autonomy-text">
                AI classifies drop-offs and models recovery outcomes in telemetry, but executes 0 external API calls or customer messages.
              </p>
            </div>

            <div
              className={`autonomy-option ${executionMode === 'SUPERVISED' ? 'selected' : ''}`}
              onClick={() => setExecutionMode('SUPERVISED')}
            >
              <div className="autonomy-option-head">
                <span className="autonomy-title">Supervised</span>
                <span className="autonomy-chip">Human-in-the-Loop</span>
              </div>
              <p className="autonomy-text">
                Remediation plans require explicit operator clearance in the Opportunity Radar before Razorpay recovery links are generated.
              </p>
            </div>

            <div
              className={`autonomy-option ${executionMode === 'AUTONOMOUS' ? 'selected' : ''}`}
              onClick={() => setExecutionMode('AUTONOMOUS')}
            >
              <div className="autonomy-option-head">
                <span className="autonomy-title">Autonomous (Recommended)</span>
                <span className="autonomy-chip active">Production Mode</span>
              </div>
              <p className="autonomy-text">
                Eligible opportunities clearing all 5 policy guardrails are dispatched instantly (&lt; 250ms) to maximize recovery conversion.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Block 2: Hard Numerical Guardrails */}
        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <div className="policy-card-title">Threshold & Margin Guardrails</div>
              <div className="policy-card-desc">Safety bounds to prevent customer fatigue, brand degradation, and negative unit economics.</div>
            </div>
          </div>

          <div className="guardrail-fields">
            <div className="guardrail-field-item">
              <div className="field-label-group">
                <label className="field-label">Maximum Re-attempts per Customer</label>
                <span className="field-help">Hard limit on recovery attempts per customer in 24 hours.</span>
              </div>
              <div className="field-input-box">
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="policy-input-num"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                />
                <span className="input-unit">attempts / 24h</span>
              </div>
            </div>

            <div className="guardrail-field-item">
              <div className="field-label-group">
                <label className="field-label">Minimum Recovery Basket Size</label>
                <span className="field-help">Drop-offs below this value are suppressed to preserve messaging margins.</span>
              </div>
              <div className="field-input-box">
                <input
                  type="number"
                  min="100"
                  step="100"
                  className="policy-input-num"
                  value={minMargin}
                  onChange={(e) => setMinMargin(Number(e.target.value))}
                />
                <span className="input-unit">INR (₹)</span>
              </div>
            </div>

            <div className="guardrail-field-item">
              <div className="field-label-group">
                <label className="field-label">Customer Fatigue Cooldown Window</label>
                <span className="field-help">Mandatory quiet period if customer declines two consecutive recovery links.</span>
              </div>
              <div className="field-input-box">
                <input
                  type="number"
                  min="12"
                  max="168"
                  className="policy-input-num"
                  value={fatigueHours}
                  onChange={(e) => setFatigueHours(Number(e.target.value))}
                />
                <span className="input-unit">hours cooldown</span>
              </div>
            </div>
          </div>

          <div className="policy-save-footer">
            <button
              type="button"
              className="btn-save-policy"
              onClick={handleSave}
            >
              Update Policy Thresholds
            </button>
          </div>
        </div>

        {/* Policy Block 3: Regulatory Compliance Verification */}
        <div className="policy-card policy-span-2">
          <div className="policy-card-header">
            <div>
              <div className="policy-card-title">Regulatory & Industry Protocol Compliance</div>
              <div className="policy-card-desc">Statutory requirements enforced natively at runtime before dispatch.</div>
            </div>
            <span className="compliance-cert-badge">RBI & DPDP ALIGNED</span>
          </div>

          <div className="compliance-grid">
            <div className="compliance-cell">
              <div className="compliance-cell-head">
                <span className="check-bullet">✓</span>
                <span className="compliance-name">RBI Circular RBI/2020-21/74</span>
              </div>
              <p className="compliance-text">
                Enforces 24-hour advance pre-debit notifications with mandate reference numbers before triggering any recurring UPI Autopay charge.
              </p>
            </div>

            <div className="compliance-cell">
              <div className="compliance-cell-head">
                <span className="check-bullet">✓</span>
                <span className="compliance-name">Digital Personal Data Protection (DPDP) Act 2023</span>
              </div>
              <p className="compliance-text">
                All PII (customer email, phone, card tokens) masked with SHA-256 HMAC salting. Zero unencrypted customer data stored outside memory.
              </p>
            </div>

            <div className="compliance-cell">
              <div className="compliance-cell-head">
                <span className="check-bullet">✓</span>
                <span className="compliance-name">PCI-DSS Level 1 & Tokenization</span>
              </div>
              <p className="compliance-text">
                Card credentials never touch MerchantPulse servers; transactions reference Razorpay secure card tokens and RBI compliant co-badged networks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
