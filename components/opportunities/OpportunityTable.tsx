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
    if (filterType === 'ESCALATED') return item.opportunity.status === 'ESCALATED';
    if (filterType === 'RECOVERED') return item.opportunity.status === 'RECOVERED';
    if (filterType === 'EXECUTED') return item.opportunity.status === 'EXECUTED';
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
      alert(`[Demo Mode] Razorpay Test Mode Key is not configured on the client (NEXT_PUBLIC_RAZORPAY_KEY_ID). In production or test mode, this triggers Razorpay Standard Checkout for ₹${inrAmount}.`);
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
          name: 'Demo Merchant',
          email: opportunity.customerEmail || 'merchant@example.com',
          contact: opportunity.customerContact || '9999999999',
        },
        theme: {
          color: '#2563EB',
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert(`Razorpay Payment Link Triggered for ${opportunity.id}.\nAmount: ₹${inrAmount.toLocaleString('en-IN')}\nPayment Link: https://rzp.io/l/plink_${opportunity.id}`);
    }
  };

  const getStatusBadge = (status: RevenueOpportunity['status']) => {
    switch (status) {
      case 'RECOVERED':
        return (
          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            RECOVERED
          </span>
        );
      case 'EXECUTED':
        return (
          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5 w-fit">
            <ArrowUpRight className="w-3 h-3" />
            EXECUTED
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3 h-3" />
            ESCALATED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-fit">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 w-fit">
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
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 m3-elevation-2">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-mono">
            <span>Opportunity Leak Radar</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              {filteredItems.length} Active Leaks
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
            Deterministic leaks ranked by Net Expected Value (EV) math
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          {[
            { key: 'ALL', label: 'All Leaks' },
            { key: 'ESCALATED', label: 'Human Review Queue' },
            { key: 'EXECUTED', label: 'Executed' },
            { key: 'RECOVERED', label: 'Recovered' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap ${
                filterType === f.key
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Opportunity ID / Type</th>
              <th className="py-3 px-4">Customer Context</th>
              <th className="py-3 px-4 text-right">GMV (INR)</th>
              <th className="py-3 px-4 text-right">Net Expected Value</th>
              <th className="py-3 px-4 text-center">P(Success)</th>
              <th className="py-3 px-4">Status & Action</th>
              <th className="py-3 px-4 text-right">Razorpay Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                  No opportunities match the selected filter.
                </td>
              </tr>
            ) : (
              filteredItems.map(({ opportunity }) => {
                const isSelected = selectedOpportunityId === opportunity.id;
                const inr = opportunity.amountPaise / 100;
                const evInr = opportunity.expectedValue.netExpectedValuePaise / 100;

                return (
                  <tr
                    key={opportunity.id}
                    onClick={() => onSelectOpportunity(opportunity)}
                    className={`cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800/40 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-600' : ''
                    }`}
                  >
                    {/* Opportunity Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {getTypeLabel(opportunity.type)}
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                        {opportunity.id}
                      </div>
                    </td>

                    {/* Customer / Context */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-800 dark:text-slate-200">
                        {opportunity.customerEmail || opportunity.customerContact || 'Direct Checkout'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {opportunity.evidence.paymentMethod?.toUpperCase()} • {opportunity.evidence.failureCode || 'GATEWAY_TIMEOUT'}
                      </div>
                    </td>

                    {/* GMV */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* Expected Value */}
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{evInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* P(Success) */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {Math.round(opportunity.expectedValue.pSuccess * 100)}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(opportunity.status)}
                    </td>

                    {/* Razorpay Pay Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleOpenRazorpayCheckout(e, opportunity)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all shadow-sm active:scale-95"
                        title="Test Razorpay Web Checkout"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Link</span>
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
