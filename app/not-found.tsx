import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '404 - Ledger Page Not Found · MerchantPulse',
  description: 'The requested route does not exist in the MerchantPulse revenue intelligence network.',
};

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="shell notfound-shell">
        <div className="card notfound-card">
          <div className="notfound-code">404</div>
          <span className="notfound-tag">ROUTE NOT FOUND IN EVENT LEDGER</span>
          <h1 className="notfound-title">Page Missing or Unreconciled</h1>
          <p className="notfound-desc">
            The endpoint or resource you are looking for has either been moved, updated to a higher
            security tier, or was not registered in the MerchantPulse route map.
          </p>

          <div className="notfound-links-box">
            <span className="links-box-title">Recommended Destinations:</span>
            <div className="quick-links-grid">
              <Link href="/" className="quick-link-card">
                <strong>⚡ Revenue Radar</strong>
                <span>Return to main analytics dashboard</span>
              </Link>
              <Link href="/admin" className="quick-link-card">
                <strong>🔒 Admin Room</strong>
                <span>System status and security diagnostics</span>
              </Link>
              <Link href="/contact" className="quick-link-card">
                <strong>💬 Enterprise Support</strong>
                <span>Reach our payment engineering team</span>
              </Link>
              <Link href="/privacy" className="quick-link-card">
                <strong>📜 Privacy & Security</strong>
                <span>Read our DPDP compliance manifesto</span>
              </Link>
            </div>
          </div>

          <Link href="/" className="btn-primary" style={{ marginTop: 24 }}>
            ← Back to Home Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
