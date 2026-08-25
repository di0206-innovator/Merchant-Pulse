'use client';

import React from 'react';
import { X, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { signInWithGoogle } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { switchRole } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Google Auth Error:', err);
    }
  };

  const handleDemoLogin = () => {
    switchRole('OWNER');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 p-6 sm:p-8 shadow-2xl space-y-6 relative m3-elevation-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-blue-500/25">
            MP
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to MerchantPulse
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Authenticate to access the Live Revenue Recovery Terminal, Policy Ledger & Benchmark Suite.
          </p>
        </div>

        {/* Auth Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary Google Auth Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono shadow-lg shadow-blue-600/30 transition-all active:scale-98 m3-state-layer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {/* Secondary Demo Auth Button */}
          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono border border-slate-700 transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Launch as Demo Merchant Account</span>
          </button>
        </div>

        {/* Security Footer Notice */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase OAuth • 256-Bit Encrypted Sessions</span>
          </p>
        </div>
      </div>
    </div>
  );
}
