import React from 'react';
import { ShieldCheck, Lock, DollarSign, Database, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export function TrustGuardrailPanel() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="nb-panel p-6 shadow-skeuo-card space-y-2 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl border border-emerald-400/40 flex items-center justify-center shadow-skeuo-green" style={{ background: 'linear-gradient(180deg, #6EE7B7 0%, #10B981 60%, #047857 100%)' }}>
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          </div>
          <h2 className="text-base font-black text-nb-white uppercase tracking-tight font-mono">Financial Truth &amp; Safety Architecture</h2>
        </div>
        <p className="text-xs text-nb-muted max-w-3xl font-mono mt-1">
          MerchantPulse guarantees zero hallucinated accounting and zero unauthorized money movement by maintaining a strict boundary between deterministic code, AI strategy reasoning, and policy permissions.
        </p>
      </div>

      {/* Safety Pipeline Diagram */}
      <div className="nb-panel p-6 shadow-skeuo-card space-y-6">
        <h3 className="text-xs font-mono font-bold text-nb-muted uppercase tracking-wider">
          5-Stage Execution Safety Guardrail Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-2" style={{ background: 'var(--nb-recessed)' }}>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-black uppercase">
              <Database className="w-4 h-4 text-blue-400" />
              <span>1. Code Truth</span>
            </div>
            <p className="text-[11px] text-nb-muted leading-relaxed">
              GMV, balances, and EV math computed deterministically in integer paise. No LLM arithmetic.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-2" style={{ background: 'var(--nb-recessed)' }}>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-black uppercase">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>2. AI Reasoning</span>
            </div>
            <p className="text-[11px] text-nb-muted leading-relaxed">
              Gemini 2.5 Flash suggests strategy. Output strictly validated via Zod schemas.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-2" style={{ background: 'var(--nb-recessed)' }}>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-black uppercase">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>3. Policy Gate</span>
            </div>
            <p className="text-[11px] text-nb-muted leading-relaxed">
              6 deterministic rules enforce ₹25k auto limit, 24h contact cooldown, &amp; minimum margin.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-2" style={{ background: 'var(--nb-recessed)' }}>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-black uppercase">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>4. Idempotency</span>
            </div>
            <p className="text-[11px] text-nb-muted leading-relaxed">
              Execution-intent state machine prevents duplicate Razorpay payment link creations.
            </p>
          </div>

          {/* Stage 5 */}
          <div className="p-4 rounded-xl border border-nb-stroke/50 shadow-skeuo-inset space-y-2" style={{ background: 'var(--nb-recessed)' }}>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-black uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>5. Outcome</span>
            </div>
            <p className="text-[11px] text-nb-muted leading-relaxed">
              HMAC-verified webhooks reconcile recovery to decision ID, eliminating double counting.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit Rules Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="nb-panel p-5 space-y-3 shadow-skeuo-card">
          <h4 className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-2">
            <span className="skeuo-led-red w-2 h-2" />
            <span>What AI Can NEVER Control</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-nb-muted font-mono">
            <li className="flex items-center gap-2"><span className="text-rose-400 font-black">✕</span> Calculate accounting balances or transaction totals</li>
            <li className="flex items-center gap-2"><span className="text-rose-400 font-black">✕</span> Modify merchant policy thresholds or limits</li>
            <li className="flex items-center gap-2"><span className="text-rose-400 font-black">✕</span> Execute arbitrary Razorpay API requests directly</li>
            <li className="flex items-center gap-2"><span className="text-rose-400 font-black">✕</span> Suggest refunds or discounts as incentives</li>
          </ul>
        </div>

        <div className="nb-panel p-5 space-y-3 shadow-skeuo-card">
          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-2">
            <span className="skeuo-led-green w-2 h-2" />
            <span>What AI IS Approved To Reason Over</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-nb-muted font-mono">
            <li className="flex items-center gap-2"><span className="text-emerald-400 font-black">✓</span> Technical diagnosis of payment failure code</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400 font-black">✓</span> Ranking bounded strategies (e.g. Payment Link vs Reminder)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400 font-black">✓</span> Formulating empathetic, personalized SMS/Email copy</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400 font-black">✓</span> Providing business rationale for human ops review</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
