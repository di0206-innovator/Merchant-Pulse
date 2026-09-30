'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type { AnalysisResult, Opportunity } from '@/core/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeritageIllustration } from '@/components/HeritageIllustration';
import { MerchantSwitcher, MERCHANT_PRESETS, type MerchantPreset } from '@/components/MerchantSwitcher';
import { RecoveryModal } from '@/components/RecoveryModal';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { trackEvent } from '@/lib/analytics';

function formatCurrency(paise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<MerchantPreset>(MERCHANT_PRESETS[0]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [radarFilter, setRadarFilter] = useState<'all' | 'recovery' | 'conversion' | 'retention'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const analyze = async (presetToUse = selectedPreset) => {
    setLoading(true);
    setNotification(null);
    trackEvent('run_revenue_analysis', { merchant: presetToUse.name });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payments: presetToUse.payments,
          merchant: presetToUse.profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis pipeline returned error status');
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
      if (data.opportunities.length > 0) {
        setSelectedOpportunity(data.opportunities[0]);
      }
    } catch {
      setNotification('Failed to analyze merchant payments. Please verify network status.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial analysis automatically on mount
  useEffect(() => {
    analyze(selectedPreset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (preset: MerchantPreset) => {
    setSelectedPreset(preset);
    analyze(preset);
  };

  const revenueAtRisk = useMemo(() => {
    return result?.opportunities.reduce((sum, item) => sum + item.revenue_at_risk_paise, 0) ?? 0;
  }, [result]);

  const filteredOpportunities = useMemo(() => {
    if (!result) return [];
    if (radarFilter === 'all') return result.opportunities;
    return result.opportunities.filter((opp) => opp.type === radarFilter);
  }, [result, radarFilter]);

  const filteredAuditEvents = useMemo(() => {
    if (!result) return [];
    if (!auditSearch.trim()) return result.audit;
    const q = auditSearch.toLowerCase();
    return result.audit.filter(
      (ev) =>
        ev.actor.toLowerCase().includes(q) ||
        ev.action.toLowerCase().includes(q) ||
        JSON.stringify(ev.metadata).toLowerCase().includes(q)
    );
  }, [result, auditSearch]);

  const handleOpenRecovery = (opp?: Opportunity) => {
    if (opp) {
      setSelectedOpportunity(opp);
    } else if (result?.opportunities && result.opportunities.length > 0) {
      setSelectedOpportunity(result.opportunities[0]);
    }
    setIsRecoveryModalOpen(true);
    trackEvent('open_recovery_modal');
  };

  const handleActionExecuted = (summary: string) => {
    setNotification(summary);
    trackEvent('recovery_action_executed', { summary });
    // Append a live execution event to local audit trail
    if (result) {
      setResult({
        ...result,
        audit: [
          {
            id: `audit_live_${Date.now()}`,
            actor: 'executor',
            action: 'execute_recovery_flow',
            metadata: { summary, status: 'dispatched_to_razorpay' },
            timestamp: Date.now(),
          },
          ...result.audit,
        ],
      });
    }
  };

  const exportAuditJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.audit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merchantpulse_audit_${selectedPreset.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('export_audit_log');
  };

  return (
    <div className="page-wrapper">
      <Navbar onRunAudit={() => analyze(selectedPreset)} loading={loading} />

      <main className="shell app-main">
        {notification && (
          <div className="form-alert-error" role="status" style={{ marginTop: 20, borderColor: 'var(--gold-400)', background: 'rgba(245,158,11,0.1)', color: '#FDE68A' }}>
            <span>⚡ {notification}</span>
          </div>
        )}

        {/* HERO EDITORIAL SECTION */}
        <section className="hero-editorial">
          <div className="hero-grid">
            {/* Visual Heritage Poster Side */}
            <div className="hero-visual-card">
              <div className="poster-header-bar">
                <div>
                  <div className="poster-tagline">Fintech Heritage & Intelligence</div>
                  <h2 className="poster-hindi-title">मर्चेंट पल्स</h2>
                </div>
                <span className="poster-badge">🇮🇳 RAZORPAY ECOSYSTEM</span>
              </div>

              <div className="poster-art-wrap">
                <HeritageIllustration width="100%" height="auto" />
              </div>

              <div className="poster-bottom-caption">
                <p>
                  <strong>Autonomous Payment Intelligence</strong> · Built for Indian commerce hubs
                  from Ballard Estate to Indiranagar. Turning raw payment drop-offs into deterministic,
                  policy-verified recovery flows.
                </p>
              </div>
            </div>

            {/* Right Value & KPI Column */}
            <div className="hero-content-col">
              <div className="card hero-main-card">
                <div className="eyebrow-chip">Track 01 · Revenue Intelligence Engine</div>
                <h1 className="hero-title">
                  Find the revenue <span className="text-gradient-gold">worth acting on</span> next.
                </h1>
                <p className="hero-desc">
                  MerchantPulse parses raw payment events deterministically, ranks interventions
                  through transparent AI strategy, and enforces strict merchant policy gates before any
                  action is executed.
                </p>

                <div className="hero-cta-group">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => analyze(selectedPreset)}
                    disabled={loading}
                    aria-label="Run revenue analysis"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-sm" /> Running Pipeline...
                      </>
                    ) : (
                      <>⚡ Run Revenue Intelligence Audit</>
                    )}
                  </button>

                  {result?.opportunities && result.opportunities.length > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleOpenRecovery()}
                    >
                      Review Recovery Action →
                    </button>
                  )}
                </div>
              </div>

              {/* Metric KPIs */}
              <div className="metrics-row">
                <div className="metric-box">
                  <span className="metric-label">Monthly GMV</span>
                  <strong className="metric-val">
                    {result ? formatCurrency(result.merchant.monthly_gmv_paise) : '₹1.24Cr'}
                  </strong>
                  <span className="metric-sub">{selectedPreset.name}</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Analyzed Txns</span>
                  <strong className="metric-val text-sky">
                    {result ? result.payments_processed : '8'}
                  </strong>
                  <span className="metric-sub">Event state machine</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Revenue at Risk</span>
                  <strong className="metric-val text-amber">
                    {result ? formatCurrency(revenueAtRisk) : '₹15,597'}
                  </strong>
                  <span className="metric-sub">Identified leakage</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Policy Gate</span>
                  <strong className={`metric-val ${result?.policy.action === 'execute' ? 'text-emerald' : 'text-amber'}`}>
                    {result ? result.policy.action.toUpperCase() : 'VERIFIED'}
                  </strong>
                  <span className="metric-sub">Pre-action check</span>
                </div>
              </div>

              {/* Merchant Preset Switcher */}
              <MerchantSwitcher
                selectedPreset={selectedPreset}
                onSelectPreset={handleSelectPreset}
                disabled={loading}
              />
            </div>
          </div>
        </section>

        {/* OPERATIONS GRID: Radar & Strategy/Policy */}
        <section className="ops-grid" id="radar">
          {/* Left Column: Opportunity Radar */}
          <div className="card">
            <div className="section-head">
              <h3 className="section-title">Opportunity Radar</h3>
              <p className="section-desc">
                Deterministic failure clustering converts raw payment drops into verified commercial opportunities.
              </p>
            </div>

            <div className="radar-tabs">
              {(['all', 'recovery', 'conversion', 'retention'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`radar-tab-btn ${radarFilter === tab ? 'active' : ''}`}
                  onClick={() => setRadarFilter(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="opps-list">
              {filteredOpportunities.map((opp) => (
                <div key={opp.title} className="opp-item">
                  <div className="opp-item-top">
                    <div>
                      <div className="opp-item-title">{opp.title}</div>
                      <div className="opp-item-desc">{opp.description}</div>
                    </div>
                    <span
                      className={`badge ${
                        opp.type === 'recovery'
                          ? 'badge-green'
                          : opp.type === 'retention'
                          ? 'badge-yellow'
                          : 'badge-blue'
                      }`}
                    >
                      {opp.type}
                    </span>
                  </div>

                  <div className="opp-kpis">
                    <div className="opp-kpi">
                      <span>Revenue at Risk</span>
                      <strong className="text-amber">{formatCurrency(opp.revenue_at_risk_paise)}</strong>
                    </div>
                    <div className="opp-kpi">
                      <span>Affected Transactions</span>
                      <strong>{opp.affected_transactions}</strong>
                    </div>
                    <div className="opp-kpi">
                      <span>Evidence Confidence</span>
                      <strong className="text-emerald">{Math.round(opp.evidence_score * 100)}%</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="opp-action-trigger"
                    onClick={() => handleOpenRecovery(opp)}
                  >
                    ⚡ Review & Trigger Valid Follow-up →
                  </button>
                </div>
              ))}

              {filteredOpportunities.length === 0 && (
                <div className="opp-item">
                  <div className="opp-item-title">No opportunities found in this filter category</div>
                  <div className="opp-item-desc">
                    Switch filters or select another merchant preset to simulate different failure patterns.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Strategy & Policy Decision Gate */}
          <div className="card" id="strategy">
            <div className="section-head">
              <h3 className="section-title">AI Strategy & Policy Decision Gate</h3>
              <p className="section-desc">
                AI ranks potential interventions; deterministic policy gates verify budget & risk before execution.
              </p>
            </div>

            <div className="strategy-body">
              {result ? (
                <>
                  <div className="strategy-box">
                    <div className="eyebrow-chip">Recommended Intervention</div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 12px' }}>
                      {result.recommendation.recommendation.type.replaceAll('_', ' ').toUpperCase()}
                    </h4>

                    <div className="modal-detail-box">
                      <div className="modal-detail-row">
                        <span className="label">Expected Recovery Rate:</span>
                        <span className="value text-emerald">
                          {Math.round(result.recommendation.recommendation.expected_recovery_rate * 100)}%
                        </span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="label">Net Expected Value:</span>
                        <span className="value text-amber font-mono">
                          {formatCurrency(result.recommendation.recommendation.expected_value_paise)}
                        </span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="label">Strategy Model Score:</span>
                        <span className="value font-mono">
                          {(result.recommendation.strategy_score * 100).toFixed(0)}/100
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong>Strategic Rationale:</strong> {result.recommendation.recommendation.rationale}
                    </div>

                    {result.recommendation.assumptions.length > 0 && (
                      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                        <strong>Assumptions:</strong> {result.recommendation.assumptions.join(' · ')}
                      </div>
                    )}
                  </div>

                  {/* Deterministic Policy Gate Box */}
                  <div className={`policy-gate-card ${result.policy.action}`} id="policy">
                    <div className="policy-gate-top">
                      <span className="policy-title">
                        POLICY DECISION: {result.policy.action.toUpperCase()}
                      </span>
                      <span className={`badge ${result.policy.allowed ? 'badge-green' : 'badge-yellow'}`}>
                        {result.policy.allowed ? 'PASSED GATE' : 'BLOCKED'}
                      </span>
                    </div>
                    <p className="policy-reasons">{result.policy.reasons.join(' ')}</p>
                  </div>
                </>
              ) : (
                <div className="strategy-box">
                  <div className="opp-item-title">Strategy Engine Idle</div>
                  <div className="opp-item-desc">
                    Click &ldquo;Run Revenue Intelligence Audit&rdquo; to evaluate merchant transactions.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DECISION AUDIT TRAIL */}
        <section className="card audit-section" id="audit">
          <div className="section-head">
            <h3 className="section-title">Append-Only Decision Audit Trail</h3>
            <p className="section-desc">
              Every ingestion, opportunity detection, AI ranking, and policy verification is immutably logged.
            </p>
          </div>

          <div className="audit-toolbar">
            <input
              type="search"
              placeholder="Search actors, actions, metadata..."
              className="audit-search-input"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              aria-label="Filter audit events"
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {filteredAuditEvents.length} events logged
              </span>
              <button type="button" className="btn-secondary" style={{ padding: '6px 14px', minHeight: 36, fontSize: 12 }} onClick={exportAuditJson}>
                📥 Export JSON
              </button>
            </div>
          </div>

          <div className="audit-list">
            {filteredAuditEvents.map((ev) => (
              <div key={ev.id} className="audit-row">
                <div className="audit-time">
                  {new Date(ev.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
                <div className="audit-actor text-amber">{ev.actor}</div>
                <div>
                  <span className="audit-action-tag">{ev.action}</span>
                </div>
                <div className="audit-meta-json" title={JSON.stringify(ev.metadata)}>
                  {JSON.stringify(ev.metadata)}
                </div>
              </div>
            ))}

            {filteredAuditEvents.length === 0 && (
              <div className="opp-item">
                <div className="opp-item-desc">No matching audit events found.</div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* RECOVERY ACTION MODAL */}
      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        opportunity={selectedOpportunity}
        recommendation={result?.recommendation ?? null}
        policy={result?.policy ?? null}
        onActionExecuted={handleActionExecuted}
      />

      {/* STICKY MOBILE CTA BAR */}
      <StickyMobileBar
        onRunAudit={() => analyze(selectedPreset)}
        loading={loading}
        revenueAtRisk={revenueAtRisk}
        onOpenRecovery={() => handleOpenRecovery()}
        hasRecoveryAction={Boolean(result?.opportunities && result.opportunities.length > 0)}
      />

      <Footer />
    </div>
  );
}
