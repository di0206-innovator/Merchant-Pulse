'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Cookie, X, Check, ArrowRight } from 'lucide-react';
import { trackAnalyticsEvent } from '@/lib/env';

const PAGE_METADATA_MAP: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'MerchantPulse | Autonomous AI Payment Recovery for Razorpay Merchants',
    description:
      'Recover up to 34% of failed UPI, Card, and NetBanking checkouts with deterministic paise-level EV math, bounded Gemini 2.5 AI strategy, and cryptographic webhook reconciliation.',
  },
  '/auth': {
    title: 'Sign In or Create Account | MerchantPulse Security Gateway',
    description:
      'Authenticate into your MerchantPulse console with RBAC role isolation, Google OAuth, or 1-click sandbox personas.',
  },
  '/onboarding/business': {
    title: 'Merchant Onboarding & Guardrail Setup | MerchantPulse',
    description:
      'Configure your Razorpay merchant profile, autonomous GMV thresholds, and recovery channels in under 2 minutes.',
  },
  '/overview': {
    title: 'Live Recovery Console & Opportunity Radar | MerchantPulse',
    description:
      'Monitor real-time payment failures, expected value calculations, gateway degradation radar, and autonomous Razorpay Payment Link dispatches.',
  },
  '/dashboard': {
    title: 'Executive Revenue Dashboard | MerchantPulse',
    description:
      'Track recovered GMV, attributed intervention conversion rates, and active payment recovery opportunities.',
  },
  '/reviewer': {
    title: 'Human-in-the-Loop Reviewer Cockpit | MerchantPulse',
    description:
      'Inspect and authorize high-value escalated payment recovery interventions with full deterministic and AI audit trails.',
  },
  '/audit': {
    title: 'Immutable Cryptographic Audit Ledger | MerchantPulse',
    description:
      'Verify every autonomous and human-approved recovery decision, policy rule evaluation, and webhook attribution record.',
  },
  '/history': {
    title: 'Closed-Loop Recovery History & Attribution | MerchantPulse',
    description:
      'Review historical recovered orders, separated cleanly between attributed MerchantPulse interventions and organic customer retries.',
  },
  '/knowledge': {
    title: 'Multimodal RAG Policy Knowledge Base | MerchantPulse',
    description:
      'Upload merchant refund SOPs, compliance PDFs, and support recordings to ground AI recovery recommendations in pgvector.',
  },
  '/benchmark': {
    title: 'Held-Out Statistical Evaluation Benchmark | MerchantPulse',
    description:
      'Compare MerchantPulse AI and deterministic strategies against no-action and blind-rule baselines across 1,000+ synthetic events.',
  },
  '/privacy': {
    title: 'Privacy Policy & RBI Data Compliance | MerchantPulse',
    description:
      'How MerchantPulse protects merchant and shopper data under the India DPDP Act 2023 and RBI tokenization guidelines.',
  },
  '/terms': {
    title: 'Terms and Conditions & SaaS SLA | MerchantPulse',
    description:
      'Service level agreements, autonomous guardrail governance, and legal terms for MerchantPulse Technologies Pvt. Ltd.',
  },
  '/thank-you': {
    title: 'Thank You & Activation Next Steps | MerchantPulse',
    description:
      'Your MerchantPulse workspace is ready. Copy your dedicated Razorpay webhook endpoint and complete live verification.',
  },
};

export function GlobalGtmWidgets() {
  const pathname = usePathname();
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'essential_only' | null>(null);
  const [bannerMounted, setBannerMounted] = useState(false);

  // 1. Dynamic Meta Title & Meta Description per page + Pageview Analytics
  useEffect(() => {
    const meta = PAGE_METADATA_MAP[pathname] || {
      title: 'MerchantPulse | AI Revenue Recovery for Razorpay',
      description: 'Deterministic financial truth. Bounded AI strategy. Closed-loop payment recovery.',
    };

    if (typeof document !== 'undefined') {
      document.title = meta.title;
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', meta.description);
    }

    trackAnalyticsEvent('page_view', {
      path: pathname,
      title: meta.title,
    });
  }, [pathname]);

  // 2. Load Cookie Consent State
  useEffect(() => {
    setBannerMounted(true);
    try {
      const saved = window.localStorage.getItem('mp_cookie_consent');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.status === 'accepted' || parsed?.status === 'essential_only') {
          setCookieConsent(parsed.status);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleCookieChoice = (choice: 'accepted' | 'essential_only') => {
    setCookieConsent(choice);
    try {
      window.localStorage.setItem(
        'mp_cookie_consent',
        JSON.stringify({
          status: choice,
          analytics: choice === 'accepted',
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage errors
    }
    trackAnalyticsEvent('cookie_consent_updated', { choice });
  };

  const isLandingOrPublic = pathname === '/' || pathname === '/privacy' || pathname === '/terms';

  return (
    <>
      {/* Cookie Consent Banner (GDPR & India DPDP Act 2023 Compliant) */}
      {bannerMounted && cookieConsent === null && (
        <aside
          role="region"
          aria-label="Cookie and privacy consent banner"
          className="fixed bottom-16 md:bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 rounded-2xl border border-amber-400/40 bg-slate-950/95 backdrop-blur-xl p-5 text-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Cookie className="w-4 h-4 text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                  Privacy &amp; Telemetry Controls
                </h2>
                <p className="font-mono text-[10px] text-emerald-400">
                  DPDP Act 2023 &amp; RBI Tokenization Aligned
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCookieChoice('essential_only')}
              aria-label="Dismiss and use essential cookies only"
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-3 font-mono text-[11px] leading-5 text-slate-300">
            We use strictly necessary session cookies for RBAC security and optional anonymized analytics to measure recovery funnel performance. Read our{' '}
            <Link href="/privacy" className="text-amber-400 underline hover:text-amber-300">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-amber-400 underline hover:text-amber-300">
              Terms
            </Link>.
          </p>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleCookieChoice('accepted')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 px-3.5 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-skeuo-gold transition-transform active:translate-y-0.5"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Accept All
            </button>
            <button
              type="button"
              onClick={() => handleCookieChoice('essential_only')}
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-colors"
            >
              Essential Only
            </button>
          </div>
        </aside>
      )}

      {/* Sticky Mobile CTA Bar on Public/Landing Pages */}
      {isLandingOrPublic && (
        <div
          role="region"
          aria-label="Quick mobile call to action"
          className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-amber-400/30 bg-slate-950/95 backdrop-blur-lg px-4 py-3 flex items-center justify-between gap-3 shadow-2xl"
        >
          <div>
            <div className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Recover Failed Checkouts
            </div>
            <div className="font-mono text-[10px] text-slate-300">
              Free up to ₹5L GMV · 2-min setup
            </div>
          </div>
          <Link
            href="/auth"
            onClick={() => trackAnalyticsEvent('sticky_mobile_cta_clicked', { path: pathname })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-slate-950 shadow-skeuo-gold shrink-0"
          >
            Start Free
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
