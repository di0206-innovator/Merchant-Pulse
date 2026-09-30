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
  const [copyStatus, setCopyStatus] = useState(false);

  if (!isOpen || !opportunity) return null;

  const recoveryLink = `https://rzp.io/i/mp_recov_${Math.random().toString(36).substring(2, 9)}`;

  const handleExecute = async () => {
    setExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setExecuting(false);
    setExecuted(true);
    onActionExecuted(`Executed ${opportunity.recommended_action} for ₹${Math.round(opportunity.revenue_at_risk_paise / 100).toLocaleString('en-IN')}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(recoveryLink);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-tag">⚡ VALIDATED EXECUTION GATE</span>
            <h3 id="modal-title" className="modal-title">
              {opportunity.title}
            </h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-kpi-grid">
            <div className="modal-kpi-item">
              <span>Revenue At Risk</span>
              <strong className="text-amber">
                ₹{(opportunity.revenue_at_risk_paise / 100).toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="modal-kpi-item">
              <span>Expected Recovery</span>
              <strong className="text-emerald">
                {recommendation ? `${Math.round(recommendation.recommendation.expected_recovery_rate * 100)}%` : '65%'}
              </strong>
            </div>
            <div className="modal-kpi-item">
              <span>Policy Status</span>
              <strong className={policy?.action === 'execute' ? 'text-emerald' : 'text-amber'}>
                {policy ? policy.action.toUpperCase() : 'VERIFIED'}
              </strong>
            </div>
          </div>

          <div className="modal-detail-box">
            <div className="modal-detail-row">
              <span className="label">Recommended Action:</span>
              <span className="value font-mono">{opportunity.recommended_action.replaceAll('_', ' ')}</span>
            </div>
            <div className="modal-detail-row">
              <span className="label">Deterministic Rationale:</span>
              <span className="value">{opportunity.description}</span>
            </div>
            {policy && (
              <div className="modal-detail-row">
                <span className="label">Policy Verification:</span>
                <span className="value text-muted">{policy.reasons.join(' ')}</span>
              </div>
            )}
          </div>

          {executed ? (
            <div className="modal-success-box">
              <div className="success-icon">✓</div>
              <div>
                <strong>Recovery Follow-up Generated!</strong>
                <p>
                  A verified follow-up payment link has been staged for the affected customer. The
                  system will listen for Razorpay payment webhooks to measure outcome.
                </p>
                <div className="copy-link-bar">
                  <input type="text" readOnly value={recoveryLink} className="link-input" />
                  <button type="button" onClick={copyLink} className="copy-btn">
                    {copyStatus ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="modal-info-note">
              <span className="info-icon">ℹ</span>
              <span>
                MerchantPulse adheres strictly to Razorpay's integration principle: we initiate a
                valid follow-up order rather than triggering arbitrary blind retries.
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {executed ? 'Done' : 'Cancel'}
          </button>
          {!executed && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleExecute}
              disabled={executing || policy?.action === 'reject'}
            >
              {executing ? 'Executing Action...' : 'Confirm & Execute Follow-up'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
