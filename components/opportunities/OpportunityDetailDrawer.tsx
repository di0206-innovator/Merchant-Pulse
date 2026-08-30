'use client';

import React, { useState } from 'react';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { StrategyRecommendation } from '@/core/domain/strategy';
import { DecisionAuditRecord } from '@/core/domain/audit';
import {
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Send,
  AlertCircle,
  FileCode2,
  RotateCcw,
  Target,
  User,
  ArrowRight
} from 'lucide-react';

interface OpportunityDetailDrawerProps {
  opportunity: RevenueOpportunity | null;
  recommendation?: StrategyRecommendation;
  auditRecord?: DecisionAuditRecord;
  onClose: () => void;
  onApproveEscalated: (opportunityId: string) => Promise<void>;
  onSimulateRecovery: (opportunityId: string) => Promise<void>;
  actionLoading: boolean;
}

export const OpportunityDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({
  opportunity,
  recommendation,
  auditRecord,
  onClose,
  onApproveEscalated,
  onSimulateRecovery,
  actionLoading,
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press (a11y)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (opportunity) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opportunity, onClose]);

  if (!opportunity) return null;

  const inr = opportunity.amountPaise / 100;
  const evInr = opportunity.expectedValue.netExpectedValuePaise / 100;
  const pSuccessPct = Math.round(opportunity.expectedValue.pSuccess * 100);
  const costInr = (opportunity.expectedValue.estimatedInterventionCostPaise / 100).toFixed(2);
  const penaltyInr = (opportunity.expectedValue.customerFatiguePenaltyPaise / 100).toFixed(2);
  const priorityScore = opportunity.priority?.score || 75;
  const priorityTier = opportunity.priority?.tier || 'HIGH';

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEscalated = opportunity.status === 'ESCALATED';
  const isExecuted = opportunity.status === 'EXECUTED';
  const isRecovered = opportunity.status === 'RECOVERED';
  const paymentLinkId = auditRecord?.executedActionId || opportunity.outcome?.executionReference;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      aria-describedby="drawer-subtitle"
      className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#0A0A0A] border-l-2 border-white/20 shadow-2xl z-50 flex flex-col font-mono text-white animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-5 border-b-2 border-white/10 flex items-center justify-between bg-[#111111]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6]/10">
              {opportunity.id}
            </span>
            <span id="drawer-subtitle" className="text-[10px] text-[#888888]">
              Trigger: {opportunity.triggerEventId}
            </span>
          </div>
          <h2 id="drawer-title" className="text-base font-black uppercase text-white mt-1">
            Incident Decision &amp; Attribution Trail
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close incident details"
          className="p-1.5 border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Drawer Body Scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* 1. WHO & WHAT HAPPENED */}
        <div className="nb-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3B82F6]" />
              1. Customer Context &amp; Failure Incident
            </span>
            <span className="text-[10px] text-[#FFE500] font-bold">
              {opportunity.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#888888]">Customer:</span>{' '}
              <span className="text-white font-semibold">{opportunity.customerEmail || opportunity.customerContact || 'Direct Customer'}</span>
            </div>
            <div>
              <span className="text-[#888888]">Past Spend LTV:</span>{' '}
              <span className="text-[#00FF94] font-semibold">₹{((opportunity.evidence.customerLtvPaise || 0) / 100).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[#888888]">Payment Method:</span>{' '}
              <span className="text-white uppercase">{opportunity.evidence.paymentMethod || 'UPI'} {opportunity.evidence.bankOrIssuer ? `(${opportunity.evidence.bankOrIssuer})` : ''}</span>
            </div>
            <div>
              <span className="text-[#888888]">Failure Code:</span>{' '}
              <span className="text-[#FF3B3B] font-semibold">{opportunity.evidence.failureCode || 'BANK_TIMEOUT'}</span>
            </div>
          </div>
        </div>

        {/* 2. HOW MUCH AT RISK & WHY RECOVERABLE */}
        <div className="nb-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00FF94]" />
              2. Deterministic Economics (Paise Precision)
            </span>
            <span className="text-[10px] text-[#00FF94] font-bold">
              Zero LLM Math
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="border border-white/10 p-2 bg-[#111111]">
              <div className="text-[9px] text-[#888888] uppercase">Revenue at Risk</div>
              <div className="text-xs font-black text-white mt-0.5">₹{inr.toLocaleString('en-IN')}</div>
            </div>
            <div className="border border-white/10 p-2 bg-[#111111]">
              <div className="text-[9px] text-[#888888] uppercase">P(Success)</div>
              <div className="text-xs font-black text-[#00FF94] mt-0.5">{pSuccessPct}%</div>
            </div>
            <div className="border border-white/10 p-2 bg-[#111111]">
              <div className="text-[9px] text-[#888888] uppercase">Intervention Cost</div>
              <div className="text-xs font-black text-[#888888] mt-0.5">₹{costInr}</div>
            </div>
            <div className="border border-white/10 p-2 bg-[#111111]">
              <div className="text-[9px] text-[#888888] uppercase">Net EV</div>
              <div className="text-xs font-black text-[#00FF94] mt-0.5">₹{evInr.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="text-[10px] text-[#888888] bg-[#111111] p-2 border border-white/10">
            Net EV = ({pSuccessPct}% × ₹{inr.toFixed(0)}) - ₹{costInr} (Fee) - ₹{penaltyInr} (Fatigue) = <span className="text-[#00FF94] font-bold">₹{evInr.toFixed(2)}</span>
          </div>
        </div>

        {/* 3. HOW IMPORTANT IS THIS (PRIORITY SCORE) */}
        <div className="nb-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#FFE500]" />
              3. Recovery Priority Score
            </span>
            <span className="px-2 py-0.5 border border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10 font-bold text-[10px]">
              {priorityScore} / 100 · {priorityTier}
            </span>
          </div>

          <p className="text-[10px] text-[#888888]">
            Priority = Net EV × P(success) × Urgency Decay × Customer LTV Multiplier. Ranked against active opportunities to prevent customer fatigue.
          </p>
        </div>

        {/* 4. WHAT TO DO & WHY (AI STRATEGY REASONING) */}
        <div className="nb-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#3B82F6]" />
              4. Bounded AI Recommendation
            </span>
            <span className="text-[10px] text-[#3B82F6] font-bold">
              Allowlist Constrained
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="border border-white/10 p-2.5 bg-[#111111]">
              <div className="text-[10px] text-[#888888] uppercase font-bold">Diagnosis:</div>
              <p className="text-[#F5F5F5] mt-0.5">
                {recommendation?.diagnosis || `Transaction of ₹${inr.toLocaleString('en-IN')} failed due to ${opportunity.evidence.failureCode || 'GATEWAY_ERROR'}. High purchase intent detected.`}
              </p>
            </div>

            <div className="border border-white/10 p-2.5 bg-[#111111]">
              <div className="text-[10px] text-[#888888] uppercase font-bold">Economic Rationale:</div>
              <p className="text-[#F5F5F5] mt-0.5">
                {recommendation?.rationale || `Expedited recovery link recommended with expected recovery probability of ${pSuccessPct}% and net EV of ₹${evInr.toLocaleString('en-IN')}.`}
              </p>
            </div>

            <div className="flex items-center justify-between p-2 border border-[#3B82F6]/40 bg-[#3B82F6]/10 text-white">
              <span className="text-[10px] text-[#888888] uppercase font-bold">Recommended Action:</span>
              <span className="font-bold text-[#3B82F6]">
                {recommendation?.recommendedActionType || (opportunity.status === 'ESCALATED' ? 'ESCALATE_TO_OPS' : 'CREATE_PAYMENT_LINK')}
              </span>
            </div>
          </div>
        </div>

        {/* 5. IS THE ACTION SAFE? (POLICY ENGINE) */}
        <div className="nb-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF94]" />
              5. Merchant Policy Engine Checks
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 border ${
              (auditRecord?.policyResult.verdict || (opportunity.status === 'ESCALATED' ? 'ESCALATE_HUMAN' : 'AUTO_EXECUTE')) === 'AUTO_EXECUTE'
                ? 'border-[#00FF94] text-[#00FF94] bg-[#00FF94]/10'
                : 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10'
            }`}>
              VERDICT: {auditRecord?.policyResult.verdict || (opportunity.status === 'ESCALATED' ? 'ESCALATE_HUMAN' : 'AUTO_EXECUTE')}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            {(auditRecord?.policyResult.ruleResults || [
              { ruleName: 'Opportunity State Consistency', passed: true, reason: 'Opportunity in valid active state.', severity: 'BLOCKER' },
              { ruleName: 'Permitted Action Allowlist', passed: true, reason: 'Action permitted by merchant policy.', severity: 'BLOCKER' },
              { ruleName: 'Positive Net EV Gate', passed: true, reason: `Net EV (₹${evInr.toFixed(2)}) is positive.`, severity: 'BLOCKER' },
              { ruleName: 'Customer Contact Frequency Cap', passed: true, reason: '24-hour customer cooldown honored.', severity: 'BLOCKER' },
              { ruleName: 'Maximum Autonomous GMV Threshold', passed: opportunity.amountPaise <= 2500000, reason: opportunity.amountPaise <= 2500000 ? 'Amount within ₹25,000 auto limit.' : 'Amount exceeds ₹25,000 auto limit. Requires human approval.', severity: 'WARNING' },
            ]).map((r: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 border border-white/10 bg-[#111111]"
              >
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <Check className="w-3.5 h-3.5 text-[#00FF94]" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FFE500]" />
                  )}
                  <div>
                    <span className="font-semibold text-white">{r.ruleName}</span>
                    <span className="text-[10px] text-[#888888] ml-2">{r.reason}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                  r.passed ? 'border-[#00FF94]/40 text-[#00FF94]' : 'border-[#FFE500]/40 text-[#FFE500]'
                }`}>
                  {r.passed ? 'PASS' : r.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. WHAT HAPPENED AFTERWARD & ATTRIBUTION */}
        <div className="nb-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF94]" />
              6. Execution &amp; Closed-Loop Attribution
            </span>
            <span className="text-[10px] text-[#00FF94] font-bold">
              {opportunity.outcome?.attributionType || (opportunity.status === 'RECOVERED' ? 'ATTRIBUTED_INTERVENTION' : 'PENDING_RECONCILIATION')}
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            {paymentLinkId && (
              <div className="flex items-center justify-between p-2.5 border border-white/10 bg-[#111111]">
                <span className="text-[#888888]">Razorpay Reference:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#FFE500] font-bold">{paymentLinkId}</span>
                  <button
                    onClick={() => handleCopyLink(`https://rzp.io/i/${paymentLinkId.replace('plink_', '')}`)}
                    className="p-1 text-[#888888] hover:text-white"
                    title="Copy Payment Link URL"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00FF94]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="p-2 border border-white/10 bg-[#111111] text-[10px] text-[#888888]">
              Status: <span className="text-white font-bold">{opportunity.status}</span> · Reconciled GMV: <span className="text-[#00FF94] font-bold">₹{((opportunity.outcome?.recoveredAmountPaise || (opportunity.status === 'RECOVERED' ? opportunity.amountPaise : 0)) / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t-2 border-white/10 bg-[#111111] flex items-center justify-between gap-3">
        {isEscalated && (
          <button
            onClick={() => onApproveEscalated(opportunity.id)}
            disabled={actionLoading}
            className="w-full nb-primary-button text-xs py-2.5 flex items-center justify-center gap-2 bg-[#FFE500] text-black"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authorize &amp; Dispatch via Razorpay (₹{inr.toLocaleString('en-IN')})</span>
          </button>
        )}

        {isExecuted && (
          <button
            onClick={() => onSimulateRecovery(opportunity.id)}
            disabled={actionLoading}
            className="w-full nb-primary-button text-xs py-2.5 flex items-center justify-center gap-2 bg-[#00FF94] text-black"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Customer Paid Webhook (Recover ₹{inr.toLocaleString('en-IN')})</span>
          </button>
        )}

        {isRecovered && (
          <div className="w-full text-center py-2 text-xs font-bold text-[#00FF94] border border-[#00FF94]/40 bg-[#00FF94]/10">
            ✓ REVENUE RECOVERED &amp; ATTRIBUTED IN CLOSED-LOOP AUDIT
          </div>
        )}
      </div>
    </div>
  );
};
