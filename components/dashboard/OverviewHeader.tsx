'use client';

import React from 'react';
import { Activity, ShieldCheck, Cpu, RefreshCw, Zap, Play, CheckCircle2 } from 'lucide-react';

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
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-900/40 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
          <Activity className="w-6 h-6 animate-pulse text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              MerchantPulse
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Razorpay Core v1.0
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomous Revenue Recovery • Deterministic Financial Truth • Policy Guardrails • Closed-Loop Audit
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-[11px] font-mono text-slate-500">LAST SYNC</div>
          <div className="text-xs font-mono text-slate-300">
            {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{loading ? 'Simulating Pipeline...' : 'Run Demo Scenario (₹1.24 Cr)'}</span>
        </button>
      </div>
    </header>
  );
};
