'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, ArrowUpRight, Filter } from 'lucide-react';

const STATUSES = ['All', 'Recovered', 'Executed', 'Escalated', 'Skipped', 'Failed'] as const;

interface HistoryItem {
  id: string;
  eventId: string;
  merchantId: string;
  amount: string;
  method: string;
  status: 'Recovered' | 'Executed' | 'Escalated' | 'Skipped' | 'Failed';
  strategy: string;
  timestamp: string;
  netEv: string;
}

function generateHistory(): HistoryItem[] {
  const statuses = ['Recovered', 'Executed', 'Escalated', 'Skipped', 'Failed'] as const;
  const methods = ['UPI', 'Card', 'Netbanking', 'Wallet', 'EMI'];
  const strategies = ['PAYMENT_LINK', 'SMS_RETRY', 'EMAIL_RETRY', 'ESCALATE', 'SKIP'];
  const items: HistoryItem[] = [];

  for (let i = 0; i < 32; i++) {
    const amt = (Math.random() * 24000 + 500).toFixed(0);
    const ev = (Math.random() * parseInt(amt) * 0.6).toFixed(0);
    const hoursAgo = Math.floor(Math.random() * 72);
    const date = new Date(Date.now() - hoursAgo * 3600 * 1000);
    items.push({
      id: `hist_${String(i + 1).padStart(3, '0')}`,
      eventId: `evt_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      merchantId: `rzp_m_${Math.random().toString(36).slice(2, 8)}`,
      amount: `₹${parseInt(amt).toLocaleString('en-IN')}`,
      method: methods[i % methods.length],
      status: statuses[i % statuses.length],
      strategy: strategies[i % strategies.length],
      timestamp: date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      netEv: `₹${parseInt(ev).toLocaleString('en-IN')}`,
    });
  }
  return items.sort((a, b) => b.id.localeCompare(a.id));
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; bg: string; border: string; shadow: string }> = {
  Recovered: { color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', shadow: 'shadow-skeuo-green' },
  Executed:  { color: 'text-blue-400', icon: TrendingUp,  bg: 'bg-blue-500/10', border: 'border-blue-500/40', shadow: 'shadow-skeuo-blue' },
  Escalated: { color: 'text-amber-400', icon: AlertCircle, bg: 'bg-amber-500/10', border: 'border-amber-500/40', shadow: 'shadow-skeuo-gold' },
  Skipped:   { color: 'text-[var(--nb-text-muted)]', icon: XCircle, bg: 'bg-white/5', border: 'border-white/10', shadow: 'shadow-skeuo-badge' },
  Failed:    { color: 'text-rose-400', icon: XCircle, bg: 'bg-rose-500/10', border: 'border-rose-500/40', shadow: 'shadow-skeuo-red' },
};

export default function HistoryPage() {
  const [history] = useState<HistoryItem[]>(() => generateHistory());
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filtered = history.filter((item) => {
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchSearch = !search || item.eventId.toLowerCase().includes(search.toLowerCase()) ||
      item.merchantId.toLowerCase().includes(search.toLowerCase()) ||
      item.method.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: history.length,
    recovered: history.filter(h => h.status === 'Recovered').length,
    escalated: history.filter(h => h.status === 'Escalated').length,
    failed: history.filter(h => h.status === 'Failed').length,
  };

  return (
    <AppLayout>
      <div className="nb-page space-y-6">

        {/* Header */}
        <div className="nb-page-header">
          <div className="nb-eyebrow mb-4">
            <Clock className="w-3.5 h-3.5" />
            Activity History
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Recovery<br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">History Log</span>
          </h1>
          <p className="mt-3 font-mono text-xs text-[var(--nb-text-muted)] max-w-xl leading-6">
            Complete chronological record of every payment recovery action, decision, and outcome.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, color: 'text-white' },
            { label: 'Recovered',    value: stats.recovered, color: 'text-emerald-400' },
            { label: 'Escalated',    value: stats.escalated, color: 'text-amber-400' },
            { label: 'Failed',       value: stats.failed,    color: 'text-rose-400' },
          ].map(stat => (
            <div key={stat.label} className="nb-panel p-5">
              <div className="nb-label text-[10px] text-[var(--nb-text-muted)]">{stat.label}</div>
              <div className={`font-mono text-3xl font-black tabular-nums leading-none mt-2 ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="nb-panel p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--nb-text-muted)]" />
            <div className="inline-flex p-1 bg-[var(--nb-recessed)] rounded-xl border border-white/10 shadow-skeuo-inset">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                    statusFilter === s
                      ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-slate-950 shadow-skeuo-gold font-black'
                      : 'text-[var(--nb-text-muted)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Search event ID or merchant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="nb-input max-w-xs text-xs"
          />
        </div>

        {/* Table */}
        <div className="nb-panel overflow-hidden">
          <div className="overflow-x-auto shadow-skeuo-inset bg-[var(--nb-recessed)]/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[var(--nb-surface-2)] to-[var(--nb-surface)] border-b border-white/10">
                  {['Event ID', 'Amount', 'Method', 'Strategy', 'Status', 'Net EV', 'Timestamp'].map(h => (
                    <th key={h} className="nb-th text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="nb-td text-center py-12 text-[var(--nb-text-muted)]">
                      No records match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const cfg = STATUS_CONFIG[item.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="nb-td">
                          <span className="font-mono text-[11px] text-[var(--nb-text-muted)]">{item.eventId}</span>
                        </td>
                        <td className="nb-td font-black text-white">{item.amount}</td>
                        <td className="nb-td">
                          <span className="border border-white/10 bg-[var(--nb-recessed)] px-2.5 py-1 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--nb-text-muted)] shadow-skeuo-inset">
                            {item.method}
                          </span>
                        </td>
                        <td className="nb-td font-mono text-[10px] text-[var(--nb-text-muted)] uppercase tracking-wide">
                          {item.strategy.replace(/_/g, ' ')}
                        </td>
                        <td className="nb-td">
                          <span
                            className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.shadow}`}
                          >
                            <Icon className="w-3 h-3" />
                            {item.status}
                          </span>
                        </td>
                        <td className="nb-td font-mono text-[11px] font-black" style={{ color: item.status === 'Recovered' ? '#34D399' : '#F8FAFC' }}>
                          {item.status === 'Failed' || item.status === 'Skipped' ? '—' : item.netEv}
                        </td>
                        <td className="nb-td font-mono text-[10px] text-[var(--nb-text-muted)] whitespace-nowrap">
                          {item.timestamp}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 bg-gradient-to-r from-[var(--nb-surface-2)] to-[var(--nb-surface)] px-6 py-3.5 font-mono text-[10px] text-[var(--nb-text-muted)]">
            Showing {filtered.length} of {history.length} records
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
