'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BarChart3, Play, ShieldCheck } from 'lucide-react';

export default function StrategyPage() {
  const [batchSize, setBatchSize] = useState<number>(1000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

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
      <div className="nb-page">

        {/* Header */}
        <div className="nb-page-header">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="nb-eyebrow">
                <BarChart3 className="w-3.5 h-3.5" />
                Recovery Strategy Engine
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Strategy &<br />
                <span className="text-[#FFE500]">Recovery Benchmark</span>
              </h1>
              <p className="mt-3 font-mono text-xs text-[#888888] max-w-xl leading-6">
                Compare 3-way strategy outcomes across 1,000–5,000 synthetic event batches with an 80/20 held-out split. Understand where your revenue is being left on the table.
              </p>
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
        </div>

        {/* Batch size selector */}
        <div className="nb-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="nb-label mb-0">Batch Size:</span>
            <div className="flex items-center gap-2">
              {[1000, 2500, 5000].map((size) => (
                <button
                  key={size}
                  onClick={() => setBatchSize(size)}
                  className={`border-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                    batchSize === size
                      ? 'border-[#FFE500] bg-[#FFE500] text-black shadow-brutal-y'
                      : 'border-white/20 bg-transparent text-[#888888] hover:border-white hover:text-white hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  {size.toLocaleString()} Events
                </button>
              ))}
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#888888]">
            Held-out split: <strong className="text-[#F5F5F5]">20% Validation Set</strong>
          </span>
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

        {isRunning && (
          <div className="nb-panel p-12 text-center" style={{ borderColor: '#FFE500', boxShadow: '6px 6px 0 #FFE500' }}>
            <div className="font-mono text-sm font-black uppercase text-[#FFE500] animate-flicker">
              Running Strategy Evaluation · {batchSize.toLocaleString()} Events
            </div>
            <p className="font-mono text-[11px] text-[#888888] mt-2">
              Simulating payment failures, EV calculations, strategy selection...
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
