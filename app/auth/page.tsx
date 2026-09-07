'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Chrome, Shield, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { createClient, signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase/client';
import { PRESET_USERS } from '@/core/auth/manager';

export default function AuthPage() {
  const router = useRouter();
  const { setProfile, switchRole } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const supabaseConfigured = isSupabaseConfigured();

  const handleQuickLogin = (presetEmail: string) => {
    const preset = PRESET_USERS[presetEmail];
    if (preset) {
      setProfile(preset);
      setSuccessMsg(`Authenticated as ${preset.name} (${preset.role})`);
      setTimeout(() => {
        router.push('/overview');
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !name) { setError('Please enter your name.'); return; }
    setLoading(true);

    const userEmail = email.trim();

    // If Supabase is configured, use it. Otherwise seamlessly authenticate in Sandbox Demo Mode.
    if (supabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          let res;
          if (tab === 'signup') {
            res = await supabase.auth.signUp({
              email: userEmail,
              password: password,
              options: { data: { full_name: name.trim() } }
            });
          } else {
            res = await supabase.auth.signInWithPassword({
              email: userEmail,
              password: password
            });
          }

          if (res.error) {
            setError(res.error.message);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Supabase auth failed, falling back to local session:', err);
        }
      }
    }

    // Local / Sandbox session resolution
    const matchedPreset = PRESET_USERS[userEmail];
    if (matchedPreset) {
      setProfile(matchedPreset);
    } else {
      setProfile({
        id: `usr_${Date.now().toString(36)}`,
        name: tab === 'signup' ? name.trim() : (userEmail.split('@')[0] || 'Merchant Admin'),
        email: userEmail,
        role: 'OWNER',
        merchantId: 'rzp_merchant_main',
        permissions: ['opportunities:read', 'opportunities:execute', 'policy:write', 'audit:read', 'stress_test:run'],
      });
    }

    setLoading(false);
    router.push(tab === 'signup' ? '/onboarding/business' : '/overview');
  };

  return (
    <div className="min-h-screen bg-[var(--nb-bg)] flex flex-col">

      {/* Minimal header */}
      <header className="border-b border-white/10 bg-[var(--nb-surface)] px-6 py-4 flex items-center justify-between shadow-skeuo-card">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center font-mono text-xs font-black text-slate-950 shadow-skeuo-gold transition-all group-hover:scale-105">
            MP
          </div>
          <span className="font-black uppercase text-sm tracking-tight text-white">MerchantPulse</span>
        </Link>
        <span className="font-mono text-[10px] text-[var(--nb-text-muted)] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 skeuo-led-emerald inline-block" />
          Secure Auth Gateway
        </span>
      </header>

      {/* Auth card */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-gradient-to-b from-[var(--nb-surface)] to-[var(--nb-surface-2)] border border-white/15 rounded-2xl p-8 shadow-skeuo-card-lg relative">

            {/* Tab switcher */}
            <div className="p-1 bg-[var(--nb-recessed)] rounded-xl border border-white/10 shadow-skeuo-inset flex mb-8">
              {(['signin', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                    tab === t
                      ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-slate-950 shadow-skeuo-gold font-black'
                      : 'text-[var(--nb-text-muted)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-8">
              <h1 className="font-black uppercase text-2xl text-white leading-tight">
                {tab === 'signin' ? 'Welcome back' : 'Get started free'}
              </h1>
              <p className="font-mono text-xs text-[var(--nb-text-muted)]">
                {tab === 'signin'
                  ? 'Sign in to access your MerchantPulse dashboard.'
                  : 'Set up your account in under 2 minutes.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 border border-rose-500/40 bg-rose-500/10 rounded-xl px-4 py-3 font-mono text-xs text-rose-400 shadow-skeuo-inset">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 border border-emerald-500/40 bg-emerald-500/10 rounded-xl px-4 py-3 font-mono text-xs text-emerald-400 flex items-center gap-2 shadow-skeuo-inset">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="nb-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="nb-input"
                  />
                </div>
              )}

              <div>
                <label className="nb-label">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--nb-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@yourbusiness.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="nb-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="nb-label">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--nb-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="nb-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="nb-primary-button w-full mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            {/* Quick 1-Click Demo Persona Login */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 skeuo-led-amber inline-block" />
                  1-Click Demo Personas
                </span>
                <span className="font-mono text-[9px] text-[var(--nb-text-muted)]">Instant Role Switch</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@merchantpulse.io')}
                  className="rounded-xl border border-white/10 hover:border-amber-400/60 bg-[var(--nb-recessed)] p-3 text-left transition-all shadow-skeuo-card hover:shadow-skeuo-card-hover active:translate-y-0.5 group"
                >
                  <div className="font-mono text-[10px] font-black text-white group-hover:text-amber-400">Admin / Owner</div>
                  <div className="font-mono text-[9px] text-[var(--nb-text-muted)]">Divyanshu Sinha</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('ops@merchantpulse.io')}
                  className="rounded-xl border border-white/10 hover:border-blue-400/60 bg-[var(--nb-recessed)] p-3 text-left transition-all shadow-skeuo-card hover:shadow-skeuo-card-hover active:translate-y-0.5 group"
                >
                  <div className="font-mono text-[10px] font-black text-white group-hover:text-blue-400">Ops Manager</div>
                  <div className="font-mono text-[9px] text-[var(--nb-text-muted)]">Rahul Sharma</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('auditor@merchantpulse.io')}
                  className="rounded-xl border border-white/10 hover:border-emerald-400/60 bg-[var(--nb-recessed)] p-3 text-left transition-all shadow-skeuo-card hover:shadow-skeuo-card-hover active:translate-y-0.5 group"
                >
                  <div className="font-mono text-[10px] font-black text-white group-hover:text-emerald-400">Auditor</div>
                  <div className="font-mono text-[9px] text-[var(--nb-text-muted)]">Neha Verma</div>
                </button>
              </div>
            </div>

            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-dashed border-white/10" />
              <span className="px-3 bg-transparent font-mono text-[10px] text-[var(--nb-text-muted)] uppercase tracking-widest">or</span>
              <div className="flex-1 border-t border-dashed border-white/10" />
            </div>

            <button
              type="button"
              className="nb-secondary-button w-full"
              onClick={async () => {
                setLoading(true);
                try {
                  await signInWithGoogle();
                } catch (e) {
                  setError('Google auth failed or is not configured.');
                  setLoading(false);
                }
              }}
            >
              <Chrome className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            <p className="mt-6 text-center font-mono text-xs text-[var(--nb-text-muted)]">
              {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                {tab === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] text-[var(--nb-text-muted)]">
            By continuing you agree to our{' '}
            <span className="text-white cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-white cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </main>
    </div>
  );
}
