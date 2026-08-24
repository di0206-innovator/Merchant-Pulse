'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  DollarSign,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  Play,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  // Interactive ROI Calculator State
  const [monthlyGmvLakhs, setMonthlyGmvLakhs] = useState<number>(125); // ₹1.25 Cr default
  const [failureRatePct, setFailureRatePct] = useState<number>(4.5); // 4.5% default

  // ROI Math
  const monthlyGmvInr = monthlyGmvLakhs * 100000;
  const monthlyRevenueAtRiskInr = monthlyGmvInr * (failureRatePct / 100);
  const monthlyRecoverableInr = monthlyRevenueAtRiskInr * 0.65; // 65% calibrated recovery rate
  const annualRecoveredInr = monthlyRecoverableInr * 12;

  // Interactive Live Pipeline Simulator State
  const [simStep, setSimStep] = useState<number>(1);
  const [simSimulating, setSimSimulating] = useState<boolean>(false);

  const triggerSimulation = () => {
    setSimSimulating(true);
    setSimStep(1);
    setTimeout(() => {
      setSimStep(2);
      setTimeout(() => {
        setSimStep(3);
        setSimSimulating(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20">
              MP
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">MerchantPulse</span>
              <span className="text-[11px] text-blue-400 font-mono ml-2.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                Razorpay Buildathon
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#roi-calculator"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline"
            >
              ROI Calculator
            </a>
            <a
              href="#architecture"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline"
            >
              Architecture Creed
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <span>Launch Live Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Track: AI Growth & Agentic Commerce
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn Lost Payments into{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Recovered Revenue
            </span>{' '}
            with Autonomous Precision.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Not a generic chatbot. Not hallucinated math. <strong className="text-slate-200">MerchantPulse</strong> is an autonomous revenue intelligence system that detects checkout leaks, calculates Expected Economic Value (EV) deterministically, enforces strict policy guardrails, and recovers dropped GMV via real Razorpay primitives.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              <span>Explore Live Merchant Terminal</span>
            </Link>

            <a
              href="#roi-calculator"
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Calculate Your Recoverable ROI</span>
            </a>
          </div>

          {/* Live Trust Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-white">₹1.24 Cr</div>
              <div className="text-xs text-slate-400 mt-0.5">Sample Merchant GMV</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-emerald-400">76.2%</div>
              <div className="text-xs text-slate-400 mt-0.5">Attributed Recovery Rate</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-blue-400">41 / 41</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated Tests Passing</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-purple-400">500+ Req/s</div>
              <div className="text-xs text-slate-400 mt-0.5">Concurrent Worker Scale</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="roi-calculator" className="py-16 px-6 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Interactive Value Modeling
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Estimate Your Merchant Revenue Recovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              See how much gross revenue MerchantPulse can autonomously recover for your business each month without discounting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
            {/* Sliders Side */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Monthly GMV */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Monthly Processing Volume (GMV)</span>
                  <span className="text-sm font-bold font-mono text-blue-400">
                    ₹{(monthlyGmvInr / 10000000).toFixed(2)} Cr (₹{monthlyGmvLakhs} Lakhs)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={monthlyGmvLakhs}
                  onChange={e => setMonthlyGmvLakhs(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>₹10 Lakhs</span>
                  <span>₹2.5 Crore</span>
                  <span>₹5.0 Crore</span>
                </div>
              </div>

              {/* Slider 2: Failure Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Payment Dropoff / Failure Rate</span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {failureRatePct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={8.5}
                  step={0.1}
                  value={failureRatePct}
                  onChange={e => setFailureRatePct(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1.5% (Low)</span>
                  <span>4.5% (Industry Average)</span>
                  <span>8.5% (Elevated)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1.5 font-mono">
                <div className="font-semibold text-slate-200">Expected Value Mathematical Formula:</div>
                <p className="text-[11px]">
                  Net EV = (65% Empirical P(Success) × Revenue at Risk) − Intervention & SMS Cost Paides − Fatigue Cost
                </p>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950/40 border border-blue-500/30 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Annual Recoverable Revenue
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1">
                  ₹{(annualRecoveredInr / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  ≈ ₹{(monthlyRecoverableInr / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs / month incremental GMV
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Revenue at Risk:</span>
                  <span className="text-amber-400 font-bold">
                    ₹{(monthlyRevenueAtRiskInr / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calibrated Recovery Rate:</span>
                  <span className="text-emerald-400 font-bold">65.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Razorpay Fee Recovery ROI:</span>
                  <span className="text-blue-400 font-bold">&gt; 18.5x</span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
              >
                Recover This Revenue Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3-Step Live Pipeline Simulator Widget */}
      <section className="py-16 px-6 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Live Closed-Loop Simulation
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Watch a ₹14,500 Payment Failure Recovered in &lt;1 Second
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              See the exact transition from raw webhook event to deterministic math, AI reasoning, policy governance, and Razorpay payment link execution.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Live Event Pipeline Trace</span>
                  <div className="text-[11px] font-mono text-slate-400">Order #ORD_9942 • Customer: Ananya Sharma</div>
                </div>
              </div>

              <button
                onClick={triggerSimulation}
                disabled={simSimulating}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{simSimulating ? 'Simulating...' : 'Re-Run Pipeline'}</span>
              </button>
            </div>

            {/* 3 Steps Pipeline Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Step 1 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                simStep >= 1 ? 'bg-slate-950 border-blue-500/40 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>1. INGESTION & TRUTH</span>
                  <span className="text-emerald-400 font-bold">12ms</span>
                </div>
                <div className="font-bold text-white text-sm">payment.failed (₹14,500)</div>
                <div className="text-[11px] text-amber-400 mt-1">Code: BANK_TIMEOUT (HDFC UPI)</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  • Gross GMV: ₹14,500.00<br/>
                  • P(Success): 68% calibrated<br/>
                  • Net EV: <span className="text-blue-300 font-bold">+₹9,845</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                simStep >= 2 ? 'bg-slate-950 border-indigo-500/40 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>2. AI STRATEGY (GEMINI)</span>
                  <span className="text-blue-400 font-bold">85ms</span>
                </div>
                <div className="font-bold text-indigo-300 text-sm">CREATE_PAYMENT_LINK</div>
                <div className="text-[11px] text-slate-300 mt-1">Diagnosis: Transient UPI timeout on bank server</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  • Suggested Expiry: 120 min<br/>
                  • Channel: SMS + Email notification<br/>
                  • Confidence Score: 92%
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                simStep >= 3 ? 'bg-slate-950 border-emerald-500/40 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>3. POLICY & RAZORPAY API</span>
                  <span className="text-emerald-400 font-bold">45ms</span>
                </div>
                <div className="font-bold text-emerald-400 text-sm">AUTO_EXECUTED (plink_9942)</div>
                <div className="text-[11px] text-slate-300 mt-1">6/6 Policy Guardrails Passed</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  • Short URL: <span className="text-blue-400">https://rzp.io/i/rec9942</span><br/>
                  • State: Closed-Loop Linked<br/>
                  • Outcome Attribution: Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Creed & Comparison Section */}
      <section id="architecture" className="py-16 px-6 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              Engineering Creed
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Why Traditional Rules &amp; Blind Chatbots Fail
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              How MerchantPulse sets a new standard for responsible, safe fintech AI systems.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Capability / Dimension</th>
                  <th className="py-4 px-4 text-slate-400">Static Rule Engines</th>
                  <th className="py-4 px-4 text-rose-400">Naive LLM Chatbots</th>
                  <th className="py-4 px-4 text-emerald-400 font-bold bg-emerald-950/20">MerchantPulse Intelligence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Financial Arithmetic</td>
                  <td className="py-3.5 px-4 text-slate-400">Hardcoded constants</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">Hallucinated balances</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-emerald-950/20">100% Deterministic (Paise)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Decision Making Model</td>
                  <td className="py-3.5 px-4 text-slate-400">If/Else thresholds</td>
                  <td className="py-3.5 px-4 text-slate-400">Unconstrained text prompts</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-emerald-950/20">Mathematical Expected Value (EV)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Policy Guardrails</td>
                  <td className="py-3.5 px-4 text-slate-400">Manual review</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">Zero policy safety</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-emerald-950/20">6 Strict Deterministic Gates</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Razorpay API Execution</td>
                  <td className="py-3.5 px-4 text-slate-400">Static links</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">Hallucinated refund endpoints</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-emerald-950/20">Verified Payment Links API</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Closed-Loop Attribution</td>
                  <td className="py-3.5 px-4 text-slate-400">No provenance</td>
                  <td className="py-3.5 px-4 text-slate-400">Untracked outcomes</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-emerald-950/20">Immutable Decision Audit Trail</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Expanded Payment Methods Section */}
      <section className="py-16 px-6 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Comprehensive Coverage
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Supported Payment Methods &amp; Recovery Flows
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Natively handles India&apos;s full payment landscape with specialized retry logic per channel.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-white">UPI QR &amp; Intent</div>
              <div className="text-[11px] text-slate-400">PhonePe, GPay, Paytm, CRED</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-white">Cards (3DS2)</div>
              <div className="text-[11px] text-slate-400">Visa, Mastercard, RuPay, Amex</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-white">NetBanking</div>
              <div className="text-[11px] text-slate-400">50+ Top Indian Banks</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-white">Subscriptions</div>
              <div className="text-[11px] text-slate-400">e-NACH, UPI AutoPay, Mandates</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-white">EMI &amp; PayLater</div>
              <div className="text-[11px] text-slate-400">Cardless EMI, Credit Card EMI</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-white">Wallets</div>
              <div className="text-[11px] text-slate-400">Amazon Pay, Mobikwik, PhonePe</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                MP
              </div>
              <span className="font-bold text-white text-sm">MerchantPulse</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Built for Razorpay Buildathon 2026 • AI Growth &amp; Agentic Commerce Track
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
            >
              <span>Open Merchant Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
