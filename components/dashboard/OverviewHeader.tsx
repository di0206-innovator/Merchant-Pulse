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
    <header className="nb-page-header flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        {/* Logo block */}
        <div
          className="w-12 h-12 shrink-0 border-2 border-white bg-[#FFE500] flex items-center justify-center shadow-brutal transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg"
        >
          <Activity className="w-5 h-5 text-black" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-black uppercase tracking-tight text-white text-xl">
              MerchantPulse Terminal
            </h1>
            <span className="nb-chip border-[#3B82F6]/60 text-[#3B82F6]">
              Razorpay Core SDK v1.0
            </span>
            <span className="nb-chip border-[#00FF94]/60 text-[#00FF94]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-flicker" />
              5000 Req/s
            </span>
          </div>
          <p className="font-mono text-[10px] text-[#888888] mt-1 uppercase tracking-wide">
            Deterministic Revenue Leak Engine · Policy Guardrails · Closed-Loop Razorpay Verification
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Last updated */}
        <div className="text-right hidden sm:block font-mono">
          <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#888888]">
            Last Recovery Sync
          </div>
          <div className="font-mono text-xs font-black text-[#F5F5F5]">
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
            <Play className="w-4 h-4 fill-black" />
          )}
          <span>{loading ? 'Simulating Pipeline...' : 'Run Scenario (₹1.24 Cr)'}</span>
        </button>
      </div>
    </header>
  );
};
