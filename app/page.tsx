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

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-Time Failure Detection',
    desc: 'Every failed payment event is ingested, verified, deduplicated, and normalized within milliseconds.',
    accent: '#FFE500',
  },
  {
    icon: Gauge,
    title: 'Deterministic EV Calculus',
    desc: 'Net expected value is computed in integer paise — no floating point drift, no LLM math errors.',
    accent: '#00FF94',
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
    accent: '#FF3B3B',
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
  { icon: CheckCircle2, label: 'Test Coverage',   value: '60+',  detail: 'unit · integration · stress · safety', accent: '#00FF94' },
  { icon: Lock,         label: 'Duplicate Links', value: '0',    detail: 'intent state machine guard',            accent: '#FF3B3B' },
  { icon: ShieldCheck,  label: 'GMV Safety Cap',  value: '₹25k', detail: 'ops escalation above threshold',        accent: '#3B82F6' },
  { icon: BarChart3,    label: 'Event Benchmark', value: '1k+',  detail: 'synthetic held-out evaluation',         accent: '#FFE500' },
];

export default function LandingPage() {
  const router = useRouter();
  const [gmvLakhs, setGmvLakhs] = useState(125);
  const [failRate, setFailRate] = useState(4.5);

  const gmvInr = gmvLakhs * 100_000;
  const atRisk = gmvInr * (failRate / 100);
  const recovered = atRisk * 0.34;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">

      {/* ── NAV ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b-2 border-white/10 bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-white bg-[#FFE500] flex items-center justify-center font-mono text-xs font-black text-black">
              MP
            </div>
            <div>
              <div className="font-black uppercase text-xs tracking-tight text-white">MerchantPulse</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#888888]">AI Revenue Recovery</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth" className="nb-secondary-button text-xs py-2 px-4">
              Sign In
            </Link>
            <Link href="/auth" className="nb-primary-button text-xs py-2 px-4">
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">

          {/* Left */}
          <div className="bg-[#111111] border-2 border-white p-8" style={{ boxShadow: '6px 6px 0 #FFE500' }}>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="nb-eyebrow">
                <Globe className="w-3.5 h-3.5" />
                AI-Powered Payment Recovery
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-[#00FF94] bg-[#00FF94]/10 px-3 py-1 font-mono text-[10px] font-bold text-[#00FF94]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-flicker" />
                Live System
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.92]">
              Stop Losing<br />
              <span className="text-[#FFE500]">Revenue</span><br />
              To Failures.
            </h1>

            <p className="mt-6 font-mono text-sm leading-7 text-[#888888] max-w-lg">
              MerchantPulse detects every failed payment, calculates the exact expected value of recovery, selects a bounded AI strategy, and executes — all with cryptographic proof.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth" className="nb-primary-button">
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth" className="nb-secondary-button">
                See a Demo
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PROOF.map(({ icon: Icon, label, value, detail, accent }) => (
                <div
                  key={label}
                  className="border-2 border-white bg-[#0A0A0A] p-4 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
                  style={{ boxShadow: `3px 3px 0 ${accent}` }}
                >
                  <Icon className="w-4 h-4" style={{ color: accent }} />
                  <div className="mt-3 font-mono text-3xl font-black text-white tabular-nums leading-none">{value}</div>
                  <div className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{label}</div>
                  <div className="mt-1 font-mono text-[10px] text-[#888888]">{detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline right */}
          <div className="bg-[#111111] border-2 border-white p-6" style={{ boxShadow: '4px 4px 0 #fff' }}>
            <div className="flex items-start justify-between gap-4 border-b-2 border-white/10 pb-4 mb-5">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">Recovery Pipeline</div>
                <h2 className="mt-1 font-black uppercase text-white">Observe · Decide · Act · Reconcile</h2>
              </div>
              <Gauge className="w-5 h-5 shrink-0 text-[#FFE500]" />
            </div>

            <div className="space-y-2">
              {PIPELINE.map(([num, title, detail]) => (
                <div
                  key={num}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 border-2 border-white/10 bg-[#0A0A0A] p-3 transition-all hover:border-[#FFE500]/40 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(255,229,0,0.3)]"
                >
                  <div className="flex h-9 w-9 items-center justify-center border-2 border-[#FFE500] bg-[#FFE500]/10 font-mono text-xs font-black text-[#FFE500]">
                    {num}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-black uppercase tracking-wide text-white">{title}</div>
                    <p className="mt-1 font-mono text-[10px] leading-5 text-[#888888]">{detail}</p>
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

          <div className="bg-[#111111] border-2 border-white p-6" style={{ boxShadow: '4px 4px 0 #00FF94' }}>
            <div className="flex items-center gap-3 border-b-2 border-white/10 pb-4 mb-5">
              <TrendingUp className="w-5 h-5 text-[#00FF94]" />
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">Interactive</div>
                <h2 className="font-black uppercase text-white">Revenue Recovery Estimator</h2>
              </div>
            </div>

            <div className="space-y-6">
              <label className="block">
                <div className="nb-label">Monthly GMV</div>
                <div className="mb-2 flex justify-between">
                  <span className="font-mono text-xs text-[#888888]">Gross Merchandise Value</span>
                  <strong className="font-mono text-sm font-black text-[#FFE500]">₹{(gmvLakhs / 100).toFixed(2)} Cr</strong>
                </div>
                <input type="range" min="10" max="500" step="5" value={gmvLakhs}
                  onChange={e => setGmvLakhs(Number(e.target.value))} className="w-full" />
              </label>

              <label className="block">
                <div className="nb-label">Failure / Drop-off Rate</div>
                <div className="mb-2 flex justify-between">
                  <span className="font-mono text-xs text-[#888888]">Payment failure rate</span>
                  <strong className="font-mono text-sm font-black text-[#FF3B3B]">{failRate}%</strong>
                </div>
                <input type="range" min="1" max="12" step="0.5" value={failRate}
                  onChange={e => setFailRate(Number(e.target.value))} className="w-full" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-[#111111] border-2 border-white p-5 flex flex-col justify-between" style={{ boxShadow: '4px 4px 0 #FF3B3B' }}>
              <Clock className="w-5 h-5 text-[#FF3B3B]" />
              <div>
                <div className="mt-4 font-mono text-4xl font-black text-white tabular-nums leading-none">
                  ₹{(atRisk / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">Monthly at Risk</div>
              </div>
            </div>
            <div className="bg-[#111111] border-2 border-white p-5 flex flex-col justify-between" style={{ boxShadow: '4px 4px 0 #00FF94' }}>
              <Zap className="w-5 h-5 text-[#00FF94]" />
              <div>
                <div className="mt-4 font-mono text-4xl font-black text-[#00FF94] tabular-nums leading-none">
                  ₹{(recovered / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">Conservative Recovery</div>
              </div>
            </div>
            <div className="bg-[#111111] border-2 border-white p-5 flex flex-col justify-between" style={{ boxShadow: '4px 4px 0 #3B82F6' }}>
              <Database className="w-5 h-5 text-[#3B82F6]" />
              <div>
                <div className="mt-4 font-mono text-4xl font-black text-white tabular-nums leading-none">
                  ₹{((recovered * 12) / 100_000).toFixed(2)}L
                </div>
                <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">Annualised Signal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="border-2 border-white bg-[#111111] p-6 sm:p-8" style={{ boxShadow: '6px 6px 0 #fff' }}>
          <div className="mb-8 border-b-2 border-white/10 pb-5">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">Platform Capabilities</div>
            <h2 className="mt-1 text-2xl font-black uppercase text-white">Built for precision. Built to recover.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="border-2 border-white/10 bg-[#0A0A0A] p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ '--accent': accent } as React.CSSProperties}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 0 ${accent}`;
                  (e.currentTarget as HTMLElement).style.borderColor = accent;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div className="w-10 h-10 border-2 flex items-center justify-center mb-4" style={{ borderColor: accent, backgroundColor: `${accent}15` }}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div className="font-mono text-xs font-black uppercase tracking-wide text-white mb-2">{title}</div>
                <p className="font-mono text-[11px] leading-5 text-[#888888]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="border-2 border-[#FFE500] bg-[#FFE500]/5 p-8 sm:p-12 text-center" style={{ boxShadow: '8px 8px 0 #FFE500' }}>
          <div className="nb-eyebrow mx-auto w-fit mb-6">
            Start recovering revenue today
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight mb-4">
            Your first <span className="text-[#FFE500]">₹1 recovered</span><br />is on us.
          </h2>
          <p className="font-mono text-xs text-[#888888] max-w-md mx-auto mb-8 leading-6">
            Get started in under 2 minutes. No credit card required for the Base plan. Upgrade when you&apos;re ready.
          </p>
          <Link href="/auth" className="nb-primary-button inline-flex mx-auto text-sm px-8 py-4">
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 font-mono text-[10px] text-[#888888]">
            Base plan free forever · No contracts · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t-2 border-white/10 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border-2 border-white bg-[#FFE500] flex items-center justify-center font-mono text-[10px] font-black text-black">MP</div>
            <span className="font-mono text-[10px] text-[#888888]">MerchantPulse · AI Revenue Recovery</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-[#888888]">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-white transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
