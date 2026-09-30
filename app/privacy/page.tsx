import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy · MerchantPulse',
  description:
    'Our commitment to data protection, privacy by design, and compliance with the Digital Personal Data Protection (DPDP) Act 2023 and GDPR.',
};

export default function PrivacyPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="shell legal-shell">
        <div className="legal-header">
          <Link href="/" className="back-link">
            ← Return to Dashboard
          </Link>
          <div className="legal-tag">LEGAL COMPLIANCE & PRIVACY</div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">
            Effective Date: January 1, 2026 · Last Updated: September 2026
          </p>
        </div>

        <article className="legal-body">
          <section className="legal-section">
            <h2>1. Introduction & Overview</h2>
            <p>
              MerchantPulse Technologies Private Limited (“MerchantPulse”, “we”, “our”, or “us”),
              having its registered office at 4th Floor, Ballard House, Ballard Estate, Fort, Mumbai,
              Maharashtra 400001, India, is dedicated to protecting your privacy and confidential
              commercial information.
            </p>
            <p>
              This Privacy Policy explains how we collect, process, store, and safeguard transaction
              telemetry, merchant profile information, and system audit logs in accordance with the
              <strong> Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India,
              the Information Technology Act, 2000, and international standards including the General
              Data Protection Regulation (GDPR).
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Core Data Minimization Principle</h2>
            <p>
              MerchantPulse operates under a strict principle of data minimization:
            </p>
            <ul>
              <li>
                <strong>No Primary Cardholder Data Stored:</strong> We do NOT store credit or debit card
                numbers, CVVs, PINs, or banking passwords. All payment tokenization and card processing
                take place exclusively within Razorpay’s certified PCI-DSS Level 1 environment.
              </li>
              <li>
                <strong>Pseudonymized Customer Identifiers:</strong> Customer references are stored
                as hashed or opaque identifiers (e.g., <code>cust_repeat_1</code>) rather than cleartext
                names or national identity numbers.
              </li>
              <li>
                <strong>Deterministic Processing:</strong> Transaction event data is processed to detect
                technical failure categories (network timeout, authentication decline) and derive
                aggregate recovery opportunities.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Information We Collect</h2>
            <p>We collect and process the following categories of data:</p>
            <ol>
              <li>
                <strong>Merchant Account Information:</strong> Business name, registered address, authorized
                signatory contact information, and business email address.
              </li>
              <li>
                <strong>Payment Event Metadata:</strong> Order IDs, payment transaction identifiers,
                amounts in paise, payment methods (card, UPI, netbanking), gateway response error codes,
                and attempt timestamps received via verified Razorpay webhooks.
              </li>
              <li>
                <strong>System Audit Records:</strong> An immutable, append-only log of pipeline decisions,
                including policy evaluations, intervention proposals, and operator approvals.
              </li>
              <li>
                <strong>Technical & Telemetry Data:</strong> IP addresses, browser user agent, session
                identifiers, and request timestamps strictly utilized for rate-limiting, CSRF prevention,
                and DDoS defense.
              </li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>4. Purpose of Data Processing</h2>
            <p>We process your data strictly for legitimate business and technical purposes:</p>
            <ul>
              <li>Identifying systemic payment gateway drop-offs and revenue leakage.</li>
              <li>Evaluating deterministic policy constraints before initiating payment recovery flows.</li>
              <li>Maintaining immutable compliance audit trails for financial reconciliation.</li>
              <li>Securing API endpoints against automated brute-force attacks and abuse.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Sub-Processors and Data Transfers</h2>
            <p>
              We partner solely with industry-certified infrastructure providers:
            </p>
            <ul>
              <li>
                <strong>Razorpay Software Private Limited:</strong> Payment gateway and webhook delivery.
              </li>
              <li>
                <strong>Google Cloud Platform (India Region - Mumbai / Delhi):</strong> Encrypted cloud hosting,
                secure database backups, and AI strategy generation behind private VPC endpoints.
              </li>
            </ul>
            <p>
              Data is stored primarily within India in full compliance with the Reserve Bank of India (RBI)
              mandates on storage of payment system data.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Rights Under DPDP Act 2023</h2>
            <p>
              As a merchant or designated data principal, you possess the right to:
            </p>
            <ul>
              <li>Request a summary of personal and business data processed by MerchantPulse.</li>
              <li>Request correction or updating of inaccurate account records.</li>
              <li>Request erasure of obsolete data, subject to statutory taxation and audit obligations.</li>
              <li>Register grievances with our designated Data Protection Officer.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Contact Our Data Protection Officer</h2>
            <p>
              For privacy inquiries, audit disclosures, or to exercise your rights, please reach out to:
            </p>
            <div className="legal-contact-card">
              <strong>Data Protection & Grievance Officer</strong>
              <br />
              MerchantPulse Technologies Private Limited
              <br />
              Ballard House, Adi Marzban Path, Ballard Estate,
              <br />
              Fort, Mumbai 400001, Maharashtra, India.
              <br />
              Email:{' '}
              <a href="mailto:privacy@merchantpulse.in" className="text-amber">
                privacy@merchantpulse.in
              </a>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
