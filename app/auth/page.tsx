'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, Eye, EyeOff, Lock, Mail, Chrome } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { createClient, signInWithGoogle } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const { switchRole, setProfile } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !name) { setError('Please enter your name.'); return; }
    setLoading(true);

    const userEmail = email.trim();
    
    // Call Supabase auth here
    const supabase = createClient();
    if (!supabase) {
      setError('Supabase is not configured. Provide URL and Key in .env.local');
      setLoading(false);
      return;
    }
    
    (async () => {
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
      } else {
        setLoading(false);
        router.push(tab === 'signup' ? '/onboarding/business' : '/overview');
      }
    })();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* Minimal header */}
      <header className="border-b-2 border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border-2 border-white bg-[#FFE500] flex items-center justify-center font-mono text-xs font-black text-black shadow-brutal transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal-lg">
            MP
          </div>
          <span className="font-black uppercase text-sm tracking-tight text-white">MerchantPulse</span>
        </Link>
      </header>

      {/* Auth card */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#111111] border-2 border-white p-8" style={{ boxShadow: '8px 8px 0 #FFE500' }}>

            {/* Tab switcher */}
            <div className="flex border-b-2 border-white/10 mb-8">
              {(['signin', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 pb-3 font-mono text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${
                    tab === t
                      ? 'border-[#FFE500] text-[#FFE500]'
                      : 'border-transparent text-[#888888] hover:text-white'
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
              <p className="font-mono text-xs text-[#888888]">
                {tab === 'signin'
                  ? 'Sign in to access your MerchantPulse dashboard.'
                  : 'Set up your account in under 2 minutes.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 border-2 border-[#FF3B3B] bg-[#FF3B3B]/10 px-4 py-3 font-mono text-[11px] text-[#FF3B3B]">
                {error}
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
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
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
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white transition-colors"
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
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-none animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-white/10" />
              <span className="px-3 bg-[#111111] font-mono text-[10px] text-[#888888] uppercase tracking-widest">or</span>
              <div className="flex-1 border-t-2 border-dashed border-white/10" />
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

            <p className="mt-6 text-center font-mono text-[10px] text-[#888888]">
              {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }}
                className="text-[#FFE500] font-bold hover:underline"
              >
                {tab === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] text-[#888888]">
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
