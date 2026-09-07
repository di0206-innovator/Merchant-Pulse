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
  UserCheck,
  CreditCard,
  ExternalLink
} from 'lucide-react';

interface OpportunityTableProps {
  items: Array<{
    opportunity: RevenueOpportunity;
    recommendation?: StrategyRecommendation;
    auditRecord?: DecisionAuditRecord;
  }>;
  onSelectOpportunity: (opportunity: RevenueOpportunity) => void;
  selectedOpportunityId?: string;
  onRazorpayPay?: (opportunity: RevenueOpportunity) => void;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  items,
  onSelectOpportunity,
  selectedOpportunityId,
  onRazorpayPay
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredItems = items.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'HIGH_PRIORITY') return (item.opportunity.priority?.score || 0) >= 70;
    if (filterType === 'ESCALATED') return item.opportunity.status === 'ESCALATED';
    if (filterType === 'RECOVERED') return item.opportunity.status === 'RECOVERED';
    if (filterType === 'EXECUTED') return item.opportunity.status === 'EXECUTED';
    if (filterType === 'ORGANIC') return item.opportunity.outcome?.attributionType === 'ORGANIC_RECOVERY';
    if (filterType === 'NO_ACTION') return item.auditRecord?.aiRecommendation?.recommendedActionType === 'NO_ACTION';
    return item.opportunity.type === filterType;
  });

  const handleOpenRazorpayCheckout = (e: React.MouseEvent, opportunity: RevenueOpportunity) => {
    e.stopPropagation();
    if (onRazorpayPay) {
      onRazorpayPay(opportunity);
      return;
    }

    const inrAmount = opportunity.amountPaise / 100;
    
    // Check if Razorpay SDK script is available
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert(`[Demo Mode] Razorpay Test Mode Key is not configured on the client. In live mode, this triggers Razorpay Checkout for ₹${inrAmount.toLocaleString('en-IN')}.`);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const options = {
        key: razorpayKey,
        amount: opportunity.amountPaise,
        currency: 'INR',
        name: 'MerchantPulse Recovery',
        description: `Revenue Recovery Payment for ${opportunity.id}`,
        handler: function (response: any) {
          alert(`Razorpay Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: opportunity.customerName || 'Demo Merchant Customer',
          email: opportunity.customerEmail || 'customer@example.com',
          contact: opportunity.customerContact || '9999999999',
        },
        theme: {
          color: '#FFE500',
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert(`Razorpay Payment Link Dispatched for ${opportunity.id}.\nAmount: ₹${inrAmount.toLocaleString('en-IN')}\nPayment Link: https://rzp.io/l/plink_${opportunity.id}`);
    }
  };

  const getPriorityBadge = (score?: number, tier?: string) => {
    const s = score ?? 75;
    const t = tier ?? (s >= 85 ? 'CRITICAL' : s >= 70 ? 'HIGH' : s >= 45 ? 'MEDIUM' : 'LOW');

    let badgeStyle = 'border-blue-500/40 text-blue-400 bg-blue-500/10';
    if (t === 'CRITICAL') {
      badgeStyle = 'border-rose-500/50 text-rose-400 bg-rose-500/15 shadow-skeuo-red';
    } else if (t === 'HIGH') {
      badgeStyle = 'border-amber-500/50 text-amber-400 bg-amber-500/15 shadow-skeuo-gold';
    } else if (t === 'LOW') {
      badgeStyle = 'border-slate-700 text-slate-400 bg-slate-800/40';
    }

    return (
      <span className={`px-2.5 py-1 text-[10px] font-mono font-black border rounded-lg flex items-center gap-1.5 w-fit shadow-skeuo-badge ${badgeStyle}`}>
        <span className="text-xs font-black tabular-nums">{s}</span>
        <span className="text-[9px] uppercase tracking-wider">{t}</span>
      </span>
    );
  };

  const getStatusBadge = (status: RevenueOpportunity['status'], attribution?: string) => {
    if (status === 'RECOVERED') {
      if (attribution === 'ORGANIC_RECOVERY') {
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 w-fit shadow-skeuo-badge">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            ORGANIC
          </span>
        );
      }
      return (
        <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 w-fit shadow-skeuo-green">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          VERIFIED RECOVERED
        </span>
      );
    }
    if (status === 'EXECUTED') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/40 flex items-center gap-1.5 w-fit shadow-skeuo-blue">
          <ArrowUpRight className="w-3 h-3 text-blue-400" />
          EXECUTED
        </span>
      );
    }
    if (status === 'ESCALATED') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 w-fit animate-pulse shadow-skeuo-gold">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          ESCALATED
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/40 flex items-center gap-1 w-fit shadow-skeuo-badge">
          SUPPRESSED
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-slate-800/40 text-slate-300 border border-nb-stroke/50 flex items-center gap-1.5 w-fit shadow-skeuo-badge">
        <Clock className="w-3 h-3 text-nb-muted" />
        {status}
      </span>
    );
  };

  const getTypeLabel = (type: RevenueOpportunity['type']) => {
    switch (type) {
      case 'FAILED_PAYMENT': return 'Failed Payment';
      case 'HIGH_VALUE_DROPOFF': return 'High-Value Failure';
      case 'PAYMENT_METHOD_DEGRADATION': return 'Bank Downtime';
      case 'CUSTOMER_CHURN_RISK': return 'VIP Churn Risk';
      case 'RETRIED_CARD_FAILURE': return 'Card Retry Failure';
      case 'ABANDONED_CHECKOUT': return 'Abandoned Cart';
      case 'STATE_MISMATCH': return 'Payment/Order Mismatch';
      default: return type;
    }
  };

  return (
    <div className="nb-panel p-5 space-y-4" role="region" aria-label="Recovery Opportunity Queue">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nb-stroke/50 pb-4">
        <div>
          <h2 className="text-base font-black uppercase text-nb-white tracking-tight flex items-center gap-2.5 font-mono">
            <span>Recovery Opportunity Queue</span>
            <span className="nb-chip-yellow text-[10px]">
              {filteredItems.length} Leaks
            </span>
          </h2>
          <p className="text-xs text-nb-muted font-mono mt-0.5">
            Ranked deterministically by Recovery Priority Score (Net EV × Probability × Urgency × LTV)
          </p>
        </div>

        {/* Filter Rack - Tactile Segmented Control */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border border-nb-stroke/60 overflow-x-auto shadow-skeuo-inset"
          style={{ background: 'var(--nb-recessed)' }}
          role="toolbar"
          aria-label="Filter opportunities by status or priority"
        >
          {[
            { key: 'ALL', label: 'All' },
            { key: 'HIGH_PRIORITY', label: 'High Priority (70+)' },
            { key: 'ESCALATED', label: 'Human Review' },
            { key: 'EXECUTED', label: 'Dispatched' },
            { key: 'RECOVERED', label: 'Recovered' },
            { key: 'ORGANIC', label: 'Organic' },
            { key: 'NO_ACTION', label: 'Suppressed' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              aria-pressed={filterType === f.key}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap select-none ${
                filterType === f.key
                  ? 'text-slate-950 font-black shadow-skeuo-gold'
                  : 'text-nb-muted hover:text-nb-white hover:bg-nb-surface/60 active:translate-y-0.5'
              }`}
              style={
                filterType === f.key
                  ? {
                      background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 55%, #D97706 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                    }
                  : {}
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Chassis */}
      <div
        className="overflow-x-auto rounded-xl border border-nb-stroke/60 shadow-skeuo-inset"
        style={{ background: 'var(--nb-recessed)' }}
      >
        <table className="w-full text-left text-xs font-mono" aria-label="Recoverable revenue opportunities">
          <thead
            className="text-nb-muted uppercase text-[10px] tracking-wider border-b border-nb-stroke/50"
            style={{
              background: 'linear-gradient(180deg, var(--nb-surface) 0%, var(--nb-recessed) 100%)',
            }}
          >
            <tr>
              <th scope="col" className="py-3 px-4">Priority</th>
              <th scope="col" className="py-3 px-4">Type / ID</th>
              <th scope="col" className="py-3 px-4">Customer &amp; Evidence</th>
              <th scope="col" className="py-3 px-4 text-right">Revenue at Risk</th>
              <th scope="col" className="py-3 px-4 text-right">Net Expected Value</th>
              <th scope="col" className="py-3 px-4 text-center">P(Success)</th>
              <th scope="col" className="py-3 px-4">Status &amp; Attribution</th>
              <th scope="col" className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nb-stroke/30 text-nb-white">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-nb-muted font-mono">
                  No opportunities match the selected filter.
                </td>
              </tr>
            ) : (
              filteredItems.map(({ opportunity, recommendation, auditRecord }) => {
                const isSelected = selectedOpportunityId === opportunity.id;
                const inr = opportunity.amountPaise / 100;
                const evInr = opportunity.expectedValue.netExpectedValuePaise / 100;

                return (
                  <tr
                    key={opportunity.id}
                    onClick={() => onSelectOpportunity(opportunity)}
                    className={`cursor-pointer transition-all duration-150 hover:bg-nb-surface/60 ${
                      isSelected ? 'bg-amber-500/10 border-l-4 border-l-[#F59E0B]' : ''
                    }`}
                  >
                    {/* Priority Score */}
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(opportunity.priority?.score, opportunity.priority?.tier)}
                    </td>

                    {/* Opportunity Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-nb-white">
                        {getTypeLabel(opportunity.type)}
                      </div>
                      <div className="text-[10px] text-nb-blue font-mono font-semibold">
                        {opportunity.id}
                      </div>
                    </td>

                    {/* Customer / Context */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-nb-white font-semibold">
                        {opportunity.customerEmail || opportunity.customerContact || 'Direct Customer'}
                      </div>
                      <div className="text-[10px] text-nb-muted">
                        {opportunity.evidence.paymentMethod?.toUpperCase()} · {opportunity.evidence.failureCode || 'GATEWAY_ERROR'}
                      </div>
                    </td>

                    {/* GMV */}
                    <td className="py-3.5 px-4 text-right font-black text-nb-white tabular-nums">
                      ₹{inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* Expected Value */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400 tabular-nums" style={{ textShadow: '0 0 8px rgba(16, 185, 129, 0.3)' }}>
                      ₹{evInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* P(Success) */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-lg border border-nb-stroke/50 text-nb-white font-bold text-[11px] shadow-skeuo-badge" style={{ background: 'var(--nb-surface)' }}>
                        {Math.round(opportunity.expectedValue.pSuccess * 100)}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(opportunity.status, opportunity.outcome?.attributionType)}
                    </td>

                    {/* Razorpay Pay Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleOpenRazorpayCheckout(e, opportunity)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-nb-stroke/60 hover:border-amber-400/60 font-mono font-bold text-[10px] uppercase text-nb-white hover:text-slate-950 transition-all duration-150 shadow-skeuo-button active:translate-y-0.5 active:shadow-skeuo-button-pressed"
                        style={{
                          background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 90%, white) 0%, var(--nb-surface) 100%)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 90%, white) 0%, var(--nb-surface) 100%)';
                        }}
                        title="Inspect or Trigger Razorpay Checkout"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Inspect</span>
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
