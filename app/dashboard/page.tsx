'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MaterialAppLayout } from '@/components/layout/MaterialAppLayout';
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
    <MaterialAppLayout>
      <div className="nb-page">
        {/* Overview Header & Controls */}
        <OverviewHeader
          onRunDemo={handleRunDemo}
          loading={loading}
          lastUpdated={lastUpdated}
        />

        {/* Real-time Metric Cards */}
        <MetricCards metrics={metrics} />

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 border-b-2 border-white/10 pb-0 overflow-x-auto">
          {[
            { id: 'RADAR',     label: `Opportunity Radar (${opportunities.length})`, icon: Layers,      badge: escalatedCount > 0 ? `${escalatedCount} ESC` : null },
            { id: 'BENCHMARK', label: 'Batch Benchmark',                              icon: Sparkles,    badge: null },
            { id: 'AUDIT',     label: `Audit Ledger (${auditRecords.length})`,        icon: FileText,    badge: null },
            { id: 'SAFETY',    label: 'Trust & Safety',                               icon: ShieldCheck, badge: null },
            { id: 'HEALTH',    label: `Gateway Health (${gatewayHealth.length})`,     icon: Activity,    badge: null },
            { id: 'STRESS',    label: '500-User Stress',                              icon: Server,      badge: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id as typeof activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 border-2 border-b-0 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-100 ${
                  isActive
                    ? 'border-white bg-[#FFE500] text-black'
                    : 'border-white/20 bg-[#0A0A0A] text-[#888888] hover:border-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 bg-black text-[#FFE500] font-black text-[9px] border border-[#FFE500]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
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
      </div>
    </MaterialAppLayout>
  );
}
