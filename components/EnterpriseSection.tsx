'use client';

import React from 'react';

export function EnterpriseSection() {
  const slaMetrics = [
    { label: 'Platform Availability SLA', value: '99.99%', target: 'Target: 99.95%' },
    { label: 'Mean Webhook Ingestion Latency', value: '38.4 ms', target: 'P99: 82 ms' },
    { label: 'Zero Event Drop Guarantee', value: '100.0%', target: 'Dual Append Ledger' },
    { label: 'Autonomous Remediation Dispatch', value: '< 250 ms', target: 'Edge Invalidation' },
  ];

  const entities = [
    { name: 'Northstar Commerce India Pvt Ltd', gst: '27AABCN8291M1Z4', currency: 'INR (₹)', volume: '₹18.42 Cr / mo', status: 'ACTIVE' },
    { name: 'Kolkata Artisans Export LLP', gst: '19AAECK4491K1Z2', currency: 'USD / EUR / INR', volume: '₹4.20 Cr / mo', status: 'ACTIVE' },
    { name: 'Bengaluru CloudStack Systems Inc', gst: '29AABCB1102P1Z8', currency: 'INR / USD', volume: '₹9.80 Cr / mo', status: 'ACTIVE' },
  ];

  return (
    <section className="enterprise-section" id="enterprise" aria-label="Enterprise Infrastructure & Governance">
      <div className="enterprise-header">
        <div className="enterprise-header-left">
          <div className="enterprise-tag">ENTERPRISE GRADE INFRASTRUCTURE</div>
          <h2 className="enterprise-title">Multi-Entity Enterprise Control Plane</h2>
          <p className="enterprise-subtitle">
            Engineered for high-volume Indian merchant conglomerates, payment aggregators, and venture-backed platforms processing &gt; ₹100 Cr annual GMV.
          </p>
        </div>

        <div className="enterprise-tier-badge">
          <span className="tier-star">★</span>
          <span>TIER-1 ENTERPRISE SPARK CLUSTER</span>
        </div>
      </div>

      {/* SLA Benchmarks */}
      <div className="enterprise-sla-grid">
        {slaMetrics.map((sla, idx) => (
          <div key={idx} className="sla-card">
            <span className="sla-label">{sla.label}</span>
            <span className="sla-value font-mono">{sla.value}</span>
            <span className="sla-target">{sla.target}</span>
          </div>
        ))}
      </div>

      {/* Multi-Entity Table */}
      <div className="enterprise-entities-card">
        <div className="entities-card-header">
          <div>
            <div className="entities-card-title">Registered Corporate Entities & Payment Spines</div>
            <div className="entities-card-subtitle">Unified treasury and recovery observability across subsidiary legal entities.</div>
          </div>
          <span className="entities-count font-mono">3 Entities Connected</span>
        </div>

        <div className="entities-table">
          <div className="entities-table-head">
            <span>Corporate Entity Name</span>
            <span>GSTIN Identifier</span>
            <span>Settlement Currencies</span>
            <span>Processed Volume</span>
            <span className="text-right">Spine Status</span>
          </div>
          {entities.map((ent, idx) => (
            <div key={idx} className="entities-table-row">
              <span className="font-semibold text-primary">{ent.name}</span>
              <span className="font-mono text-secondary">{ent.gst}</span>
              <span className="currency-pill">{ent.currency}</span>
              <span className="font-mono font-bold text-primary">{ent.volume}</span>
              <span className="status-pill optimal text-right">
                <span className="status-pill-dot" />
                {ent.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Compliance Grid */}
      <div className="enterprise-certifications-grid">
        <div className="cert-card">
          <div className="cert-icon">🛡</div>
          <div className="cert-title">SOC2 Type II Certified</div>
          <p className="cert-desc">Independently audited operational security, availability, and confidentiality controls with annual penetration testing.</p>
        </div>
        <div className="cert-card">
          <div className="cert-icon">🔒</div>
          <div className="cert-title">PCI-DSS Level 1 Compliant</div>
          <p className="cert-desc">Zero sensitive cardholder data footprint. Full interoperability with network tokenization standards.</p>
        </div>
        <div className="cert-card">
          <div className="cert-icon">🇮🇳</div>
          <div className="cert-title">DPDP Act 2023 Enforced</div>
          <p className="cert-desc">Strict Indian data sovereignty with local VPC hosting, zero cross-border telemetry leakage, and automated data purging.</p>
        </div>
        <div className="cert-card">
          <div className="cert-icon">⚡</div>
          <div className="cert-title">99.99% Availability SLA</div>
          <p className="cert-desc">Financially backed uptime SLA with automated multi-region active-active failover and continuous heartbeat telemetry.</p>
        </div>
      </div>
    </section>
  );
}
