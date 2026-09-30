'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

interface NavbarProps {
  onRunAudit?: () => void;
  loading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRunAudit, loading }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        {/* Left: Brand Identity */}
        <div className="header-left">
          <Link href="/" className="brand-logo" aria-label="MerchantPulse Home">
            <div className="brand-symbol">
              <span>M</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">MerchantPulse</span>
              <span className="brand-sub">मर्चेंट पल्स · FINANCIAL INTELLIGENCE</span>
            </div>
          </Link>

          <div className="env-tag">
            <span className="env-dot" />
            <span>Razorpay Spine v2</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link href="/#radar" className="nav-item">
            Opportunity Radar
          </Link>
          <Link href="/#strategy" className="nav-item">
            AI Strategy
          </Link>
          <Link href="/#telemetry" className="nav-item">
            Telemetry
          </Link>
          <Link href="/#audit" className="nav-item">
            Audit Trail
          </Link>
          <Link href="/admin" className="nav-item nav-admin-link">
            <span className="lock-glyph">🔒</span> Admin
          </Link>
          <Link href="/contact" className="nav-item">
            Enterprise
          </Link>
        </nav>

        {/* Right: Actions & Theme Toggle */}
        <div className="header-right">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {onRunAudit && (
            <button
              type="button"
              className="btn-header-cta"
              onClick={onRunAudit}
              disabled={loading}
              aria-label="Run revenue audit"
            >
              {loading ? (
                <>
                  <span className="spinner-xs" /> Analyzing...
                </>
              ) : (
                <>⚡ Run Audit</>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation Drawer">
          <nav className="mobile-drawer-links">
            <Link href="/#radar" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Opportunity Radar
            </Link>
            <Link href="/#strategy" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              AI Strategy & Policy
            </Link>
            <Link href="/#telemetry" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Telemetry & Failure Distribution
            </Link>
            <Link href="/#audit" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Append-Only Audit Trail
            </Link>
            <Link href="/admin" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              🔒 Admin Control Room
            </Link>
            <Link href="/contact" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Enterprise Contact
            </Link>
            <Link href="/privacy" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Privacy Policy (DPDP 2023)
            </Link>
            <Link href="/terms" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Terms of Service
            </Link>

            <div className="drawer-actions">
              <button
                type="button"
                className="drawer-theme-btn"
                onClick={toggleTheme}
              >
                Toggle Mode: {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </button>

              {onRunAudit && (
                <button
                  type="button"
                  className="drawer-cta-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRunAudit();
                  }}
                  disabled={loading}
                >
                  {loading ? 'Evaluating Payments...' : '⚡ Run Revenue Intelligence Audit'}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
