import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, Mail, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & DPDP Act Compliance',
  description: 'How MerchantPulse protects merchant and shopper payment telemetry under RBI Tokenization and the India DPDP Act 2023.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-nb-bg text-nb-white py-12 px-4 sm:px-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="nb-secondary-button text-xs py-2 px-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <span className="nb-chip-green text-[10px]">
            <Lock className="w-3 h-3" aria-hidden="true" />
            DPDP Act 2023 &amp; RBI Compliant
          </span>
        </div>

        <article className="nb-panel p-8 sm:p-10 space-y-6 shadow-skeuo-card-lg">
          <header className="border-b border-nb-stroke/50 pb-6 space-y-2">
            <div className="nb-eyebrow">Legal &amp; Trust Center</div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="font-mono text-xs text-nb-muted">
              Effective Date: October 1, 2026 · Last Updated: October 16, 2026
            </p>
          </header>

          <section className="space-y-3 font-mono text-xs leading-6 text-nb-muted">
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              1. Zero Cardholder PAN/CVV Storage (RBI Tokenization Compliance)
            </h2>
            <p>
              MerchantPulse Technologies Pvt. Ltd. (&quot;MerchantPulse&quot;, &quot;we&quot;, &quot;our&quot;) never collects, stores, or processes raw credit/debit card numbers (PAN), CVV codes, or UPI PINs. We exclusively ingest HMAC-verified Razorpay webhook metadata (<code className="text-amber-400">payment.failed</code>, <code className="text-amber-400">payment.captured</code>, <code className="text-amber-400">payment_link.paid</code>) containing tokenized identifiers, failure codes, and order references.
            </p>
          </section>

          <section className="space-y-3 font-mono text-xs leading-6 text-nb-muted">
            <h2 className="text-sm font-black uppercase text-white">
              2. Data Collected &amp; Purpose of Processing
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Merchant Account Data:</strong> Name, business email, hashed credentials (salted PBKDF2-SHA256), role permissions, and masked API key references.</li>
              <li><strong>Transaction Telemetry:</strong> Razorpay payment IDs, order IDs, paise amounts, bank/issuer failure codes, and customer contact identifiers solely for executing merchant-authorized payment recovery links.</li>
              <li><strong>Bounded AI Processing:</strong> Anonymized failure context is evaluated via deterministic rules and bounded schema-validated AI prompts without training external foundation models on merchant PII.</li>
            </ul>
          </section>

          <section className="space-y-3 font-mono text-xs leading-6 text-nb-muted">
            <h2 className="text-sm font-black uppercase text-white">
              3. Data Retention, Tenant Isolation &amp; Rights (India DPDP Act 2023)
            </h2>
            <p>
              All records are logically isolated per merchant tenant using PostgreSQL Row-Level Security (RLS). Customers and merchants may request data export, correction, or erasure at any time by contacting our Data Protection Officer.
            </p>
          </section>

          <section className="p-5 rounded-xl border border-nb-stroke/60 bg-[var(--nb-recessed)] space-y-2 font-mono text-xs">
            <h2 className="font-black uppercase text-amber-400">
              4. Data Protection Officer &amp; Registered Office Address
            </h2>
            <p className="text-white font-bold">MerchantPulse Technologies Pvt. Ltd.</p>
            <p className="text-nb-muted flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              4th Floor, Indiqube Orion, 24th Main Rd, HSR Layout Sector 2, Bengaluru, Karnataka 560102, India
            </p>
            <p className="text-nb-muted flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              privacy@merchantpulse.io · +91 (80) 4568-9200
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
