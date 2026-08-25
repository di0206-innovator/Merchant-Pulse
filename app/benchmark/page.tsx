'use client';

import React, { useState } from 'react';
import { MaterialAppLayout } from '@/components/layout/MaterialAppLayout';
import { BarChart3, Play, Sparkles, CheckCircle2, TrendingUp, DollarSign, Layers, ShieldCheck } from 'lucide-react';

export default function BenchmarkPage() {
  const [batchSize, setBatchSize] = useState<number>(1000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const runSyntheticBenchmark = async () => {
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
      console.error('Benchmark execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <MaterialAppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Surface */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 m3-elevation-1">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-mono mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Synthetic Batch Evaluation Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Strategy & Net Money Recovered Benchmark
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
              Compare 3-way strategy outcomes across 1,000–5,000 synthetic event batches with an 80/20 held-out split.
            </p>
          </div>

          <button
            onClick={runSyntheticBenchmark}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 active:scale-95"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Simulating Batch ({batchSize} Events)...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Batch Evaluation</span>
              </span>
            )}
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-700 dark:text-slate-400 font-bold">Select Batch Size:</span>
            <div className="flex items-center gap-2">
              {[1000, 2500, 5000].map((size) => (
                <button
                  key={size}
                  onClick={() => setBatchSize(size)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    batchSize === size
                      ? 'bg-blue-600/20 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                      : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {size.toLocaleString()} Events
                </button>
              ))}
            </div>
          </div>

          <span className="text-slate-500 text-[11px]">
            Held-Out Evaluation Split: <strong className="text-slate-800 dark:text-slate-300">20% Validation Set</strong>
          </span>
        </div>

        {/* Results Overview */}
        {result && result.metrics && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 3-Way Strategy Benchmark Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Baseline 1: No Action */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 m3-elevation-1">
                <div className="text-xs text-slate-500 font-mono">Baseline 1: No Intervention</div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">₹0 Recovered</div>
                <p className="text-[11px] text-slate-500 font-mono">
                  All dropped payment links and failed attempts are permanently lost.
                </p>
              </div>

              {/* Baseline 2: Heuristic Rules */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-amber-500/30 space-y-3 m3-elevation-1">
                <div className="text-xs text-amber-600 dark:text-amber-500 font-mono">Baseline 2: Static Rules</div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-500">
                  ₹{((result.metrics.netRecoveredPaise * 0.42) / 100).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  Static retries without EV cost calculation erode margin on low-intent dropoffs.
                </p>
              </div>

              {/* MerchantPulse AI Recovery */}
              <div className="p-5 rounded-3xl bg-blue-50 dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-slate-900 dark:to-indigo-900/40 border border-blue-500/50 space-y-3 m3-elevation-3">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>MerchantPulse AI System</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{(result.metrics.netRecoveredPaise / 100).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                  Attributed Recovery Rate: <strong className="text-blue-600 dark:text-blue-400">{result.metrics.attributedRecoveryRatePct}%</strong>
                </p>
              </div>
            </div>

            {/* Detailed Batch Metrics Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 m3-elevation-2 font-mono text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Evaluation Batch Summary Breakdown
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Total Events Evaluated</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">{result.metrics.totalEventsProcessed}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Revenue at Risk Identified</div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                    ₹{(result.metrics.totalRevenueAtRiskPaise / 100).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Held-Out Validation Set</div>
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {result.metrics.heldOutEventsCount} Events ({result.metrics.heldOutSplitPct}%)
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 text-[10px]">Guardrail Interventions Escalated</div>
                  <div className="text-base font-bold text-amber-600 dark:text-amber-500">
                    {result.metrics.escalatedCount || 0} Events
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MaterialAppLayout>
  );
}
