'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProfileBar } from '@/components/dashboard/ProfileBar';
import { SettingsDrawer } from '@/components/dashboard/SettingsDrawer';
import { useAuth } from '@/lib/supabase/authContext';
import { OverviewHeader } from '@/components/dashboard/OverviewHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { GatewayHealthRadar } from '@/components/dashboard/GatewayHealthRadar';
import { ConcurrencyStressPanel } from '@/components/dashboard/ConcurrencyStressPanel';
import { BatchBenchmarkPanel } from '@/components/dashboard/BatchBenchmarkPanel';
import { TrustGuardrailPanel } from '@/components/dashboard/TrustGuardrailPanel';
import { OpportunityTable } from '@/components/opportunities/OpportunityTable';
import { OpportunityDetailDrawer } from '@/components/opportunities/OpportunityDetailDrawer';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { StrategyRecommendation } from '@/core/domain/strategy';
import { DecisionAuditRecord } from '@/core/domain/audit';
import { MerchantRevenueMetrics } from '@/core/revenue/metrics';
import { MethodHealthStats } from '@/core/revenue/factStore';
import { UserProfile, UserRole } from '@/core/auth/types';
import { ConcurrencyMetrics } from '@/core/concurrency/workerPool';
import {
  Activity,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Users,
  Server,
  Key,
  ArrowLeft,
  Lock,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { profile: currentUser, switchRole } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stressLoading, setStressLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'RADAR' | 'BENCHMARK' | 'AUDIT' | 'SAFETY' | 'HEALTH' | 'STRESS'>('RADAR');

  const [metrics, setMetrics] = useState<MerchantRevenueMetrics>({
    totalGmvPaise: 1245000000,
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
    if (currentUser.role === 'AUDITOR') {
      alert('Permission Denied: Auditors have read-only access.');
      return;
    }

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

  const handleRunStressTest = async (count: number): Promise<ConcurrencyMetrics | null> => {
    setStressLoading(true);
    try {
      const res = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDashboardData();
        return data.concurrencyMetrics;
      }
      return null;
    } catch (err) {
      console.error('Failed to run stress test:', err);
      return null;
    } finally {
      setStressLoading(false);
    }
  };



  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing Page</span>
            </Link>

            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              MP
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">MerchantPulse</span>
              <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                Revenue Terminal
              </span>
            </div>
          </div>

          <ProfileBar onOpenSettings={() => setIsSettingsOpen(true)} />
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
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('RADAR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
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
            onClick={() => setActiveTab('BENCHMARK')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              activeTab === 'BENCHMARK'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-blue-400 hover:text-blue-300 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Batch Recovery Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              activeTab === 'AUDIT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Closed-Loop Audit Ledger ({auditRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SAFETY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              activeTab === 'SAFETY'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trust & Safety Guardrails</span>
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              activeTab === 'HEALTH'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Gateway Health Radar ({gatewayHealth.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STRESS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              activeTab === 'STRESS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900/60 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>500-User Concurrency Stress Harness</span>
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

        {activeTab === 'BENCHMARK' && (
          <BatchBenchmarkPanel />
        )}

        {activeTab === 'AUDIT' && (
          <AuditTimeline auditRecords={auditRecords} />
        )}

        {activeTab === 'SAFETY' && (
          <TrustGuardrailPanel />
        )}

        {activeTab === 'HEALTH' && (
          <div className="space-y-6">
            <GatewayHealthRadar healthStats={gatewayHealth} />
          </div>
        )}

        {activeTab === 'STRESS' && (
          <div className="space-y-6">
            <ConcurrencyStressPanel
              onRunStressTest={handleRunStressTest}
              stressLoading={stressLoading}
            />
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

      {/* Settings Modal Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <p>
          MerchantPulse • Razorpay Buildathon • AI Growth & Agentic Commerce
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Logged in as: <span className="text-slate-300 font-bold">{currentUser.name}</span> ({currentUser.role}) • Merchant ID: {currentUser.merchantId}
        </p>
      </footer>
    </div>
  );
}
