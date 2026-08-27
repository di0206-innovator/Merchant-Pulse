-- ====================================================================
-- MerchantPulse PostgreSQL / Supabase Core Schema
-- Razorpay Buildathon 2026: AI Revenue Recovery Agent
-- ====================================================================

-- 1. Webhook Events (Append-Only Log for Inbound Razorpay Webhooks)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(128) NOT NULL UNIQUE,
    event_type VARCHAR(64) NOT NULL,
    merchant_id VARCHAR(64) NOT NULL DEFAULT 'rzp_merchant_main',
    raw_payload JSONB NOT NULL,
    signature VARCHAR(256),
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    processed_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_merchant_id ON public.webhook_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON public.webhook_events(received_at DESC);

-- 2. Payments (Fact Store Normalized Ledger)
CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(128) PRIMARY KEY, -- rzp payment id e.g. pay_...
    merchant_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(128),
    amount_paise BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL,
    method VARCHAR(32) NOT NULL,
    bank_or_issuer VARCHAR(64),
    error_code VARCHAR(64),
    error_description TEXT,
    customer_contact VARCHAR(64),
    customer_email VARCHAR(128),
    customer_name VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON public.payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 3. Revenue Opportunities (Detected Failures with Deterministic EV)
CREATE TABLE IF NOT EXISTS public.revenue_opportunities (
    id VARCHAR(128) PRIMARY KEY, -- opp_...
    merchant_id VARCHAR(64) NOT NULL,
    payment_id VARCHAR(128) REFERENCES public.payments(id) ON DELETE SET NULL,
    order_id VARCHAR(128),
    amount_paise BIGINT NOT NULL,
    type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DETECTED',
    customer_name VARCHAR(128),
    customer_contact VARCHAR(64),
    customer_email VARCHAR(128),
    
    -- Deterministic EV Breakdown (Paise)
    p_success NUMERIC(5, 4) NOT NULL,
    recoverable_gmv_paise BIGINT NOT NULL,
    intervention_cost_paise BIGINT NOT NULL,
    net_expected_value_paise BIGINT NOT NULL,
    
    -- Evidence Context
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_opportunities_merchant_id ON public.revenue_opportunities(merchant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_order_id ON public.revenue_opportunities(order_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.revenue_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.revenue_opportunities(created_at DESC);

-- 4. Strategy Runs (AI & Mock Strategy Recommendations)
CREATE TABLE IF NOT EXISTS public.strategy_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id VARCHAR(128) NOT NULL REFERENCES public.revenue_opportunities(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL,
    recommended_action_type VARCHAR(64) NOT NULL,
    diagnosis TEXT NOT NULL,
    rationale TEXT NOT NULL,
    confidence_score NUMERIC(5, 4) NOT NULL,
    suggested_expiry_minutes INT NOT NULL DEFAULT 120,
    customer_messaging JSONB,
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Provider Telemetry & Verification Metadata
    provider_name VARCHAR(64) NOT NULL, -- GeminiStrategyProvider | MockStrategyProvider | MockFallback
    model_name VARCHAR(64) NOT NULL,
    prompt_version VARCHAR(32) NOT NULL,
    strategy_schema_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    context_hash VARCHAR(128) NOT NULL,
    latency_ms INT NOT NULL,
    validation_status VARCHAR(32) NOT NULL,
    fallback_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_strategy_runs_opp_id ON public.strategy_runs(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_strategy_runs_merchant_id ON public.strategy_runs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_strategy_runs_created_at ON public.strategy_runs(created_at DESC);

-- 5. Policy Decisions (Policy Guardrail Evaluations)
CREATE TABLE IF NOT EXISTS public.policy_decisions (
    decision_id VARCHAR(128) PRIMARY KEY, -- dec_...
    opportunity_id VARCHAR(128) NOT NULL REFERENCES public.revenue_opportunities(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL,
    verdict VARCHAR(32) NOT NULL, -- AUTO_EXECUTE | ESCALATE_HUMAN | REJECT
    primary_reason TEXT NOT NULL,
    evaluated_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_policy_decisions_merchant_id ON public.policy_decisions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_policy_decisions_opp_id ON public.policy_decisions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_policy_decisions_verdict ON public.policy_decisions(verdict);

-- 6. Execution Intents (Concurrency & Idempotency State Machine)
CREATE TABLE IF NOT EXISTS public.execution_intents (
    intent_key VARCHAR(256) PRIMARY KEY, -- intent_merchant_oppId_actionType
    opportunity_id VARCHAR(128) NOT NULL REFERENCES public.revenue_opportunities(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    state VARCHAR(32) NOT NULL, -- EXECUTION_REQUESTED | EXECUTION_IN_FLIGHT | EXECUTION_SUCCEEDED | EXECUTION_FAILED
    execution_record_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_execution_intents_opp_id ON public.execution_intents(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_execution_intents_state ON public.execution_intents(state);

-- 7. Execution Records (External Razorpay Primitives Executed)
CREATE TABLE IF NOT EXISTS public.execution_records (
    id VARCHAR(128) PRIMARY KEY, -- exec_...
    opportunity_id VARCHAR(128) NOT NULL REFERENCES public.revenue_opportunities(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL, -- SUCCESS | FAILED | SKIPPED
    razorpay_reference_id VARCHAR(128) UNIQUE, -- plink_...
    razorpay_short_url VARCHAR(256),
    payload_sent JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_received JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_execution_records_merchant_id ON public.execution_records(merchant_id);
CREATE INDEX IF NOT EXISTS idx_execution_records_opp_id ON public.execution_records(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_execution_records_rzp_ref ON public.execution_records(razorpay_reference_id);

-- 8. Recovery Outcomes (Reconciliation Evidence)
CREATE TABLE IF NOT EXISTS public.recovery_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id VARCHAR(128) NOT NULL,
    opportunity_id VARCHAR(128) NOT NULL,
    merchant_id VARCHAR(64) NOT NULL,
    attribution_type VARCHAR(64) NOT NULL, -- ATTRIBUTED_INTERVENTION | ORGANIC_RECOVERY | REJECTED_UNATTRIBUTED
    status VARCHAR(32) NOT NULL, -- RECOVERED | EXPIRED | PENDING | REJECTED
    reconciled_amount_paise BIGINT NOT NULL DEFAULT 0,
    resolution_event_id VARCHAR(128),
    reconciled_payment_id VARCHAR(128),
    notes TEXT,
    reconciled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_recovery_decision UNIQUE (decision_id)
);

CREATE INDEX IF NOT EXISTS idx_recovery_outcomes_opp_id ON public.recovery_outcomes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_recovery_outcomes_merchant_id ON public.recovery_outcomes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recovery_outcomes_status ON public.recovery_outcomes(status);

-- 9. Audit Events (Immutable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id VARCHAR(128) NOT NULL,
    opportunity_id VARCHAR(128) NOT NULL,
    event_id VARCHAR(128) NOT NULL,
    merchant_id VARCHAR(64) NOT NULL,
    action_status VARCHAR(32) NOT NULL,
    executed_action_id VARCHAR(128),
    deterministic_metrics JSONB NOT NULL,
    ai_recommendation JSONB NOT NULL,
    policy_result JSONB NOT NULL,
    outcome JSONB NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_events_merchant_id ON public.audit_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_decision_id ON public.audit_events(decision_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_opp_id ON public.audit_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_recorded_at ON public.audit_events(recorded_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchant_select_opportunities ON public.revenue_opportunities
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) IS NOT NULL
    );

CREATE POLICY merchant_select_payments ON public.payments
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) IS NOT NULL
    );

CREATE POLICY merchant_select_decisions ON public.policy_decisions
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) IS NOT NULL
    );

CREATE POLICY merchant_select_audit ON public.audit_events
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) IS NOT NULL
    );

CREATE POLICY merchant_select_outcomes ON public.recovery_outcomes
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) IS NOT NULL
    );
