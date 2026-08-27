'use client';

import React, { useState } from 'react';
import { X, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { signInWithGoogle } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { switchRole, setProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Google Auth Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Authenticate demo/local user session with entered email
    const userEmail = email.trim() || 'founder@example.com';
    const userName = userEmail.split('@')[0];
    
    setProfile(prev => ({
      ...prev,
      email: userEmail,
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      role: 'OWNER',
    }));

    switchRole('OWNER');

    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-slide-up">
      <div
        className="w-full max-w-md bg-[#111111] border-2 border-white text-[#F5F5F5] p-8 space-y-6 relative"
        style={{ boxShadow: '8px 8px 0 #FFE500' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 border-2 border-white/30 p-1.5 text-[#888888] hover:border-white hover:text-white transition-all duration-100 hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-3">
          <div className="nb-eyebrow">
            <Lock className="w-3 h-3" />
            Secure Gateway
          </div>
          <h2 className="text-3xl font-black uppercase text-white leading-none">
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="font-mono text-xs text-[#888888] leading-5">
            {authMode === 'signin'
              ? 'Sign in with Google or email to access the Revenue Recovery Terminal.'
              : 'Create an account to access the AI Revenue Recovery Terminal.'}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-white/40 bg-transparent hover:border-white hover:bg-white/5 py-3 px-4 font-mono text-xs font-bold uppercase tracking-widest text-white transition-all duration-100 hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t-2 border-dashed border-white/10 w-full" />
          <span className="bg-[#111111] px-3 font-mono text-[10px] uppercase tracking-widest text-[#888888] absolute">
            Or Email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="nb-label">Email Address</label>
            <input
              type="email"
              placeholder="founder@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="nb-input"
              required
            />
          </div>

          <div>
            <label className="nb-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="nb-input pr-10"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="nb-primary-button w-full mt-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between font-mono text-[10px] pt-3 border-t-2 border-white/10">
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            className="text-[#FFE500] font-bold uppercase hover:underline"
          >
            {authMode === 'signin' ? 'Create Account' : 'Already have account?'}
          </button>
          <button
            type="button"
            onClick={() => { setEmail('founder@example.com'); setPassword('demo1234'); }}
            className="text-[#888888] uppercase hover:text-white"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
