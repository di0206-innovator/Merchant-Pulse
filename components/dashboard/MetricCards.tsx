'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { MerchantRevenueMetrics } from '@/core/revenue/metrics';

interface MetricCardsProps {
  metrics: MerchantRevenueMetrics;
}

function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const from = fromRef.current;
    const start = performance.now();
    startRef.current = start;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) { raf.current = requestAnimationFrame(tick); }
      else { fromRef.current = target; }
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

function AnimatedInr({ paise, accent }: { paise: number; accent: string }) {
  const animatedPaise = useCountUp(paise, 900);
  const inr = animatedPaise / 100;
  return (
    <span style={{ color: accent, textShadow: `0 2px 8px ${accent}60` }}>
      ₹{inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
    </span>
  );
}

function AnimatedPct({ value, accent }: { value: number; accent: string }) {
  const animated = useCountUp(Math.round(value * 10), 900);
  return (
    <span style={{ color: accent, textShadow: `0 2px 8px ${accent}60` }}>
      {(animated / 10).toFixed(1)}%
    </span>
  );
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const formatInr = (paise: number) => {
    const inr = paise / 100;
    return '₹' + inr.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const attributedInr = metrics.attributedInterventionGmvPaise
    ? formatInr(metrics.attributedInterventionGmvPaise)
    : formatInr(metrics.recoveredGmvPaise);
  const organicInr = metrics.organicRecoveredGmvPaise ? formatInr(metrics.organicRecoveredGmvPaise) : '₹0';
  const autoRate = metrics.automationRatePct ?? 85.0;

  const cards = [
    {
      label: 'Total Pipeline GMV',
      paiseValue: metrics.totalGmvPaise,
      isPct: false,
      sub: `${formatInr(metrics.totalCapturedGmvPaise)} captured baseline`,
      icon: DollarSign,
      accent: '#3B82F6',
      accentGlow: 'rgba(59, 130, 246, 0.35)',
    },
    {
      label: 'Revenue at Risk',
      paiseValue: metrics.revenueAtRiskPaise,
      isPct: false,
      sub: `${metrics.degradationRatePct}% dropoff failure rate`,
      icon: AlertTriangle,
      accent: '#EF4444',
      accentGlow: 'rgba(239, 68, 68, 0.35)',
    },
    {
      label: 'Recovered GMV (Verified)',
      paiseValue: metrics.recoveredGmvPaise,
      isPct: false,
      sub: `Attributed: ${attributedInr} · Organic: ${organicInr}`,
      icon: CheckCircle,
      accent: '#10B981',
      accentGlow: 'rgba(16, 185, 129, 0.35)',
    },
    {
      label: 'Automation Rate',
      paiseValue: autoRate,
      isPct: true,
      sub: `${metrics.netRecoveryConversionRatePct}% net recovery rate`,
      icon: TrendingUp,
      accent: '#F59E0B',
      accentGlow: 'rgba(245, 158, 11, 0.35)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="nb-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-skeuo-card-hover group relative overflow-hidden cursor-default"
          >
            {/* Top specular accent line */}
            <div
              className="absolute inset-x-0 top-0 h-[1.5px]"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${card.accent}80 30%, rgba(255,255,255,0.8) 50%, ${card.accent}80 70%, transparent 100%)`,
              }}
            />
            {/* Subtle corner glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${card.accentGlow} 0%, transparent 70%)` }}
            />

            <div className="flex items-center justify-between">
              <span className="nb-label mb-0">{card.label}</span>
              {/* Domed Icon Bezel */}
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-skeuo-badge transition-transform duration-150 group-hover:scale-110"
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
              <div className="font-mono text-3xl font-black tabular-nums leading-none tracking-tight">
                {card.isPct ? (
                  <AnimatedPct value={card.paiseValue} accent={card.accent} />
                ) : (
                  <AnimatedInr paise={card.paiseValue} accent={card.accent} />
                )}
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
