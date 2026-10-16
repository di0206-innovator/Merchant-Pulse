'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, MapPin, Mail, Zap } from 'lucide-react';
import { useOnboarding } from '@/lib/onboardingContext';

export default function ThankYouPage() {
  const { businessProfile, planSelected } = useOnboarding();
  const [copied, setCopied] = useState(false);
  const webhookUrl = 'https://app.merchantpulse.io/api/webhooks/razorpay';

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-nb-bg text-nb-white flex items-center justify-center p-4 sm:p-6 pb-24">
      <div className="w-full max-w-2xl nb-panel p-8 sm:p-10 space-y-6 shadow-skeuo-card-lg relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border border-emerald-400/50 bg-emerald-500/15 flex items-center justify-center shadow-skeuo-green">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <span className="nb-chip-green text-[10px]">
              Activation Confirmed · {planSelected.toUpperCase()} Tier
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              Thank You{businessProfile?.businessName ? `, ${businessProfile.businessName}` : ''}!
            </h1>
          </div>
        </div>

        <p className="font-mono text-xs text-nb-muted leading-6">
          Your MerchantPulse autonomous recovery workspace is provisioned with deterministic Expected Value (EV) guardrails and HMAC-SHA256 webhook protection.
        </p>

        <section className="rounded-xl border border-nb-stroke/60 bg-[var(--nb-recessed)] p-5 space-y-3 shadow-skeuo-inset">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Step 1: Connect Your Razorpay Webhook Endpoint
            </span>
            <span className="font-mono text-[10px] text-emerald-400">HMAC-SHA256 Active</span>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white">
            <code className="truncate">{webhookUrl}</code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy webhook URL"
              className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-400 hover:bg-amber-500/20 shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy URL'}
            </button>
          </div>
          <p className="font-mono text-[10px] text-nb-muted">
            Enable events: <code className="text-white">payment.failed</code>, <code className="text-white">payment.captured</code>, and <code className="text-white">payment_link.paid</code> in your Razorpay Dashboard → Settings → Webhooks.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/overview" className="nb-primary-button text-xs py-3.5 px-5 justify-center">
            <span>Launch Recovery Console</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link href="/reviewer" className="nb-secondary-button text-xs py-3.5 px-5 justify-center">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Open Reviewer Cockpit</span>
          </Link>
        </div>

        <footer className="pt-5 border-t border-nb-stroke/50 space-y-1.5 font-mono text-[11px] text-nb-muted">
          <div className="font-bold text-white">Need onboarding assistance?</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>MerchantPulse Technologies Pvt. Ltd., 4th Floor, Indiqube Orion, HSR Layout Sector 2, Bengaluru 560102</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>onboarding@merchantpulse.io · +91 (80) 4568-9200</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
