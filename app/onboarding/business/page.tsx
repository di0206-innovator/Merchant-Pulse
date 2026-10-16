'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOnboarding, Plan } from '@/lib/onboardingContext';
import { sanitizeInput } from '@/lib/cryptoUtils';
import { trackAnalyticsEvent } from '@/lib/env';

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('D2C E-Commerce');
  const [website, setWebsite] = useState('');
  const [monthlyGmv, setMonthlyGmv] = useState('₹50L – ₹5Cr');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = sanitizeInput(businessName, 100);
    const cleanWeb = sanitizeInput(website, 150);
    const cleanPhone = sanitizeInput(phone, 20);

    if (cleanName.length < 2) {
      setError('Please enter a valid business name (at least 2 characters).');
      return;
    }
    if (cleanWeb && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(cleanWeb)) {
      setError('Please enter a valid website URL starting with https:// or http://.');
      return;
    }
    if (!/^\+?[0-9\s-]{8,16}$/.test(cleanPhone)) {
      setError('Please enter a valid business contact phone number.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    completeOnboarding(selectedPlan, {
      businessName: cleanName,
      businessType: sanitizeInput(businessType, 64),
      website: cleanWeb || 'https://merchantpulse.io',
      monthlyGmv: sanitizeInput(monthlyGmv, 64),
      phone: cleanPhone,
    });

    trackAnalyticsEvent('onboarding_completed', {
      plan: selectedPlan,
      businessType,
      monthlyGmv,
    });

    setLoading(false);
    router.push('/thank-you');
  };

  return (
    <main className="min-h-screen bg-nb-bg text-nb-white flex items-center justify-center p-4 sm:p-6 pb-24">
      <div className="w-full max-w-xl nb-panel p-8 sm:p-10 space-y-6 shadow-skeuo-card-lg">
        <div className="flex items-center justify-between border-b border-nb-stroke/50 pb-4">
          <div>
            <span className="nb-eyebrow">Merchant Activation</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              Configure Your Workspace
            </h1>
          </div>
          <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" aria-hidden="true" />
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 font-mono text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs" noValidate>
          <div>
            <label htmlFor="biz-name" className="nb-label">Registered Business Name *</label>
            <input
              id="biz-name"
              type="text"
              required
              placeholder="Acme Retail Pvt. Ltd."
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="nb-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="biz-type" className="nb-label">Industry Segment</label>
              <select
                id="biz-type"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="nb-input"
              >
                <option value="D2C E-Commerce">D2C E-Commerce</option>
                <option value="SaaS & Subscriptions">SaaS &amp; Subscriptions</option>
                <option value="Fintech & EdTech">Fintech &amp; EdTech</option>
                <option value="Marketplace">Marketplace</option>
              </select>
            </div>
            <div>
              <label htmlFor="biz-gmv" className="nb-label">Monthly Razorpay GMV</label>
              <select
                id="biz-gmv"
                value={monthlyGmv}
                onChange={e => setMonthlyGmv(e.target.value)}
                className="nb-input"
              >
                <option value="Up to ₹50L">Up to ₹50L</option>
                <option value="₹50L – ₹5Cr">₹50L – ₹5Cr</option>
                <option value="₹5Cr – ₹25Cr">₹5Cr – ₹25Cr</option>
                <option value="₹25Cr+">₹25Cr+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="biz-web" className="nb-label">Storefront URL</label>
              <input
                id="biz-web"
                type="url"
                placeholder="https://yourstore.in"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="nb-input"
              />
            </div>
            <div>
              <label htmlFor="biz-phone" className="nb-label">Ops Alert Phone *</label>
              <input
                id="biz-phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="nb-input"
              />
            </div>
          </div>

          <div>
            <span className="nb-label">Select Recovery Plan</span>
            <div className="grid grid-cols-3 gap-2.5 mt-1">
              {([
                { id: 'base', label: 'Base', sub: 'Free · <₹5L GMV' },
                { id: 'pro', label: 'Pro', sub: '₹4,999/mo + 1.5%' },
                { id: 'max', label: 'Max', sub: 'Enterprise SLA' },
              ] as const).map(tier => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedPlan(tier.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPlan === tier.id
                      ? 'border-amber-400 bg-amber-500/15 text-white shadow-skeuo-gold'
                      : 'border-white/10 bg-[var(--nb-recessed)] text-nb-muted hover:text-white'
                  }`}
                >
                  <div className="font-black uppercase text-xs flex items-center justify-between">
                    {tier.label}
                    {selectedPlan === tier.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />}
                  </div>
                  <div className="text-[10px] text-nb-muted mt-1">{tier.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="nb-primary-button w-full py-3.5 justify-center">
            <span>{loading ? 'Provisioning Guardrails...' : 'Complete Activation'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="text-center pt-2">
            <Link href="/overview" className="text-[11px] text-nb-muted hover:text-white underline">
              Skip to sandbox console
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
