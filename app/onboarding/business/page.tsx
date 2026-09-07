'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Globe, Phone, TrendingUp, ChevronRight } from 'lucide-react';

const BUSINESS_TYPES = [
  'E-Commerce', 'SaaS / Software', 'Retail', 'Food & Beverage',
  'Education', 'Healthcare', 'Travel & Hospitality', 'Other',
];

const GMV_RANGES = [
  'Under ₹10L / month',
  '₹10L – ₹50L / month',
  '₹50L – ₹5Cr / month',
  'Above ₹5Cr / month',
];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    website: '',
    monthlyGmv: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [razorpayConnected, setRazorpayConnected] = useState(true);

  const set = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const applyTemplate = (name: string, type: string, gmv: string, site: string) => {
    setForm({
      businessName: name,
      businessType: type,
      website: site,
      monthlyGmv: gmv,
      phone: '+91 98765 43210',
    });
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.businessType) e.businessType = 'Select your business type';
    if (!form.monthlyGmv) e.monthlyGmv = 'Select your GMV range';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    // Store in sessionStorage for the plan page to pick up
    try {
      sessionStorage.setItem('mp_biz', JSON.stringify({ ...form, razorpayConnected }));
    } catch {}

    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding/plan');
    }, 400);
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

        {/* Steps indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 px-3 py-1.5 font-black shadow-skeuo-gold">01 Business</span>
          <ChevronRight className="w-3 h-3 text-[var(--nb-text-muted)]" />
          <span className="rounded-lg border border-white/15 bg-[var(--nb-recessed)] text-[var(--nb-text-muted)] px-3 py-1.5 shadow-skeuo-inset">02 Plan</span>
          <ChevronRight className="w-3 h-3 text-[var(--nb-text-muted)]" />
          <span className="rounded-lg border border-white/15 bg-[var(--nb-recessed)] text-[var(--nb-text-muted)] px-3 py-1.5 shadow-skeuo-inset">03 Dashboard</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-4 py-12">
        <div className="w-full max-w-2xl">

          <div className="mb-8">
            <div className="nb-eyebrow mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Step 1 of 2 — Business Setup
            </div>
            <h1 className="font-black uppercase text-3xl sm:text-4xl text-white leading-tight">
              Tell us about<br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">your business</span>
            </h1>
            <p className="mt-3 font-mono text-xs text-[var(--nb-text-muted)] max-w-md leading-6">
              This helps us calibrate your recovery benchmarks and surface the most relevant insights right away.
            </p>

            {/* Quick Templates Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-[var(--nb-text-muted)] uppercase tracking-wider">Quick Fill:</span>
              <button
                type="button"
                onClick={() => applyTemplate('Zomato Delivery Pvt', 'Food & Beverage', '₹50L – ₹5Cr / month', 'https://zomato.com')}
                className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-[var(--nb-recessed)] text-amber-400 font-mono text-[10px] hover:border-amber-400/80 shadow-skeuo-card active:translate-y-0.5 transition-all"
              >
                Food &amp; Delivery
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Nykaa Beauty Trends', 'E-Commerce', '₹50L – ₹5Cr / month', 'https://nykaa.com')}
                className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-[var(--nb-recessed)] text-blue-400 font-mono text-[10px] hover:border-blue-400/80 shadow-skeuo-card active:translate-y-0.5 transition-all"
              >
                D2C E-Commerce
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Postman SaaS Hub', 'SaaS / Software', 'Above ₹5Cr / month', 'https://postman.com')}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-[var(--nb-recessed)] text-emerald-400 font-mono text-[10px] hover:border-emerald-400/80 shadow-skeuo-card active:translate-y-0.5 transition-all"
              >
                B2B SaaS
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Business name */}
            <div className="nb-panel p-6 space-y-3">
              <label className="nb-label text-xs text-white">Business / Brand Name *</label>
              <input
                type="text"
                placeholder="Acme Pvt. Ltd."
                value={form.businessName}
                onChange={e => set('businessName', e.target.value)}
                className={`nb-input ${errors.businessName ? 'border-rose-500' : ''}`}
              />
              {errors.businessName && (
                <p className="mt-1.5 font-mono text-[10px] text-rose-400">{errors.businessName}</p>
              )}
            </div>

            {/* Business type */}
            <div className="nb-panel p-6 space-y-3">
              <label className="nb-label text-xs text-white">Business Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set('businessType', type)}
                    className={`rounded-xl px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 text-center ${
                      form.businessType === type
                        ? 'border border-blue-500/60 bg-blue-500/15 text-blue-400 shadow-skeuo-blue font-black'
                        : 'border border-white/10 bg-[var(--nb-recessed)] text-[var(--nb-text-muted)] hover:border-white/25 hover:text-white shadow-skeuo-card'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.businessType && (
                <p className="mt-2 font-mono text-[10px] text-rose-400">{errors.businessType}</p>
              )}
            </div>

            {/* Monthly GMV */}
            <div className="nb-panel p-6 space-y-3">
              <label className="nb-label text-xs text-white">Estimated Monthly GMV *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {GMV_RANGES.map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => set('monthlyGmv', range)}
                    className={`rounded-xl px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-150 text-left flex items-center gap-2.5 ${
                      form.monthlyGmv === range
                        ? 'border border-emerald-500/60 bg-emerald-500/15 text-emerald-400 shadow-skeuo-green font-black'
                        : 'border border-white/10 bg-[var(--nb-recessed)] text-[var(--nb-text-muted)] hover:border-white/25 hover:text-white shadow-skeuo-card'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    {range}
                  </button>
                ))}
              </div>
              {errors.monthlyGmv && (
                <p className="mt-2 font-mono text-[10px] text-rose-400">{errors.monthlyGmv}</p>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="nb-label">Website (optional)</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[var(--nb-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://yoursite.com"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    className="nb-input pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="nb-label">Phone (optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--nb-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className="nb-input pl-10"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="nb-primary-button w-full mt-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <ArrowRight className="w-4 h-4" />
              }
              <span>{loading ? 'Saving...' : 'Continue to Plan Selection'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
