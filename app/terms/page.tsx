import React from 'react';
import Link from 'next/link';
import { FileCheck2, ArrowLeft, ShieldCheck, MapPin, Mail } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions & SaaS SLA',
  description: 'Terms of Service, autonomous policy guardrail governance, and SLA commitments for MerchantPulse Technologies Pvt. Ltd.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-nb-bg text-nb-white py-12 px-4 sm:px-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="nb-secondary-button text-xs py-2 px-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <span className="nb-chip-blue text-[10px]">
            <FileCheck2 className="w-3 h-3" aria-hidden="true" />
            Enterprise SaaS Agreement
          </span>
        </div>

        <article className="nb-panel p-8 sm:p-10 space-y-6 shadow-skeuo-card-lg">
          <header className="border-b border-nb-stroke/50 pb-6 space-y-2">
            <div className="nb-eyebrow">Legal &amp; Governance</div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Terms and Conditions
            </h1>
            <p className="font-mono text-xs text-nb-muted">
              Effective Date: October 1, 2026 · Governing Jurisdiction: Bengaluru, Karnataka, India
            </p>
          </header>

          <section className="space-y-3 font-mono text-xs leading-6 text-nb-muted">
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" aria-hidden="true" />
              1. Scope of Service &amp; Bounded Autonomous Execution
            </h2>
            <p>
              MerchantPulse provides an AI-assisted payment failure analysis and recovery orchestration platform for Razorpay merchants. All autonomous actions are strictly constrained to the allowlisted primitives configured by the Merchant (`CREATE_PAYMENT_LINK`, `SEND_PAYMENT_REMINDER`, `NOTIFY_ALTERNATIVE_METHOD`, `RECONCILE_ORDER_STATE`, `ESCALATE_TO_OPS`, `NO_ACTION`) and bounded by the Merchant&apos;s `maxAutoGmvPaise`, `minEvPaise`, and `contactCooldownHours` policy guardrails.
            </p>
          </section>

          <section className="space-y-3 font-mono text-xs leading-6 text-nb-muted">
            <h2 className="text-sm font-black uppercase text-white">
              2. Merchant Responsibilities &amp; Webhook Security
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Merchants must maintain valid HMAC-SHA256 webhook secrets and restrict `OWNER` and `OPS_MANAGER` RBAC credentials to authorized personnel.</li>
              <li>Merchants warrant that customer contact information supplied via Razorpay webhooks has appropriate transactional notification consent for order completion reminders.</li>
              <li>Attributed recovery fees apply exclusively to transactions verified via cryptographic `ATTRIBUTED_INTERVENTION` reconciliation; `ORGANIC_RECOVERY` events are never billed.</li>
            </ul>
          </section>

          <section className="space-y-3 font-mono text-xs leading-6 text-nb-muted">
            <h2 className="text-sm font-black uppercase text-white">
              3. Service Level Agreement (SLA) &amp; Limitation of Liability
            </h2>
            <p>
              MerchantPulse targets 99.95% webhook ingestion uptime with deterministic fallback execution whenever upstream LLM APIs experience latency or downtime. Aggregate liability under these Terms shall not exceed the total SaaS subscription fees paid by the Merchant in the preceding twelve (12) months.
            </p>
          </section>

          <section className="p-5 rounded-xl border border-nb-stroke/60 bg-[var(--nb-recessed)] space-y-2 font-mono text-xs">
            <h2 className="font-black uppercase text-amber-400">
              4. Legal Notices &amp; Contact Address
            </h2>
            <p className="text-white font-bold">MerchantPulse Technologies Pvt. Ltd.</p>
            <p className="text-nb-muted flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              4th Floor, Indiqube Orion, 24th Main Rd, HSR Layout Sector 2, Bengaluru, Karnataka 560102, India
            </p>
            <p className="text-nb-muted flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              legal@merchantpulse.io · +91 (80) 4568-9200
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
