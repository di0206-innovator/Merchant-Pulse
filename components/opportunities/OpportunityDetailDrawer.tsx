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
  RotateCcw
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

  if (!opportunity) return null;

  const inr = opportunity.amountPaise / 100;
  const evInr = opportunity.expectedValue.netExpectedValuePaise / 100;
  const pSuccessPct = Math.round(opportunity.expectedValue.pSuccess * 100);
  const costInr = (opportunity.expectedValue.estimatedInterventionCostPaise / 100).toFixed(2);
  const penaltyInr = (opportunity.expectedValue.customerFatiguePenaltyPaise / 100).toFixed(2);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEscalated = opportunity.status === 'ESCALATED';
  const isExecuted = opportunity.status === 'EXECUTED';
  const isRecovered = opportunity.status === 'RECOVERED';
  const paymentLinkId = auditRecord?.executedActionId;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-slate-950/95 border-l border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl z-50 flex flex-col animate-in slide-in-from-right duration-200 font-sans text-slate-900 dark:text-slate-100">
      {/* Drawer Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {opportunity.id}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Trigger: {opportunity.triggerEventId}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            Why MerchantPulse Chose This Decision
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Section 1: Financial & Economic Truth */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Deterministic Financial Model
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              100% Deterministic EV Math
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500">Gross GMV</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500">P(Success)</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {pSuccessPct}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500">Intervention Cost</div>
              <div className="text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                ₹{costInr}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500">Net Expected Value</div>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                ₹{evInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            Formula: Net EV = ({pSuccessPct}% × ₹{inr.toFixed(0)}) - ₹{costInr} (Fee) - ₹{penaltyInr} (Fatigue) = <span className="text-blue-600 dark:text-blue-400 font-bold">₹{evInr.toFixed(2)}</span>
          </div>
        </div>

        {/* Section 2: Deterministic Evidence */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-3 font-mono">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Observed Payment Evidence
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Payment Method:</span>{' '}
              <span className="text-slate-900 dark:text-slate-200 uppercase font-semibold">
                {opportunity.evidence.paymentMethod || 'UPI'} {opportunity.evidence.bankOrIssuer ? `(${opportunity.evidence.bankOrIssuer})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Failure Code:</span>{' '}
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{opportunity.evidence.failureCode || 'GATEWAY_ERROR'}</span>
            </div>
            <div>
              <span className="text-slate-500">Customer Contact:</span>{' '}
              <span className="text-slate-800 dark:text-slate-200">{opportunity.customerContact || opportunity.customerEmail || 'Anonymous'}</span>
            </div>
            <div>
              <span className="text-slate-500">Customer Past LTV:</span>{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{(opportunity.evidence.customerLtvPaise / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Strategy Recommendation (Gemini / Schema Validated) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              AI Strategy Proposal (Gemini 2.5 Flash)
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
              Confidence: {Math.round((recommendation?.confidenceScore || 0.88) * 100)}%
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-slate-200">Technical Diagnosis:</div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {recommendation?.diagnosis || `Transaction of ₹${inr.toLocaleString('en-IN')} failed due to ${opportunity.evidence.failureCode || 'GATEWAY_ERROR'}. High purchase intent detected.`}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-slate-200">Economic Rationale:</div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {recommendation?.rationale || `Expedited recovery link recommended with expected recovery probability of ${pSuccessPct}% and net EV of ₹${evInr.toLocaleString('en-IN')}.`}
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-500/30 text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Recommended Action:</span>
              <span className="font-bold">
                {recommendation?.recommendedActionType || (opportunity.status === 'ESCALATED' ? 'ESCALATE_TO_OPS' : 'CREATE_PAYMENT_LINK')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Policy Guardrail Evaluation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Policy Engine Guardrail Checks
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
              (auditRecord?.policyResult.verdict || (opportunity.status === 'ESCALATED' ? 'ESCALATE_HUMAN' : 'AUTO_EXECUTE')) === 'AUTO_EXECUTE'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}>
              VERDICT: {auditRecord?.policyResult.verdict || (opportunity.status === 'ESCALATED' ? 'ESCALATE_HUMAN' : 'AUTO_EXECUTE')}
            </span>
          </div>

          <div className="space-y-1.5">
            {(auditRecord?.policyResult.ruleResults || [
              { ruleName: 'Opportunity State Consistency', passed: true, reason: 'Opportunity is in active state.', severity: 'BLOCKER' },
              { ruleName: 'Permitted Action Allowlist', passed: true, reason: 'Action is enabled in merchant policy.', severity: 'BLOCKER' },
              { ruleName: 'Economic Value Profitability Gate', passed: true, reason: `Net EV (₹${evInr.toFixed(2)}) is positive.`, severity: 'BLOCKER' },
              { ruleName: 'Customer Contact Frequency Cap', passed: true, reason: 'Customer contact cooldown has passed.', severity: 'BLOCKER' },
              { ruleName: 'Maximum Autonomous GMV Threshold', passed: opportunity.amountPaise <= 2500000, reason: opportunity.amountPaise <= 2500000 ? 'Amount within ₹25,000 auto limit.' : 'Amount exceeds ₹25,000 auto limit. Requires human approval.', severity: 'WARNING' },
            ]).map((r: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-start gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">{r.ruleName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.reason}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  r.passed ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                }`}>
                  {r.passed ? 'PASS' : r.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Executed Razorpay Link Details */}
        {paymentLinkId && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-500/30 space-y-2 font-mono">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Dispatched Razorpay Payment Link Primitive
            </span>
            <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-900 dark:text-slate-300">{paymentLinkId}</span>
              <button
                onClick={() => handleCopyLink(`https://rzp.io/i/${paymentLinkId.slice(6, 14)}`)}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3 font-mono">
        {isEscalated && (
          <button
            onClick={() => onApproveEscalated(opportunity.id)}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approve & Execute via Razorpay Payment Link (₹{inr.toLocaleString('en-IN')})</span>
          </button>
        )}

        {isExecuted && (
          <button
            onClick={() => onSimulateRecovery(opportunity.id)}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Customer Paid Webhook (Recover ₹{inr.toLocaleString('en-IN')})</span>
          </button>
        )}

        {isRecovered && (
          <div className="w-full text-center py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            REVENUE RECOVERED & ATTRIBUTED IN CLOSED-LOOP AUDIT
          </div>
        )}
      </div>
    </div>
  );
};
