import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-top-grid">
          <div className="footer-col-brand">
            <div className="footer-brand-header">
              <div className="brand-symbol sm">
                <span>M</span>
              </div>
              <span className="brand-name">MerchantPulse</span>
              <span className="brand-devanagari">मर्चेंट पल्स</span>
            </div>
            <p className="footer-thesis-text">
              Autonomous, policy-governed revenue intelligence for modern Indian commerce.
              Engineered on deterministic payment state transitions and transparent AI strategy.
            </p>
            <div className="footer-specs font-mono">
              <span className="spec-tag">RBI COMPLIANT DATA RESIDENCY</span>
              <span className="spec-tag">DPDP ACT 2023 READY</span>
              <span className="spec-tag">TLS 1.3 ENFORCED</span>
            </div>
          </div>

          <div className="footer-col-nav">
            <span className="footer-nav-heading">Platform</span>
            <ul className="footer-link-list">
              <li>
                <Link href="/#radar">Opportunity Radar</Link>
              </li>
              <li>
                <Link href="/#strategy">AI Strategy Layer</Link>
              </li>
              <li>
                <Link href="/#telemetry">Failure Telemetry</Link>
              </li>
              <li>
                <Link href="/#audit">Decision Audit Trail</Link>
              </li>
              <li>
                <Link href="/admin">Admin Control Room</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <span className="footer-nav-heading">Compliance &amp; Legal</span>
            <ul className="footer-link-list">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/contact">Security Advisory</Link>
              </li>
              <li>
                <Link href="/thank-you">Audit Confirmation</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <span className="footer-nav-heading">Registered Office</span>
            <address className="footer-registered-address">
              <strong>MerchantPulse Technologies Pvt. Ltd.</strong>
              <br />
              4th Floor, Ballard House, Adi Marzban Path,
              <br />
              Ballard Estate, Fort, Mumbai,
              <br />
              Maharashtra 400001, India.
              <br />
              <span className="font-mono text-muted">CIN: U72900MH2025PTC419820</span>
              <br />
              <span className="font-mono text-muted">contact@merchantpulse.in</span>
            </address>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-copyright font-mono">
            © {new Date().getFullYear()} MerchantPulse Technologies Private Limited. All rights reserved.
          </div>
          <div className="footer-axiom font-mono">
            Deterministic facts → AI strategy → policy gate → valid payment action → measured outcome.
          </div>
        </div>
      </div>
    </footer>
  );
};
