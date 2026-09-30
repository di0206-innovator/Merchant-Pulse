'use client';

import React, { useState, useEffect } from 'react';

export interface OpportunityItem {
  id: string;
  orderId: string;
  customer: string;
  rail: string;
  railType: 'UPI' | 'Card' | 'Netbanking';
  amount: number;
  errorCode: string;
  errorDesc: string;
  confidence: number;
  priority: 'P0' | 'P1' | 'P2';
  suggestedAction: string;
  status: 'PENDING_RECOVERY' | 'DISPATCHED' | 'SETTLED' | 'SUPPRESSED';
  timestamp: string;
  rawPayload: Record<string, any>;
}

interface OpportunityRadarProps {
  onExecuteRecovery: (item: OpportunityItem) => void;
  onBulkExecute: (items: OpportunityItem[]) => void;
  onOpenRecoveryModal: () => void;
}

export function OpportunityRadar({
  onExecuteRecovery,
  onBulkExecute,
  onOpenRecoveryModal,
}: OpportunityRadarProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCursorIndex, setActiveCursorIndex] = useState<number>(0);
  const [filterRail, setFilterRail] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [items, setItems] = useState<OpportunityItem[]>([
    {
      id: 'pay_01HX8911',
      orderId: 'ord_NP98102',
      customer: 'siddharth.m***@gmail.com',
      rail: 'UPI Intent (Google Pay)',
      railType: 'UPI',
      amount: 4500,
      errorCode: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
      errorDesc: 'NPCI switch timeout after 45s; customer app hung during PIN verification',
      confidence: 96,
      priority: 'P0',
      suggestedAction: 'Instant WhatsApp Dynamic Smart Link with secondary VPA fallback',
      status: 'PENDING_RECOVERY',
      timestamp: '2026-09-30 16:42:19 IST',
      rawPayload: {
        gateway_response_code: 'U30',
        acquirer: 'HDFC',
        vpa_handle: 'siddharth@okaxis',
        retry_count: 0,
        policy_checks: ['MAX_RETRIES_OK', 'FATIGUE_SHIELD_OK', 'UNIT_MARGIN_OK'],
      },
    },
    {
      id: 'pay_01HX8912',
      orderId: 'ord_NP98103',
      customer: 'pooja.n***@zenith.in',
      rail: 'Visa 3DS2 (ICICI Bank)',
      railType: 'Card',
      amount: 14200,
      errorCode: 'BANK_SYSTEM_DECLINED',
      errorDesc: 'Issuer ACS challenge OTP window expired; cardholder active on checkout',
      confidence: 92,
      priority: 'P0',
      suggestedAction: 'Push frictionless headless checkout link with biometric auth',
      status: 'PENDING_RECOVERY',
      timestamp: '2026-09-30 16:38:05 IST',
      rawPayload: {
        gateway_response_code: '51_DECLINED',
        acquirer: 'ICICI',
        card_network: 'VISA_SIGNATURE',
        retry_count: 1,
        policy_checks: ['MAX_RETRIES_OK', 'FATIGUE_SHIELD_OK', 'IDEMPOTENT_OK'],
      },
    },
    {
      id: 'pay_01HX8913',
      orderId: 'ord_NP98104',
      customer: 'amit.verma***@corp.com',
      rail: 'UPI Autopay Mandate',
      railType: 'UPI',
      amount: 8900,
      errorCode: 'PRE_DEBIT_NOTIFICATION_PENDING',
      errorDesc: 'Mandate execution blocked pending RBI mandated 24-hour pre-debit notice',
      confidence: 94,
      priority: 'P1',
      suggestedAction: 'Schedule autonomous pre-debit webhook dispatch for next execution slot',
      status: 'PENDING_RECOVERY',
      timestamp: '2026-09-30 16:31:40 IST',
      rawPayload: {
        mandate_id: 'man_UPI_990142',
        notification_channel: 'SMS_AND_WHATSAPP',
        scheduled_slot: '2026-10-01 10:00 IST',
        policy_checks: ['RBI_CIRCULAR_COMPLIANT', 'CUSTOMER_FATIGUE_OK'],
      },
    },
    {
      id: 'pay_01HX8914',
      orderId: 'ord_NP98105',
      customer: 'tarun.b***@yahoo.com',
      rail: 'SBI Netbanking Corporate',
      railType: 'Netbanking',
      amount: 23500,
      errorCode: 'GATEWAY_DOWN_TRANSIENT',
      errorDesc: 'SBI Corporate Banking Gateway returned HTTP 503 during token handoff',
      confidence: 88,
      priority: 'P1',
      suggestedAction: 'Switch rail to NEFT/RTGS Virtual Account with auto-reconciliation',
      status: 'PENDING_RECOVERY',
      timestamp: '2026-09-30 16:24:11 IST',
      rawPayload: {
        bank_code: 'SBIN',
        http_status: 503,
        suggested_rail: 'VIRTUAL_ACCOUNT_IMPS',
        policy_checks: ['HIGH_TICKET_MARGIN_CLEAR', 'MAX_RETRIES_OK'],
      },
    },
    {
      id: 'pay_01HX8915',
      orderId: 'ord_NP98106',
      customer: 'neha.j***@gmail.com',
      rail: 'Mastercard Debit (Axis Bank)',
      railType: 'Card',
      amount: 1950,
      errorCode: 'CUSTOMER_ABANDONED_AUTH',
      errorDesc: 'Customer closed browser tab during Axis bank 3D secure challenge',
      confidence: 76,
      priority: 'P2',
      suggestedAction: 'Trigger cart abandonment SMS with 1-click UPI deep link',
      status: 'PENDING_RECOVERY',
      timestamp: '2026-09-30 16:15:33 IST',
      rawPayload: {
        dropoff_screen: '3DS_CHALLENGE',
        dwell_time_seconds: 18,
        policy_checks: ['COOLDOWN_WINDOW_OK'],
      },
    },
  ]);

  // Filtering
  const filteredItems = items.filter((item) => {
    if (filterRail !== 'ALL' && item.railType !== filterRail) return false;
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.errorCode.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Keyboard navigation: J (down), K (up), X (toggle select), E (execute)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCursorIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCursorIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'x') {
        e.preventDefault();
        const current = filteredItems[activeCursorIndex];
        if (current) {
          toggleSelect(current.id);
        }
      } else if (e.key === 'e') {
        e.preventDefault();
        const current = filteredItems[activeCursorIndex];
        if (current) {
          handleExecuteSingle(current);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCursorIndex, filteredItems, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleExecuteSingle = (item: OpportunityItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'DISPATCHED' } : i))
    );
    onExecuteRecovery(item);
  };

  const handleExecuteBulk = () => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    setItems((prev) =>
      prev.map((i) => (selectedIds.includes(i.id) ? { ...i, status: 'DISPATCHED' } : i))
    );
    setSelectedIds([]);
    onBulkExecute(selectedItems);
  };

  return (
    <section className="opportunity-radar-section" id="opportunities" aria-label="Opportunity Radar Terminal">
      <div className="radar-header">
        <div className="radar-header-left">
          <div className="radar-terminal-tag">TERMINAL MODE · HIGH PRECISION</div>
          <h2 className="radar-title">Opportunity Radar</h2>
          <p className="radar-subtitle">
            Hedge-fund caliber filtration & algorithmic prioritization of recoverable payment drops.
          </p>
        </div>

        {/* Keyboard shortcut badges */}
        <div className="radar-shortcuts-panel">
          <span className="shortcut-chip"><kbd>J</kbd> / <kbd>K</kbd> Navigate</span>
          <span className="shortcut-chip"><kbd>X</kbd> Select</span>
          <span className="shortcut-chip"><kbd>E</kbd> Execute</span>
          <span className="shortcut-chip"><kbd>⌘K</kbd> Command Palette</span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="radar-toolbar">
        <div className="radar-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="radar-search-input"
            placeholder="Search payment ID, customer, order, or error code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="radar-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="radar-filter-group">
          <label className="filter-label">Rail:</label>
          {(['ALL', 'UPI', 'Card', 'Netbanking'] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`filter-btn ${filterRail === r ? 'active' : ''}`}
              onClick={() => setFilterRail(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="radar-filter-group">
          <label className="filter-label">Priority:</label>
          {(['ALL', 'P0', 'P1', 'P2'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`filter-btn ${filterPriority === p ? 'active' : ''}`}
              onClick={() => setFilterPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Sticky Bar (Appears when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="radar-bulk-bar">
          <div className="bulk-bar-info">
            <span className="bulk-bar-count">{selectedIds.length}</span>
            <span>transactions selected ({items.filter(i => selectedIds.includes(i.id)).reduce((acc, c) => acc + c.amount, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} total)</span>
          </div>
          <div className="bulk-bar-actions">
            <button
              type="button"
              className="bulk-execute-btn"
              onClick={handleExecuteBulk}
            >
              ⚡ Batch Execute Recovery ({selectedIds.length})
            </button>
            <button
              type="button"
              className="bulk-secondary-btn"
              onClick={() => {
                alert(`Suppressed ${selectedIds.length} items from automated re-attempt.`);
                setSelectedIds([]);
              }}
            >
              Suppress
            </button>
            <button
              type="button"
              className="bulk-clear-btn"
              onClick={() => setSelectedIds([])}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* High-Precision Table */}
      <div className="radar-table-container">
        <table className="radar-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
              <th>Priority</th>
              <th>Payment ID / Order</th>
              <th>Customer</th>
              <th>Rail / Network</th>
              <th>Root Cause Classification</th>
              <th className="text-right">Amount</th>
              <th>Confidence</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-empty-cell">
                  No payment opportunities match your active filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const isCursor = index === activeCursorIndex;
                const isExpanded = expandedId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`radar-row ${isSelected ? 'selected' : ''} ${isCursor ? 'cursor-active' : ''}`}
                      onClick={() => setActiveCursorIndex(index)}
                    >
                      <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          aria-label={`Select ${item.id}`}
                        />
                      </td>

                      <td>
                        <span className={`priority-pill ${item.priority}`}>
                          {item.priority}
                        </span>
                      </td>

                      <td>
                        <div className="id-stack">
                          <span className="font-mono font-bold text-accent">{item.id}</span>
                          <span className="font-mono text-muted text-xs">{item.orderId}</span>
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-secondary text-sm">{item.customer}</span>
                      </td>

                      <td>
                        <span className="rail-badge">{item.rail}</span>
                      </td>

                      <td>
                        <div className="error-stack">
                          <span className="error-code-badge">{item.errorCode}</span>
                          <span className="error-desc-text">{item.errorDesc}</span>
                        </div>
                      </td>

                      <td className="text-right">
                        <span className="font-mono font-bold text-primary">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td>
                        <div className="confidence-cell">
                          <span className="font-mono text-xs">{item.confidence}%</span>
                          <div className="confidence-track">
                            <div
                              className="confidence-fill"
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`status-tag ${item.status.toLowerCase()}`}>
                          {item.status === 'DISPATCHED' ? 'REMEDY SENT' : item.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="row-action-group">
                          <button
                            type="button"
                            className="btn-inspect-row"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : item.id);
                            }}
                            title="Inspect Causal Telemetry"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                          <button
                            type="button"
                            className="btn-execute-row"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteSingle(item);
                            }}
                            disabled={item.status === 'DISPATCHED'}
                          >
                            {item.status === 'DISPATCHED' ? 'Sent' : 'Execute'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Deep Diagnostic Telemetry Drawer */}
                    {isExpanded && (
                      <tr className="radar-expanded-row">
                        <td colSpan={10}>
                          <div className="expanded-diagnostic-box">
                            <div className="diagnostic-header">
                              <span className="diagnostic-title">
                                Causal Diagnostics & Policy Audit for {item.id} ({item.orderId})
                              </span>
                              <span className="diagnostic-timestamp">{item.timestamp}</span>
                            </div>

                            <div className="diagnostic-grid">
                              <div className="diagnostic-card">
                                <div className="diagnostic-card-title">AI Suggested Remediation</div>
                                <div className="diagnostic-card-body font-semibold text-primary">
                                  {item.suggestedAction}
                                </div>
                                <div className="diagnostic-card-footer text-xs text-secondary mt-2">
                                  Expected conversion lift: +{Math.round(item.confidence * 0.78)}% with automated SMS & WhatsApp notification.
                                </div>
                              </div>

                              <div className="diagnostic-card">
                                <div className="diagnostic-card-title">Policy Guardrail Checks Passed</div>
                                <div className="diagnostic-guardrail-list">
                                  {item.rawPayload.policy_checks?.map((chk: string, cIdx: number) => (
                                    <div key={cIdx} className="guardrail-check-pill">
                                      <span className="check-icon">✓</span>
                                      <span className="font-mono text-xs">{chk}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="diagnostic-card">
                                <div className="diagnostic-card-title">Raw Razorpay Error Metadata</div>
                                <pre className="raw-json-block">
                                  {JSON.stringify(item.rawPayload, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="radar-footer">
        <div className="radar-count-info">
          Showing {filteredItems.length} of {items.length} opportunities · Real-time WebSocket sync active
        </div>
        <div className="radar-footer-action">
          <button
            type="button"
            className="btn-launch-dialog"
            onClick={onOpenRecoveryModal}
          >
            Open Full Recovery Action Dialog →
          </button>
        </div>
      </div>
    </section>
  );
}
