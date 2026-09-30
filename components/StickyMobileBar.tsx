'use client';

import React from 'react';

interface StickyMobileBarProps {
  onRunAudit: () => void;
  loading: boolean;
  revenueAtRisk?: number;
  onOpenRecovery?: () => void;
  hasRecoveryAction?: boolean;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  onRunAudit,
  loading,
  revenueAtRisk = 0,
  onOpenRecovery,
  hasRecoveryAction = false,
}) => {
  return (
    <div className="sticky-mobile-bar" role="region" aria-label="Quick action bar">
      <div className="sticky-mobile-content">
        <div className="sticky-mobile-info">
          <span className="sticky-label">Revenue at Risk</span>
          <span className="sticky-val">
            {revenueAtRisk > 0
              ? `₹${Math.round(revenueAtRisk / 100).toLocaleString('en-IN')}`
              : '₹15,597'}
          </span>
        </div>

        <div className="sticky-mobile-btn-group">
          {hasRecoveryAction && onOpenRecovery ? (
            <button
              type="button"
              className="sticky-action-btn primary"
              onClick={onOpenRecovery}
              aria-label="Execute payment recovery flow"
            >
              ⚡ Recover Now
            </button>
          ) : (
            <button
              type="button"
              className="sticky-action-btn primary"
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
        </div>
      </div>
    </div>
  );
};
