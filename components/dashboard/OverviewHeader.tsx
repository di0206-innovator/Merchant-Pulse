'use client';

import React from 'react';
import { Activity, ShieldCheck, Cpu, RefreshCw, Zap, Play, CheckCircle2, Server } from 'lucide-react';

interface OverviewHeaderProps {
  onRunDemo: () => Promise<void>;
  loading: boolean;
  lastUpdated: Date;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  onRunDemo,
  loading,
  lastUpdated,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 m3-elevation-2 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/25">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              MerchantPulse Terminal
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              Razorpay Core SDK v1.0
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>5000 Req/s Engine Scale</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
            Deterministic Revenue Leak Engine • Policy Guardrails • Closed-Loop Razorpay Verification
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="text-right hidden sm:block font-mono">
          <div className="text-[10px] text-slate-400">LAST RECOVERY SYNC</div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{loading ? 'Simulating Pipeline...' : 'Run Scenario (₹1.24 Cr)'}</span>
        </button>
      </div>
    </header>
  );
};
