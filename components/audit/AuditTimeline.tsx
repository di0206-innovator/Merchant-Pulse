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
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            Closed-Loop Decision Audit Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically traceable provenance: Trigger Event → Metrics → AI Strategy → Policy → Razorpay Execution → Recovery Outcome
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 uppercase">
          {auditRecords.length} Immutable Decisions
        </span>
      </div>

      <div className="space-y-4">
        {auditRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
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
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 font-sans text-xs"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-[11px] border border-blue-500/20">
                      {record.decisionId}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      Trigger: {record.eventId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-[11px]">{dateStr}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      record.actionStatus === 'AUTO_EXECUTED' || record.actionStatus === 'MANUALLY_APPROVED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : record.actionStatus === 'ESCALATED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {record.actionStatus}
                    </span>
                  </div>
                </div>

                {/* Provenance Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Step 1: Deterministic Metrics */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/40">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      1. Deterministic Truth
                    </div>
                    <div className="font-mono font-bold text-white">GMV: ₹{inr}</div>
                    <div className="font-mono text-blue-400">EV: ₹{evInr}</div>
                    <div className="text-slate-400 text-[11px] truncate">Code: {record.deterministicMetrics.failureCode || 'GATEWAY_ERR'}</div>
                  </div>

                  {/* Step 2: AI Proposal */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/40">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      2. AI Strategy (Gemini)
                    </div>
                    <div className="font-bold text-blue-300 truncate">
                      {record.aiRecommendation.recommendedActionType}
                    </div>
                    <div className="text-slate-400 text-[11px] line-clamp-2">
                      {record.aiRecommendation.diagnosis}
                    </div>
                  </div>

                  {/* Step 3: Policy Verdict */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/40">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      3. Policy Engine
                    </div>
                    <div className="font-bold text-emerald-400">
                      {record.policyResult.verdict}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {record.policyResult.ruleResults.filter(r => r.passed).length}/{record.policyResult.ruleResults.length} rules passed
                    </div>
                  </div>

                  {/* Step 4: Razorpay Execution & Outcome */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/40">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      4. Razorpay Outcome
                    </div>
                    {record.executedActionId ? (
                      <div>
                        <div className="font-mono text-blue-400 text-[11px] truncate">{record.executedActionId}</div>
                        <div className={`font-mono font-bold text-[11px] mt-0.5 ${
                          record.outcome?.status === 'RECOVERED' ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                          Outcome: {record.outcome?.status || 'PENDING'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 font-mono text-[11px]">
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
