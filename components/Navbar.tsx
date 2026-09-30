'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
  onOpenCommand?: () => void;
  onRunAudit?: () => void;
  currentMerchantName?: string;
  onSwitchMerchant?: (id: string) => void;
}

export function Navbar({
  activeView = 'dashboard',
  onNavigate = () => {},
  onOpenCommand = () => {},
  onRunAudit = () => {},
  currentMerchantName = 'Northstar Commerce',
  onSwitchMerchant = () => {},
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'strategy', label: 'AI Strategy' },
    { id: 'audit', label: 'Audit Trail' },
    { id: 'policy', label: 'Policy Engine' },
    { id: 'enterprise', label: 'Enterprise' },
  ];

  const notifications = [
    { id: 'notif-1', title: 'HDFC UPI Switch Degraded', time: '4m ago', type: 'warning' },
    { id: 'notif-2', title: 'Batch Recovery Settled (+₹1.42L)', time: '12m ago', type: 'success' },
    { id: 'notif-3', title: 'RBI Pre-debit Compliance Verified', time: '35m ago', type: 'info' },
  ];

  return (
    <header className="os-top-navbar" role="banner">
      <div className="os-navbar-inner">
        {/* Left: Brand Mark & System Status */}
        <div className="os-navbar-left">
          <button
            type="button"
            className="os-brand-link"
            onClick={() => onNavigate('dashboard')}
            aria-label="MerchantPulse Home"
          >
            <div className="os-brand-mark">
              <span className="brand-mark-letter">M</span>
              <div className="brand-mark-pip" />
            </div>
            <div className="os-brand-text">
              <span className="brand-name">MerchantPulse</span>
              <span className="brand-version-chip">OS 2.0</span>
            </div>
          </button>

          <div className="os-env-pill">
            <span className="env-status-dot" />
            <span className="env-label">Razorpay Spine v2</span>
          </div>
        </div>

        {/* Center: Navigation Links (Linear/Stripe style) */}
        <nav className="os-navbar-center" aria-label="Main Navigation">
          <ul className="os-nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="os-nav-item">
                <button
                  type="button"
                  className={`os-nav-btn ${activeView === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  aria-current={activeView === item.id ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {activeView === item.id && <span className="os-nav-active-bar" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Search, Notifications, Theme, User Menu, Run Audit CTA */}
        <div className="os-navbar-right">
          {/* Quick Search / Command Palette trigger (Cmd+K) */}
          <button
            type="button"
            className="os-search-trigger"
            onClick={onOpenCommand}
            title="Open Command Palette (⌘K)"
            aria-label="Open Command Menu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="search-placeholder">Search OS...</span>
            <kbd className="os-kbd-shortcut">⌘K</kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="os-notifications-wrapper">
            <button
              type="button"
              className="os-icon-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
              title="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notif-badge">3</span>
            </button>

            {notificationsOpen && (
              <div className="os-dropdown-panel notif-panel">
                <div className="dropdown-panel-header">
                  <span className="font-semibold text-primary">System Telemetry Alerts</span>
                  <span className="text-xs text-muted">3 Unread</span>
                </div>
                <div className="dropdown-list">
                  {notifications.map((n) => (
                    <div key={n.id} className="dropdown-item notif-item">
                      <div className={`notif-indicator ${n.type}`} />
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            className="os-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* User / Merchant Selector Menu */}
          <div className="os-merchant-wrapper">
            <button
              type="button"
              className="os-merchant-pill-btn"
              onClick={() => setMerchantDropdownOpen(!merchantDropdownOpen)}
              title="Select Active Merchant"
            >
              <div className="merchant-avatar">
                {currentMerchantName.substring(0, 1)}
              </div>
              <span className="merchant-name-text">{currentMerchantName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {merchantDropdownOpen && (
              <div className="os-dropdown-panel merchant-dropdown">
                <div className="dropdown-panel-header">
                  <span className="font-semibold text-primary">Switch Merchant Org</span>
                </div>
                <div className="dropdown-list">
                  <div
                    className="dropdown-item merchant-item"
                    onClick={() => {
                      onSwitchMerchant('northstar');
                      setMerchantDropdownOpen(false);
                    }}
                  >
                    <div className="item-avatar">N</div>
                    <div className="item-text">
                      <div className="item-name">Northstar Commerce</div>
                      <div className="item-sub">High-Volume D2C · ₹18.42 Cr</div>
                    </div>
                  </div>
                  <div
                    className="dropdown-item merchant-item"
                    onClick={() => {
                      onSwitchMerchant('kolkata');
                      setMerchantDropdownOpen(false);
                    }}
                  >
                    <div className="item-avatar">K</div>
                    <div className="item-text">
                      <div className="item-name">Kolkata Artisans Co.</div>
                      <div className="item-sub">Export Guilds · $2.4M USD</div>
                    </div>
                  </div>
                  <div
                    className="dropdown-item merchant-item"
                    onClick={() => {
                      onSwitchMerchant('bengaluru');
                      setMerchantDropdownOpen(false);
                    }}
                  >
                    <div className="item-avatar">B</div>
                    <div className="item-text">
                      <div className="item-name">Bengaluru CloudStack</div>
                      <div className="item-sub">SaaS Subscriptions · ₹9.8 Cr</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action CTA: Run Audit */}
          <button
            type="button"
            className="os-btn-audit"
            onClick={onRunAudit}
            id="nav-run-audit-btn"
          >
            <span>Run Audit</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="os-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="os-mobile-drawer">
          <div className="mobile-drawer-inner">
            <div className="mobile-drawer-section">
              <span className="mobile-section-label">OPERATING SYSTEM VIEWS</span>
              <ul className="mobile-nav-list">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span>{item.label}</span>
                      {activeView === item.id && <span className="mobile-active-dot" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">ADMIN & CONTROLS</span>
              <Link
                href="/admin"
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Admin Gate Control</span>
              </Link>
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="mobile-btn-primary"
                onClick={() => {
                  onRunAudit();
                  setMobileMenuOpen(false);
                }}
              >
                Run System Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
