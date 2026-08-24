'use client';

import React from 'react';
import { MethodHealthStats } from '@/core/revenue/factStore';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GatewayHealthRadarProps {
  healthStats: MethodHealthStats[];
}

export const GatewayHealthRadar: React.FC<GatewayHealthRadarProps> = ({ healthStats }) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            Payment Method & Bank Health Radar
          </h2>
          <p className="text-xs text-slate-400">
            Real-time degradation telemetry derived deterministically from payment event stream
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 uppercase">
          {healthStats.length} Monitored Channels
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {healthStats.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-slate-500 font-mono">
            No gateway traffic observed yet. Run demo scenario to populate telemetry.
          </div>
        ) : (
          healthStats.map((stat, idx) => {
            const label = stat.bank ? `${stat.method.toUpperCase()} (${stat.bank})` : stat.method.toUpperCase();
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  stat.isDegraded
                    ? 'bg-red-950/20 border-red-500/40 text-red-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold truncate">{label}</span>
                  {stat.isDegraded ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      DEGRADED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      HEALTHY
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">Failure Rate</span>
                  <span className={`font-bold ${stat.isDegraded ? 'text-red-400' : 'text-slate-200'}`}>
                    {stat.failureRatePct}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stat.isDegraded ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, stat.failureRatePct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
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
