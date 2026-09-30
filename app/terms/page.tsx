import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service · MerchantPulse',
  description:
    'Terms of service, integration agreements, and policy guidelines governing MerchantPulse revenue intelligence platform.',
};

export default function TermsPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="shell legal-shell">
        <div className="legal-header">
          <Link href="/" className="back-link">
            ← Return to Dashboard
          </Link>
          <div className="legal-tag">COMMERCIAL & SERVICE TERMS</div>
          <h1 className="legal-title">Terms & Conditions</h1>
          <p className="legal-subtitle">
            Effective Date: January 1, 2026 · Governed by the Laws of the Republic of India
          </p>
        </div>

        <article className="legal-body">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, integrating, or utilizing the services provided by MerchantPulse Technologies
              Private Limited (“MerchantPulse”), you agree to be bound by these Terms of Service. If you
              are entering into this agreement on behalf of a registered company, business entity, or
              merchant account, you represent that you possess the full legal authority to bind such entity.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. The MerchantPulse Architecture Principle</h2>
            <p>
              MerchantPulse provides an AI-assisted revenue intelligence and payment decisioning platform.
              Our core architecture is governed by an immutable hierarchy:
            </p>
            <div className="thesis-callout">
              <strong>Deterministic Facts → AI Strategy → Policy Gate → Valid Payment Action → Measured Outcome</strong>
            </div>
            <p>
              You acknowledge and agree that:
            </p>
            <ul>
              <li>
                <strong>No Hallucinated Actions:</strong> Large Language Models (LLMs) and probabilistic
                algorithms within MerchantPulse are never granted authority to execute financial debits,
                alter monetary balances, or invent fictitious payment APIs.
              </li>
              <li>
                <strong>Deterministic Policy Overrides:</strong> All interventions proposed by AI strategy
                layers must successfully pass through deterministic policy gates (such as daily budget limits,
                maximum payment attempts, and merchant risk criteria) prior to execution.
              </li>
              <li>
                <strong>Razorpay Ecosystem Boundary:</strong> MerchantPulse does not execute arbitrary
                “retry” API calls on behalf of payment instruments. Recovery is modeled strictly through
                valid follow-up payment links or order re-issuance, and listens for resulting verified
                webhook notifications.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Merchant Account Responsibilities</h2>
            <p>
              Merchants using MerchantPulse must:
            </p>
            <ul>
              <li>Maintain valid and compliant active merchant credentials with Razorpay.</li>
              <li>Ensure all webhook signing secrets and API credentials are kept strictly confidential.</li>
              <li>Configure reasonable policy thresholds within the Admin Control Room suitable for their risk profile.</li>
              <li>Comply with all applicable Reserve Bank of India (RBI) directives regarding cardholder authorization and chargebacks.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Intellectual Property</h2>
            <p>
              All patents, algorithms, trademarks, software code, user interface designs, and documentation
              constituting the MerchantPulse platform are the exclusive intellectual property of
              MerchantPulse Technologies Private Limited.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Limitation of Liability</h2>
            <p>
              In no event shall MerchantPulse, its directors, employees, or partners be liable for any
              indirect, incidental, special, consequential, or punitive damages, including loss of profits,
              data, goodwill, or business interruption, arising from payment gateway outages, card network
              failures, or issuer banking latencies beyond our direct control.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be construed and governed in accordance with the laws of India. Any dispute,
              controversy, or claim arising out of or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the competent courts in Mumbai, Maharashtra, India.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Inquiries & Legal Notices</h2>
            <p>
              Formal legal notices or contractual inquiries must be directed in writing to:
            </p>
            <div className="legal-contact-card">
              <strong>Legal Counsel & Corporate Secretary</strong>
              <br />
              MerchantPulse Technologies Private Limited
              <br />
              4th Floor, Ballard House, Adi Marzban Path, Ballard Estate,
              <br />
              Fort, Mumbai 400001, Maharashtra, India.
              <br />
              Email:{' '}
              <a href="mailto:legal@merchantpulse.in" className="text-amber">
                legal@merchantpulse.in
              </a>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
