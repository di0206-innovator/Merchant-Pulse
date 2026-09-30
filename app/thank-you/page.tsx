import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Action Confirmed · MerchantPulse',
  description: 'Payment recovery action confirmed and recorded on the immutable audit trail.',
};

export default function ThankYouPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="shell confirmation-shell">
        <div className="card confirmation-card">
          <div className="confirmation-badge-icon">✓</div>
          <span className="confirmation-tag">AUDIT EVENT RECORDED</span>
          <h1 className="confirmation-title">Revenue Action Confirmed</h1>
          <p className="confirmation-desc">
            Your recovery intervention has been successfully verified through the deterministic policy
            engine and dispatched to the Razorpay checkout pipeline.
          </p>

          <div className="receipt-box">
            <div className="receipt-row">
              <span className="receipt-label">Reference ID</span>
              <span className="receipt-val font-mono">REC-2026-MP9940</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Execution Channel</span>
              <span className="receipt-val">Razorpay Hosted Checkout / QR</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Policy Status</span>
              <span className="receipt-val text-emerald">PASSED (Budget & Risk Validated)</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Timestamp</span>
              <span className="receipt-val font-mono">{new Date().toUTCString()}</span>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link href="/" className="btn-primary">
              Return to Intelligence Dashboard
            </Link>
            <Link href="/admin" className="btn-secondary">
              View In Audit Trail
            </Link>
          </div>

          <div className="confirmation-footer-note">
            Need custom enterprise recovery rules?{' '}
            <Link href="/contact" className="text-amber">
              Contact our fintech solutions architects →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
