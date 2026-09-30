'use client';

import React from 'react';
import type { AnalysisResult, RazorpayPayment } from '@/core/types';

interface DataVisualizationsProps {
  result: AnalysisResult | null;
  payments: RazorpayPayment[];
}

function formatPaise(paise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export const DataVisualizations: React.FC<DataVisualizationsProps> = ({ result, payments }) => {
  // Method statistics
  const methodStats = React.useMemo(() => {
    const counts: Record<string, { total: number; failed: number; amountPaise: number }> = {
      card: { total: 0, failed: 0, amountPaise: 0 },
      upi: { total: 0, failed: 0, amountPaise: 0 },
      netbanking: { total: 0, failed: 0, amountPaise: 0 },
    };

    payments.forEach((p) => {
      const m = p.method?.toLowerCase() || 'card';
      if (!counts[m]) {
        counts[m] = { total: 0, failed: 0, amountPaise: 0 };
      }
      counts[m].total += 1;
      counts[m].amountPaise += p.amount;
      if (p.status === 'failed') {
        counts[m].failed += 1;
      }
    });

    return counts;
  }, [payments]);

  // Failure reasons breakdown
  const failureStats = React.useMemo(() => {
    const reasons: Record<string, { count: number; amountPaise: number }> = {};
    payments
      .filter((p) => p.status === 'failed')
      .forEach((p) => {
        const code = p.error_code || 'UNKNOWN';
        if (!reasons[code]) {
          reasons[code] = { count: 0, amountPaise: 0 };
        }
        reasons[code].count += 1;
        reasons[code].amountPaise += p.amount;
      });
    return reasons;
  }, [payments]);

  const totalFailed = payments.filter((p) => p.status === 'failed').length;
  const totalCaptured = payments.filter((p) => p.status === 'captured').length;
  const successRate = payments.length > 0 ? Math.round((totalCaptured / payments.length) * 100) : 0;

  const revenueAtRiskPaise = result?.opportunities.reduce((acc, curr) => acc + curr.revenue_at_risk_paise, 0) ?? 0;
  const expectedValuePaise = result?.recommendation.recommendation.expected_value_paise ?? 0;

  return (
    <div className="analytics-section">
      <div className="section-header-compact">
        <div>
          <h3 className="section-title-sm">Payment Telemetry & Failure Distribution</h3>
          <p className="section-subtitle-sm">
            Disciplined breakdown across payment rails, gateway error classes, and pipeline funnel.
          </p>
        </div>
        <div className="telemetry-badge">
          <span className="dot-pulse" />
          <span>Deterministic Event Ledger</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Method Distribution Card */}
        <div className="analytics-card">
          <div className="card-top-label">
            <span>RAIL BREAKDOWN</span>
            <span className="font-mono text-muted">{payments.length} Transactions</span>
          </div>

          <div className="method-bars-list">
            {(['card', 'upi', 'netbanking'] as const).map((method) => {
              const data = methodStats[method] || { total: 0, failed: 0, amountPaise: 0 };
              const percent = payments.length > 0 ? Math.round((data.total / payments.length) * 100) : 0;
              const failRate = data.total > 0 ? Math.round((data.failed / data.total) * 100) : 0;

              return (
                <div key={method} className="method-bar-item">
                  <div className="method-bar-header">
                    <span className="method-name font-mono">{method.toUpperCase()}</span>
                    <span className="method-val font-mono">
                      {formatPaise(data.amountPaise)} ({percent}%)
                    </span>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: method === 'card' ? 'var(--accent-primary)' : method === 'upi' ? 'var(--emerald)' : 'var(--text-secondary)',
                      }}
                    />
                  </div>

                  <div className="method-sub-row">
                    <span className="text-muted">
                      {data.total} attempts · {data.failed} failed
                    </span>
                    <span className={failRate > 30 ? 'text-crimson font-mono' : 'text-emerald font-mono'}>
                      {failRate}% drop-off
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Failure Root Cause Analysis */}
        <div className="analytics-card">
          <div className="card-top-label">
            <span>GATEWAY ERROR CLASSIFICATION</span>
            <span className="font-mono text-crimson">{totalFailed} Failures</span>
          </div>

          <div className="failure-reasons-list">
            {Object.entries(failureStats).map(([code, stat]) => {
              const pctOfFailures = totalFailed > 0 ? Math.round((stat.count / totalFailed) * 100) : 0;
              return (
                <div key={code} className="failure-reason-row">
                  <div className="failure-reason-main">
                    <div className="failure-code-badge font-mono">{code}</div>
                    <div className="failure-desc">
                      {code === 'GATEWAY_TIMEOUT'
                        ? 'Acquiring bank or card network latency timeout'
                        : code === 'AUTH_ERROR'
                        ? '3D-Secure customer authentication drop-off'
                        : code === 'BAD_REQUEST_ERROR'
                        ? 'Customer declined UPI collect or authorization'
                        : 'Unclassified payment failure event'}
                    </div>
                  </div>
                  <div className="failure-amount-wrap">
                    <span className="failure-amount font-mono">{formatPaise(stat.amountPaise)}</span>
                    <span className="failure-share font-mono">{stat.count} txns ({pctOfFailures}%)</span>
                  </div>
                </div>
              );
            })}

            {totalFailed === 0 && (
              <div className="empty-telemetry">
                <span>✓ Zero failed payments recorded in this batch.</span>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Conversion & Recovery Funnel */}
        <div className="analytics-card">
          <div className="card-top-label">
            <span>RECOVERY CONVERSION FUNNEL</span>
            <span className="font-mono text-emerald">
              Success Rate: {successRate}%
            </span>
          </div>

          <div className="funnel-steps">
            <div className="funnel-step">
              <div className="funnel-step-bar" style={{ width: '100%' }}>
                <span className="funnel-step-name">1. Gross Processed</span>
                <span className="funnel-step-val font-mono">
                  {formatPaise(payments.reduce((s, p) => s + p.amount, 0))}
                </span>
              </div>
            </div>

            <div className="funnel-step">
              <div
                className="funnel-step-bar failure-bar"
                style={{ width: `${Math.max(25, (totalFailed / (payments.length || 1)) * 100)}%` }}
              >
                <span className="funnel-step-name">2. Failed Transactions</span>
                <span className="funnel-step-val font-mono">
                  {totalFailed} drops
                </span>
              </div>
            </div>

            <div className="funnel-step">
              <div
                className="funnel-step-bar opportunity-bar"
                style={{
                  width: `${Math.max(20, Math.min(85, (revenueAtRiskPaise / (payments.reduce((s, p) => s + p.amount, 0) || 1)) * 100))}%`,
                }}
              >
                <span className="funnel-step-name">3. Revenue At Risk</span>
                <span className="funnel-step-val font-mono">
                  {formatPaise(revenueAtRiskPaise)}
                </span>
              </div>
            </div>

            <div className="funnel-step">
              <div
                className="funnel-step-bar value-bar"
                style={{
                  width: `${Math.max(15, Math.min(70, (expectedValuePaise / (revenueAtRiskPaise || 1)) * 100))}%`,
                }}
              >
                <span className="funnel-step-name">4. Net Expected Recovery</span>
                <span className="funnel-step-val font-mono text-emerald">
                  {formatPaise(expectedValuePaise)}
                </span>
              </div>
            </div>
          </div>

          <div className="funnel-footer">
            <span className="footer-metric">
              Expected EV ROI: <strong>+{Math.round((result?.recommendation.recommendation.expected_recovery_rate ?? 0) * 100)}%</strong>
            </span>
            <span className="footer-metric">
              Policy Constraint: <strong>{result?.policy.action.toUpperCase() ?? 'PENDING'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
