'use client';

import React from 'react';
import { Activity, Play, RefreshCw } from 'lucide-react';

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
    <header className="nb-page-header flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
      {/* Top ambient highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="flex items-center gap-4">
        {/* Tactile 3D Logo block */}
        <div
          className="w-12 h-12 shrink-0 rounded-2xl border border-amber-300/60 flex items-center justify-center shadow-skeuo-gold transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
          }}
        >
          <Activity className="w-6 h-6 text-slate-950" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-black uppercase tracking-tight text-nb-white text-xl">
              MerchantPulse Terminal
            </h1>
            <span className="nb-chip-blue">
              Razorpay Core SDK v1.0
            </span>
            <span className="nb-chip-green">
              <span className="skeuo-led-green w-2 h-2" />
              5000 Req/s
            </span>
          </div>
          <p className="font-mono text-[10px] text-nb-muted mt-1 uppercase tracking-wider">
            Deterministic Revenue Leak Engine · Policy Guardrails · Closed-Loop Razorpay Verification
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Last updated plate */}
        <div
          className="text-right hidden sm:block font-mono px-3 py-1.5 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset"
          style={{ background: 'var(--nb-recessed)' }}
        >
          <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-nb-muted">
            Last Recovery Sync
          </div>
          <div className="font-mono text-xs font-black text-nb-white flex items-center justify-end gap-1.5">
            <span className="skeuo-led-green w-1.5 h-1.5" />
            {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={onRunDemo}
          disabled={loading}
          className="nb-primary-button"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-slate-950" />
          )}
          <span>{loading ? 'Simulating Pipeline...' : 'Run Scenario (₹1.24 Cr)'}</span>
        </button>
      </div>
    </header>
  );
};
