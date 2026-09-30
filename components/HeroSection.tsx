'use client';

import React, { useState } from 'react';

interface HeroSectionProps {
  onRunAudit: () => void;
  onOpenRecovery: () => void;
  recoverableAmount: string;
  recoveryRate: string;
  guardrailsVerified: number;
}

export function HeroSection({
  onRunAudit,
  onOpenRecovery,
  recoverableAmount,
  recoveryRate,
  guardrailsVerified,
}: HeroSectionProps) {
  const [activeRange, setActiveRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Telemetry spark bars for hero visualization
  const sparkData = [
    { time: '00:00', failed: 42, recovered: 34, status: 'ok' },
    { time: '03:00', failed: 28, recovered: 24, status: 'ok' },
    { time: '06:00', failed: 65, recovered: 52, status: 'ok' },
    { time: '09:00', failed: 142, recovered: 118, status: 'surge' },
    { time: '12:00', failed: 185, recovered: 146, status: 'surge' },
    { time: '15:00', failed: 210, recovered: 172, status: 'surge' },
    { time: '18:00', failed: 168, recovered: 139, status: 'ok' },
    { time: '21:00', failed: 94, recovered: 81, status: 'ok' },
  ];

  return (
    <section className="hero-os-section" aria-label="Revenue Intelligence Hero">
      <div className="hero-os-container">
        {/* Left Column: Editorial Headline & Executive Value Proposition */}
        <div className="hero-os-content">
          <div className="hero-os-badge">
            <span className="hero-os-badge-pulse" />
            <span className="hero-os-badge-text">REVENUE INTELLIGENCE OS 2.0</span>
            <span className="hero-os-badge-divider">/</span>
            <span className="hero-os-badge-spine">RAZORPAY SPARK PIPELINE</span>
          </div>

          <h1 className="hero-os-headline">
            Turn failed payments into <span className="hero-os-headline-accent">recovered revenue.</span>
          </h1>

          <p className="hero-os-subheadline">
            Detect. Diagnose. Prioritize. Act. Verify.
          </p>

          <p className="hero-os-description">
            MerchantPulse operates as an autonomous financial control layer over Razorpay webhooks.
            By coupling deterministic payment state verification with causal AI diagnostics and
            strict policy guardrails, we systematically eliminate checkout drop-off and salvage high-intent Indian commerce.
          </p>

          <div className="hero-os-actions">
            <button
              type="button"
              className="hero-btn-primary"
              onClick={onOpenRecovery}
              id="hero-trigger-recovery-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Execute Recovery Action</span>
            </button>
            <button
              type="button"
              className="hero-btn-secondary"
              onClick={onRunAudit}
              id="hero-run-audit-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Run System Audit</span>
            </button>
          </div>

          <div className="hero-os-trust-strip">
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>Deterministic Idempotency</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>Zero Customer Fatigue Risk</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Data Visualization & Live Telemetry Stream */}
        <div className="hero-os-telemetry-card">
          <div className="telemetry-card-header">
            <div className="telemetry-card-title-group">
              <div className="telemetry-pulse-dot" />
              <div>
                <div className="telemetry-card-title">Live Payment Spine Telemetry</div>
                <div className="telemetry-card-subtitle">Autonomous Ingestion & Remediation Stream</div>
              </div>
            </div>
            <div className="telemetry-range-selector">
              {(['24h', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`telemetry-range-btn ${activeRange === r ? 'active' : ''}`}
                  onClick={() => setActiveRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Bar Overview */}
          <div className="telemetry-metrics-grid">
            <div className="telemetry-metric-cell">
              <div className="telemetry-metric-label">Recoverable Pipeline</div>
              <div className="telemetry-metric-value">{recoverableAmount}</div>
              <div className="telemetry-metric-trend positive">↑ 18.4% vs last cycle</div>
            </div>
            <div className="telemetry-metric-cell">
              <div className="telemetry-metric-label">Remediation Efficacy</div>
              <div className="telemetry-metric-value">{recoveryRate}</div>
              <div className="telemetry-metric-sub">Verified Causal Lift</div>
            </div>
            <div className="telemetry-metric-cell">
              <div className="telemetry-metric-label">Active Guardrails</div>
              <div className="telemetry-metric-value">{guardrailsVerified} Rules</div>
              <div className="telemetry-metric-sub">100% Policy Bound</div>
            </div>
            <div className="telemetry-metric-cell">
              <div className="telemetry-metric-label">Mean Intervention</div>
              <div className="telemetry-metric-value">4.2 min</div>
              <div className="telemetry-metric-sub">Pre-Abandonment</div>
            </div>
          </div>

          {/* Live Activity Sparkline Graph */}
          <div className="telemetry-chart-container">
            <div className="telemetry-chart-legend">
              <div className="legend-item">
                <span className="legend-color failed" />
                <span>Detected Failure Spikes</span>
              </div>
              <div className="legend-item">
                <span className="legend-color recovered" />
                <span>Salvaged Intent (Recovered)</span>
              </div>
            </div>

            <div className="telemetry-spark-bars">
              {sparkData.map((d, i) => (
                <div key={i} className="spark-bar-column">
                  <div className="spark-bar-track">
                    <div
                      className="spark-bar-failed"
                      style={{ height: `${(d.failed / 220) * 100}%` }}
                      title={`Failed: ${d.failed} txns`}
                    />
                    <div
                      className="spark-bar-recovered"
                      style={{ height: `${(d.recovered / 220) * 100}%` }}
                      title={`Recovered: ${d.recovered} txns`}
                    />
                  </div>
                  <span className="spark-bar-time">{d.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Live Feed Ticker */}
          <div className="telemetry-live-feed">
            <div className="feed-status-badge">LIVE LEDGER</div>
            <div className="feed-event-text">
              <span className="feed-timestamp">16:48:12 IST</span>
              <span className="feed-event-name">UPI_AUTOPAY_PREDEBIT_SENT</span>
              <span className="feed-order-id">#ord_NP821034</span>
              <span className="feed-amount">₹4,250.00</span>
              <span className="feed-status-pill success">SALVAGED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
