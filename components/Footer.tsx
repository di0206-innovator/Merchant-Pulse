import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <div className="logo-badge sm">
                <span>M</span>
              </div>
              <span className="footer-brand-name">MerchantPulse</span>
            </div>
            <p className="footer-tagline">
              Autonomous, policy-governed revenue intelligence for modern Indian commerce and Razorpay
              merchants. Built on deterministic payment state transitions and transparent AI strategy.
            </p>
            <div className="footer-compliance-badges">
              <span className="comp-badge">🔒 256-Bit TLS</span>
              <span className="comp-badge">🛡️ HSTS Preloaded</span>
              <span className="comp-badge">🇮🇳 DPDP Act 2023</span>
              <span className="comp-badge">💳 Razorpay Webhook Spine</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Architecture</h4>
            <ul className="footer-links">
              <li>
                <Link href="/#radar">Opportunity Radar</Link>
              </li>
              <li>
                <Link href="/#strategy">AI Strategy Layer</Link>
              </li>
              <li>
                <Link href="/#policy">Deterministic Policy Gate</Link>
              </li>
              <li>
                <Link href="/#audit">Append-Only Audit Trail</Link>
              </li>
              <li>
                <Link href="/admin">Admin Control Room</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Legal & Security</h4>
            <ul className="footer-links">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/contact">Report Vulnerability</Link>
              </li>
              <li>
                <Link href="/thank-you">Transaction Acknowledgements</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Registered Office</h4>
            <address className="footer-address">
              <strong>MerchantPulse Technologies Pvt. Ltd.</strong>
              <br />
              4th Floor, Ballard House, Adi Marzban Path,
              <br />
              Ballard Estate, Fort, Mumbai,
              <br />
              Maharashtra 400001, India.
              <br />
              <span className="footer-contact-link">CIN: U72900MH2025PTC419820</span>
              <br />
              <span className="footer-contact-link">Email: contact@merchantpulse.in</span>
            </address>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-copy">
            © {new Date().getFullYear()} MerchantPulse Technologies Private Limited. All rights reserved.
          </div>
          <div className="footer-thesis">
            Thesis: Deterministic facts → AI strategy → policy gate → valid payment action → measured outcome.
          </div>
        </div>
      </div>
    </footer>
  );
};
