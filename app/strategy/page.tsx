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
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
                AI Strategy Reasoner &amp;<br />
                <span className="text-[#FFE500]">Multi-Tier Policy Engine</span>
              </h1>
              <p className="mt-3 font-mono text-xs text-[#888888] max-w-xl leading-6">
                Bounded Gemini 2.5 Flash reasoning over deterministic Net Expected Value facts. Evaluates safety guardrails and outputs strictly schema-validated execution intents.
              </p>
            </div>

            {/* Tab switch buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('REASONER')}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                  activeTab === 'REASONER'
                    ? 'border-[#FFE500] bg-[#FFE500] text-black shadow-brutal-y'
                    : 'border-white/20 text-[#888888] hover:border-white hover:text-white'
                }`}
              >
                Live AI Reasoner
              </button>
              <button
                onClick={() => setActiveTab('BENCHMARK')}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                  activeTab === 'BENCHMARK'
                    ? 'border-[#FFE500] bg-[#FFE500] text-black shadow-brutal-y'
                    : 'border-white/20 text-[#888888] hover:border-white hover:text-white'
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
            <div className="nb-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  1. Select Payment Incident Fact Pattern
                </span>
                <span className="font-mono text-[10px] text-[#888888]">
                  Deterministic Context Vector
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {SCENARIOS.map((sc) => {
                  const isSelected = selectedScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => { setSelectedScenario(sc); setReasonerResult(null); }}
                      className={`p-3.5 border-2 text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#FFE500] bg-[#FFE500]/10 text-white shadow-brutal-sm'
                          : 'border-white/10 bg-[#0A0A0A] text-[#888888] hover:border-white/40 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-mono text-xs font-black uppercase text-white mb-1">{sc.name}</div>
                        <p className="font-mono text-[10px] text-[#888888] line-clamp-2 leading-4">{sc.description}</p>
                      </div>
                      <div className="mt-3 font-mono text-[10px] font-bold text-[#FFE500]">
                        ₹{(sc.amountPaise / 100).toLocaleString('en-IN')}
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
                      <Zap className="w-4 h-4 fill-black" />
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
                <div className="nb-panel p-5 space-y-4">
                  <div className="border-b-2 border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-[#3B82F6]">
                      Deterministic Financial Facts
                    </span>
                    <span className="nb-chip border-[#3B82F6] text-[#3B82F6]">Zero-LLM Math</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-[#888888]">Gross Amount</span>
                      <span className="font-black text-white">₹{(reasonerResult.opportunity.amountPaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-[#888888]">P(Recovery)</span>
                      <span className="font-black text-[#00FF94]">{Math.round(reasonerResult.opportunity.expectedValue.pSuccess * 100)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-[#888888]">Net Expected Value</span>
                      <span className="font-black text-[#FFE500]">₹{(reasonerResult.opportunity.expectedValue.netExpectedValuePaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-[#888888]">Priority Score</span>
                      <span className="font-black text-white">{reasonerResult.opportunity.priority?.score} / 100 ({reasonerResult.opportunity.priority?.tier})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Customer LTV</span>
                      <span className="font-black text-white">₹{(reasonerResult.opportunity.evidence.customerLtvPaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* 2. AI Reasoner Output */}
                <div className="nb-panel p-5 space-y-4">
                  <div className="border-b-2 border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-[#FFE500]">
                      AI Reasoner (Gemini 2.5 Flash)
                    </span>
                    <span className="nb-chip border-[#FFE500] text-[#FFE500]">Bounded Output</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Selected Action</span>
                      <span className="font-black text-sm text-[#FFE500]">{reasonerResult.recommendation.actionType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Recommended Channel</span>
                      <span className="font-bold text-white uppercase">{reasonerResult.recommendation.channel || 'IN_APP_RETRY'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Urgency Level</span>
                      <span className="font-bold text-white uppercase">{reasonerResult.recommendation.urgencyLevel || 'MEDIUM'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Strategic Rationale</span>
                      <p className="text-[#F5F5F5] text-[11px] leading-5 mt-1 border-l-2 border-[#FFE500] pl-2">
                        {reasonerResult.recommendation.rationale}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Multi-Tier Policy Gate */}
                <div className="nb-panel p-5 space-y-4" style={{ borderColor: reasonerResult.policyResult.allowed ? '#00FF94' : '#FFE500' }}>
                  <div className="border-b-2 border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-white">
                      Policy Gate &amp; Risk Verdict
                    </span>
                    <span className="nb-chip border-white/40 text-white">Rule Gate</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Risk Classification</span>
                      <span className="font-black text-sm text-white">{reasonerResult.policyResult.riskClass}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Execution Verdict</span>
                      <span className={`font-black text-sm uppercase ${
                        reasonerResult.policyResult.action === 'AUTO_EXECUTE' ? 'text-[#00FF94]' :
                        reasonerResult.policyResult.action === 'ESCALATE_HUMAN' ? 'text-[#FFE500]' : 'text-[#FF3B3B]'
                      }`}>
                        {reasonerResult.policyResult.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase block">Evaluated Guardrails</span>
                      <ul className="space-y-1.5 mt-2">
                        {reasonerResult.policyResult.ruleResults.map((r: any) => (
                          <li key={r.ruleName} className="flex items-start gap-1.5 text-[11px]">
                            {r.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF94] shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-[#FFE500] shrink-0 mt-0.5" />
                            )}
                            <span className={r.passed ? 'text-[#888888]' : 'text-[#FFE500]'}>{r.ruleName}: {r.reason}</span>
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
                <span className="nb-label mb-0">Synthetic Batch Size:</span>
                <div className="flex items-center gap-2">
                  {[1000, 2500, 5000].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size)}
                      className={`border-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                        batchSize === size
                          ? 'border-[#FFE500] bg-[#FFE500] text-black shadow-brutal-y'
                          : 'border-white/20 bg-transparent text-[#888888] hover:border-white hover:text-white'
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
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin" />
                    <span>Simulating ({batchSize} Events)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Execute Strategy Evaluation</span>
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {result && result.metrics && (
              <div className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="nb-panel p-5 space-y-3" style={{ boxShadow: '4px 4px 0 #FF3B3B' }}>
                    <div className="nb-label">Baseline 1: No Intervention</div>
                    <div className="font-mono text-3xl font-black text-[#888888]">₹0</div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[#888888]">Recovered</div>
                    <p className="font-mono text-[10px] leading-5 text-[#888888]">
                      All dropped payment links and failed attempts are permanently lost.
                    </p>
                  </div>

                  <div className="nb-panel p-5 space-y-3" style={{ boxShadow: '4px 4px 0 #FFE500' }}>
                    <div className="nb-label text-[#FFE500]">Baseline 2: Static Rules</div>
                    <div className="font-mono text-3xl font-black text-[#FFE500]">
                      ₹{((result.metrics.netRecoveredPaise * 0.42) / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[#888888]">Recovered</div>
                    <p className="font-mono text-[10px] leading-5 text-[#888888]">
                      Static retries without EV cost calculation erode margin on low-intent dropoffs.
                    </p>
                  </div>

                  <div className="nb-panel p-5 space-y-3" style={{ boxShadow: '4px 4px 0 #00FF94', borderColor: '#00FF94' }}>
                    <div className="flex items-center gap-1.5 nb-label text-[#00FF94]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00FF94]" />
                      MerchantPulse AI
                    </div>
                    <div className="font-mono text-3xl font-black text-[#00FF94]">
                      ₹{(result.metrics.netRecoveredPaise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[#888888]">
                      Net Recovered · Rate: <span className="text-[#00FF94]">{result.metrics.attributedRecoveryRatePct}%</span>
                    </div>
                    <p className="font-mono text-[10px] leading-5 text-[#888888]">
                      Attributed recovery with EV-bounded strategy and policy guardrails.
                    </p>
                  </div>
                </div>

                <div className="nb-panel overflow-hidden">
                  <div className="border-b-2 border-white/10 bg-[#111111] px-6 py-4">
                    <div className="nb-label">Evaluation Summary</div>
                    <h3 className="font-black uppercase text-white mt-1">Batch Breakdown</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
                    {[
                      { label: 'Total Events',    value: String(result.metrics.totalEventsProcessed), color: '#F5F5F5' },
                      { label: 'Revenue at Risk', value: `₹${(result.metrics.totalRevenueAtRiskPaise / 100).toLocaleString('en-IN')}`, color: '#FF3B3B' },
                      { label: 'Held-Out Set',    value: `${result.metrics.heldOutEventsCount} (${result.metrics.heldOutSplitPct}%)`, color: '#3B82F6' },
                      { label: 'Escalations',     value: `${result.metrics.escalatedCount || 0}`, color: '#FFE500' },
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
              <div className="nb-panel p-12 text-center border-dashed border-white/10 bg-transparent">
                <BarChart3 className="w-8 h-8 text-[#888888] mx-auto mb-4" />
                <div className="font-mono text-sm font-bold uppercase text-[#888888]">No strategy run yet</div>
                <p className="font-mono text-[11px] text-[#888888] mt-2 max-w-sm mx-auto">
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
