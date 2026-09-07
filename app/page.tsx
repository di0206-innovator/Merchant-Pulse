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
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-Time Failure Detection',
    desc: 'Every failed payment event is ingested, verified, deduplicated, and normalized within milliseconds.',
    accent: '#F59E0B',
  },
  {
    icon: Gauge,
    title: 'Deterministic EV Calculus',
    desc: 'Net expected value is computed in integer paise — no floating point drift, no LLM math errors.',
    accent: '#10B981',
  },
  {
    icon: ShieldCheck,
    title: 'Bounded Recovery Strategies',
    desc: 'AI proposes only allowlisted recovery actions. Policy gates enforce amount caps, cooldowns and profitability rules.',
    accent: '#3B82F6',
  },
  {
    icon: Lock,
    title: 'Idempotent Execution',
    desc: 'Payment Link issuance is idempotent. Reconciliation only closes the loop when outcome webhooks arrive.',
    accent: '#EF4444',
  },
];

const PIPELINE = [
  ['01', 'Ingest & Verify',    'payment.failed webhooks are HMAC-verified, deduped, and written to the event ledger.'],
  ['02', 'EV Calculation',     'Recoverable GMV, action cost, customer fatigue penalty and net expected value computed in paise.'],
  ['03', 'Strategy Selection', 'Bounded AI or deterministic fallback selects from an approved action allowlist only.'],
  ['04', 'Policy Gate',        'Amount caps, cooldown windows, evidence sufficiency and profitability thresholds applied.'],
  ['05', 'Execute & Reconcile','Payment links issued idempotently; reconciliation triggered on outcome webhook receipt.'],
];

const PROOF = [
  { icon: CheckCircle2, label: 'Test Coverage',   value: '60+',  detail: 'unit · integration · stress · safety', accent: '#10B981' },
  { icon: Lock,         label: 'Duplicate Links', value: '0',    detail: 'intent state machine guard',            accent: '#EF4444' },
  { icon: ShieldCheck,  label: 'GMV Safety Cap',  value: '₹25k', detail: 'ops escalation above threshold',        accent: '#3B82F6' },
  { icon: BarChart3,    label: 'Event Benchmark', value: '1k+',  detail: 'synthetic held-out evaluation',         accent: '#F59E0B' },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [gmvLakhs, setGmvLakhs] = useState(125);
  const [failRate, setFailRate] = useState(4.5);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.location.replace(`/auth/callback?code=${code}`);
    }
  }, []);

  const gmvInr = gmvLakhs * 100_000;
  const atRisk = gmvInr * (failRate / 100);
  const recovered = atRisk * 0.34;

  return (
    <div className="min-h-screen bg-nb-bg text-nb-white">

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
            <div
              className="w-9 h-9 rounded-xl border border-amber-300/60 flex items-center justify-center font-mono text-xs font-black text-slate-950 shadow-skeuo-gold"
              style={{
                background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
              }}
            >
              MP
            </div>
            <div>
              <div className="font-black uppercase text-xs tracking-tight text-nb-white drop-shadow-sm flex items-center gap-1.5">
                MerchantPulse
                <span className="skeuo-led-green w-2 h-2" />
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-nb-muted">AI Revenue Recovery</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link href="/overview" className="nb-primary-button text-xs py-2 px-4">
                Open Console
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/auth" className="nb-secondary-button text-xs py-2 px-4">
                  Sign In
                </Link>
                <Link href="/auth" className="nb-primary-button text-xs py-2 px-4">
                  Get Started Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">

          {/* Left Console Deck */}
          <div className="nb-panel p-8 sm:p-10 relative overflow-hidden shadow-skeuo-card-lg">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              <span className="nb-eyebrow">
                <Globe className="w-3.5 h-3.5" />
                AI-Powered Payment Recovery
              </span>
              <span className="nb-chip-green">
                <span className="skeuo-led-green w-2 h-2" />
                Live System Active
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-nb-white leading-[0.95]">
              Stop Losing<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-sm">
                Revenue
              </span><br />
              To Failures.
            </h1>

            <p className="mt-6 font-mono text-sm leading-7 text-nb-muted max-w-lg">
              MerchantPulse detects every failed payment, calculates the exact expected value of recovery, selects a bounded AI strategy, and executes — all with cryptographic proof.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/auth" className="nb-primary-button text-sm px-6 py-3.5">
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth" className="nb-secondary-button text-sm px-6 py-3.5">
                See a Demo
              </Link>
            </div>

            {/* Proof Metrics Strip */}
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PROOF.map(({ icon: Icon, label, value, detail, accent }) => (
                <div
                  key={label}
                  className="rounded-xl border border-nb-stroke/60 p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-skeuo-card"
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
                    <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                  </div>
                  <div className="mt-3 font-mono text-3xl font-black text-nb-white tabular-nums leading-none tracking-tight">
                    {value}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-white">
                    {label}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-nb-muted">
                    {detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Right Console */}
          <div className="nb-panel p-6 sm:p-7 shadow-skeuo-card relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

            <div className="flex items-start justify-between gap-4 border-b border-nb-stroke/50 pb-4 mb-5">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Recovery Pipeline</div>
                <h2 className="mt-1 font-black uppercase text-nb-white text-base">Observe · Decide · Act · Reconcile</h2>
              </div>
              <div className="w-9 h-9 rounded-xl border border-amber-400/40 flex items-center justify-center shadow-skeuo-gold" style={{ background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)' }}>
                <Gauge className="w-5 h-5 text-slate-950" />
              </div>
            </div>

            <div className="space-y-2.5">
              {PIPELINE.map(([num, title, detail]) => (
                <div
                  key={num}
                  className="grid grid-cols-[2.75rem_1fr] gap-3.5 rounded-xl border border-nb-stroke/50 p-3.5 transition-all duration-150 hover:border-amber-400/40 hover:-translate-y-0.5 shadow-skeuo-card"
                  style={{ background: 'linear-gradient(180deg, var(--nb-surface) 0%, var(--nb-surface-2) 100%)' }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/60 font-mono text-xs font-black text-slate-950 shadow-skeuo-gold"
                    style={{ background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)' }}
                  >
                    {num}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-black uppercase tracking-wide text-nb-white">{title}</div>
                    <p className="mt-1 font-mono text-[10px] leading-5 text-nb-muted">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SIMULATOR ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">

          {/* Controls Panel */}
          <div className="nb-panel p-6 sm:p-7 shadow-skeuo-card relative">
            <div className="flex items-center gap-3 border-b border-nb-stroke/50 pb-4 mb-6">
              <div className="w-9 h-9 rounded-xl border border-emerald-400/40 flex items-center justify-center shadow-skeuo-green" style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #10B981 60%, #047857 100%)' }}>
                <TrendingUp className="w-5 h-5 text-slate-950" />
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
                  value={failRate}
                  onChange={e => setFailRate(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>
          </div>

          {/* Gauges Output Panel */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="nb-panel p-6 flex flex-col justify-between shadow-skeuo-card hover:-translate-y-1 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl border border-rose-500/50 flex items-center justify-center shadow-skeuo-badge" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, rgba(239, 68, 68, 0.2) 60%, transparent 100%)' }}>
                <Clock className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="mt-6 font-mono text-4xl font-black text-rose-400 tabular-nums leading-none" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.35)' }}>
                  ₹{(atRisk / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Monthly at Risk</div>
              </div>
            </div>

            <div className="nb-panel p-6 flex flex-col justify-between shadow-skeuo-card hover:-translate-y-1 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl border border-emerald-500/50 flex items-center justify-center shadow-skeuo-badge" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, rgba(16, 185, 129, 0.2) 60%, transparent 100%)' }}>
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="mt-6 font-mono text-4xl font-black text-emerald-400 tabular-nums leading-none" style={{ textShadow: '0 0 10px rgba(16, 185, 129, 0.35)' }}>
                  ₹{(recovered / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-muted">Conservative Recovery</div>
              </div>
            </div>

            <div className="nb-panel p-6 flex flex-col justify-between shadow-skeuo-card hover:-translate-y-1 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl border border-blue-500/50 flex items-center justify-center shadow-skeuo-badge" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, rgba(59, 130, 246, 0.2) 60%, transparent 100%)' }}>
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="mt-6 font-mono text-4xl font-black text-blue-400 tabular-nums leading-none" style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.35)' }}>
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
                  className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4 shadow-skeuo-badge group-hover:scale-105 transition-transform"
                  style={{
                    borderColor: `${accent}60`,
                    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, ${accent}25 60%, ${accent}08 100%)`,
                    boxShadow: `0 0 12px ${accent}30`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div className="font-mono text-xs font-black uppercase tracking-wide text-nb-white mb-2">{title}</div>
                <p className="font-mono text-[11px] leading-5 text-nb-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div
          className="nb-panel p-8 sm:p-12 text-center relative overflow-hidden shadow-skeuo-card-lg"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 95%, #F59E0B) 0%, var(--nb-surface) 100%)',
          }}
        >
          <div className="nb-eyebrow mx-auto w-fit mb-6">
            Start recovering revenue today
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-nb-white leading-tight mb-4">
            Your first <span className="text-amber-400">₹1 recovered</span><br />is on us.
          </h2>
          <p className="font-mono text-xs text-nb-muted max-w-md mx-auto mb-8 leading-6">
            Get started in under 2 minutes. No credit card required for the Base plan. Upgrade when you&apos;re ready.
          </p>
          <Link href="/auth" className="nb-primary-button inline-flex mx-auto text-sm px-8 py-4">
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 font-mono text-[10px] text-nb-muted">
            Base plan free forever · No contracts · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-nb-stroke/50 px-4 sm:px-6 py-6" style={{ background: 'var(--nb-surface)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg border border-amber-300/60 flex items-center justify-center font-mono text-[10px] font-black text-slate-950 shadow-skeuo-gold"
              style={{
                background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
              }}
            >
              MP
            </div>
            <span className="font-mono text-[10px] text-nb-muted">MerchantPulse · AI Revenue Recovery</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-nb-muted">
            <span className="cursor-pointer hover:text-nb-white transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-nb-white transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-nb-white transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
