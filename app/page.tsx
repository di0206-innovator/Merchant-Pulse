'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ExternalLink,
  BarChart3,
  FileCheck2,
  Globe,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';
import { ProfileBar } from '@/components/dashboard/ProfileBar';
import { SettingsDrawer } from '@/components/dashboard/SettingsDrawer';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/supabase/authContext';
import { useTheme } from '@/lib/themeContext';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, profile: currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Parallax Scroll Offset State
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleLaunchTerminal = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] dark:bg-[#070B12] light:bg-[#F8FAFC] text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white relative overflow-hidden transition-colors duration-150">
      {/* Standalone Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#0A0E1A]/90 dark:bg-[#0A0E1A]/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/25">
              MP
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white dark:text-white light:text-slate-900">MerchantPulse</span>
              <span className="text-[11px] text-blue-500 font-mono ml-2.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 hidden sm:inline">
                Razorpay Buildathon
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400 dark:text-slate-400 light:text-slate-600">
            <a href="#roi-calculator" className="hover:text-blue-500 transition-colors">
              ROI Calculator
            </a>
            <a href="#pipeline-simulator" className="hover:text-blue-500 transition-colors">
              Live Pipeline
            </a>
            <a href="#features" className="hover:text-blue-500 transition-colors">
              Architecture Creed
            </a>
          </div>

          {/* Public Action Header */}
          <div className="flex items-center gap-3">
            {/* Quick Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <PwaInstallPrompt />

            <ProfileBar onOpenSettings={() => setIsSettingsOpen(true)} />

            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono shadow-lg shadow-blue-600/30 transition-all active:scale-95 m3-state-layer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            ) : (
              <button
                onClick={handleLaunchTerminal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <span>Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Parallax Body */}
      <main className="flex-1 relative">
        {/* Parallax Background Blobs */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none transition-transform duration-75 ease-out"
          style={{ transform: `translate(-50%, ${scrollY * 0.35}px)` }}
        />
        <div
          className="absolute top-40 right-10 w-[500px] h-[350px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none transition-transform duration-75 ease-out"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        />

        {/* Hero Section */}
        <section className="relative pt-12 sm:pt-20 pb-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs font-mono text-slate-300 dark:text-slate-300 light:text-slate-700 m3-elevation-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Razorpay AI Buildathon 2026 — Track 03: AI Revenue Recovery
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 leading-tight">
              Recover Payment Revenue Automatically —{' '}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                Without Letting AI Control Your Money.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-3xl mx-auto leading-relaxed font-sans">
              MerchantPulse finds failed payment revenue that is recoverable, chooses the highest-value bounded intervention, executes it through Razorpay primitives, and proves whether the intervention recovered money.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleLaunchTerminal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono shadow-xl shadow-blue-600/30 transition-all active:scale-95 m3-state-layer"
              >
                <Activity className="w-4 h-4" />
                <span>{isAuthenticated ? 'Open Live Merchant Terminal' : 'Sign In to Access Terminal'}</span>
              </button>

              <a
                href="#roi-calculator"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white hover:bg-slate-800/80 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold text-xs font-mono transition-all m3-elevation-1"
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Calculate Your Recoverable ROI</span>
              </a>
            </div>

            {/* Parallax Metrics Surfaces */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-left"
              style={{ transform: `translateY(${scrollY * -0.08}px)` }}
            >
              <div className="p-4 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 backdrop-blur m3-elevation-2 space-y-1">
                <div className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900 font-mono">₹1.24 Cr</div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-mono">Sample Merchant GMV</div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-emerald-500/30 backdrop-blur m3-elevation-2 space-y-1">
                <div className="text-2xl font-extrabold text-emerald-500 font-mono">76.2%</div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-mono">Attributed Recovery Rate</div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-indigo-500/30 backdrop-blur m3-elevation-2 space-y-1">
                <div className="text-2xl font-extrabold text-indigo-500 font-mono">41 / 41</div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-mono">Automated Tests Passing</div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-blue-500/30 backdrop-blur m3-elevation-2 space-y-1">
                <div className="text-2xl font-extrabold text-blue-500 font-mono">500+ Req/s</div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-mono">Concurrent Worker Scale</div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive Pipeline Visualizer Section */}
        <section id="pipeline-simulator" className="py-16 px-4 sm:px-6 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border-t border-slate-900 dark:border-slate-900 light:border-slate-200">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight">
                Live 4-Stage Autonomous Recovery Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono max-w-2xl mx-auto">
                Test how MerchantPulse processes a real-time failed payment webhook event from Razorpay.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 m3-elevation-3 space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white dark:text-white light:text-slate-900">
                  <Play className="w-4 h-4 text-blue-500 fill-blue-500" />
                  <span>Pipeline Event Stream Simulator</span>
                </div>
                <button
                  onClick={triggerSimulation}
                  disabled={simSimulating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-50"
                >
                  {simSimulating ? 'Processing Event...' : 'Trigger Test Event (₹8,500 Failure)'}
                </button>
              </div>

              {/* Step Progress Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border transition-all ${
                  simStep >= 1
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                    : 'bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border-slate-800 text-slate-500'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>1. Detection & EV Math</span>
                    {simStep >= 1 && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-80">
                    Calculated P(success)=0.74, Intervention Fee=₹130, Net EV=₹6,160.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  simStep >= 2
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border-slate-800 text-slate-500'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>2. Policy Evaluation</span>
                    {simStep >= 2 && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-80">
                    GMV Cap ₹8.5k &lt; ₹25k limit. 24h Cooldown valid. Policy Passed.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  simStep >= 3
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border-slate-800 text-slate-500'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>3. Razorpay Dispatch</span>
                    {simStep >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-80">
                    Payment link generated: plink_Pz884422. SMS dispatched.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Material ROI Calculator Section */}
        <section id="roi-calculator" className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight">
                Estimate Your Merchant Revenue Recovery
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono max-w-2xl mx-auto">
                See how much gross revenue MerchantPulse can autonomously recover for your business each month without discounting.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 m3-elevation-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold mb-2">
                    Monthly Processing Volume (GMV): <span className="text-blue-500 text-sm">₹{(monthlyGmvLakhs / 100).toFixed(2)} Cr</span> (₹{monthlyGmvLakhs} Lakhs)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={monthlyGmvLakhs}
                    onChange={(e) => setMonthlyGmvLakhs(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>₹10 Lakhs</span>
                    <span>₹2.5 Crore</span>
                    <span>₹5.0 Crore</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold mb-2">
                    Payment Dropoff / Failure Rate: <span className="text-amber-500 text-sm">{failureRatePct}%</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="12.0"
                    step="0.5"
                    value={failureRatePct}
                    onChange={(e) => setFailureRatePct(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1.5% (Low)</span>
                    <span>4.5% (Industry Avg)</span>
                    <span>8.5% (Elevated)</span>
                  </div>
                </div>
              </div>

              {/* Output Result Surfaces */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
                <div className="p-4 rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 font-mono">
                  <div className="text-slate-500 text-[10px]">Monthly Revenue at Risk</div>
                  <div className="text-xl font-bold text-amber-500 mt-1">
                    ₹{(monthlyRevenueAtRiskInr / 100000).toFixed(2)} Lakhs
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-emerald-500/40 font-mono">
                  <div className="text-emerald-500 text-[10px] font-bold">Monthly Recovered Money</div>
                  <div className="text-2xl font-extrabold text-emerald-500 mt-1">
                    ₹{(monthlyRecoverableInr / 100000).toFixed(2)} Lakhs
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 dark:from-blue-900/30 light:from-blue-50 border border-blue-500/50 font-mono">
                  <div className="text-blue-500 text-[10px] font-bold">Annual Incremental Recovery</div>
                  <div className="text-2xl font-extrabold text-blue-500 mt-1">
                    ₹{(annualRecoveredInr / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview Grid */}
        <section id="features" className="py-16 px-4 sm:px-6 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border-t border-slate-900 dark:border-slate-900 light:border-slate-200">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight">
                Architected for Production Razorpay Submissions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono max-w-2xl mx-auto">
                Deterministic detection, economic expected-value modeling, policy guardrails, and closed-loop Razorpay execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 m3-elevation-2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 font-mono">Deterministic EV Math</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
                  Calculates Net Expected Value before taking action: <code className="text-blue-500 font-mono">Net EV = (P_success × GMV) - (Fee + Fatigue)</code>.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 m3-elevation-2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 font-mono">Bounded Policy Guardrails</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
                  Strict caps on maximum GMV auto-execution, 24-hour contact cooldowns, and mandatory escalation queues for high-risk operations.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 m3-elevation-2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 font-mono">Closed-Loop Attribution</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
                  Reconciles Razorpay paid webhooks against idempotency keys to guarantee zero double-counting in batch recovery reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="py-12 px-4 sm:px-6 bg-slate-950 dark:bg-slate-950 light:bg-white border-t border-slate-900 dark:border-slate-900 light:border-slate-200">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight">Ready to test the Live Terminal?</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono mt-1">
                Authenticate your merchant account to access live recovery streams and synthetic benchmark suites.
              </p>
            </div>

            <button
              onClick={handleLaunchTerminal}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>{isAuthenticated ? 'Open Merchant Terminal' : 'Sign In / Register'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />

      {/* Settings Modal Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
