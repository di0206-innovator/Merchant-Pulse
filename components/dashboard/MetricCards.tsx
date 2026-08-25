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
      <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 m3-elevation-2 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Pipeline GMV
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
            {formatInr(metrics.totalGmvPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatInr(metrics.totalCapturedGmvPaise)}
            </span>
            <span>captured organic</span>
          </div>
        </div>
      </div>

      {/* Revenue at Risk */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 m3-elevation-2 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Revenue at Risk
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight tabular-nums">
            {formatInr(metrics.revenueAtRiskPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {metrics.degradationRatePct}%
            </span>
            <span>dropoff failure rate</span>
          </div>
        </div>
      </div>

      {/* Recoverable Opportunity EV */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 m3-elevation-2 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recoverable EV Math
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">
            {formatInr(metrics.recoverableOpportunityPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {metrics.activeOpportunityCount}
            </span>
            <span>active actionable leaks</span>
          </div>
        </div>
      </div>

      {/* Recovered Value */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 m3-elevation-2 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recovered Money (Attributed)
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
            {formatInr(metrics.recoveredGmvPaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {metrics.netRecoveryConversionRatePct}%
            </span>
            <span>attributed conversion</span>
          </div>
        </div>
      </div>
    </div>
  );
};
