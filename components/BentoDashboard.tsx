'use client';

import React from 'react';

interface BentoDashboardProps {
  gmvTotal: string;
  identifiedLeakage: string;
  salvagedVolume: string;
  policyVerdict: string;
  netExpectedValue: string;
  onNavigate: (view: string) => void;
  onOpenRecovery: () => void;
}

export function BentoDashboard({
  gmvTotal,
  identifiedLeakage,
  salvagedVolume,
  policyVerdict,
  netExpectedValue,
  onNavigate,
  onOpenRecovery,
}: BentoDashboardProps) {
  // Indian Gateway Rail Performance Data
  const gateways = [
    { name: 'HDFC Bank UPI', rail: 'UPI', uptime: '98.9%', latency: '98ms', status: 'optimal' },
    { name: 'ICICI Bank Cards', rail: 'Cards', uptime: '97.4%', latency: '164ms', status: 'optimal' },
    { name: 'Axis Bank Netbanking', rail: 'Netbanking', uptime: '91.8%', latency: '342ms', status: 'degraded' },
    { name: 'SBI UPI Switch', rail: 'UPI', uptime: '94.2%', latency: '210ms', status: 'warning' },
  ];

  // Pipeline Stages
  const pipeline = [
    { step: '01', name: 'Ingested', count: '1,480 txns', value: identifiedLeakage, status: 'complete' },
    { step: '02', name: 'AI Diagnosed', count: '1,324 txns', value: '₹12.60L', status: 'complete' },
    { step: '03', name: 'Policy Validated', count: '1,120 txns', value: '₹10.84L', status: 'active' },
    { step: '04', name: 'Dispatched', count: '890 txns', value: '₹8.92L', status: 'pending' },
    { step: '05', name: 'Settled', count: '640 txns', value: salvagedVolume, status: 'settled' },
  ];

  // Recent Salvaged Transactions Ticker
  const recentRecoveries = [
    { id: 'pay_01HX9821A', customer: 'vikram.s***@gmail.com', rail: 'UPI (PhonePe)', amount: '₹3,499', code: 'BANK_TIMEOUT_RESOLVED', time: '2m ago' },
    { id: 'pay_01HX9819B', customer: 'priya.k***@outlook.com', rail: 'Visa 3DS2 (HDFC)', amount: '₹12,450', code: 'SMART_LINK_RECOVERY', time: '6m ago' },
    { id: 'pay_01HX9812C', customer: 'rohit.m***@company.in', rail: 'UPI Autopay', amount: '₹8,900', code: 'PRE_DEBIT_DISPATCHED', time: '11m ago' },
    { id: 'pay_01HX9808D', customer: 'ananya.d***@gmail.com', rail: 'SBI Netbanking', amount: '₹2,100', code: 'FALLBACK_UPI_SETTLED', time: '17m ago' },
  ];

  return (
    <section className="bento-dashboard-section" aria-label="Executive Bento Grid">
      <div className="bento-grid">
        {/* Card 1: Revenue At Risk (Span 2) */}
        <div className="bento-card bento-span-2">
          <div className="bento-card-header">
            <div>
              <div className="bento-card-label">CAPITAL PRESERVATION</div>
              <div className="bento-card-title">Revenue At Risk & Recovery Run-rate</div>
            </div>
            <span className="bento-badge amber">CRITICAL CONCENTRATION</span>
          </div>

          <div className="bento-risk-grid">
            <div className="bento-risk-stat">
              <span className="bento-stat-label">Total Failed GMV</span>
              <span className="bento-stat-num danger">{identifiedLeakage}</span>
              <span className="bento-stat-sub">Across 1,480 payment drops</span>
            </div>
            <div className="bento-risk-stat">
              <span className="bento-stat-label">Autonomous Salvageable</span>
              <span className="bento-stat-num success">{salvagedVolume}</span>
              <span className="bento-stat-sub">72.4% conversion expectancy</span>
            </div>
            <div className="bento-risk-stat">
              <span className="bento-stat-label">Net Projected Recovery</span>
              <span className="bento-stat-num highlight">{netExpectedValue}</span>
              <span className="bento-stat-sub">After gateway re-attempt fees</span>
            </div>
          </div>

          <div className="bento-progress-strip">
            <div className="bento-progress-header">
              <span>Remediation Target vs Identified Leakage</span>
              <span className="font-mono">72.4% Salvageable</span>
            </div>
            <div className="bento-progress-track">
              <div className="bento-progress-fill success" style={{ width: '72.4%' }} />
              <div className="bento-progress-fill warning" style={{ width: '18.2%' }} />
              <div className="bento-progress-fill danger" style={{ width: '9.4%' }} />
            </div>
            <div className="bento-progress-legend">
              <span><span className="dot success" /> Auto-Recoverable (72.4%)</span>
              <span><span className="dot warning" /> Requires Customer Action (18.2%)</span>
              <span><span className="dot danger" /> Unrecoverable Hard Declines (9.4%)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Recovery Pipeline (Span 2) */}
        <div className="bento-card bento-span-2">
          <div className="bento-card-header">
            <div>
              <div className="bento-card-label">LIFECYCLE TELEMETRY</div>
              <div className="bento-card-title">Autonomous Recovery Funnel</div>
            </div>
            <button
              type="button"
              className="bento-action-link"
              onClick={() => onNavigate('opportunities')}
            >
              View In Radar →
            </button>
          </div>

          <div className="pipeline-steps-horizontal">
            {pipeline.map((p, idx) => (
              <div key={idx} className={`pipeline-step-item ${p.status}`}>
                <div className="pipeline-step-top">
                  <span className="pipeline-step-index">{p.step}</span>
                  <span className={`pipeline-step-indicator ${p.status}`} />
                </div>
                <div className="pipeline-step-name">{p.name}</div>
                <div className="pipeline-step-count">{p.count}</div>
                <div className="pipeline-step-val">{p.value}</div>
              </div>
            ))}
          </div>

          <div className="pipeline-cta-bar">
            <div className="pipeline-cta-info">
              <span className="pipeline-pulse-dot" />
              <span>1,120 transactions cleared all safety policies and are ready for dispatch.</span>
            </div>
            <button
              type="button"
              className="pipeline-execute-btn"
              onClick={onOpenRecovery}
            >
              Trigger Recovery Action
            </button>
          </div>
        </div>

        {/* Card 3: Gateway Health (Span 2) */}
        <div className="bento-card bento-span-2">
          <div className="bento-card-header">
            <div>
              <div className="bento-card-label">RAIL OBSERVABILITY</div>
              <div className="bento-card-title">Indian Gateway & Bank Switch Health</div>
            </div>
            <span className="bento-badge blue">LIVE PING 10s</span>
          </div>

          <div className="gateway-table">
            <div className="gateway-table-head">
              <span>Network Switch</span>
              <span>Rail</span>
              <span>Uptime</span>
              <span>Latency</span>
              <span>Operational Status</span>
            </div>
            {gateways.map((g, idx) => (
              <div key={idx} className="gateway-table-row">
                <span className="font-semibold text-primary">{g.name}</span>
                <span className="rail-pill">{g.rail}</span>
                <span className="font-mono text-secondary">{g.uptime}</span>
                <span className="font-mono text-secondary">{g.latency}</span>
                <span className={`status-pill ${g.status}`}>
                  <span className="status-pill-dot" />
                  {g.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <div className="gateway-alert-callout">
            <span className="callout-icon">⚠</span>
            <div className="callout-body">
              <strong>Axis Bank Netbanking Switch Degraded:</strong> MerchantPulse automated routing is dynamically prioritizing UPI QR fallback for affected baskets over ₹2,000.
            </div>
          </div>
        </div>

        {/* Card 4: AI Recommendations & Policy Decisions (Span 2) */}
        <div className="bento-card bento-span-2">
          <div className="bento-card-header">
            <div>
              <div className="bento-card-label">DECISION GOVERNANCE</div>
              <div className="bento-card-title">AI Strategy & Guardrail Verifications</div>
            </div>
            <span className="bento-badge emerald">100% GUARDRAIL CLEARED</span>
          </div>

          <div className="bento-decision-body">
            <div className="decision-lead">
              <div className="decision-icon">⚡</div>
              <div>
                <div className="decision-title">Strategy Verdict: {policyVerdict}</div>
                <div className="decision-desc">
                  Autonomous Causal Model recommends instant UPI Intent link dispatch for timeout failures and delayed pre-debit notifications for recurring mandates.
                </div>
              </div>
            </div>

            <div className="guardrail-checklist">
              <div className="guardrail-item checked">
                <span className="check-mark">✓</span>
                <span>Max Retries Policy: ≤ 2 re-attempts per customer in 24 hours</span>
              </div>
              <div className="guardrail-item checked">
                <span className="check-mark">✓</span>
                <span>Customer Fatigue Shield: Zero SMS/WhatsApp dispatch after 21:00 IST</span>
              </div>
              <div className="guardrail-item checked">
                <span className="check-mark">✓</span>
                <span>Minimum Unit Economics: Expected salvage value &gt; 12x payment gateway cost</span>
              </div>
              <div className="guardrail-item checked">
                <span className="check-mark">✓</span>
                <span>RBI Mandate Verification: Fully compliant with 24h pre-debit rules</span>
              </div>
            </div>

            <div className="bento-card-footer-action">
              <button
                type="button"
                className="btn-outline-sm"
                onClick={() => onNavigate('strategy')}
              >
                Inspect Full McKinsey Strategy Report →
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Recent Recoveries Stream (Span 4) */}
        <div className="bento-card bento-span-4">
          <div className="bento-card-header">
            <div>
              <div className="bento-card-label">SETTLED INVENTORY</div>
              <div className="bento-card-title">Recent Autonomous Recoveries</div>
            </div>
            <button
              type="button"
              className="bento-action-link"
              onClick={() => onNavigate('audit')}
            >
              Full Cryptographic Ledger →
            </button>
          </div>

          <div className="recent-recoveries-table">
            <div className="recent-recoveries-head">
              <span>Payment ID</span>
              <span>Customer</span>
              <span>Rail / Corridor</span>
              <span>Root Cause Resolved</span>
              <span>Time</span>
              <span className="text-right">Salvaged Amount</span>
            </div>
            {recentRecoveries.map((r, idx) => (
              <div key={idx} className="recent-recoveries-row">
                <span className="font-mono text-accent">{r.id}</span>
                <span className="font-mono text-secondary">{r.customer}</span>
                <span className="text-secondary">{r.rail}</span>
                <span className="remediation-tag">{r.code}</span>
                <span className="text-muted text-sm">{r.time}</span>
                <span className="font-mono font-bold text-success text-right">{r.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
