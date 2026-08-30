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
      shadow: '4px 4px 0 #3B82F6',
    },
    {
      label: 'Revenue at Risk',
      value: formatInr(metrics.revenueAtRiskPaise),
      sub: `${metrics.degradationRatePct}% dropoff failure rate`,
      icon: AlertTriangle,
      accent: '#FF3B3B',
      shadow: '4px 4px 0 #FF3B3B',
    },
    {
      label: 'Recovered GMV (Verified)',
      value: formatInr(metrics.recoveredGmvPaise),
      sub: `Attributed: ${attributedInr} · Organic: ${organicInr}`,
      icon: CheckCircle,
      accent: '#00FF94',
      shadow: '4px 4px 0 #00FF94',
    },
    {
      label: 'Automation Rate',
      value: `${autoRate}%`,
      sub: `${metrics.netRecoveryConversionRatePct}% net recovery rate`,
      icon: TrendingUp,
      accent: '#FFE500',
      shadow: '4px 4px 0 #FFE500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="nb-panel p-5 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: card.shadow }}
          >
            <div className="flex items-center justify-between">
              <span className="nb-label mb-0">{card.label}</span>
              <Icon className="w-4 h-4 shrink-0" style={{ color: card.accent }} />
            </div>
            <div className="mt-4">
              <div
                className="font-mono text-3xl font-black tabular-nums leading-none"
                style={{ color: card.accent }}
              >
                {card.value}
              </div>
              <div className="mt-2 font-mono text-[10px] text-[#888888]">
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
