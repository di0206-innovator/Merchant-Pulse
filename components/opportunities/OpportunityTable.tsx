'use client';

import React, { useState } from 'react';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { StrategyRecommendation } from '@/core/domain/strategy';
import { DecisionAuditRecord } from '@/core/domain/audit';
import {
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  UserCheck
} from 'lucide-react';

interface OpportunityTableProps {
  items: Array<{
    opportunity: RevenueOpportunity;
    recommendation?: StrategyRecommendation;
    auditRecord?: DecisionAuditRecord;
  }>;
  onSelectOpportunity: (opportunity: RevenueOpportunity) => void;
  selectedOpportunityId?: string;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  items,
  onSelectOpportunity,
  selectedOpportunityId,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredItems = items.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ESCALATED') return item.opportunity.status === 'ESCALATED';
    if (filterType === 'RECOVERED') return item.opportunity.status === 'RECOVERED';
    if (filterType === 'EXECUTED') return item.opportunity.status === 'EXECUTED';
    return item.opportunity.type === filterType;
  });

  const getStatusBadge = (status: RevenueOpportunity['status']) => {
    switch (status) {
      case 'RECOVERED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            RECOVERED
          </span>
        );
      case 'EXECUTED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <ArrowUpRight className="w-3 h-3" />
            EXECUTED (LINK SENT)
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3 h-3" />
            ESCALATED (HUMAN QUEUE)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-fit">
            POLICY REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 w-fit">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: RevenueOpportunity['type']) => {
    switch (type) {
      case 'HIGH_VALUE_DROPOFF': return 'High-Value Dropoff';
      case 'PAYMENT_METHOD_DEGRADATION': return 'Gateway Degradation';
      case 'CUSTOMER_CHURN_RISK': return 'VIP Churn Risk';
      case 'RETRIED_CARD_FAILURE': return 'Card Retry Failures';
      case 'ABANDONED_CHECKOUT': return 'Abandoned Checkout';
      default: return type;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            Opportunity Radar
          </h2>
          <p className="text-xs text-slate-400">
            Real-time actionable leaks ranked by Expected Economic Value (EV)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All Leaks' },
            { key: 'ESCALATED', label: 'Human Review Queue' },
            { key: 'EXECUTED', label: 'Executed' },
            { key: 'RECOVERED', label: 'Recovered' },
            { key: 'HIGH_VALUE_DROPOFF', label: 'High Value' },
            { key: 'PAYMENT_METHOD_DEGRADATION', label: 'Degradation' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all whitespace-nowrap ${
                filterType === f.key
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Opportunity</th>
              <th className="py-3 px-4">Customer / Context</th>
              <th className="py-3 px-4 text-right">GMV (Paise/INR)</th>
              <th className="py-3 px-4 text-right">Expected Value (EV)</th>
              <th className="py-3 px-4 text-center">P(Success)</th>
              <th className="py-3 px-4">Status & Action</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                  No opportunities match the selected filter. Click &ldquo;Run Demo Scenario&rdquo; to populate.
                </td>
              </tr>
            ) : (
              filteredItems.map(({ opportunity, recommendation }) => {
                const isSelected = selectedOpportunityId === opportunity.id;
                const inr = opportunity.amountPaise / 100;
                const evInr = opportunity.expectedValue.netExpectedValuePaise / 100;

                return (
                  <tr
                    key={opportunity.id}
                    onClick={() => onSelectOpportunity(opportunity)}
                    className={`cursor-pointer transition-all hover:bg-slate-800/40 ${
                      isSelected ? 'bg-blue-950/30 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    {/* Opportunity Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {getTypeLabel(opportunity.type)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate max-w-[160px]">
                        {opportunity.id}
                      </div>
                    </td>

                    {/* Customer / Context */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="text-slate-200">
                        {opportunity.customerEmail || opportunity.customerContact || 'Direct Checkout'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {opportunity.evidence.paymentMethod?.toUpperCase()} • {opportunity.evidence.failureCode || 'ERROR'}
                      </div>
                    </td>

                    {/* GMV */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* Expected Value */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-400">
                      ₹{evInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* P(Success) */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {Math.round(opportunity.expectedValue.pSuccess * 100)}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(opportunity.status)}
                    </td>

                    {/* Details Arrow */}
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
