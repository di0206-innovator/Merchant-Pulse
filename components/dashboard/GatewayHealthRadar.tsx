'use client';

import React from 'react';
import { MethodHealthStats } from '@/core/revenue/factStore';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GatewayHealthRadarProps {
  healthStats: MethodHealthStats[];
}

export const GatewayHealthRadar: React.FC<GatewayHealthRadarProps> = ({ healthStats }) => {
  return (
    <div className="nb-panel p-5 space-y-4 shadow-skeuo-card relative">
      <div className="flex items-center justify-between border-b border-nb-stroke/50 pb-4">
        <div>
          <h2 className="text-sm font-black text-nb-white uppercase tracking-tight flex items-center gap-2">
            <span>Payment Method &amp; Bank Health Radar</span>
            <span className="skeuo-led-green w-2 h-2" />
          </h2>
          <p className="text-xs text-nb-muted font-mono mt-0.5">
            Real-time degradation telemetry derived deterministically from payment event stream
          </p>
        </div>
        <span className="nb-chip-blue text-[10px]">
          {healthStats.length} Monitored Channels
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {healthStats.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-nb-muted font-mono rounded-xl border border-nb-stroke/40 shadow-skeuo-inset" style={{ background: 'var(--nb-recessed)' }}>
            No gateway traffic observed yet. Run demo scenario to populate telemetry.
          </div>
        ) : (
          healthStats.map((stat, idx) => {
            const label = stat.bank ? `${stat.method.toUpperCase()} (${stat.bank})` : stat.method.toUpperCase();
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border transition-all duration-150 shadow-skeuo-card hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(180deg, var(--nb-surface) 0%, var(--nb-surface-2) 100%)',
                  borderColor: stat.isDegraded ? 'rgba(239, 68, 68, 0.4)' : 'var(--nb-stroke)',
                }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-nb-white truncate">{label}</span>
                  {stat.isDegraded ? (
                    <span className="nb-chip-red text-[9px] py-0.5">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      DEGRADED
                    </span>
                  ) : (
                    <span className="nb-chip-green text-[9px] py-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      HEALTHY
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-nb-muted">Failure Rate</span>
                  <span className={`font-bold tabular-nums ${stat.isDegraded ? 'text-rose-400' : 'text-nb-white'}`}>
                    {stat.failureRatePct}%
                  </span>
                </div>

                {/* Sunken meter track */}
                <div
                  className="w-full h-2 rounded-full mt-2.5 overflow-hidden p-0.5 border border-nb-stroke/50 shadow-skeuo-inset"
                  style={{ background: 'var(--nb-recessed)' }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stat.isDegraded
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-skeuo-red'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-skeuo-green'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, stat.failureRatePct))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-nb-muted mt-2">
                  <span>{stat.successfulAttempts} Success</span>
                  <span>{stat.failedAttempts} Failed</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
