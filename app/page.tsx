import React from 'react';
import { Activity, ShieldCheck, Zap, ArrowUpRight, DollarSign, TrendingUp, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
      {/* Top Banner / System Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white tracking-tight">MerchantPulse</h1>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Razorpay Engine v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic Truth • AI Strategy • Policy Governance • Closed-Loop Recovery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gateway Active
          </div>
          <button className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm">
            Run Demo Pipeline
          </button>
        </div>
      </div>

      {/* Metrics Row Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Monthly GMV</span>
          <div className="text-2xl font-bold font-mono text-white">₹1,24,50,000</div>
          <span className="text-xs text-emerald-400 font-mono">+12.4% vs last period</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Revenue at Risk</span>
          <div className="text-2xl font-bold font-mono text-amber-400">₹4,82,600</div>
          <span className="text-xs text-slate-400 font-mono">3.87% degradation rate</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Recoverable Opportunity (EV)</span>
          <div className="text-2xl font-bold font-mono text-blue-400">₹3,18,450</div>
          <span className="text-xs text-blue-400/80 font-mono">72 actionable leaks</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Recovered Revenue (30d)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">₹2,42,800</div>
          <span className="text-xs text-emerald-400 font-mono">76.2% conversion</span>
        </div>
      </div>
    </main>
  );
}
