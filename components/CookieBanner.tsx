'use client';

import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'merchantpulse_cookie_consent_v1';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  decidedAt: string;
}

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [functionalConsent, setFunctionalConsent] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it does not block initial paint
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore write errors
    }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      functional: true,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      functional: false,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      necessary: true,
      analytics: analyticsConsent,
      functional: functionalConsent,
      decidedAt: new Date().toISOString(),
    });
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="cookie-banner-wrapper"
    >
      <div className="cookie-banner-box">
        <div className="cookie-banner-content">
          <div className="cookie-banner-badge">🔒 Privacy & Cookies</div>
          <p className="cookie-banner-text">
            MerchantPulse uses essential cookies to ensure our deterministic payment and revenue
            intelligence platform operates securely. With your consent, we also use privacy-first
            anonymous telemetry to enhance dashboard performance. We never sell your personal data.
          </p>

          {showPreferences && (
            <div className="cookie-prefs-panel">
              <label className="cookie-pref-item">
                <input type="checkbox" checked disabled readOnly />
                <div>
                  <strong>Strictly Necessary (Required)</strong>
                  <span>Essential for session security, rate-limiting, and CSRF protection.</span>
                </div>
              </label>

              <label className="cookie-pref-item">
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                />
                <div>
                  <strong>Privacy Telemetry (Anonymous)</strong>
                  <span>Helps us optimize query response time and pipeline execution speed.</span>
                </div>
              </label>

              <label className="cookie-pref-item">
                <input
                  type="checkbox"
                  checked={functionalConsent}
                  onChange={(e) => setFunctionalConsent(e.target.checked)}
                />
                <div>
                  <strong>Functional Preferences</strong>
                  <span>Remembers your preferred demo merchant and radar filter settings.</span>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="cookie-banner-actions">
          {showPreferences ? (
            <button
              type="button"
              className="cookie-btn cookie-btn-primary"
              onClick={handleSaveCustom}
            >
              Save Custom Choices
            </button>
          ) : (
            <>
              <button
                type="button"
                className="cookie-btn cookie-btn-primary"
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn-secondary"
                onClick={handleRejectNonEssential}
              >
                Essential Only
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn-link"
                onClick={() => setShowPreferences(true)}
              >
                Customize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
