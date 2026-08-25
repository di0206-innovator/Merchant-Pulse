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
  Moon,
  Star
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
  const [merchantEmailInput, setMerchantEmailInput] = useState('');

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
    <div className="min-h-screen bg-[#8BE8F5] dark:bg-[#070B12] light:bg-[#F8FAFC] text-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-950 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Vintage / Retro Standalone Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#8BE8F5]/90 dark:bg-[#0A0E1A]/90 backdrop-blur-md border-b-2 border-slate-950 dark:border-slate-800 py-4 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Brand Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white font-serif font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-950 dark:text-white">MerchantPulse</span>
              <span className="text-[10px] text-slate-800 dark:text-blue-400 font-mono -mt-1 font-bold">
                Razorpay AI Buildathon
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-900 dark:text-slate-300">
            <a href="#roi-calculator" className="hover:underline transition-all">
              Home
            </a>
            <a href="#pipeline-simulator" className="hover:underline transition-all">
              Live Pipeline
            </a>
            <a href="#features" className="hover:underline transition-all">
              Features
            </a>
            <a href="#roi-calculator" className="hover:underline transition-all">
              ROI Calculator
            </a>
          </div>

          {/* Public Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-950 text-slate-950 dark:text-slate-300 hover:bg-slate-100 dark:hover:text-white transition-colors flex items-center gap-1.5 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              title={`Switch Mode (${theme.toUpperCase()})`}
            >
              {theme === 'retro' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Retro Cyan</span>
                </>
              ) : theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <PwaInstallPrompt />

            <ProfileBar onOpenSettings={() => setIsSettingsOpen(true)} />

            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 rounded-full border-2 border-slate-950 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Login
              </button>
            ) : null}

            <button
              onClick={handleLaunchTerminal}
              className="px-6 py-2.5 rounded-full border-2 border-slate-950 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px]"
            >
              {isAuthenticated ? 'Open Terminal' : 'Try it Now'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Vintage Hero & Body Section */}
      <main className="flex-1 relative">
        {/* Vintage Cyan Hero Section matching Screenshot */}
        <section className="relative pt-12 sm:pt-20 pb-24 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Headline Area */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-950 text-xs font-mono font-bold text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Track 03 — AI Revenue Recovery
              </div>

              <h1 className="text-5xl sm:text-7xl font-serif font-bold text-slate-950 dark:text-white leading-[1.06] tracking-tight">
                Handle your <br className="hidden sm:inline" />
                <span className="italic">Revenue Recovery</span> <br />
                Easily.
              </h1>

              <p className="text-lg sm:text-xl text-slate-800 dark:text-slate-300 max-w-xl leading-relaxed font-sans font-medium">
                MerchantPulse delivers automated AI revenue recovery, deterministic Net EV expected-value modeling, and bounded Razorpay execution.
              </p>

              {/* Email Input Bar Matching Screenshot */}
              <div className="pt-4 max-w-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLaunchTerminal();
                  }}
                  className="flex items-center bg-white border-2 border-slate-950 rounded-full p-1.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                >
                  <input
                    type="email"
                    placeholder="Your Email address..."
                    value={merchantEmailInput}
                    onChange={(e) => setMerchantEmailInput(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2 text-sm font-sans text-slate-950 placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold font-mono transition-all"
                  >
                    Get Started
                  </button>
                </form>
              </div>
            </div>

            {/* Right Vintage Illustration Canvas & Badge Overlay */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {/* Hand-Drawn Retro Art Simulation Box */}
              <div className="w-full max-w-md h-80 sm:h-96 rounded-3xl border-3 border-slate-950 bg-white/70 backdrop-blur-sm p-6 relative flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-slate-950 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 border border-slate-950" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 border border-slate-950" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-950" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-950">Razorpay Pipeline v2.5</span>
                </div>

                {/* Center Animated Hands/Chart Graphic */}
                <div className="my-auto flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-amber-300 border-2 border-slate-950 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-bounce">
                    <TrendingUp className="w-12 h-12 text-slate-950" />
                  </div>
                  <div className="font-serif font-extrabold text-2xl text-slate-950">
                    ₹48,50,000 Recovered
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700">
                    Closed-Loop Razorpay Attribution
                  </div>
                </div>

                {/* Floating A+ Rating Badge Overlay (Exactly matching image) */}
                <div className="absolute bottom-4 right-4 bg-white border-2 border-slate-950 rounded-2xl p-4 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] font-serif text-slate-950 space-y-1">
                  <div className="text-xl font-extrabold tracking-tight">A+ Rating</div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive Pipeline Visualizer Section */}
        <section id="pipeline-simulator" className="py-16 px-6 sm:px-12 bg-white dark:bg-slate-950/60 border-t-2 border-slate-950">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 dark:text-white tracking-tight">
                Live 4-Stage Autonomous Recovery Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-mono max-w-2xl mx-auto font-bold">
                Test how MerchantPulse processes a real-time failed payment webhook event from Razorpay.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-slate-900/80 border-2 border-slate-950 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white text-sm">
                  <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Pipeline Event Stream Simulator</span>
                </div>
                <button
                  onClick={triggerSimulation}
                  disabled={simSimulating}
                  className="px-5 py-2.5 rounded-full border-2 border-slate-950 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                >
                  {simSimulating ? 'Processing Event...' : 'Trigger Test Event (₹8,500 Failure)'}
                </button>
              </div>

              {/* Step Progress Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border-2 border-slate-950 transition-all ${
                  simStep >= 1
                    ? 'bg-blue-100 dark:bg-blue-600/10 text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-white text-slate-400'
                }`}>
                  <div className="font-bold flex items-center justify-between text-xs">
                    <span>1. Detection & EV Math</span>
                    {simStep >= 1 && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-90 font-sans">
                    Calculated P(success)=0.74, Fee=₹130, Net EV=₹6,160.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border-2 border-slate-950 transition-all ${
                  simStep >= 2
                    ? 'bg-amber-100 dark:bg-indigo-600/10 text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-white text-slate-400'
                }`}>
                  <div className="font-bold flex items-center justify-between text-xs">
                    <span>2. Policy Evaluation</span>
                    {simStep >= 2 && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-90 font-sans">
                    GMV Cap ₹8.5k &lt; ₹25k limit. 24h Cooldown valid.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border-2 border-slate-950 transition-all ${
                  simStep >= 3
                    ? 'bg-emerald-200 dark:bg-emerald-600/10 text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-white text-slate-400'
                }`}>
                  <div className="font-bold flex items-center justify-between text-xs">
                    <span>3. Razorpay Dispatch</span>
                    {simStep >= 3 && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-90 font-sans">
                    Payment link generated: plink_Pz884422. SMS dispatched.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Material ROI Calculator Section */}
        <section id="roi-calculator" className="py-16 px-6 sm:px-12 bg-[#8BE8F5] border-t-2 border-slate-950">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
                Estimate Your Recoverable ROI
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 font-mono font-bold max-w-2xl mx-auto">
                See how much gross revenue MerchantPulse can autonomously recover for your business each month without discounting.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-950 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-slate-950 font-bold mb-2">
                    Monthly Processing Volume (GMV): <span className="text-blue-700 text-sm font-bold">₹{(monthlyGmvLakhs / 100).toFixed(2)} Cr</span> (₹{monthlyGmvLakhs} Lakhs)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={monthlyGmvLakhs}
                    onChange={(e) => setMonthlyGmvLakhs(Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-950 font-bold mb-2">
                    Payment Dropoff / Failure Rate: <span className="text-amber-700 text-sm font-bold">{failureRatePct}%</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="12.0"
                    step="0.5"
                    value={failureRatePct}
                    onChange={(e) => setFailureRatePct(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Output Result Surfaces */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-950">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border-2 border-slate-950 font-mono shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                  <div className="text-slate-600 text-[10px] font-bold uppercase">Monthly Revenue at Risk</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    ₹{(monthlyRevenueAtRiskInr / 100000).toFixed(2)} Lakhs
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-slate-950 font-mono shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                  <div className="text-emerald-800 text-[10px] font-extrabold uppercase">Monthly Recovered Money</div>
                  <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                    ₹{(monthlyRecoverableInr / 100000).toFixed(2)} Lakhs
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-100 border-2 border-slate-950 font-mono shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                  <div className="text-blue-900 text-[10px] font-extrabold uppercase">Annual Incremental Recovery</div>
                  <div className="text-2xl font-extrabold text-blue-950 mt-1">
                    ₹{(annualRecoveredInr / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="py-12 px-6 sm:px-12 bg-white border-t-2 border-slate-950">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-950 tracking-tight">Ready to test the Live Terminal?</h3>
              <p className="text-xs text-slate-700 font-mono mt-1 font-semibold">
                Authenticate your merchant account to access live recovery streams and synthetic benchmark suites.
              </p>
            </div>

            <button
              onClick={handleLaunchTerminal}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-slate-950 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs font-mono shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-[2px] active:translate-y-[2px]"
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
