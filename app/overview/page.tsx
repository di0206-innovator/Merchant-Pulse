'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { OverviewHeader } from '@/components/dashboard/OverviewHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { GatewayHealthRadar } from '@/components/dashboard/GatewayHealthRadar';
import { ConcurrencyStressPanel } from '@/components/dashboard/ConcurrencyStressPanel';
import { TrustGuardrailPanel } from '@/components/dashboard/TrustGuardrailPanel';
import { OpportunityTable } from '@/components/opportunities/OpportunityTable';
import { OpportunityDetailDrawer } from '@/components/opportunities/OpportunityDetailDrawer';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { useAuth } from '@/lib/supabase/authContext';
import { RevenueOpportunity } from '@/core/domain/opportunity';
import { DecisionAuditRecord } from '@/core/domain/audit';
import { MerchantRevenueMetrics } from '@/core/revenue/metrics';
import { MethodHealthStats } from '@/core/revenue/factStore';
import { ConcurrencyMetrics } from '@/core/concurrency/workerPool';
import {
  Activity, ShieldCheck, Layers, FileText, Server, Sparkles,
} from 'lucide-react';

const TABS = [
  { id: 'RADAR',   label: 'Opportunity Radar', icon: Layers      },
  { id: 'AUDIT',   label: 'Audit Ledger',      icon: FileText    },
  { id: 'SAFETY',  label: 'Trust & Safety',    icon: ShieldCheck },
  { id: 'HEALTH',  label: 'Gateway Health',    icon: Activity    },
  { id: 'STRESS',  label: 'Stress Test',        icon: Server      },
] as const;

type TabId = typeof TABS[number]['id'];

export default function OverviewPage() {
  const { profile: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stressLoading, setStressLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabId>('RADAR');

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

  const fetchData = useCallback(async () => {
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
    } catch (err) { console.error('Failed to fetch data:', err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRunDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo', { method: 'POST' });
      if (res.ok) await fetchData();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApproveEscalated = async (opportunityId: string) => {
    if (currentUser.role === 'AUDITOR') { alert('Permission Denied: Auditors have read-only access.'); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/execute`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
        const updated = opportunities.find(o => o.id === opportunityId);
        if (updated) setSelectedOpportunity({ ...updated, status: 'EXECUTED' });
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleSimulateRecovery = async (opportunityId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/simulate-outcome`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
        const updated = opportunities.find(o => o.id === opportunityId);
        if (updated) setSelectedOpportunity({ ...updated, status: 'RECOVERED' });
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
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
        await fetchData();
        return data.concurrencyMetrics;
      }
      return null;
    } catch (err) { console.error(err); return null; }
    finally { setStressLoading(false); }
  };

  const tableItems = opportunities.map(opp => {
    const audit = auditRecords.find(a => a.opportunityId === opp.id);
    return { opportunity: opp, recommendation: audit?.aiRecommendation, auditRecord: audit };
  });

  const selectedAudit = selectedOpportunity
    ? auditRecords.find(a => a.opportunityId === selectedOpportunity.id)
    : undefined;

  const escalatedCount = opportunities.filter(o => o.status === 'ESCALATED').length;

  return (
    <AppLayout>
      <div className="nb-page">

        {/* Header */}
        <OverviewHeader onRunDemo={handleRunDemo} loading={loading} lastUpdated={lastUpdated} />

        {/* Metric cards */}
        <MetricCards metrics={metrics} />

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b-2 border-white/10 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const displayLabel = id === 'RADAR'
              ? `${label} (${opportunities.length})`
              : id === 'AUDIT'
              ? `${label} (${auditRecords.length})`
              : id === 'HEALTH'
              ? `${label} (${gatewayHealth.length})`
              : label;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 border-2 border-b-0 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-100 ${
                  isActive
                    ? 'border-white bg-[#FFE500] text-black'
                    : 'border-white/20 bg-[#0A0A0A] text-[#888888] hover:border-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {displayLabel}
                {id === 'RADAR' && escalatedCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-black text-[#FFE500] font-black text-[9px] border border-[#FFE500]">
                    {escalatedCount} ESC
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
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
        {activeTab === 'AUDIT' && <AuditTimeline auditRecords={auditRecords} />}
        {activeTab === 'SAFETY' && <TrustGuardrailPanel />}
        {activeTab === 'HEALTH' && <GatewayHealthRadar healthStats={gatewayHealth} />}
        {activeTab === 'STRESS' && (
          <ConcurrencyStressPanel onRunStressTest={handleRunStressTest} stressLoading={stressLoading} />
        )}

        <OpportunityDetailDrawer
          opportunity={selectedOpportunity}
          recommendation={selectedAudit?.aiRecommendation}
          auditRecord={selectedAudit}
          onClose={() => setSelectedOpportunity(null)}
          onApproveEscalated={handleApproveEscalated}
          onSimulateRecovery={handleSimulateRecovery}
          actionLoading={actionLoading}
        />
      </div>
    </AppLayout>
  );
}
