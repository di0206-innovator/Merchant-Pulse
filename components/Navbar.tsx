'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onRunAudit?: () => void;
  loading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRunAudit, loading }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand-logo" aria-label="MerchantPulse Home">
          <div className="logo-badge">
            <span>M</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">MerchantPulse</span>
            <span className="brand-subtitle">मर्चेंट पल्स · REVENUE INTELLIGENCE</span>
          </div>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/#radar" className="nav-link">
            Opportunity Radar
          </Link>
          <Link href="/#strategy" className="nav-link">
            AI Strategy
          </Link>
          <Link href="/#audit" className="nav-link">
            Audit Trail
          </Link>
          <Link href="/admin" className="nav-link admin-pill">
            <span className="lock-icon">🔒</span> Admin Room
          </Link>
          <Link href="/contact" className="nav-link">
            Enterprise
          </Link>
        </nav>

        <div className="header-actions">
          <div className="engine-status-chip" title="Deterministic engine & Razorpay webhook listener online">
            <span className="status-ping" />
            <span className="status-text">Engine Online</span>
          </div>

          {onRunAudit && (
            <button
              type="button"
              className="header-cta-btn"
              onClick={onRunAudit}
              disabled={loading}
              aria-label="Run revenue analysis"
            >
              {loading ? (
                <>
                  <span className="spinner-sm" /> Running...
                </>
              ) : (
                <>⚡ Run Audit</>
              )}
            </button>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <nav className="mobile-nav-links">
            <Link href="/#radar" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Opportunity Radar
            </Link>
            <Link href="/#strategy" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              AI Strategy & Policy
            </Link>
            <Link href="/#audit" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Audit Trail
            </Link>
            <Link href="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              🔒 Admin Control Room
            </Link>
            <Link href="/contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Enterprise Contact
            </Link>
            <Link href="/privacy" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Terms of Service
            </Link>

            {onRunAudit && (
              <button
                type="button"
                className="mobile-drawer-cta"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRunAudit();
                }}
                disabled={loading}
              >
                {loading ? 'Analyzing Transactions...' : '⚡ Run Revenue Intelligence Audit'}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
