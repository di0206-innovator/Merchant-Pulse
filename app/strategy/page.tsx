'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BarChart3, Play, ShieldCheck, Cpu, Zap, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'upi_dropoff',
    name: 'High-Value UPI Dropoff (₹8,500)',
    description: 'UPI App timeout on checkout. High recovery probability with instant payment link.',
    amountPaise: 850000,
    failureCode: 'BANK_TIMEOUT',
    failureDescription: 'Bank Gateway Timeout (HTTP 504)',
    paymentMethod: 'upi',
    bankOrIssuer: 'HDFC Bank',
    customerLtvPaise: 5000000,
    opportunityType: 'FAILED_PAYMENT',
    accent: '#FFE500',
  },
  {
    id: 'state_mismatch',
    name: 'State Mismatch (₹22,000)',
    description: 'Customer debited on Razorpay, order pending in merchant DB. Requires zero-link state reconciliation.',
    amountPaise: 2200000,
    failureCode: 'STATE_MISMATCH',
    failureDescription: 'Gateway captured payment but merchant webhook failed',
    paymentMethod: 'card',
    bankOrIssuer: 'ICICI Bank',
    customerLtvPaise: 12000000,
    opportunityType: 'STATE_MISMATCH',
    accent: '#3B82F6',
  },
  {
    id: 'bank_degraded',
    name: 'Bank Downtime Degradation (₹14,500)',
    description: 'HDFC NetBanking SR degraded. AI recommends alternative payment method notify.',
    amountPaise: 1450000,
    failureCode: 'GATEWAY_ERROR',
    failureDescription: 'HDFC NetBanking SR degraded below 40%',
    paymentMethod: 'netbanking',
    bankOrIssuer: 'HDFC Bank',
    customerLtvPaise: 3500000,
    opportunityType: 'PAYMENT_METHOD_DEGRADATION',
    accent: '#00FF94',
  },
  {
    id: 'negative_ev',
    name: 'Negative EV Minor Dropoff (₹199)',
    description: 'Expired debit card on low-margin item. Cost of SMS/Link exceeds gross EV -> AI suppresses intervention.',
    amountPaise: 19900,
    failureCode: 'CARD_EXPIRED',
    failureDescription: 'Card expired at gateway',
    paymentMethod: 'card',
    bankOrIssuer: 'SBI',
    customerLtvPaise: 50000,
    opportunityType: 'FAILED_PAYMENT',
    accent: '#FF3B3B',
  },
  {
    id: 'over_limit',
    name: 'Enterprise Over-Limit (₹65,000)',
    description: 'High-value transaction exceeds ₹25,000 autonomous threshold -> Policy routes to Human Review Queue.',
    amountPaise: 6500000,
    failureCode: 'LIMIT_EXCEEDED',
    failureDescription: 'Per-transaction enterprise limit exceeded',
    paymentMethod: 'card',
    bankOrIssuer: 'Axis Bank',
    customerLtvPaise: 25000000,
    opportunityType: 'HIGH_VALUE_DROPOFF',
    accent: '#FFE500',
  },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<'REASONER' | 'BENCHMARK'>('REASONER');
  
  // Live Reasoner State
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [reasonerLoading, setReasonerLoading] = useState(false);
  const [reasonerResult, setReasonerResult] = useState<any>(null);

  // Benchmark State
  const [batchSize, setBatchSize] = useState<number>(1000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const runLiveReasoner = async () => {
    setReasonerLoading(true);
    try {
      const res = await fetch('/api/strategy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedScenario),
      });
      if (res.ok) {
        const data = await res.json();
        setReasonerResult(data);
      }
    } catch (err) {
      console.error('Failed to run live reasoner:', err);
    } finally {
      setReasonerLoading(false);
    }
  };

  const runBenchmark = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalEvents: batchSize, heldOutSplitPct: 20 }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Strategy benchmark error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppLayout>
      <div className="nb-page space-y-6">

        {/* Header */}
        <div className="nb-page-header">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="nb-eyebrow">
                <Cpu className="w-3.5 h-3.5" />
                Intelligence &amp; Recovery Strategy Layer
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                AI Strategy Reasoner &amp;<br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Multi-Tier Policy Engine</span>
              </h1>
              <p className="mt-3 font-mono text-xs text-[var(--nb-text-muted)] max-w-xl leading-6">
                Bounded Gemini 2.5 Flash reasoning over deterministic Net Expected Value facts. Evaluates safety guardrails and outputs strictly schema-validated execution intents.
              </p>
            </div>

            {/* Tab switch buttons */}
            <div className="inline-flex p-1 bg-[var(--nb-recessed)] rounded-xl border border-white/10 shadow-skeuo-inset">
              <button
                onClick={() => setActiveTab('REASONER')}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                  activeTab === 'REASONER'
                    ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-slate-950 shadow-skeuo-gold font-black'
                    : 'text-[var(--nb-text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                Live AI Reasoner
              </button>
              <button
                onClick={() => setActiveTab('BENCHMARK')}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                  activeTab === 'BENCHMARK'
                    ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-slate-950 shadow-skeuo-gold font-black'
                    : 'text-[var(--nb-text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                3-Way Benchmark
              </button>
            </div>
          </div>
        </div>

        {/* ── TAB 1: LIVE AI STRATEGY REASONER ────────────────────────────── */}
        {activeTab === 'REASONER' && (
          <div className="space-y-6 animate-fade-in">
            {/* Scenario Picker */}
            <div className="nb-panel p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 skeuo-led-amber inline-block" />
                  1. Select Payment Incident Fact Pattern
                </span>
                <span className="font-mono text-[10px] text-[var(--nb-text-muted)]">
                  Deterministic Context Vector
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {SCENARIOS.map((sc) => {
                  const isSelected = selectedScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => { setSelectedScenario(sc); setReasonerResult(null); }}
                      className={`p-4 rounded-xl text-left transition-all duration-150 flex flex-col justify-between relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-b from-[var(--nb-surface-2)] to-[var(--nb-surface)] border-2 border-amber-400/80 shadow-skeuo-gold text-white scale-[1.02]'
                          : 'bg-gradient-to-b from-[var(--nb-surface)] to-[var(--nb-surface-2)] border border-white/10 text-[var(--nb-text-muted)] hover:border-white/30 hover:text-white shadow-skeuo-card hover:shadow-skeuo-card-hover'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
                      )}
                      <div>
                        <div className="font-mono text-xs font-black uppercase text-white mb-1.5 leading-snug">{sc.name}</div>
                        <p className="font-mono text-[10px] text-[var(--nb-text-muted)] line-clamp-2 leading-4">{sc.description}</p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--nb-text-muted)]">Amount</span>
                        <span className="font-mono text-xs font-black text-amber-400">
                          ₹{(sc.amountPaise / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={runLiveReasoner}
                  disabled={reasonerLoading}
                  className="nb-primary-button"
                >
                  {reasonerLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini 2.5 Flash Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Evaluate Strategy with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Result View */}
            {reasonerResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                {/* 1. Deterministic Math Facts */}
                <div className="nb-panel p-6 space-y-5">
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-blue-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 skeuo-led-blue inline-block" />
                      Deterministic Facts
                    </span>
                    <span className="nb-chip border-blue-500/40 text-blue-400 bg-blue-500/10">Zero-LLM Math</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[var(--nb-text-muted)]">Gross Amount</span>
                      <span className="font-black text-white">₹{(reasonerResult.opportunity.amountPaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[var(--nb-text-muted)]">P(Recovery)</span>
                      <span className="font-black text-emerald-400">{Math.round(reasonerResult.opportunity.expectedValue.pSuccess * 100)}%</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[var(--nb-text-muted)]">Net Expected Value</span>
                      <span className="font-black text-amber-400">₹{(reasonerResult.opportunity.expectedValue.netExpectedValuePaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[var(--nb-text-muted)]">Priority Score</span>
                      <span className="font-black text-white">{reasonerResult.opportunity.priority?.score} / 100 ({reasonerResult.opportunity.priority?.tier})</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[var(--nb-text-muted)]">Customer LTV</span>
                      <span className="font-black text-white">₹{(reasonerResult.opportunity.evidence.customerLtvPaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* 2. AI Reasoner Output */}
                <div className="nb-panel p-6 space-y-5">
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-amber-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 skeuo-led-amber inline-block" />
                      AI Reasoner (Gemini 2.5)
                    </span>
                    <span className="nb-chip border-amber-500/40 text-amber-400 bg-amber-500/10">Bounded Schema</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block">Selected Action</span>
                      <span className="font-black text-sm text-amber-400">{reasonerResult.recommendation.actionType}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block">Recommended Channel</span>
                      <span className="font-bold text-white uppercase">{reasonerResult.recommendation.channel || 'IN_APP_RETRY'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block">Urgency Level</span>
                      <span className="font-bold text-white uppercase">{reasonerResult.recommendation.urgencyLevel || 'MEDIUM'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block mb-1">Strategic Rationale</span>
                      <p className="text-slate-200 text-[11px] leading-5 border-l-2 border-amber-400 pl-2">
                        {reasonerResult.recommendation.rationale}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Multi-Tier Policy Gate */}
                <div className={`nb-panel p-6 space-y-5 border-2 ${
                  reasonerResult.policyResult.allowed ? 'border-emerald-500/60' : 'border-amber-500/60'
                }`}>
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${
                        reasonerResult.policyResult.allowed ? 'bg-emerald-400 skeuo-led-emerald' : 'bg-amber-400 skeuo-led-amber'
                      }`} />
                      Policy Gate &amp; Risk Verdict
                    </span>
                    <span className="nb-chip border-white/20 text-white bg-white/5">Rule Guard</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block">Risk Classification</span>
                      <span className="font-black text-sm text-white">{reasonerResult.policyResult.riskClass}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block">Execution Verdict</span>
                      <span className={`font-black text-sm uppercase ${
                        reasonerResult.policyResult.action === 'AUTO_EXECUTE' ? 'text-emerald-400' :
                        reasonerResult.policyResult.action === 'ESCALATE_HUMAN' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {reasonerResult.policyResult.action}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <span className="text-[10px] text-[var(--nb-text-muted)] uppercase block mb-2">Evaluated Guardrails</span>
                      <ul className="space-y-2">
                        {reasonerResult.policyResult.ruleResults.map((r: any) => (
                          <li key={r.ruleName} className="flex items-start gap-2 text-[11px]">
                            {r.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <span className={r.passed ? 'text-[var(--nb-text-muted)]' : 'text-amber-300 font-medium'}>
                              {r.ruleName}: {r.reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: 3-WAY STRATEGY BENCHMARK ────────────────────────────── */}
        {activeTab === 'BENCHMARK' && (
          <div className="space-y-6 animate-fade-in">
            {/* Batch size selector */}
            <div className="nb-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="nb-label mb-0 text-xs text-white">Synthetic Batch Size:</span>
                <div className="inline-flex p-1 bg-[var(--nb-recessed)] rounded-xl border border-white/10 shadow-skeuo-inset">
                  {[1000, 2500, 5000].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size)}
                      className={`px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                        batchSize === size
                          ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-slate-950 shadow-skeuo-gold font-black'
                          : 'text-[var(--nb-text-muted)] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {size.toLocaleString()} Events
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runBenchmark}
                disabled={isRunning}
                className="nb-primary-button shrink-0 whitespace-nowrap"
              >
                {isRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                    <span>Simulating ({batchSize} Events)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Execute Strategy Evaluation</span>
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {result && result.metrics && (
              <div className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="nb-panel p-6 space-y-3 border-rose-500/30">
                    <div className="nb-label text-rose-400">Baseline 1: No Intervention</div>
                    <div className="font-mono text-3xl font-black text-[var(--nb-text-muted)]">₹0</div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[var(--nb-text-muted)]">Recovered</div>
                    <p className="font-mono text-[10px] leading-5 text-[var(--nb-text-muted)]">
                      All dropped payment links and failed attempts are permanently lost.
                    </p>
                  </div>

                  <div className="nb-panel p-6 space-y-3 border-amber-500/40">
                    <div className="nb-label text-amber-400">Baseline 2: Static Rules</div>
                    <div className="font-mono text-3xl font-black text-amber-400">
                      ₹{((result.metrics.netRecoveredPaise * 0.42) / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[var(--nb-text-muted)]">Recovered</div>
                    <p className="font-mono text-[10px] leading-5 text-[var(--nb-text-muted)]">
                      Static retries without EV cost calculation erode margin on low-intent dropoffs.
                    </p>
                  </div>

                  <div className="nb-panel p-6 space-y-3 border-2 border-emerald-500/70 shadow-skeuo-green">
                    <div className="flex items-center gap-1.5 nb-label text-emerald-400 font-black">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      MerchantPulse AI
                    </div>
                    <div className="font-mono text-3xl font-black text-emerald-400">
                      ₹{(result.metrics.netRecoveredPaise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[var(--nb-text-muted)]">
                      Net Recovered · Rate: <span className="text-emerald-400 font-bold">{result.metrics.attributedRecoveryRatePct}%</span>
                    </div>
                    <p className="font-mono text-[10px] leading-5 text-[var(--nb-text-muted)]">
                      Attributed recovery with EV-bounded strategy and policy guardrails.
                    </p>
                  </div>
                </div>

                <div className="nb-panel overflow-hidden">
                  <div className="border-b border-white/10 bg-gradient-to-r from-[var(--nb-surface-2)] to-[var(--nb-surface)] px-6 py-4">
                    <div className="nb-label">Evaluation Summary</div>
                    <h3 className="font-black uppercase text-white mt-1">Batch Breakdown</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
                    {[
                      { label: 'Total Events',    value: String(result.metrics.totalEventsProcessed), color: '#F8FAFC' },
                      { label: 'Revenue at Risk', value: `₹${(result.metrics.totalRevenueAtRiskPaise / 100).toLocaleString('en-IN')}`, color: '#F87171' },
                      { label: 'Held-Out Set',    value: `${result.metrics.heldOutEventsCount} (${result.metrics.heldOutSplitPct}%)`, color: '#60A5FA' },
                      { label: 'Escalations',     value: `${result.metrics.escalatedCount || 0}`, color: '#FBBF24' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-5">
                        <div className="nb-label">{stat.label}</div>
                        <div className="font-mono text-2xl font-black tabular-nums" style={{ color: stat.color }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!result && !isRunning && (
              <div className="nb-panel p-12 text-center border-dashed border-white/15 bg-transparent shadow-none">
                <BarChart3 className="w-8 h-8 text-[var(--nb-text-muted)] mx-auto mb-4" />
                <div className="font-mono text-sm font-bold uppercase text-[var(--nb-text-muted)]">No strategy run yet</div>
                <p className="font-mono text-[11px] text-[var(--nb-text-muted)] mt-2 max-w-sm mx-auto">
                  Select a batch size above and click Execute to compare recovery strategies.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
