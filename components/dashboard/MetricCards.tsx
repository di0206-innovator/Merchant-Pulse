'use client';

import React from 'react';
import { DollarSign, AlertTriangle, ArrowUpRight, CheckCircle, TrendingUp } from 'lucide-react';
import { MerchantRevenueMetrics } from '@/core/revenue/metrics';

interface MetricCardsProps {
  metrics: MerchantRevenueMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const formatInr = (paise: number) => {
    const inr = paise / 100;
    return '₹' + inr.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total GMV */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Pipeline GMV
          </span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatInr(metrics.totalGmvPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-mono font-medium">
              {formatInr(metrics.totalCapturedGmvPaise)}
            </span>
            <span>captured organic</span>
          </div>
        </div>
      </div>

      {/* Revenue at Risk */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Revenue at Risk
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
            {formatInr(metrics.revenueAtRiskPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
            <span className="text-amber-400 font-mono font-medium">
              {metrics.degradationRatePct}%
            </span>
            <span>dropoff & degradation rate</span>
          </div>
        </div>
      </div>

      {/* Recoverable Opportunity EV */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recoverable EV
          </span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-blue-400 tracking-tight">
            {formatInr(metrics.recoverableOpportunityPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
            <span className="text-blue-400 font-mono font-medium">
              {metrics.activeOpportunityCount}
            </span>
            <span>active actionable leaks</span>
          </div>
        </div>
      </div>

      {/* Recovered Value */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recovered Value (Closed-Loop)
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {formatInr(metrics.recoveredGmvPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-mono font-medium">
              {metrics.netRecoveryConversionRatePct}%
            </span>
            <span>attributed conversion rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
