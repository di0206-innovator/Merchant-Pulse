'use client';

import React from 'react';
import { DecisionAuditRecord } from '@/core/domain/audit';
import {
  GitCommit,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown
} from 'lucide-react';

interface AuditTimelineProps {
  auditRecords: DecisionAuditRecord[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ auditRecords }) => {
  return (
    <div className="nb-panel p-5 space-y-4 shadow-skeuo-card relative">
      <div className="flex items-center justify-between border-b border-nb-stroke/50 pb-4">
        <div>
          <h2 className="text-sm font-black text-nb-white uppercase tracking-tight flex items-center gap-2">
            <span>Closed-Loop Decision Audit Ledger</span>
            <span className="skeuo-led-blue w-2 h-2" />
          </h2>
          <p className="text-xs text-nb-muted font-mono mt-0.5">
            Cryptographically traceable provenance: Trigger Event → Metrics → AI Strategy → Policy → Razorpay Execution → Recovery Outcome
          </p>
        </div>
        <span className="nb-chip-yellow text-[10px]">
          {auditRecords.length} Immutable Decisions
        </span>
      </div>

      <div className="space-y-4">
        {auditRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-nb-muted font-mono rounded-xl border border-nb-stroke/40 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
            No audit records yet. Run demo scenario or trigger webhook to generate decision logs.
          </div>
        ) : (
          auditRecords.map(record => {
            const dateStr = new Date(record.timestamp * 1000).toLocaleTimeString();
            const inr = (record.deterministicMetrics.amountPaise / 100).toLocaleString('en-IN');
            const evInr = (record.deterministicMetrics.expectedValuePaise / 100).toLocaleString('en-IN');

            return (
              <div
                key={record.decisionId}
                className="p-4 rounded-xl border border-nb-stroke/50 space-y-3 font-sans text-xs shadow-skeuo-card hover:-translate-y-0.5 transition-all duration-150"
                style={{ background: 'linear-gradient(180deg, var(--nb-surface) 0%, var(--nb-surface-2) 100%)' }}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nb-stroke/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="nb-chip-blue text-[10px] py-0.5">
                      {record.decisionId}
                    </span>
                    <span className="font-mono text-nb-muted text-[11px]">
                      Trigger: {record.eventId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-nb-muted text-[11px]">{dateStr}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border shadow-skeuo-badge ${
                      record.actionStatus === 'AUTO_EXECUTED' || record.actionStatus === 'MANUALLY_APPROVED'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        : record.actionStatus === 'ESCALATED'
                        ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                    }`}>
                      {record.actionStatus}
                    </span>
                  </div>
                </div>

                {/* Provenance Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Step 1: Deterministic Metrics */}
                  <div className="p-3 rounded-xl border border-nb-stroke/40 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
                    <div className="text-[10px] font-mono text-nb-muted uppercase tracking-wider mb-1 font-bold">
                      1. Deterministic Truth
                    </div>
                    <div className="font-mono font-bold text-nb-white tabular-nums">GMV: ₹{inr}</div>
                    <div className="font-mono text-blue-400 font-bold tabular-nums">EV: ₹{evInr}</div>
                    <div className="text-nb-muted text-[10px] truncate mt-0.5">Code: {record.deterministicMetrics.failureCode || 'GATEWAY_ERR'}</div>
                  </div>

                  {/* Step 2: AI Proposal */}
                  <div className="p-3 rounded-xl border border-nb-stroke/40 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
                    <div className="text-[10px] font-mono text-nb-muted uppercase tracking-wider mb-1 font-bold">
                      2. AI Strategy (Gemini)
                    </div>
                    <div className="font-bold text-amber-400 truncate">
                      {record.aiRecommendation.recommendedActionType}
                    </div>
                    <div className="text-nb-muted text-[10px] line-clamp-2 mt-0.5">
                      {record.aiRecommendation.diagnosis}
                    </div>
                  </div>

                  {/* Step 3: Policy Verdict */}
                  <div className="p-3 rounded-xl border border-nb-stroke/40 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
                    <div className="text-[10px] font-mono text-nb-muted uppercase tracking-wider mb-1 font-bold">
                      3. Policy Engine
                    </div>
                    <div className="font-bold text-emerald-400">
                      {record.policyResult.verdict}
                    </div>
                    <div className="text-nb-muted text-[10px] mt-0.5">
                      {record.policyResult.ruleResults.filter(r => r.passed).length}/{record.policyResult.ruleResults.length} rules passed
                    </div>
                  </div>

                  {/* Step 4: Razorpay Execution & Outcome */}
                  <div className="p-3 rounded-xl border border-nb-stroke/40 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
                    <div className="text-[10px] font-mono text-nb-muted uppercase tracking-wider mb-1 font-bold">
                      4. Razorpay Outcome
                    </div>
                    {record.executedActionId ? (
                      <div>
                        <div className="font-mono text-blue-400 text-[10px] truncate">{record.executedActionId}</div>
                        <div className={`font-mono font-bold text-[10px] mt-0.5 ${
                          record.outcome?.status === 'RECOVERED' ? 'text-emerald-400' : 'text-nb-muted'
                        }`}>
                          Outcome: {record.outcome?.status || 'PENDING'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-nb-muted font-mono text-[10px]">
                        No API action dispatched
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
