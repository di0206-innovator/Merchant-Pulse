'use client';

import React from 'react';
import { DollarSign, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { MerchantRevenueMetrics } from '@/core/revenue/metrics';

interface MetricCardsProps {
  metrics: MerchantRevenueMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const formatInr = (paise: number) => {
    const inr = paise / 100;
    return '₹' + inr.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const attributedInr = metrics.attributedInterventionGmvPaise ? formatInr(metrics.attributedInterventionGmvPaise) : formatInr(metrics.recoveredGmvPaise);
  const organicInr = metrics.organicRecoveredGmvPaise ? formatInr(metrics.organicRecoveredGmvPaise) : '₹0';
  const autoRate = metrics.automationRatePct ?? 85.0;

  const cards = [
    {
      label: 'Total Pipeline GMV',
      value: formatInr(metrics.totalGmvPaise),
      sub: `${formatInr(metrics.totalCapturedGmvPaise)} captured baseline`,
      icon: DollarSign,
      accent: '#3B82F6',
      accentGlow: 'rgba(59, 130, 246, 0.35)',
      gradient: 'linear-gradient(180deg, #93C5FD 0%, #3B82F6 60%, #1D4ED8 100%)',
    },
    {
      label: 'Revenue at Risk',
      value: formatInr(metrics.revenueAtRiskPaise),
      sub: `${metrics.degradationRatePct}% dropoff failure rate`,
      icon: AlertTriangle,
      accent: '#EF4444',
      accentGlow: 'rgba(239, 68, 68, 0.35)',
      gradient: 'linear-gradient(180deg, #FCA5A5 0%, #EF4444 60%, #B91C1C 100%)',
    },
    {
      label: 'Recovered GMV (Verified)',
      value: formatInr(metrics.recoveredGmvPaise),
      sub: `Attributed: ${attributedInr} · Organic: ${organicInr}`,
      icon: CheckCircle,
      accent: '#10B981',
      accentGlow: 'rgba(16, 185, 129, 0.35)',
      gradient: 'linear-gradient(180deg, #6EE7B7 0%, #10B981 60%, #047857 100%)',
    },
    {
      label: 'Automation Rate',
      value: `${autoRate}%`,
      sub: `${metrics.netRecoveryConversionRatePct}% net recovery rate`,
      icon: TrendingUp,
      accent: '#F59E0B',
      accentGlow: 'rgba(245, 158, 11, 0.35)',
      gradient: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #B45309 100%)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="nb-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-skeuo-card-hover group relative overflow-hidden"
          >
            {/* Top specular reflection line */}
            <div
              className="absolute inset-x-0 top-0 h-[1.5px]"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${card.accent}80 30%, rgba(255,255,255,0.8) 50%, ${card.accent}80 70%, transparent 100%)`,
              }}
            />

            <div className="flex items-center justify-between">
              <span className="nb-label mb-0">{card.label}</span>
              {/* Domed Icon Bezel */}
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-skeuo-badge transition-transform duration-150 group-hover:scale-105"
                style={{
                  borderColor: `${card.accent}60`,
                  background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, ${card.accent}25 50%, ${card.accent}10 100%)`,
                  boxShadow: `0 0 12px ${card.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.3)`,
                }}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: card.accent }} />
              </div>
            </div>

            <div className="mt-4">
              <div
                className="font-mono text-3xl font-black tabular-nums leading-none tracking-tight"
                style={{
                  color: card.accent,
                  textShadow: `0 2px 8px ${card.accentGlow}`,
                }}
              >
                {card.value}
              </div>
              <div
                className="mt-2.5 inline-block font-mono text-[10px] text-nb-muted px-2.5 py-1 rounded-lg border border-nb-stroke/40"
                style={{ background: 'var(--nb-recessed)' }}
              >
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
