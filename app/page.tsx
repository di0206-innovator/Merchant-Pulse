'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Gauge,
  Lock,
  ShieldCheck,
  TrendingUp,
  Zap,
  Activity,
  Globe,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { sanitizeInput } from '@/lib/cryptoUtils';
import { trackAnalyticsEvent } from '@/lib/env';

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-Time Failure Detection',
    desc: 'Every failed payment event is ingested, HMAC-verified, deduplicated, and normalized within milliseconds.',
    accent: '#F59E0B',
  },
  {
    icon: Gauge,
    title: 'Deterministic EV Calculus',
    desc: 'Net expected value is computed in integer paise — zero floating-point drift, zero LLM math errors.',
    accent: '#10B981',
  },
  {
    icon: ShieldCheck,
    title: 'Bounded Recovery Strategies',
    desc: 'AI proposes only allowlisted recovery actions. Policy gates enforce amount caps, cooldowns, and profitability.',
    accent: '#3B82F6',
  },
  {
    icon: Lock,
    title: 'Idempotent Execution',
    desc: 'Payment Link issuance is idempotent. Reconciliation closes the loop only when outcome webhooks arrive.',
    accent: '#EF4444',
  },
];

const PIPELINE = [
  ['01', 'Ingest & Verify', 'payment.failed webhooks are HMAC-verified, deduped, and written to the event ledger.'],
  ['02', 'EV Calculation', 'Recoverable GMV, action cost, customer fatigue penalty, and net EV computed in paise.'],
  ['03', 'Strategy Selection', 'Bounded AI or deterministic fallback selects from an approved action allowlist only.'],
  ['04', 'Policy Gate', 'Amount caps, cooldown windows, evidence sufficiency, and profitability thresholds applied.'],
  ['05', 'Execute & Reconcile', 'Payment links issued idempotently; reconciliation triggered on outcome webhook receipt.'],
];

const PROOF = [
  { icon: CheckCircle2, label: 'Test Coverage', value: '90+', detail: 'unit · integration · stress · safety', accent: '#10B981' },
  { icon: Lock, label: 'Duplicate Links', value: '0', detail: 'intent state machine guard', accent: '#EF4444' },
  { icon: ShieldCheck, label: 'GMV Safety Cap', value: '₹25k', detail: 'ops escalation above threshold', accent: '#3B82F6' },
  { icon: BarChart3, label: 'Event Benchmark', value: '1k+', detail: 'synthetic held-out evaluation', accent: '#F59E0B' },
];

const PRICING_TIERS = [
  {
    name: 'Starter Base',
    price: '₹0',
    period: 'forever up to ₹5L at-risk GMV/mo',
    desc: 'For emerging D2C and SaaS teams validating automated payment link recovery.',
    features: [
      'Deterministic EV & Priority Scoring Engine',
      'Standard Razorpay Payment Links Dispatch',
      '24-Hour Customer Fatigue Cooldown Gate',
      '7-Day Cryptographic Audit Ledger Retention',
    ],
    cta: 'Start Free on Base',
    highlighted: false,
  },
  {
    name: 'Growth Pro',
    price: '₹4,999',
    period: '/month + 1.5% attributed recovered GMV',
    desc: 'Full Gemini 2.5 Flash bounded AI reasoning + RAG policy grounding for scaling brands.',
    features: [
      'Gemini 2.5 Flash Bounded AI Strategy + Fallback',
      'Multimodal pgvector RAG Policy Grounding',
      'Custom SMS & Email Recovery Copy Generation',
      'Human-in-the-Loop Reviewer Cockpit & RBAC',
    ],
    cta: 'Start 14-Day Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise Max',
    price: 'Custom',
    period: 'volume SLA & dedicated tenant isolation',
    desc: 'For high-volume marketplaces and fintechs processing ₹25Cr+ monthly GMV.',
    features: [
      'Multi-MID Razorpay Webhook Secret Rotation',
      'Custom Autonomous GMV Caps & Risk Rules',
      'Dedicated Supabase RLS Tenant Isolation',
      '99.95% Uptime SLA & Priority Solutions Engineer',
    ],
    cta: 'Book Architecture Review',
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [gmvLakhs, setGmvLakhs] = useState(125);
  const [failRate, setFailRate] = useState(4.5);

  // Sanitized Lead / Instant Audit Form State (Items 12 & 13: Loading & Form Error States)
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadError, setLeadError] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
    }
  }, []);

  const gmvInr = gmvLakhs * 100_000;
  const atRisk = gmvInr * (failRate / 100);
  const recovered = atRisk * 0.34;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');

    const cleanEmail = sanitizeInput(leadEmail, 254).toLowerCase();
    const cleanCompany = sanitizeInput(leadCompany, 100);

    if (!cleanCompany || cleanCompany.length < 2) {
      setLeadError('Please enter your company or store name (at least 2 characters).');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setLeadError('Please enter a valid work email address.');
      return;
    }

    setLeadLoading(true);
    trackAnalyticsEvent('hero_audit_requested', { emailDomain: cleanEmail.split('@')[1], gmvLakhs });
    await new Promise(r => setTimeout(r, 450));
    setLeadLoading(false);
    router.push('/thank-you');
  };

  return (
    <div className="min-h-screen bg-nb-bg text-nb-white pb-20 md:pb-0">
      {/* ── NAV ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-nb-stroke/60 backdrop-blur-md"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, white) 0%, var(--nb-surface) 100%)',
          boxShadow: 'inset 0 1px 0 var(--nb-bevel), inset 0 -1px 0 var(--nb-rim-shade), 0 4px 14px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="MerchantPulse Emblem"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl shadow-skeuo-gold"
            />
            <div>
              <div className="font-black uppercase text-xs tracking-tight text-nb-white drop-shadow-sm flex items-center gap-1.5">
                MerchantPulse
                <span className="skeuo-led-green w-2 h-2" aria-label="System online" />
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-nb-muted">AI Revenue Recovery</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-nb-muted" aria-label="Marketing Navigation">
            <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
            <a href="#calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/reviewer" className="hover:text-amber-400 transition-colors">Live Sandbox</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link href="/overview" className="nb-primary-button text-xs py-2 px-4">
                Open Console
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link href="/auth" className="nb-secondary-button text-xs py-2 px-3 sm:px-4">
                  Sign In
                </Link>
                <Link href="/auth" className="nb-primary-button text-xs py-2 px-3 sm:px-4">
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO (CTA ABOVE THE FOLD) ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-8 items-start">
          {/* Left Console Deck */}
          <div className="nb-panel p-6 sm:p-10 relative overflow-hidden shadow-skeuo-card-lg">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="nb-eyebrow">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                Built for Razorpay Merchants
              </span>
              <span className="nb-chip-green">
                <span className="skeuo-led-green w-2 h-2" aria-hidden="true" />
                RBI Tokenization Aligned
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-nb-white leading-[0.95]">
              Stop Losing<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-sm">
                Revenue
              </span><br />
              To Failures.
            </h1>

            <p className="mt-5 font-mono text-xs sm:text-sm leading-6 sm:leading-7 text-nb-muted max-w-xl">
              MerchantPulse ingests every failed UPI, Card, and NetBanking webhook, computes exact paise-level Expected Value, selects a bounded AI recovery strategy, and dispatches idempotent Razorpay Payment Links with cryptographic attribution.
            </p>

            {/* Primary CTA Buttons Above the Fold */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/auth" className="nb-primary-button text-xs sm:text-sm px-6 py-3.5">
                <span>Start Free Recovery</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link href="/reviewer" className="nb-secondary-button text-xs sm:text-sm px-6 py-3.5">
                <span>Launch Interactive Demo</span>
              </Link>
            </div>

            {/* Sanitized Instant Recovery Audit Form with Loading & Error States */}
            <form
              onSubmit={handleLeadSubmit}
              className="mt-7 p-4 rounded-2xl border border-nb-stroke/60 bg-[var(--nb-recessed)] shadow-skeuo-inset space-y-3"
              noValidate
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Instant Webhook Sandbox Provisioning
                </span>
                <span className="font-mono text-[10px] text-nb-muted">No credit card required</span>
              </div>

              {leadError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-400 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{leadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5">
                <input
                  type="text"
                  aria-label="Company or Store Name"
                  placeholder="Store / Company Name"
                  value={leadCompany}
                  onChange={e => setLeadCompany(e.target.value)}
                  className="nb-input text-xs py-2.5"
                  required
                />
                <input
                  type="email"
                  aria-label="Work Email Address"
                  placeholder="you@company.in"
                  value={leadEmail}
                  onChange={e => setLeadEmail(e.target.value)}
                  className="nb-input text-xs py-2.5"
                  required
                />
                <button
                  type="submit"
                  disabled={leadLoading}
                  className="nb-primary-button text-xs px-5 py-2.5 whitespace-nowrap justify-center"
                >
                  <span>{leadLoading ? 'Provisioning...' : 'Get Webhook Key'}</span>
                </button>
              </div>
            </form>

            {/* Proof Metrics Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROOF.map(({ icon: Icon, label, value, detail, accent }) => (
                <div
                  key={label}
                  className="rounded-xl border border-nb-stroke/60 p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-skeuo-card"
                  style={{
                    background: 'linear-gradient(180deg, var(--nb-surface-2) 0%, var(--nb-surface) 100%)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg border flex items-center justify-center shadow-skeuo-badge"
                    style={{
                      borderColor: `${accent}60`,
                      background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, ${accent}25 60%, ${accent}10 100%)`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: accent }} aria-hidden="true" />
                  </div>
                  <div className="mt-2.5 font-mono text-2xl sm:text-3xl font-black text-nb-white tabular-nums leading-none">
                    {value}
                  </div>
                  <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-white">
                    {label}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-nb-muted">
                    {detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Right Console */}
          <div id="pipeline" className="nb-panel p-6 sm:p-7 shadow-skeuo-card relative overflow-hidden space-y-5">
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

            <div className="flex items-start justify-between gap-4 border-b border-nb-stroke/50 pb-4">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Closed-Loop Architecture</div>
                <h2 className="mt-1 font-black uppercase text-nb-white text-base">Observe · Decide · Act · Reconcile</h2>
              </div>
              <div className="w-9 h-9 rounded-xl border border-amber-400/40 flex items-center justify-center shadow-skeuo-gold" style={{ background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)' }}>
                <Gauge className="w-5 h-5 text-slate-950" aria-hidden="true" />
              </div>
            </div>

            <img
              src="/og-image.svg"
              alt="MerchantPulse 5-stage autonomous payment recovery architecture diagram"
              width={600}
              height={315}
              loading="lazy"
              className="w-full h-auto rounded-xl border border-nb-stroke/60 shadow-skeuo-inset"
            />

            <div className="space-y-2.5">
              {PIPELINE.map(([num, title, detail]) => (
                <div
                  key={num}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-xl border border-nb-stroke/50 p-3 transition-all duration-150 hover:border-amber-400/40 shadow-skeuo-card"
                  style={{ background: 'linear-gradient(180deg, var(--nb-surface) 0%, var(--nb-surface-2) 100%)' }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/60 font-mono text-xs font-black text-slate-950 shadow-skeuo-gold"
                    style={{ background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)' }}
                  >
                    {num}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-black uppercase tracking-wide text-nb-white">{title}</div>
                    <p className="mt-0.5 font-mono text-[10px] leading-5 text-nb-muted">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SIMULATOR ────────────────────────────────────────── */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div className="nb-panel p-6 sm:p-7 shadow-skeuo-card relative">
            <div className="flex items-center gap-3 border-b border-nb-stroke/50 pb-4 mb-6">
              <div className="w-9 h-9 rounded-xl border border-emerald-400/40 flex items-center justify-center shadow-skeuo-green" style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #10B981 60%, #047857 100%)' }}>
                <TrendingUp className="w-5 h-5 text-slate-950" aria-hidden="true" />
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Interactive Instrument</div>
                <h2 className="font-black uppercase text-nb-white text-base">Revenue Recovery Estimator</h2>
              </div>
            </div>

            <div className="space-y-6">
              <label className="block p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
                <div className="nb-label">Monthly GMV</div>
                <div className="mb-3 flex justify-between items-center">
                  <span className="font-mono text-xs text-nb-muted">Gross Merchandise Value</span>
                  <strong className="font-mono text-sm font-black text-amber-400 tabular-nums">
                    ₹{(gmvLakhs / 100).toFixed(2)} Cr
                  </strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  aria-label="Monthly Gross Merchandise Value in Lakhs"
                  value={gmvLakhs}
                  onChange={e => setGmvLakhs(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <label className="block p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
                <div className="nb-label">Failure / Drop-off Rate</div>
                <div className="mb-3 flex justify-between items-center">
                  <span className="font-mono text-xs text-nb-muted">Payment failure rate</span>
                  <strong className="font-mono text-sm font-black text-rose-400 tabular-nums">
                    {failRate}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  aria-label="Payment failure percentage"
                  value={failRate}
                  onChange={e => setFailRate(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="nb-panel p-6 flex flex-col justify-between shadow-skeuo-card">
              <div className="w-9 h-9 rounded-xl border border-rose-500/50 flex items-center justify-center shadow-skeuo-badge">
                <Clock className="w-5 h-5 text-rose-400" aria-hidden="true" />
              </div>
              <div>
                <div className="mt-6 font-mono text-3xl sm:text-4xl font-black text-rose-400 tabular-nums leading-none">
                  ₹{(atRisk / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Monthly at Risk</div>
              </div>
            </div>

            <div className="nb-panel p-6 flex flex-col justify-between shadow-skeuo-card">
              <div className="w-9 h-9 rounded-xl border border-emerald-500/50 flex items-center justify-center shadow-skeuo-badge">
                <Zap className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <div className="mt-6 font-mono text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums leading-none">
                  ₹{(recovered / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Conservative Recovery</div>
              </div>
            </div>

            <div className="nb-panel p-6 flex flex-col justify-between shadow-skeuo-card">
              <div className="w-9 h-9 rounded-xl border border-blue-500/50 flex items-center justify-center shadow-skeuo-badge">
                <Database className="w-5 h-5 text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <div className="mt-6 font-mono text-3xl sm:text-4xl font-black text-blue-400 tabular-nums leading-none">
                  ₹{((recovered * 12) / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Annualised Signal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="nb-panel p-6 sm:p-8 shadow-skeuo-card-lg relative">
          <div className="mb-8 border-b border-nb-stroke/50 pb-5">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Platform Architecture</div>
            <h2 className="mt-1 text-2xl font-black uppercase text-nb-white">Built for precision. Built to recover.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="rounded-xl border border-nb-stroke/50 p-5 transition-all duration-200 hover:-translate-y-1 shadow-skeuo-card group"
                style={{ background: 'linear-gradient(180deg, var(--nb-surface) 0%, var(--nb-surface-2) 100%)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4 shadow-skeuo-badge"
                  style={{ borderColor: `${accent}60` }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} aria-hidden="true" />
                </div>
                <div className="font-mono text-xs font-black uppercase tracking-wide text-nb-white mb-2">{title}</div>
                <p className="font-mono text-[11px] leading-5 text-nb-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARENT SAAS PRICING ─────────────────────────── */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="nb-panel p-6 sm:p-10 shadow-skeuo-card-lg space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="nb-eyebrow mx-auto w-fit">Aligned Economics</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">
              Pay Only For Verified Recovery
            </h2>
            <p className="font-mono text-xs text-nb-muted">
              Organic customer retries are automatically filtered out by our reconciliation engine and never billed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map(tier => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-6 flex flex-col justify-between space-y-6 ${
                  tier.highlighted
                    ? 'border-amber-400/70 bg-gradient-to-b from-amber-500/15 to-[var(--nb-surface)] shadow-skeuo-gold'
                    : 'border-nb-stroke/60 bg-[var(--nb-recessed)] shadow-skeuo-card'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-white">{tier.name}</span>
                    {tier.highlighted && (
                      <span className="nb-chip-yellow text-[9px]">Most Popular</span>
                    )}
                  </div>
                  <div>
                    <div className="font-mono text-3xl font-black text-amber-400">{tier.price}</div>
                    <div className="font-mono text-[10px] text-nb-muted mt-0.5">{tier.period}</div>
                  </div>
                  <p className="font-mono text-xs text-nb-muted leading-5">{tier.desc}</p>
                  <ul className="space-y-2.5 pt-2 font-mono text-[11px] text-nb-white">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/onboarding/business"
                  className={tier.highlighted ? 'nb-primary-button text-xs py-3 justify-center' : 'nb-secondary-button text-xs py-3 justify-center'}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER WITH REAL CONTACT ADDRESS & LEGAL LINKS ───── */}
      <footer className="border-t border-nb-stroke/60 px-4 sm:px-6 py-10" style={{ background: 'var(--nb-surface)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 font-mono text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="MerchantPulse Footer Logo"
                width={28}
                height={28}
                className="w-7 h-7 rounded-lg"
              />
              <span className="font-black uppercase text-white">MerchantPulse Technologies Pvt. Ltd.</span>
            </div>
            <p className="text-[11px] text-nb-muted leading-5">
              Autonomous payment failure recovery and cryptographic reconciliation engine for Razorpay merchants.
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-nb-muted">
            <div className="font-black uppercase text-white text-xs">Registered Office Address</div>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>4th Floor, Indiqube Orion, 24th Main Rd, HSR Layout Sector 2, Bengaluru, Karnataka 560102, India</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <a href="mailto:security@merchantpulse.io" className="hover:text-white underline">security@merchantpulse.io</a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
              <a href="tel:+918045689200" className="hover:text-white">+91 (80) 4568-9200</a>
            </p>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="font-black uppercase text-white text-xs">Compliance &amp; Navigation</div>
            <div className="grid grid-cols-2 gap-2 text-nb-muted">
              <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link>
              <Link href="/thank-you" className="hover:text-amber-400 transition-colors">Webhook Setup</Link>
              <Link href="/onboarding/business" className="hover:text-amber-400 transition-colors">Onboarding</Link>
              <Link href="/overview" className="hover:text-amber-400 transition-colors">Recovery Console</Link>
              <Link href="/reviewer" className="hover:text-amber-400 transition-colors">Reviewer Cockpit</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
