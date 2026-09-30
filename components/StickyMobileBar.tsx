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
    <div className="sticky-mobile-dock" role="region" aria-label="Mobile quick action bar">
      <div className="dock-inner">
        <div className="dock-stat-group">
          <span className="dock-stat-label font-mono">REVENUE AT RISK</span>
          <span className="dock-stat-val font-mono">
            {revenueAtRisk > 0
              ? `₹${Math.round(revenueAtRisk / 100).toLocaleString('en-IN')}`
              : '₹15,597'}
          </span>
        </div>

        <div className="dock-action-group">
          {hasRecoveryAction && onOpenRecovery ? (
            <button
              type="button"
              className="btn-dock-action primary"
              onClick={onOpenRecovery}
              aria-label="Execute payment recovery flow"
            >
              ⚡ Recover Flow
            </button>
          ) : (
            <button
              type="button"
              className="btn-dock-action primary"
              onClick={onRunAudit}
              disabled={loading}
              aria-label="Run revenue audit"
            >
              {loading ? (
                <>
                  <span className="spinner-xs" /> Running...
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
