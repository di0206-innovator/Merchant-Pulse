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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* Progress header */}
      <header className="border-b-2 border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-white bg-[#FFE500] flex items-center justify-center font-mono text-xs font-black text-black">
            MP
          </div>
          <span className="font-black uppercase text-sm tracking-tight text-white">MerchantPulse</span>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="border-2 border-[#FFE500] bg-[#FFE500] text-black px-2.5 py-1 font-black">01 Business</span>
          <ChevronRight className="w-3 h-3 text-[#888888]" />
          <span className="border-2 border-white/20 text-[#888888] px-2.5 py-1">02 Plan</span>
          <ChevronRight className="w-3 h-3 text-[#888888]" />
          <span className="border-2 border-white/20 text-[#888888] px-2.5 py-1">03 Dashboard</span>
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
              <span className="text-[#FFE500]">your business</span>
            </h1>
            <p className="mt-3 font-mono text-xs text-[#888888] max-w-md leading-6">
              This helps us calibrate your recovery benchmarks and surface the most relevant insights right away.
            </p>

            {/* Quick Templates Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">Quick Fill:</span>
              <button
                type="button"
                onClick={() => applyTemplate('Zomato Delivery Pvt', 'Food & Beverage', '₹50L – ₹5Cr / month', 'https://zomato.com')}
                className="px-2.5 py-1 border border-[#FFE500]/60 bg-[#FFE500]/10 text-[#FFE500] font-mono text-[10px] hover:bg-[#FFE500] hover:text-black transition-all"
              >
                Food &amp; Delivery
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Nykaa Beauty Trends', 'E-Commerce', '₹50L – ₹5Cr / month', 'https://nykaa.com')}
                className="px-2.5 py-1 border border-[#3B82F6]/60 bg-[#3B82F6]/10 text-[#3B82F6] font-mono text-[10px] hover:bg-[#3B82F6] hover:text-black transition-all"
              >
                D2C E-Commerce
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Postman SaaS Hub', 'SaaS / Software', 'Above ₹5Cr / month', 'https://postman.com')}
                className="px-2.5 py-1 border border-[#00FF94]/60 bg-[#00FF94]/10 text-[#00FF94] font-mono text-[10px] hover:bg-[#00FF94] hover:text-black transition-all"
              >
                B2B SaaS
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Business name */}
            <div className="bg-[#111111] border-2 border-white p-6" style={{ boxShadow: '4px 4px 0 #FFE500' }}>
              <label className="nb-label">Business / Brand Name *</label>
              <input
                type="text"
                placeholder="Acme Pvt. Ltd."
                value={form.businessName}
                onChange={e => set('businessName', e.target.value)}
                className={`nb-input ${errors.businessName ? 'border-[#FF3B3B]' : ''}`}
              />
              {errors.businessName && (
                <p className="mt-1.5 font-mono text-[10px] text-[#FF3B3B]">{errors.businessName}</p>
              )}
            </div>

            {/* Business type */}
            <div className="bg-[#111111] border-2 border-white p-6" style={{ boxShadow: '4px 4px 0 #3B82F6' }}>
              <label className="nb-label">Business Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set('businessType', type)}
                    className={`border-2 px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-all duration-100 text-center ${
                      form.businessType === type
                        ? 'border-[#3B82F6] bg-[#3B82F6]/20 text-[#3B82F6]'
                        : 'border-white/20 text-[#888888] hover:border-white hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.businessType && (
                <p className="mt-2 font-mono text-[10px] text-[#FF3B3B]">{errors.businessType}</p>
              )}
            </div>

            {/* Monthly GMV */}
            <div className="bg-[#111111] border-2 border-white p-6" style={{ boxShadow: '4px 4px 0 #00FF94' }}>
              <label className="nb-label">Estimated Monthly GMV *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {GMV_RANGES.map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => set('monthlyGmv', range)}
                    className={`border-2 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide transition-all duration-100 text-left flex items-center gap-2 ${
                      form.monthlyGmv === range
                        ? 'border-[#00FF94] bg-[#00FF94]/10 text-[#00FF94]'
                        : 'border-white/20 text-[#888888] hover:border-white hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    {range}
                  </button>
                ))}
              </div>
              {errors.monthlyGmv && (
                <p className="mt-2 font-mono text-[10px] text-[#FF3B3B]">{errors.monthlyGmv}</p>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="nb-label">Website (optional)</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
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
                  <Phone className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
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
              className="nb-primary-button w-full"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
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
