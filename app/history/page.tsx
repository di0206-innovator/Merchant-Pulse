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

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  Recovered: { color: '#00FF94', icon: CheckCircle2, bg: 'bg-[#00FF94]/10' },
  Executed:  { color: '#3B82F6', icon: TrendingUp,  bg: 'bg-[#3B82F6]/10' },
  Escalated: { color: '#FFE500', icon: AlertCircle, bg: 'bg-[#FFE500]/10' },
  Skipped:   { color: '#888888', icon: XCircle,     bg: 'bg-white/5'       },
  Failed:    { color: '#FF3B3B', icon: XCircle,     bg: 'bg-[#FF3B3B]/10' },
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
      <div className="nb-page">

        {/* Header */}
        <div className="nb-page-header">
          <div className="nb-eyebrow mb-4">
            <Clock className="w-3.5 h-3.5" />
            Activity History
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
            Recovery<br />
            <span className="text-[#FFE500]">History Log</span>
          </h1>
          <p className="mt-3 font-mono text-xs text-[#888888] max-w-xl leading-6">
            Complete chronological record of every payment recovery action, decision, and outcome.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, color: '#F5F5F5', shadow: '3px 3px 0 #fff' },
            { label: 'Recovered',    value: stats.recovered, color: '#00FF94', shadow: '3px 3px 0 #00FF94' },
            { label: 'Escalated',    value: stats.escalated, color: '#FFE500', shadow: '3px 3px 0 #FFE500' },
            { label: 'Failed',       value: stats.failed,    color: '#FF3B3B', shadow: '3px 3px 0 #FF3B3B' },
          ].map(stat => (
            <div key={stat.label} className="nb-panel p-4" style={{ boxShadow: stat.shadow }}>
              <div className="nb-label">{stat.label}</div>
              <div className="font-mono text-3xl font-black tabular-nums leading-none mt-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="nb-panel p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#888888]" />
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`border-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-100 ${
                  statusFilter === s
                    ? 'border-[#FFE500] bg-[#FFE500] text-black'
                    : 'border-white/20 text-[#888888] hover:border-white hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search event ID or merchant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="nb-input max-w-xs"
          />
        </div>

        {/* Table */}
        <div className="nb-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Event ID', 'Amount', 'Method', 'Strategy', 'Status', 'Net EV', 'Timestamp'].map(h => (
                    <th key={h} className="nb-th text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="nb-td text-center py-12 text-[#888888]">
                      No records match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const cfg = STATUS_CONFIG[item.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="nb-td">
                          <span className="font-mono text-[10px] text-[#888888]">{item.eventId}</span>
                        </td>
                        <td className="nb-td font-black text-white">{item.amount}</td>
                        <td className="nb-td">
                          <span className="border border-white/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[#888888]">
                            {item.method}
                          </span>
                        </td>
                        <td className="nb-td font-mono text-[10px] text-[#888888] uppercase tracking-wide">
                          {item.strategy.replace(/_/g, ' ')}
                        </td>
                        <td className="nb-td">
                          <span
                            className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${cfg.bg}`}
                            style={{ borderColor: cfg.color, color: cfg.color }}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            {item.status}
                          </span>
                        </td>
                        <td className="nb-td font-mono text-[11px]" style={{ color: item.status === 'Recovered' ? '#00FF94' : '#F5F5F5' }}>
                          {item.status === 'Failed' || item.status === 'Skipped' ? '—' : item.netEv}
                        </td>
                        <td className="nb-td font-mono text-[10px] text-[#888888] whitespace-nowrap">
                          {item.timestamp}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t-2 border-white/10 px-4 py-3 font-mono text-[10px] text-[#888888]">
            Showing {filtered.length} of {history.length} records
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
