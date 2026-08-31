'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DecisionAuditRecord } from '@/core/domain/audit';
import { ShieldCheck, CheckCircle2, AlertTriangle, Search, Filter, Download, Lock, RefreshCw, FileCheck } from 'lucide-react';

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [auditLogs, setAuditLogs] = useState<DecisionAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.auditTrail && Array.isArray(data.auditTrail)) {
          setAuditLogs(data.auditTrail);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.opportunityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.decisionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.aiRecommendation.recommendedActionType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.executedActionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      log.actionStatus === statusFilter ||
      log.policyResult.verdict === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCsv = () => {
    const headers = ['Decision ID', 'Timestamp', 'Opportunity ID', 'Recommended Action', 'Net EV (Paise)', 'Policy Verdict', 'Action Status', 'Razorpay Action ID', 'Outcome Status'];
    const rows = filteredLogs.map((log) => [
      log.decisionId,
      new Date(log.timestamp * 1000).toISOString(),
      log.opportunityId,
      log.aiRecommendation.recommendedActionType,
      log.deterministicMetrics.expectedValuePaise,
      log.policyResult.verdict,
      log.actionStatus,
      log.executedActionId || 'N/A',
      log.outcome?.status || 'PENDING',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `merchantpulse_compliance_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    if (status === 'AUTO_EXECUTED' || status === 'MANUALLY_APPROVED' || status === 'PASSED') return '#00FF94';
    if (status === 'ESCALATED' || status === 'ESCALATE_HUMAN') return '#FFE500';
    return '#FF3B3B';
  };

  return (
    <AppLayout>
      <div className="nb-page">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="nb-page-header">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="nb-eyebrow">
                <Lock className="w-3.5 h-3.5" />
                Tamper-Evident Audit Ledger
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Compliance &<br />
                <span className="text-[#FFE500]">Policy Audit Trail</span>
              </h1>
              <p className="mt-3 font-mono text-xs text-[#888888] leading-6">
                Deterministic verification of every EV decision, policy guardrail, and Razorpay API execution.
              </p>
            </div>

            <button
              onClick={exportCsv}
              className="nb-primary-button shrink-0 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export Compliance Report</span>
            </button>
          </div>
        </div>

        {/* ── FILTERS ─────────────────────────────────────────── */}
        <div className="nb-panel p-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search opportunity ID, action type, or rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="nb-input pl-10 text-xs"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-[#888888]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="nb-input w-auto px-3 py-2.5 text-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASSED">Passed</option>
              <option value="ESCALATED">Escalated</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* ── AUDIT TABLE ─────────────────────────────────────── */}
        <div className="nb-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="nb-th">Audit ID / Time</th>
                  <th className="nb-th">Opportunity ID</th>
                  <th className="nb-th">Recommended Action</th>
                  <th className="nb-th">Net EV (₹)</th>
                  <th className="nb-th">Policy Status</th>
                  <th className="nb-th">Evaluated Rule</th>
                  <th className="nb-th">Razorpay Ref</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const sc = getStatusColor(log.actionStatus);
                  const dateStr = new Date(log.timestamp * 1000).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' });
                  return (
                    <tr
                      key={log.decisionId}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-xs"
                    >
                      <td className="nb-td">
                        <div className="font-black text-white">{log.decisionId}</div>
                        <div className="text-[10px] text-[#888888]">{dateStr}</div>
                      </td>
                      <td className="nb-td text-[#3B82F6] font-black">{log.opportunityId}</td>
                      <td className="nb-td font-bold text-white">{log.aiRecommendation.recommendedActionType}</td>
                      <td className="nb-td text-[#00FF94] font-black">
                        ₹{(log.deterministicMetrics.expectedValuePaise / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="nb-td">
                        <span
                          className="inline-flex items-center gap-1 border-2 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest"
                          style={{ borderColor: sc, color: sc, backgroundColor: `${sc}15` }}
                        >
                          {log.actionStatus === 'AUTO_EXECUTED' || log.actionStatus === 'MANUALLY_APPROVED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {log.actionStatus}
                        </span>
                      </td>
                      <td className="nb-td text-[#888888] text-[10px] max-w-xs truncate">
                        {log.policyResult.ruleResults.filter(r => r.passed).length}/{log.policyResult.ruleResults.length} Rules Passed ({log.policyResult.riskClass || 'LOW_RISK'})
                      </td>
                      <td className="nb-td text-[10px]">
                        <div className="font-bold text-white">{log.executedActionId || 'N/A'}</div>
                        <div className={`text-[9px] ${log.outcome?.status === 'RECOVERED' ? 'text-[#00FF94]' : 'text-[#888888]'}`}>
                          Outcome: {log.outcome?.status || 'PENDING'}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center font-mono text-[11px] text-[#888888]">
                      {loading ? 'Loading live audit trail...' : 'No records match your filters. Run demo or webhooks to populate ledger.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-white/10 bg-[#111111] px-6 py-3 flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#888888]">
              Showing <strong className="text-white">{filteredLogs.length}</strong> of {auditLogs.length} records
            </span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF94]" />
              <span className="font-mono text-[10px] text-[#888888]">Tamper-evident · Append-only ledger</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
