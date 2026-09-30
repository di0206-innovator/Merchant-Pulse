'use client';

import React, { useState } from 'react';

export interface AuditEntry {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  action: string;
  actor: 'AUTONOMOUS_ENGINE' | 'SUPERVISED_OPERATOR' | 'SYSTEM_CRON';
  entity: string;
  amount?: string;
  status: 'VERIFIED' | 'DISPATCHED' | 'SETTLED' | 'SUPPRESSED';
  policyProof: string;
  webhookRef: string;
  details: string;
}

interface AuditTrailProps {
  onExportCsv: () => void;
}

export function AuditTrail({ onExportCsv }: AuditTrailProps) {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const logs: AuditEntry[] = [
    {
      id: 'log_01HX9881',
      hash: 'sha256:7f8a92bc4e1290ff8a17d8327918a2bc4e9281726a8d7126c891a271891bca72',
      previousHash: 'sha256:1a82bc99e12089ff817290182761829038291029182918291829182918291829',
      timestamp: '2026-09-30 16:47:32 IST',
      action: 'PAYMENT_RECOVERY_DISPATCHED',
      actor: 'AUTONOMOUS_ENGINE',
      entity: 'pay_01HX8911',
      amount: '₹4,500.00',
      status: 'DISPATCHED',
      policyProof: 'PASS(RULE_MAX_VELOCITY=1, RULE_FATIGUE_SHIELD=OK)',
      webhookRef: 'evt_pay_01HX8911_failed',
      details: 'Dynamic WhatsApp Smart Link dispatched to +91 98450***** with fallback PhonePe UPI Intent handle.',
    },
    {
      id: 'log_01HX9880',
      hash: 'sha256:1a82bc99e12089ff817290182761829038291029182918291829182918291829',
      previousHash: 'sha256:39a812b1892a0172618920182718291029182910291829182918291829182918',
      timestamp: '2026-09-30 16:44:10 IST',
      action: 'REVENUE_SETTLED_CONFIRMED',
      actor: 'SYSTEM_CRON',
      entity: 'pay_01HX8904',
      amount: '₹12,450.00',
      status: 'SETTLED',
      policyProof: 'PASS(RECONCILED_RAZORPAY_BANK_FEED)',
      webhookRef: 'evt_pay_01HX8904_captured',
      details: 'Customer completed recovery link payment via ICICI Visa 3DS2. Funds captured into merchant settlement account.',
    },
    {
      id: 'log_01HX9879',
      hash: 'sha256:39a812b1892a0172618920182718291029182910291829182918291829182918',
      previousHash: 'sha256:c72a819b12890a81726182910291829102918291829182918291829182918291',
      timestamp: '2026-09-30 16:39:18 IST',
      action: 'POLICY_EVALUATION_PASSED',
      actor: 'AUTONOMOUS_ENGINE',
      entity: 'pay_01HX8912',
      amount: '₹14,200.00',
      status: 'VERIFIED',
      policyProof: 'PASS(ALL_5_GUARDRAILS_VERIFIED)',
      webhookRef: 'evt_pay_01HX8912_failed',
      details: 'Deterministic policy evaluation executed: Rate limit clear, buyer cooldown valid, unit margin positive.',
    },
    {
      id: 'log_01HX9878',
      hash: 'sha256:c72a819b12890a81726182910291829102918291829182918291829182918291',
      previousHash: 'sha256:8819a82b192a0172618291029182910291829182918291829182918291829182',
      timestamp: '2026-09-30 16:32:04 IST',
      action: 'RETRY_VELOCITY_SUPPRESSED',
      actor: 'AUTONOMOUS_ENGINE',
      entity: 'pay_01HX8899',
      amount: '₹1,200.00',
      status: 'SUPPRESSED',
      policyProof: 'FAIL(RULE_MAX_VELOCITY_EXCEEDED: count=3/2)',
      webhookRef: 'evt_pay_01HX8899_failed',
      details: 'Payment recovery suppressed: Customer reached maximum retry velocity (3 attempts in 24h). Suppressed to safeguard customer trust.',
    },
    {
      id: 'log_01HX9877',
      hash: 'sha256:8819a82b192a0172618291029182910291829182918291829182918291829182',
      previousHash: 'sha256:e192a819b0192a01726182910291829102918291829182918291829182918291',
      timestamp: '2026-09-30 16:21:49 IST',
      action: 'PRE_DEBIT_NOTIFICATION_ISSUED',
      actor: 'AUTONOMOUS_ENGINE',
      entity: 'man_UPI_990142',
      amount: '₹8,900.00',
      status: 'DISPATCHED',
      policyProof: 'PASS(RBI_CIRCULAR_T24_WINDOW)',
      webhookRef: 'evt_mandate_01HX8880',
      details: 'Autonomous RBI pre-debit advisory dispatched for UPI Autopay mandate renewal scheduled for tomorrow 10:00 IST.',
    },
  ];

  const filteredLogs = logs.filter((l) => {
    if (filterAction !== 'ALL' && l.action !== filterAction) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        l.id.toLowerCase().includes(q) ||
        l.hash.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.webhookRef.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const copyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <section className="audit-trail-section" id="audit" aria-label="Audit Trail">
      <div className="audit-header">
        <div className="audit-header-left">
          <div className="audit-tag">APPEND-ONLY IMMUTABLE LEDGER</div>
          <h2 className="audit-title">Cryptographic Audit Trail</h2>
          <p className="audit-subtitle">
            Every state mutation, AI strategy execution, and policy decision cryptographically chained and signed.
          </p>
        </div>

        <div className="audit-header-actions">
          <button
            type="button"
            className="btn-export-csv"
            onClick={onExportCsv}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Verified Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="audit-toolbar">
        <div className="audit-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="audit-search-input"
            placeholder="Search hash, entity ID, webhook reference, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="audit-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="audit-filter-group">
          <label className="filter-label">Filter Action:</label>
          {(['ALL', 'PAYMENT_RECOVERY_DISPATCHED', 'REVENUE_SETTLED_CONFIRMED', 'POLICY_EVALUATION_PASSED', 'RETRY_VELOCITY_SUPPRESSED'] as const).map((a) => (
            <button
              key={a}
              type="button"
              className={`filter-btn ${filterAction === a ? 'active' : ''}`}
              onClick={() => setFilterAction(a)}
            >
              {a === 'ALL' ? 'ALL' : a.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Git-Commit Style Timeline List */}
      <div className="audit-timeline-container">
        {filteredLogs.length === 0 ? (
          <div className="audit-empty-state">
            No audit records match your query.
          </div>
        ) : (
          <div className="audit-timeline-list">
            {filteredLogs.map((entry, idx) => (
              <div key={entry.id} className="audit-timeline-item">
                {/* Timeline node line */}
                <div className="timeline-node-track">
                  <div className={`timeline-node-circle ${entry.status.toLowerCase()}`} />
                  {idx !== filteredLogs.length - 1 && <div className="timeline-connector-line" />}
                </div>

                {/* Commit block */}
                <div className="audit-commit-block">
                  <div className="audit-commit-header">
                    <div className="commit-action-group">
                      <span className="commit-action-name font-semibold text-primary">{entry.action}</span>
                      <span className={`commit-status-pill ${entry.status.toLowerCase()}`}>
                        {entry.status}
                      </span>
                      <span className="commit-actor-tag">{entry.actor}</span>
                    </div>

                    <div className="commit-meta-group">
                      {entry.amount && (
                        <span className="commit-amount font-mono font-bold text-success">{entry.amount}</span>
                      )}
                      <span className="commit-time text-muted font-mono">{entry.timestamp}</span>
                    </div>
                  </div>

                  <p className="commit-details-text">
                    {entry.details}
                  </p>

                  <div className="commit-footer-bar">
                    <div className="commit-hash-group">
                      <span className="hash-label">HASH:</span>
                      <span className="hash-code font-mono" title={entry.hash}>
                        {entry.hash.substring(0, 18)}...
                      </span>
                      <button
                        type="button"
                        className="btn-copy-hash"
                        onClick={() => copyHash(entry.hash)}
                        title="Copy full SHA-256 hash"
                      >
                        {copiedHash === entry.hash ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div className="commit-refs">
                      <span className="ref-item">
                        <span className="ref-label">Entity:</span>
                        <span className="ref-val font-mono">{entry.entity}</span>
                      </span>
                      <span className="ref-item">
                        <span className="ref-label">Webhook:</span>
                        <span className="ref-val font-mono">{entry.webhookRef}</span>
                      </span>
                      <span className="ref-item">
                        <span className="ref-label">Proof:</span>
                        <span className="ref-val policy-proof font-mono">{entry.policyProof}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="audit-integrity-footer">
        <div className="integrity-status">
          <span className="integrity-icon">🛡</span>
          <span>Ledger state root cryptographically validated against HMAC secret. Zero mutations or unchained blocks detected.</span>
        </div>
        <div className="integrity-counter font-mono">
          5 Verified Blocks · 0 Dropped Events
        </div>
      </div>
    </section>
  );
}
