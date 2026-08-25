'use client';

import React, { useState } from 'react';
import { Lock, LogIn, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { AuthModal } from './AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If user is logged in / authenticated, render internal content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If unauthenticated, show protected barrier screen with Auth Modal trigger
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 m3-elevation-2">
        <Lock className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Merchant Terminal Access Required
        </h2>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          The Live Recovery Terminal, Policy Audit Ledger, and Benchmark Suite are restricted to authenticated merchants. Please sign in or create an account to proceed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono shadow-xl shadow-blue-600/30 transition-all active:scale-95 m3-state-layer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Create Merchant Account</span>
        </button>
      </div>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
