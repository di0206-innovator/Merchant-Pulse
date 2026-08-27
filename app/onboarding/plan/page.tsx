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
    accent: '#888888',
    shadow: '4px 4px 0 #888888',
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
    accent: '#FFE500',
    shadow: '4px 4px 0 #FFE500',
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
    accent: '#00FF94',
    shadow: '4px 4px 0 #00FF94',
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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* Progress header */}
      <header className="border-b-2 border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-white bg-[#FFE500] flex items-center justify-center font-mono text-xs font-black text-black">
            MP
          </div>
          <span className="font-black uppercase text-sm tracking-tight text-white">MerchantPulse</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="border-2 border-white/20 text-[#888888] px-2.5 py-1">01 Business</span>
          <ChevronRight className="w-3 h-3 text-[#888888]" />
          <span className="border-2 border-[#FFE500] bg-[#FFE500] text-black px-2.5 py-1 font-black">02 Plan</span>
          <ChevronRight className="w-3 h-3 text-[#888888]" />
          <span className="border-2 border-white/20 text-[#888888] px-2.5 py-1">03 Dashboard</span>
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
              <span className="text-[#FFE500]">revenue today</span>
            </h1>
            <p className="mt-3 font-mono text-xs text-[#888888] max-w-md mx-auto leading-6">
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
                  className="bg-[#111111] border-2 cursor-pointer transition-all duration-100 flex flex-col"
                  style={{
                    borderColor: isSelected ? plan.accent : 'rgba(255,255,255,0.15)',
                    boxShadow: isSelected ? plan.shadow : 'none',
                    transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="border-b-2 px-4 py-1.5 text-center font-mono text-[9px] font-black uppercase tracking-widest"
                      style={{ borderColor: plan.accent, color: plan.accent, backgroundColor: `${plan.accent}15` }}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 border-2 flex items-center justify-center"
                        style={{ borderColor: plan.accent, backgroundColor: `${plan.accent}15` }}>
                        <Icon className="w-5 h-5" style={{ color: plan.accent }} />
                      </div>
                      <div>
                        <div className="font-black uppercase text-sm text-white">{plan.name}</div>
                        {isSelected && (
                          <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: plan.accent }}>
                            Selected
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="font-mono text-4xl font-black" style={{ color: plan.accent }}>
                        {plan.price}
                      </span>
                      <span className="font-mono text-sm text-[#888888] ml-2">{plan.priceDetail}</span>
                      {plan.billing && (
                        <div className="font-mono text-[10px] text-[#888888] mt-1">{plan.billing}</div>
                      )}
                    </div>

                    <p className="font-mono text-[11px] text-[#888888] leading-5 mb-5">{plan.description}</p>

                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 font-mono text-[11px] text-[#F5F5F5]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={(e) => { e.stopPropagation(); proceed(plan.id); }}
                      disabled={loading}
                      className="w-full border-2 py-3 font-mono text-[11px] font-black uppercase tracking-widest transition-all duration-100 flex items-center justify-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5"
                      style={{
                        borderColor: plan.accent,
                        color: isSelected ? '#000' : plan.accent,
                        backgroundColor: isSelected ? plan.accent : 'transparent',
                        boxShadow: isSelected ? `3px 3px 0 ${plan.accent === '#888888' ? '#fff' : plan.accent}` : 'none',
                      }}
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
            <div className="inline-flex items-center gap-3 border-2 border-dashed border-white/20 px-6 py-4 font-mono text-xs text-[#888888]">
              <span>Not sure yet?</span>
              <button
                onClick={() => proceed('base')}
                disabled={loading}
                className="font-black text-[#FFE500] hover:underline uppercase tracking-wide"
              >
                Skip &amp; continue with Base (Free) →
              </button>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] text-[#888888]">
            Upgrade or downgrade at any time · No contracts · All prices include GST
          </p>
        </div>
      </main>
    </div>
  );
}
