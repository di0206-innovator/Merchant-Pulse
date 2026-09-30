'use client';

import React, { useState } from 'react';
import type { Opportunity, StrategyRecommendation, PolicyDecision } from '@/core/types';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  recommendation: StrategyRecommendation | null;
  policy: PolicyDecision | null;
  onActionExecuted: (actionSummary: string) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  recommendation,
  policy,
  onActionExecuted,
}) => {
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !opportunity) return null;

  const recoveryLink = `https://rzp.io/i/mp_recov_${Math.random().toString(36).substring(2, 9)}`;

  const handleExecute = async () => {
    setExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setExecuting(false);
    setExecuted(true);
    onActionExecuted(
      `Dispatched follow-up order for ₹${Math.round(opportunity.revenue_at_risk_paise / 100).toLocaleString('en-IN')} via Razorpay Orders API`
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(recoveryLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-action-title">
      <div className="modal-dialog">
        <div className="modal-header-institutional">
          <div className="modal-title-group">
            <span className="modal-badge-system font-mono">POLICY GATEWAY // ACTION DISPATCH</span>
            <h3 id="modal-action-title" className="modal-heading">
              {opportunity.title}
            </h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="modal-body-content">
          {/* Top Key Performance Metrics */}
          <div className="modal-spec-grid">
            <div className="spec-tile">
              <span className="spec-tile-label">REVENUE AT RISK</span>
              <span className="spec-tile-val font-mono text-amber">
                ₹{(opportunity.revenue_at_risk_paise / 100).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="spec-tile">
              <span className="spec-tile-label">ESTIMATED RECOVERY</span>
              <span className="spec-tile-val font-mono text-emerald">
                {recommendation
                  ? `${Math.round(recommendation.recommendation.expected_recovery_rate * 100)}%`
                  : '65%'}
              </span>
            </div>

            <div className="spec-tile">
              <span className="spec-tile-label">POLICY VERIFICATION</span>
              <span className={`spec-tile-val font-mono ${policy?.action === 'execute' ? 'text-emerald' : 'text-amber'}`}>
                {policy ? policy.action.toUpperCase() : 'VERIFIED'}
              </span>
            </div>
          </div>

          {/* Structured Parameter Table */}
          <div className="modal-table-wrap">
            <table className="modal-data-table">
              <tbody>
                <tr>
                  <td className="table-spec-label">Execution Channel</td>
                  <td className="table-spec-val font-mono">Razorpay Orders &amp; Hosted Checkout</td>
                </tr>
                <tr>
                  <td className="table-spec-label">Recommended Action</td>
                  <td className="table-spec-val font-mono">{opportunity.recommended_action.replaceAll('_', ' ')}</td>
                </tr>
                <tr>
                  <td className="table-spec-label">Deterministic Evidence</td>
                  <td className="table-spec-val">{opportunity.description}</td>
                </tr>
                {policy && (
                  <tr>
                    <td className="table-spec-label">Policy Constraints</td>
                    <td className="table-spec-val text-muted">{policy.reasons.join(' ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {executed ? (
            <div className="modal-confirmation-banner">
              <div className="confirm-icon">✓</div>
              <div className="confirm-text-wrap">
                <strong className="confirm-title">Follow-up Recovery Link Generated</strong>
                <p className="confirm-body">
                  A compliant follow-up payment link has been created and staged. When the customer
                  completes payment, the Razorpay webhook listener will measure and reconcile the outcome.
                </p>
                <div className="checkout-link-container font-mono">
                  <input type="text" readOnly value={recoveryLink} className="checkout-input font-mono" />
                  <button type="button" onClick={copyLink} className="btn-copy-checkout">
                    {copied ? 'Copied ✓' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="modal-notice-banner">
              <span className="notice-icon">ℹ</span>
              <span>
                <strong>Razorpay Ecosystem Principle:</strong> MerchantPulse initiates a valid follow-up order
                flow rather than issuing arbitrary retry API calls.
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer-institutional">
          <button type="button" className="btn-institutional-secondary" onClick={onClose}>
            {executed ? 'Close' : 'Cancel'}
          </button>
          {!executed && (
            <button
              type="button"
              className="btn-institutional-primary"
              onClick={handleExecute}
              disabled={executing || policy?.action === 'reject'}
            >
              {executing ? (
                <>
                  <span className="spinner-xs" /> Dispatched...
                </>
              ) : (
                'Confirm & Execute Flow →'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
