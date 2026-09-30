'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type { AnalysisResult, Opportunity } from '@/core/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MerchantSwitcher, MERCHANT_PRESETS, type MerchantPreset } from '@/components/MerchantSwitcher';
import { DataVisualizations } from '@/components/DataVisualizations';
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
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  const analyze = async (presetToUse = selectedPreset) => {
    setLoading(true);
    setBannerFeedback(null);
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
      setBannerFeedback('Failed to evaluate payment events. Ensure local services are running.');
    } finally {
      setLoading(false);
    }
  };

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
    setBannerFeedback(summary);
    trackEvent('recovery_action_executed', { summary });
    if (result) {
      setResult({
        ...result,
        audit: [
          {
            id: `audit_live_${Date.now()}`,
            actor: 'executor',
            action: 'execute_recovery_flow',
            metadata: { summary, channel: 'razorpay_checkout' },
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
    <div className="institutional-app">
      <Navbar onRunAudit={() => analyze(selectedPreset)} loading={loading} />

      <main className="shell platform-shell">
        {bannerFeedback && (
          <div className="system-feedback-banner" role="status">
            <span className="feedback-glyph">⚡</span>
            <span>{bannerFeedback}</span>
            <button
              type="button"
              className="feedback-dismiss"
              onClick={() => setBannerFeedback(null)}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* INSTITUTIONAL OPERATIONAL HERO */}
        <section className="executive-hero">
          <div className="hero-top-strip">
            <div className="hero-thesis-tag font-mono">
              <span>FINANCIAL OPERATIONS // REVENUE SPINE</span>
              <span className="strip-divider">·</span>
              <span className="text-muted">DETERMINISTIC FACTS → AI STRATEGY → POLICY GATE → EXECUTION</span>
            </div>

            <div className="hero-heritage-seal font-mono">
              <span className="seal-emblem">🏛️</span>
              <span className="seal-city">BALLARD ESTATE, MUMBAI</span>
              <span className="seal-lang">मर्चेंट पल्स</span>
            </div>
          </div>

          <div className="hero-main-row">
            <div className="hero-headline-wrap">
              <h1 className="executive-title">
                Automated Revenue Intelligence for Razorpay Merchants.
              </h1>
              <p className="executive-lead">
                Deterministic payment parsing identifies recoverable failure patterns, an AI strategy
                layer calculates net expected value, and explicit merchant policy boundaries verify every
                action before live execution.
              </p>
            </div>

            <div className="hero-action-panel">
              <button
                type="button"
                className="btn-institutional-primary btn-large"
                onClick={() => analyze(selectedPreset)}
                disabled={loading}
                aria-label="Execute full intelligence pipeline"
              >
                {loading ? (
                  <>
                    <span className="spinner-xs" /> Evaluating Events...
                  </>
                ) : (
                  <>⚡ Evaluate Revenue Opportunities</>
                )}
              </button>

              {result?.opportunities && result.opportunities.length > 0 && (
                <button
                  type="button"
                  className="btn-institutional-secondary"
                  onClick={() => handleOpenRecovery()}
                >
                  Review Staged Interventions →
                </button>
              )}
            </div>
          </div>

          {/* Scenario Selector Segmented Bar */}
          <div className="scenario-bar-container">
            <MerchantSwitcher
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              disabled={loading}
            />
          </div>

          {/* Precision Financial Metric Tiles */}
          <div className="kpi-metric-strip">
            <div className="kpi-tile">
              <div className="kpi-tile-header font-mono">
                <span>MONTHLY GMV</span>
                <span className="kpi-mini-badge">ANNUALIZED</span>
              </div>
              <strong className="kpi-tile-value font-mono">
                {result ? formatCurrency(result.merchant.monthly_gmv_paise) : '₹1.24Cr'}
              </strong>
              <span className="kpi-tile-sub">
                Profile: <span className="font-semibold">{selectedPreset.name}</span>
              </span>
            </div>

            <div className="kpi-tile">
              <div className="kpi-tile-header font-mono">
                <span>BATCH VOLUME</span>
                <span className="kpi-mini-badge">EVENTS</span>
              </div>
              <strong className="kpi-tile-value font-mono">
                {result ? `${result.payments_processed} Txns` : '8 Txns'}
              </strong>
              <span className="kpi-tile-sub">State machine normalized</span>
            </div>

            <div className="kpi-tile">
              <div className="kpi-tile-header font-mono">
                <span>IDENTIFIED LEAKAGE</span>
                <span className="kpi-mini-badge text-amber">AT RISK</span>
              </div>
              <strong className="kpi-tile-value font-mono text-amber">
                {result ? formatCurrency(revenueAtRisk) : '₹15,597'}
              </strong>
              <span className="kpi-tile-sub">Recoverable gateway drop-offs</span>
            </div>

            <div className="kpi-tile">
              <div className="kpi-tile-header font-mono">
                <span>POLICY VERDICT</span>
                <span className={`kpi-mini-badge ${result?.policy.action === 'execute' ? 'text-emerald' : 'text-amber'}`}>
                  {result ? result.policy.action.toUpperCase() : 'VERIFIED'}
                </span>
              </div>
              <strong className={`kpi-tile-value font-mono ${result?.policy.action === 'execute' ? 'text-emerald' : 'text-amber'}`}>
                {result ? result.policy.action.toUpperCase() : 'EXECUTE'}
              </strong>
              <span className="kpi-tile-sub">Automated budget &amp; risk check</span>
            </div>

            <div className="kpi-tile">
              <div className="kpi-tile-header font-mono">
                <span>NET EXPECTED VALUE</span>
                <span className="kpi-mini-badge text-emerald">ROI MODEL</span>
              </div>
              <strong className="kpi-tile-value font-mono text-emerald">
                {result ? formatCurrency(result.recommendation.recommendation.expected_value_paise) : '₹14,445'}
              </strong>
              <span className="kpi-tile-sub">
                Est. recovery:{' '}
                <span className="font-semibold">
                  {result ? `${Math.round(result.recommendation.recommendation.expected_recovery_rate * 100)}%` : '69%'}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* DATA VISUALIZATIONS SECTION */}
        <section id="telemetry">
          <DataVisualizations result={result} payments={selectedPreset.payments} />
        </section>

        {/* OPERATIONS GRID: Opportunity Radar + Strategy Gate */}
        <section className="operations-split-grid" id="radar">
          {/* Opportunity Radar Column */}
          <div className="institutional-panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <span className="panel-tag font-mono">DETECTION ENGINE</span>
                <h2 className="panel-title">Opportunity Radar</h2>
              </div>
              <span className="panel-count font-mono">{filteredOpportunities.length} Qualified</span>
            </div>

            <div className="radar-filter-bar font-mono">
              {(['all', 'recovery', 'conversion', 'retention'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`filter-pill ${radarFilter === tab ? 'active' : ''}`}
                  onClick={() => setRadarFilter(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="opportunities-stack">
              {filteredOpportunities.map((opp) => (
                <div key={opp.title} className="opportunity-entry">
                  <div className="opp-meta-row">
                    <span
                      className={`type-indicator-badge font-mono ${
                        opp.type === 'recovery'
                          ? 'badge-emerald'
                          : opp.type === 'retention'
                          ? 'badge-amber'
                          : 'badge-sky'
                      }`}
                    >
                      {opp.type.toUpperCase()}
                    </span>
                    <span className="opp-evidence font-mono">
                      Confidence: {Math.round(opp.evidence_score * 100)}%
                    </span>
                  </div>

                  <h3 className="opp-heading">{opp.title}</h3>
                  <p className="opp-body">{opp.description}</p>

                  <div className="opp-metrics-table">
                    <div className="opp-metric-col">
                      <span className="opp-label font-mono">REVENUE AT RISK</span>
                      <strong className="opp-val font-mono text-amber">
                        {formatCurrency(opp.revenue_at_risk_paise)}
                      </strong>
                    </div>
                    <div className="opp-metric-col">
                      <span className="opp-label font-mono">AFFECTED TXNS</span>
                      <strong className="opp-val font-mono">{opp.affected_transactions}</strong>
                    </div>
                    <div className="opp-metric-col">
                      <span className="opp-label font-mono">ACTION FLOW</span>
                      <span className="opp-action-name font-mono">
                        {opp.recommended_action.replaceAll('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-trigger-action"
                    onClick={() => handleOpenRecovery(opp)}
                  >
                    <span>Execute Valid Follow-up</span>
                    <span className="arrow-glyph">→</span>
                  </button>
                </div>
              ))}

              {filteredOpportunities.length === 0 && (
                <div className="empty-state-entry">
                  <p className="empty-text">No opportunities found for the selected category.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Strategy & Deterministic Policy Decision Column */}
          <div className="institutional-panel" id="strategy">
            <div className="panel-header">
              <div className="panel-header-left">
                <span className="panel-tag font-mono">STRATEGY &amp; POLICY</span>
                <h2 className="panel-title">Decision Gate</h2>
              </div>
              <span className={`panel-status-chip font-mono ${result?.policy.allowed ? 'status-cleared' : 'status-blocked'}`}>
                {result?.policy.allowed ? 'POLICY CLEARED' : 'GATE ACTIVE'}
              </span>
            </div>

            <div className="decision-content">
              {result ? (
                <>
                  <div className="strategy-recommendation-block">
                    <span className="strategy-block-tag font-mono">PROPOSED INTERVENTION</span>
                    <h3 className="strategy-action-title font-mono">
                      {result.recommendation.recommendation.type.replaceAll('_', ' ').toUpperCase()}
                    </h3>

                    <div className="strategy-economics-grid">
                      <div className="econ-stat">
                        <span className="econ-label font-mono">ESTIMATED RECOVERY RATE</span>
                        <strong className="econ-val font-mono text-emerald">
                          {Math.round(result.recommendation.recommendation.expected_recovery_rate * 100)}%
                        </strong>
                      </div>
                      <div className="econ-stat">
                        <span className="econ-label font-mono">NET EXPECTED VALUE (EV)</span>
                        <strong className="econ-val font-mono text-amber">
                          {formatCurrency(result.recommendation.recommendation.expected_value_paise)}
                        </strong>
                      </div>
                      <div className="econ-stat">
                        <span className="econ-label font-mono">STRATEGY MODEL SCORE</span>
                        <strong className="econ-val font-mono">
                          {(result.recommendation.strategy_score * 100).toFixed(0)}/100
                        </strong>
                      </div>
                      <div className="econ-stat">
                        <span className="econ-label font-mono">EXECUTION COST</span>
                        <strong className="econ-val font-mono text-muted">
                          {formatCurrency(result.recommendation.recommendation.execution_cost_paise)}
                        </strong>
                      </div>
                    </div>

                    <div className="strategy-rationale-box">
                      <span className="rationale-label font-mono">STRATEGY RATIONALE:</span>
                      <p className="rationale-text">{result.recommendation.recommendation.rationale}</p>
                    </div>

                    {result.recommendation.assumptions.length > 0 && (
                      <div className="strategy-assumptions-list font-mono">
                        <span className="assumptions-heading">MODEL ASSUMPTIONS:</span>
                        <ul>
                          {result.recommendation.assumptions.map((asm, i) => (
                            <li key={i}>{asm}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Deterministic Policy Check Card */}
                  <div className={`policy-decision-card ${result.policy.action}`} id="policy">
                    <div className="policy-decision-header font-mono">
                      <span className="policy-status-label">
                        POLICY VERDICT: {result.policy.action.toUpperCase()}
                      </span>
                      <span className="policy-result-badge">
                        {result.policy.allowed ? 'PASSED ALL CHECKS' : 'MANUAL APPROVAL REQUIRED'}
                      </span>
                    </div>

                    <ul className="policy-reasons-checklist">
                      {result.policy.reasons.map((reason, idx) => (
                        <li key={idx} className="policy-check-item">
                          <span className="check-bullet">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="action-button-row">
                    <button
                      type="button"
                      className="btn-institutional-primary"
                      onClick={() => handleOpenRecovery()}
                      disabled={!result.policy.allowed}
                      style={{ width: '100%' }}
                    >
                      Trigger Policy-Approved Intervention →
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state-entry">
                  <p className="empty-text">Click &ldquo;Evaluate Revenue Opportunities&rdquo; to begin decisioning.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DECISION AUDIT TRAIL */}
        <section className="institutional-panel audit-panel-container" id="audit">
          <div className="panel-header">
            <div className="panel-header-left">
              <span className="panel-tag font-mono">IMMUTABLE LOG</span>
              <h2 className="panel-title">Decision Audit Trail</h2>
            </div>
            <div className="audit-header-actions font-mono">
              <span className="text-muted">{filteredAuditEvents.length} Recorded Events</span>
              <button type="button" className="btn-institutional-secondary btn-sm" onClick={exportAuditJson}>
                📥 Export JSON
              </button>
            </div>
          </div>

          <div className="audit-search-bar">
            <input
              type="search"
              placeholder="Filter audit events by actor, action, or metadata..."
              className="institutional-search-input font-mono"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              aria-label="Filter audit events"
            />
          </div>

          <div className="audit-table-wrapper">
            <table className="audit-data-table font-mono">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>TIMESTAMP</th>
                  <th style={{ width: '90px' }}>ACTOR</th>
                  <th style={{ width: '180px' }}>ACTION</th>
                  <th>STRUCTURED METADATA</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td className="text-muted">
                      {new Date(ev.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td>
                      <span className={`actor-tag actor-${ev.actor}`}>{ev.actor}</span>
                    </td>
                    <td className="action-cell">{ev.action}</td>
                    <td className="metadata-cell" title={JSON.stringify(ev.metadata)}>
                      {JSON.stringify(ev.metadata)}
                    </td>
                  </tr>
                ))}

                {filteredAuditEvents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-table-cell">
                      No matching audit records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        opportunity={selectedOpportunity}
        recommendation={result?.recommendation ?? null}
        policy={result?.policy ?? null}
        onActionExecuted={handleActionExecuted}
      />

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
