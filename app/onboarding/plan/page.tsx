'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Zap, Shield, Crown, ArrowRight } from 'lucide-react';
import { useOnboarding, type Plan } from '@/lib/onboardingContext';
import type { BusinessProfile } from '@/lib/onboardingContext';

const PLANS = [
  {
    id: 'base' as Plan,
    icon: Shield,
    name: 'Base',
    price: 'Free',
    priceDetail: 'Forever',
    billing: null,
    accent: '#94A3B8',
    colorClass: 'text-slate-400',
    borderSelected: 'border-slate-400',
    shadowSelected: 'shadow-skeuo-card',
    bgBadge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    description: 'Core payment failure monitoring, alerts and basic recovery insights.',
    features: [
      'Payment failure monitoring',
      'Basic recovery alerts',
      'Up to 500 events / month',
      'Email support',
      'Policy guardrails',
    ],
    cta: 'Start Free',
  },
  {
    id: 'pro' as Plan,
    icon: Zap,
    name: 'Pro',
    price: '₹299',
    priceDetail: '/ 3 months',
    billing: '≈ ₹100 / month',
    accent: '#F59E0B',
    colorClass: 'text-amber-400',
    borderSelected: 'border-amber-400',
    shadowSelected: 'shadow-skeuo-gold',
    bgBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    description: 'Advanced AI-powered recovery strategies, full audit trail and benchmarking.',
    features: [
      'Everything in Base',
      'AI recovery strategy engine',
      'Unlimited events',
      'Recovery benchmark suite',
      'Closed-loop reconciliation',
      'Priority email support',
    ],
    cta: 'Start Pro Trial',
    badge: 'POPULAR',
  },
  {
    id: 'max' as Plan,
    icon: Crown,
    name: 'Max',
    price: '₹1,149',
    priceDetail: '/ 12 months',
    billing: '≈ ₹96 / month · Best value',
    accent: '#10B981',
    colorClass: 'text-emerald-400',
    borderSelected: 'border-emerald-400',
    shadowSelected: 'shadow-skeuo-green',
    bgBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    description: 'Full enterprise suite with custom guardrails, SLA and dedicated support.',
    features: [
      'Everything in Pro',
      'Custom policy rules engine',
      'Gateway health radar',
      'Concurrency stress testing',
      'SLA guarantee',
      'Dedicated account manager',
      'Slack / phone support',
    ],
    cta: 'Start Max',
    badge: 'BEST VALUE',
  },
];

export default function PlanPage() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro');
  const [loading, setLoading] = useState(false);

  const proceed = (plan: Plan) => {
    setLoading(true);
    let biz: BusinessProfile = { businessName: '', businessType: '', website: '', monthlyGmv: '', phone: '' };
    try {
      const raw = sessionStorage.getItem('mp_biz');
      if (raw) biz = JSON.parse(raw);
    } catch {}

    completeOnboarding(plan, biz);
    setTimeout(() => {
      setLoading(false);
      router.push('/overview');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[var(--nb-bg)] flex flex-col">

      {/* Progress header */}
      <header className="border-b border-white/10 bg-[var(--nb-surface)] px-6 py-4 flex items-center justify-between shadow-skeuo-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center font-mono text-xs font-black text-slate-950 shadow-skeuo-gold">
            MP
          </div>
          <span className="font-black uppercase text-sm tracking-tight text-white">MerchantPulse</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="rounded-lg border border-white/15 bg-[var(--nb-recessed)] text-[var(--nb-text-muted)] px-3 py-1.5 shadow-skeuo-inset">01 Business</span>
          <ChevronRight className="w-3 h-3 text-[var(--nb-text-muted)]" />
          <span className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 px-3 py-1.5 font-black shadow-skeuo-gold">02 Plan</span>
          <ChevronRight className="w-3 h-3 text-[var(--nb-text-muted)]" />
          <span className="rounded-lg border border-white/15 bg-[var(--nb-recessed)] text-[var(--nb-text-muted)] px-3 py-1.5 shadow-skeuo-inset">03 Dashboard</span>
        </div>
      </header>

      <main className="flex-1 p-4 py-12">
        <div className="max-w-5xl mx-auto">

          <div className="mb-10 text-center">
            <div className="inline-flex nb-eyebrow mb-4">
              <Crown className="w-3.5 h-3.5" />
              Step 2 of 2 — Choose Your Plan
            </div>
            <h1 className="font-black uppercase text-3xl sm:text-4xl text-white leading-tight">
              Start recovering<br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">revenue today</span>
            </h1>
            <p className="mt-3 font-mono text-xs text-[var(--nb-text-muted)] max-w-md mx-auto leading-6">
              All plans include a 14-day trial. Cancel anytime. No credit card required for Base.
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col relative overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-b from-[var(--nb-surface)] to-[var(--nb-surface-2)] border-2 ${plan.borderSelected} ${plan.shadowSelected} scale-[1.02]`
                      : 'bg-gradient-to-b from-[var(--nb-surface)] to-[var(--nb-surface-2)] border-white/15 shadow-skeuo-card hover:shadow-skeuo-card-hover'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className={`border-b px-4 py-1.5 text-center font-mono text-[9px] font-black uppercase tracking-widest ${plan.bgBadge}`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-[var(--nb-recessed)] border border-white/10 shadow-skeuo-inset flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${plan.colorClass}`} />
                      </div>
                      <div>
                        <div className="font-black uppercase text-base text-white">{plan.name}</div>
                        {isSelected && (
                          <div className={`font-mono text-[10px] uppercase tracking-wider font-bold ${plan.colorClass}`}>
                            Selected Plan
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-xl bg-[var(--nb-recessed)] border border-white/5 shadow-skeuo-inset">
                      <div className="flex items-baseline gap-2">
                        <span className={`font-mono text-4xl font-black ${plan.colorClass}`}>
                          {plan.price}
                        </span>
                        <span className="font-mono text-xs text-[var(--nb-text-muted)]">{plan.priceDetail}</span>
                      </div>
                      {plan.billing && (
                        <div className="font-mono text-[10px] text-[var(--nb-text-muted)] mt-1">{plan.billing}</div>
                      )}
                    </div>

                    <p className="font-mono text-[11px] text-[var(--nb-text-muted)] leading-5 mb-5">{plan.description}</p>

                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 font-mono text-[11px] text-slate-200">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.colorClass}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={(e) => { e.stopPropagation(); proceed(plan.id); }}
                      disabled={loading}
                      className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 active:translate-y-0.5 ${
                        isSelected
                          ? plan.id === 'max'
                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-skeuo-green'
                            : 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-skeuo-gold'
                          : 'bg-[var(--nb-recessed)] border border-white/10 text-white shadow-skeuo-card hover:bg-white/5'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {plan.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skip to base */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[var(--nb-recessed)] px-6 py-3.5 font-mono text-xs text-[var(--nb-text-muted)] shadow-skeuo-inset">
              <span>Not sure yet?</span>
              <button
                onClick={() => proceed('base')}
                disabled={loading}
                className="font-black text-amber-400 hover:underline uppercase tracking-wider"
              >
                Skip &amp; continue with Base (Free) →
              </button>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] text-[var(--nb-text-muted)]">
            Upgrade or downgrade at any time · No contracts · All prices include GST
          </p>
        </div>
      </main>
    </div>
  );
}
