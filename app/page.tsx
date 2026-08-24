'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OverviewHeader } from '@/components/dashboard/OverviewHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { GatewayHealthRadar } from '@/components/dashboard/GatewayHealthRadar';
import { OpportunityTable } from '@/components/opportunities/OpportunityTable';
import { OpportunityDetailDrawer } from '@/components/opportunities/OpportunityDetailDrawer';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { StrategyRecommendation } from '@/core/domain/strategy';
import { DecisionAuditRecord } from '@/core/domain/audit';
import { MerchantRevenueMetrics } from '@/core/revenue/metrics';
import { MethodHealthStats } from '@/core/revenue/factStore';
import { Activity, ShieldCheck, Zap, Layers, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'RADAR' | 'AUDIT' | 'HEALTH'>('RADAR');

  const [metrics, setMetrics] = useState<MerchantRevenueMetrics>({
    totalGmvPaise: 1245000000, // ₹1,24,50,000 default baseline
    totalCapturedGmvPaise: 1196740000,
    revenueAtRiskPaise: 48260000,
    degradationRatePct: 3.87,
    recoverableOpportunityPaise: 31845000,
    recoveredGmvPaise: 24280000,
    activeOpportunityCount: 6,
    recoveredOpportunityCount: 3,
    netRecoveryConversionRatePct: 76.2,
  });

  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [auditRecords, setAuditRecords] = useState<DecisionAuditRecord[]>([]);
  const [gatewayHealth, setGatewayHealth] = useState<MethodHealthStats[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<RevenueOpportunity | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/demo', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.opportunities) setOpportunities(data.opportunities);
        if (data.auditTrail) setAuditRecords(data.auditTrail);
        if (data.gatewayHealth) setGatewayHealth(data.gatewayHealth);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }, []);

  const handleRunDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo', { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to run demo pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEscalated = async (opportunityId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/execute`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
        const updated = opportunities.find(o => o.id === opportunityId);
        if (updated) setSelectedOpportunity({ ...updated, status: 'EXECUTED' });
      }
    } catch (err) {
      console.error('Failed to approve opportunity:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateRecovery = async (opportunityId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/simulate-outcome`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
        const updated = opportunities.find(o => o.id === opportunityId);
        if (updated) setSelectedOpportunity({ ...updated, status: 'RECOVERED' });
      }
    } catch (err) {
      console.error('Failed to simulate recovery:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Initial auto-seed / load
  useEffect(() => {
    handleRunDemo();
  }, []);

  const tableItems = opportunities.map(opp => {
    const audit = auditRecords.find(a => a.opportunityId === opp.id);
    return {
      opportunity: opp,
      recommendation: audit?.aiRecommendation,
      auditRecord: audit,
    };
  });

  const selectedAudit = selectedOpportunity
    ? auditRecords.find(a => a.opportunityId === selectedOpportunity.id)
    : undefined;

  const escalatedCount = opportunities.filter(o => o.status === 'ESCALATED').length;

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              MP
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">MerchantPulse</span>
              <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                Revenue Intelligence Engine for Razorpay
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Policy Guardrails Active</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini Strategy v2.5</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Overview Header & Controls */}
        <OverviewHeader
          onRunDemo={handleRunDemo}
          loading={loading}
          lastUpdated={lastUpdated}
        />

        {/* Real-time Metric Cards */}
        <MetricCards metrics={metrics} />

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('RADAR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'RADAR'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Opportunity Radar ({opportunities.length})</span>
            {escalatedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold animate-pulse">
                {escalatedCount} Escalated
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Closed-Loop Audit Ledger ({auditRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'HEALTH'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Gateway Health Radar ({gatewayHealth.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'RADAR' && (
          <div className="space-y-6">
            <OpportunityTable
              items={tableItems}
              onSelectOpportunity={opp => setSelectedOpportunity(opp)}
              selectedOpportunityId={selectedOpportunity?.id}
            />
            <GatewayHealthRadar healthStats={gatewayHealth} />
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <AuditTimeline auditRecords={auditRecords} />
        )}

        {activeTab === 'HEALTH' && (
          <div className="space-y-6">
            <GatewayHealthRadar healthStats={gatewayHealth} />
          </div>
        )}
      </main>

      {/* Opportunity Detail Drawer */}
      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        recommendation={selectedAudit?.aiRecommendation}
        auditRecord={selectedAudit}
        onClose={() => setSelectedOpportunity(null)}
        onApproveEscalated={handleApproveEscalated}
        onSimulateRecovery={handleSimulateRecovery}
        actionLoading={actionLoading}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <p>
          MerchantPulse • Razorpay Buildathon • AI Growth & Agentic Commerce
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Architectural Tenet: Code establishes truth • AI reasons over truth • Policy governs • Real Razorpay primitives execute
        </p>
      </footer>
    </div>
  );
}
