import React from 'react';
import { ShieldCheck, Lock, DollarSign, Database, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export function TrustGuardrailPanel() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white font-mono">Financial Truth & Safety Architecture</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          MerchantPulse guarantees zero hallucinated accounting and zero unauthorized money movement by maintaining a strict boundary between deterministic code, AI strategy reasoning, and policy permissions.
        </p>
      </div>

      {/* Safety Pipeline Diagram */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          5-Stage Execution Safety Guardrail Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold">
              <Database className="w-4 h-4" />
              <span>1. Code Truth</span>
            </div>
            <p className="text-[11px] text-slate-400">
              GMV, balances, and EV math computed deterministically in integer paise. No LLM arithmetic.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
              <Layers className="w-4 h-4" />
              <span>2. AI Reasoning</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gemini 2.5 Flash suggests strategy. Output strictly validated via Zod schemas.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>3. Policy Gate</span>
            </div>
            <p className="text-[11px] text-slate-400">
              6 deterministic rules enforce ₹25k auto limit, 24h contact cooldown, & minimum margin.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Idempotency</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Execution-intent state machine prevents duplicate Razorpay payment link creations.
            </p>
          </div>

          {/* Stage 5 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>5. Outcome</span>
            </div>
            <p className="text-[11px] text-slate-400">
              HMAC-verified webhooks reconcile recovery to decision ID, eliminating double counting.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit Rules Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>What AI Can NEVER Control</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-400 font-mono">
            <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Calculate accounting balances or transaction totals</li>
            <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Modify merchant policy thresholds or limits</li>
            <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Execute arbitrary Razorpay API requests directly</li>
            <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Suggest refunds or discounts as incentives</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>What AI IS Approved To Reason Over</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-400 font-mono">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Technical diagnosis of payment failure code</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Ranking bounded strategies (e.g. Payment Link vs Reminder)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Formulating empathetic, personalized SMS/Email copy</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Providing business rationale for human ops review</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
