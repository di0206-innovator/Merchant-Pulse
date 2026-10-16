'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Sparkles, ShieldCheck, Zap, AlertCircle, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { sanitizeInput } from '@/lib/cryptoUtils';
import { trackAnalyticsEvent } from '@/lib/env';

export default function StrategyPage() {
  const [opportunityType, setOpportunityType] = useState('FAILED_PAYMENT');
  const [amountInr, setAmountInr] = useState(8500);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bankOrIssuer, setBankOrIssuer] = useState('HDFC Bank');
  const [failureCode, setFailureCode] = useState('BANK_TIMEOUT');
  const [failureDescription, setFailureDescription] = useState('UPI issuing bank node timed out (HTTP 504)');
  const [customerLtvInr, setCustomerLtvInr] = useState(45000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanBank = sanitizeInput(bankOrIssuer, 64);
    const cleanDesc = sanitizeInput(failureDescription, 250);

    if (!Number.isFinite(amountInr) || amountInr <= 0 || amountInr > 1000000) {
      setError('Transaction amount must be between ₹1 and ₹10,00,000.');
      return;
    }
    if (!cleanDesc || cleanDesc.length < 4) {
      setError('Please enter a valid failure description (at least 4 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/strategy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityType,
          amountPaise: Math.round(amountInr * 100),
          paymentMethod,
          bankOrIssuer: cleanBank || 'HDFC Bank',
          failureCode,
          failureDescription: cleanDesc,
          customerLtvPaise: Math.max(0, Math.round(customerLtvInr * 100)),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate recovery strategy.');
      } else {
        setResult(data);
        trackAnalyticsEvent('strategy_simulated', {
          opportunityType,
          amountInr,
          verdict: data.policyResult?.verdict,
        });
      }
    } catch {
      setError('Network error while contacting the Strategy Engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="nb-page space-y-6">
        <header className="nb-page-header">
          <div className="space-y-2">
            <span className="nb-eyebrow">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Bounded AI Strategy &amp; Policy Simulator
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Strategy Reasoning Lab
            </h1>
            <p className="font-mono text-xs text-nb-muted max-w-2xl">
              Simulate how MerchantPulse computes integer-paise Expected Value, synthesizes a bounded recovery strategy, and enforces multi-tier policy guardrails before executing via Razorpay.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Input Form */}
          <section className="nb-panel p-6 space-y-4">
            <h2 className="font-mono text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
              Incident Telemetry Parameters
            </h2>

            {error && (
              <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 font-mono text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="strat-type" className="nb-label">Opportunity Class</label>
                  <select
                    id="strat-type"
                    value={opportunityType}
                    onChange={e => setOpportunityType(e.target.value)}
                    className="nb-input"
                  >
                    <option value="FAILED_PAYMENT">FAILED_PAYMENT</option>
                    <option value="HIGH_VALUE_DROPOFF">HIGH_VALUE_DROPOFF</option>
                    <option value="PAYMENT_METHOD_DEGRADATION">PAYMENT_METHOD_DEGRADATION</option>
                    <option value="ABANDONED_CHECKOUT">ABANDONED_CHECKOUT</option>
                    <option value="STATE_MISMATCH">STATE_MISMATCH</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="strat-amount" className="nb-label">Checkout Amount (₹ INR)</label>
                  <input
                    id="strat-amount"
                    type="number"
                    min="1"
                    max="1000000"
                    value={amountInr}
                    onChange={e => setAmountInr(Number(e.target.value))}
                    className="nb-input tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="strat-method" className="nb-label">Payment Method</label>
                  <select
                    id="strat-method"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="nb-input"
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">NetBanking</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="strat-code" className="nb-label">Failure Code</label>
                  <select
                    id="strat-code"
                    value={failureCode}
                    onChange={e => setFailureCode(e.target.value)}
                    className="nb-input"
                  >
                    <option value="BANK_TIMEOUT">BANK_TIMEOUT</option>
                    <option value="GATEWAY_ERROR">GATEWAY_ERROR</option>
                    <option value="AUTHENTICATION_ERROR">AUTHENTICATION_ERROR</option>
                    <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
                    <option value="CARD_EXPIRED">CARD_EXPIRED</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="strat-ltv" className="nb-label">Customer LTV (₹)</label>
                  <input
                    id="strat-ltv"
                    type="number"
                    min="0"
                    value={customerLtvInr}
                    onChange={e => setCustomerLtvInr(Number(e.target.value))}
                    className="nb-input tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="strat-bank" className="nb-label">Issuer / Bank</label>
                  <input
                    id="strat-bank"
                    type="text"
                    value={bankOrIssuer}
                    onChange={e => setBankOrIssuer(e.target.value)}
                    className="nb-input"
                  />
                </div>
                <div>
                  <label htmlFor="strat-desc" className="nb-label">Gateway Error Description</label>
                  <input
                    id="strat-desc"
                    type="text"
                    value={failureDescription}
                    onChange={e => setFailureDescription(e.target.value)}
                    className="nb-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="nb-primary-button w-full py-3 justify-center">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                <span>{loading ? 'Synthesizing Strategy...' : 'Generate Bounded Strategy & Evaluate Policy'}</span>
              </button>
            </form>
          </section>

          {/* Output Panel */}
          <section className="nb-panel p-6 space-y-4 font-mono text-xs">
            <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Decision &amp; Policy Output
            </h2>

            {!result ? (
              <div className="p-10 rounded-xl border border-dashed border-white/15 text-center text-nb-muted">
                Submit incident parameters on the left to inspect deterministic EV math, AI recommendation, and policy gate verdict.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-nb-stroke/50 bg-[var(--nb-recessed)]">
                    <div className="text-[10px] text-nb-muted uppercase">Net Expected Value</div>
                    <div className="text-base font-black text-emerald-400 mt-1">
                      ₹{((result.opportunity?.expectedValue?.netExpectedValuePaise || 0) / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-nb-stroke/50 bg-[var(--nb-recessed)]">
                    <div className="text-[10px] text-nb-muted uppercase">Priority Score</div>
                    <div className="text-base font-black text-amber-400 mt-1">
                      {result.opportunity?.priority?.score} / 100 ({result.opportunity?.priority?.tier})
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-nb-stroke/50 bg-[var(--nb-recessed)]">
                    <div className="text-[10px] text-nb-muted uppercase">Policy Verdict</div>
                    <div className="text-base font-black text-blue-400 mt-1">
                      {result.policyResult?.verdict}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-nb-stroke/60 bg-[var(--nb-recessed)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Recommended Action</span>
                    <span className="nb-chip-green text-[10px]">{result.recommendation?.recommendedActionType}</span>
                  </div>
                  <p className="text-white">{result.recommendation?.diagnosis}</p>
                  <p className="text-nb-muted text-[11px]">{result.recommendation?.rationale}</p>
                </div>

                {result.recommendation?.customerMessaging?.smsText && (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Sanitized Customer Recovery SMS Copy
                    </div>
                    <p className="text-white text-[11px]">{result.recommendation.customerMessaging.smsText}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
