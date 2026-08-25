'use client';

import React, { useState } from 'react';
import { MaterialAppLayout } from '@/components/layout/MaterialAppLayout';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, Search, Filter, Download, Lock } from 'lucide-react';

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const auditLogs = [
    {
      id: 'aud_001',
      timestamp: '2026-08-25 10:45:12',
      opportunityId: 'opp_890123',
      actionType: 'CREATE_PAYMENT_LINK',
      evPaise: 344000,
      policyStatus: 'PASSED',
      ruleEvaluated: 'EV_GREATER_THAN_THRESHOLD (₹3,440 > ₹20)',
      razorpayRef: 'plink_Pz01928374',
    },
    {
      id: 'aud_002',
      timestamp: '2026-08-25 10:42:05',
      opportunityId: 'opp_890124',
      actionType: 'SEND_PAYMENT_REMINDER',
      evPaise: 120000,
      policyStatus: 'PASSED',
      ruleEvaluated: 'COOLDOWN_PERIOD_VALID (24h Window)',
      razorpayRef: 'msg_Rz99887711',
    },
    {
      id: 'aud_003',
      timestamp: '2026-08-25 10:35:50',
      opportunityId: 'opp_890125',
      actionType: 'ESCALATE_TO_OPS',
      evPaise: 6500000,
      policyStatus: 'ESCALATED',
      ruleEvaluated: 'GMV_EXCEEDS_AUTO_EXECUTION_CAP (₹65,000 > ₹25,000)',
      razorpayRef: 'esc_Qz55443322',
    },
    {
      id: 'aud_004',
      timestamp: '2026-08-25 10:15:30',
      opportunityId: 'opp_890126',
      actionType: 'NOTIFY_ALTERNATIVE_METHOD',
      evPaise: 45000,
      policyStatus: 'PASSED',
      ruleEvaluated: 'GATEWAY_DEGRADATION_DETECTED (HDFC 45% failure rate)',
      razorpayRef: 'plink_Mz11223344',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.opportunityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ruleEvaluated.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.policyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MaterialAppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 m3-elevation-1">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tamper-Evident Audit Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Compliance & Policy Audit Trail
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deterministic verification of every EV decision, policy guardrail, and Razorpay API execution.
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all">
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Compliance Report</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search opportunity ID, action type, or rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASSED">Passed</option>
              <option value="ESCALATED">Escalated</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Audit Data Table */}
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden m3-elevation-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Audit ID / Time</th>
                  <th className="py-3.5 px-4">Opportunity ID</th>
                  <th className="py-3.5 px-4">Recommended Action</th>
                  <th className="py-3.5 px-4">Net EV (₹)</th>
                  <th className="py-3.5 px-4">Policy Status</th>
                  <th className="py-3.5 px-4">Evaluated Rule</th>
                  <th className="py-3.5 px-4">Razorpay Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{log.id}</div>
                      <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                    </td>
                    <td className="py-3.5 px-4 text-blue-400 font-bold">{log.opportunityId}</td>
                    <td className="py-3.5 px-4 font-semibold">{log.actionType}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      ₹{(log.evPaise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.policyStatus === 'PASSED'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {log.policyStatus === 'PASSED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{log.policyStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {log.ruleEvaluated}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {log.razorpayRef}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MaterialAppLayout>
  );
}
