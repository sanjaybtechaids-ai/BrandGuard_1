-- ==============================================================================
-- BrandGuard AI - Brand Auto-Discovery & Trusted Identity Schema
-- Migration: 20261006000002_brand_discovery.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BRAND DISCOVERY RUNS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_discovery_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    result_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. BRAND DISCOVERY CANDIDATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_discovery_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discovery_run_id UUID NOT NULL REFERENCES brand_discovery_runs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    candidate_type TEXT NOT NULL CHECK (candidate_type IN ('WEBSITE', 'APP', 'SOCIAL', 'COMPANY', 'TRADEMARK')),
    name TEXT NOT NULL,
    url TEXT,
    platform TEXT,
    source TEXT NOT NULL,
    confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('VERIFIED_OFFICIAL', 'LIKELY_OFFICIAL', 'UNVERIFIED', 'SUSPICIOUS', 'INVALID')),
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. BRAND EVIDENCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES brand_discovery_candidates(id) ON DELETE SET NULL,
    source TEXT NOT NULL,
    evidence_type TEXT NOT NULL,
    evidence_value TEXT NOT NULL,
    confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_discovery_runs_org ON brand_discovery_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_query ON brand_discovery_runs(query);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_status ON brand_discovery_runs(status);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_started ON brand_discovery_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_discovery_cand_run ON brand_discovery_candidates(discovery_run_id);
CREATE INDEX IF NOT EXISTS idx_discovery_cand_org ON brand_discovery_candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_discovery_cand_brand ON brand_discovery_candidates(brand_id);
CREATE INDEX IF NOT EXISTS idx_discovery_cand_type ON brand_discovery_candidates(candidate_type);

CREATE INDEX IF NOT EXISTS idx_brand_evidence_org ON brand_evidence(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_evidence_brand ON brand_evidence(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_evidence_cand ON brand_evidence(candidate_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE brand_discovery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_discovery_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_evidence ENABLE ROW LEVEL SECURITY;

-- 1. brand_discovery_runs RLS
CREATE POLICY "brand_discovery_runs_select"
    ON brand_discovery_runs FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "brand_discovery_runs_insert"
    ON brand_discovery_runs FOR INSERT
    WITH CHECK (
        organization_id IN (SELECT get_user_org_ids())
        AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])
    );

CREATE POLICY "brand_discovery_runs_update"
    ON brand_discovery_runs FOR UPDATE
    USING (
        organization_id IN (SELECT get_user_org_ids())
        AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])
    );

-- 2. brand_discovery_candidates RLS
CREATE POLICY "brand_discovery_candidates_select"
    ON brand_discovery_candidates FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "brand_discovery_candidates_insert"
    ON brand_discovery_candidates FOR INSERT
    WITH CHECK (
        organization_id IN (SELECT get_user_org_ids())
        AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])
    );

CREATE POLICY "brand_discovery_candidates_update"
    ON brand_discovery_candidates FOR UPDATE
    USING (
        organization_id IN (SELECT get_user_org_ids())
        AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])
    );

-- 3. brand_evidence RLS
CREATE POLICY "brand_evidence_select"
    ON brand_evidence FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "brand_evidence_insert"
    ON brand_evidence FOR INSERT
    WITH CHECK (
        organization_id IN (SELECT get_user_org_ids())
        AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])
    );

CREATE POLICY "brand_evidence_update"
    ON brand_evidence FOR UPDATE
    USING (
        organization_id IN (SELECT get_user_org_ids())
        AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])
    );
