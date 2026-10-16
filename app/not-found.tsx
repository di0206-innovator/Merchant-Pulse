import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home, ShieldCheck, Activity } from 'lucide-react';

export const metadata = {
  title: '404 — Route Not Found | MerchantPulse',
  description: 'The requested payment ops route could not be found. Return to the MerchantPulse console.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-nb-bg text-nb-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl nb-panel p-8 sm:p-10 text-center space-y-6 shadow-skeuo-card-lg relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="w-16 h-16 rounded-2xl border border-amber-400/50 bg-amber-500/10 flex items-center justify-center mx-auto shadow-skeuo-gold">
          <AlertTriangle className="w-8 h-8 text-amber-400" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="nb-eyebrow mx-auto w-fit">
            HTTP 404 · Route Unresolved
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Endpoint Not Found
          </h1>
          <p className="font-mono text-xs text-nb-muted max-w-md mx-auto leading-6">
            This route does not exist or has been relocated. Your payment recovery pipeline and webhook listeners remain active.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/" className="nb-primary-button text-xs py-3 px-5 justify-center">
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <Link href="/overview" className="nb-secondary-button text-xs py-3 px-5 justify-center">
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span>Open Recovery Console</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-nb-stroke/50 flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] text-nb-muted">
          <Link href="/reviewer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            Reviewer Cockpit
          </Link>
          <span>·</span>
          <Link href="/audit" className="hover:text-amber-400 transition-colors">
            Audit Ledger
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-amber-400 transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-amber-400 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </main>
  );
}
