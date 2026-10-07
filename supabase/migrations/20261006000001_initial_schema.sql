-- ==============================================================================
-- BrandGuard AI - Multi-Tenant Enterprise Digital Risk Protection Schema
-- Migration: 20261006000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS (Multi-tenant membership & RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'ANALYST', 'VIEWER')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. BRANDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    legal_name TEXT,
    description TEXT,
    category TEXT,
    logo_url TEXT,
    official_website TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('VERIFIED', 'PENDING', 'UNVERIFIED')),
    verification_confidence INTEGER NOT NULL DEFAULT 0 CHECK (verification_confidence BETWEEN 0 AND 100),
    headquarters TEXT,
    founded_year INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. TRUSTED DOMAINS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trusted_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    verification_method TEXT NOT NULL CHECK (verification_method IN ('ORGANIZATION_CLAIM', 'DNS_TXT', 'META_TAG', 'MANUAL_VERIFICATION', 'OFFICIAL_SOURCE')),
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('VERIFIED', 'PENDING', 'UNVERIFIED')),
    verification_token TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. OFFICIAL APPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS official_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('ANDROID', 'IOS', 'WEB')),
    name TEXT NOT NULL,
    developer_name TEXT NOT NULL,
    package_id TEXT,
    bundle_id TEXT,
    store_url TEXT,
    icon_url TEXT,
    description TEXT,
    source TEXT NOT NULL DEFAULT 'ORGANIZATION_PROFILE',
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. OFFICIAL SOCIAL ACCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS official_social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('INSTAGRAM', 'X', 'YOUTUBE', 'FACEBOOK', 'TIKTOK', 'LINKEDIN', 'TELEGRAM')),
    username TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    source TEXT NOT NULL DEFAULT 'ORGANIZATION_PROFILE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. BRAND SCANS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    started_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    scan_type TEXT NOT NULL DEFAULT 'FULL' CHECK (scan_type IN ('FULL', 'WEBSITE', 'APPS', 'SOCIAL', 'QUICK')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- ------------------------------------------------------------------------------
-- 9. SCAN CANDIDATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES brand_scans(id) ON DELETE CASCADE,
    candidate_type TEXT NOT NULL CHECK (candidate_type IN ('APP', 'SOCIAL', 'WEBSITE', 'DOMAIN')),
    name TEXT NOT NULL,
    url TEXT,
    username TEXT,
    platform TEXT,
    developer_name TEXT,
    package_id TEXT,
    description TEXT,
    logo_url TEXT,
    source TEXT NOT NULL,
    source_url TEXT,
    discovery_status TEXT NOT NULL DEFAULT 'DISCOVERED',
    is_demo_data BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. THREATS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES scan_candidates(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('FAKE_WEBSITE', 'FAKE_APP', 'FAKE_SOCIAL', 'PHISHING', 'BRAND_IMPERSONATION', 'SUSPICIOUS_DOMAIN')),
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    url TEXT,
    candidate_name TEXT,
    candidate_logo TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. THREAT EVIDENCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threat_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_id UUID NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL,
    signal_value NUMERIC,
    description TEXT NOT NULL,
    severity_weight NUMERIC NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 12. URL VERIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS url_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    submitted_url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    hostname TEXT NOT NULL,
    root_domain TEXT NOT NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED_OFFICIAL', 'LIKELY_OFFICIAL', 'UNVERIFIED', 'SUSPICIOUS', 'INVALID')),
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    title TEXT,
    description TEXT,
    favicon_url TEXT,
    final_url TEXT,
    http_status INTEGER,
    ssl_valid BOOLEAN,
    domain_match BOOLEAN NOT NULL DEFAULT false,
    trusted_domain_match BOOLEAN NOT NULL DEFAULT false,
    brand_name_similarity NUMERIC NOT NULL DEFAULT 0,
    description_similarity NUMERIC,
    suspicious_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 13. REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    report_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'READY',
    file_url TEXT,
    summary TEXT,
    threats_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 14. ALERTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    threat_id UUID REFERENCES threats(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 15. SCAN EVENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES brand_scans(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 16. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE MULTI-TENANT QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

CREATE INDEX IF NOT EXISTS idx_brands_org ON brands(organization_id);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(verification_status);

CREATE INDEX IF NOT EXISTS idx_trusted_domains_org ON trusted_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_trusted_domains_brand ON trusted_domains(brand_id);
CREATE INDEX IF NOT EXISTS idx_trusted_domains_domain ON trusted_domains(domain);

CREATE INDEX IF NOT EXISTS idx_official_apps_org ON official_apps(organization_id);
CREATE INDEX IF NOT EXISTS idx_official_apps_brand ON official_apps(brand_id);

CREATE INDEX IF NOT EXISTS idx_official_social_org ON official_social_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_official_social_brand ON official_social_accounts(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_scans_org ON brand_scans(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_scans_brand ON brand_scans(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_scans_status ON brand_scans(status);

CREATE INDEX IF NOT EXISTS idx_scan_candidates_org ON scan_candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_scan_candidates_scan ON scan_candidates(scan_id);

CREATE INDEX IF NOT EXISTS idx_threats_org ON threats(organization_id);
CREATE INDEX IF NOT EXISTS idx_threats_brand ON threats(brand_id);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity);
CREATE INDEX IF NOT EXISTS idx_threats_risk ON threats(risk_score);

CREATE INDEX IF NOT EXISTS idx_threat_evidence_threat ON threat_evidence(threat_id);

CREATE INDEX IF NOT EXISTS idx_url_verifications_org ON url_verifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_url_verifications_domain ON url_verifications(root_domain);
CREATE INDEX IF NOT EXISTS idx_url_verifications_status ON url_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_url_verifications_risk ON url_verifications(risk_score);
CREATE INDEX IF NOT EXISTS idx_url_verifications_created ON url_verifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Isolation & Role-Based Access Control
-- ==============================================================================

-- Helper function: Get user organizations
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid() AND status = 'ACTIVE';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if current user has one of the required roles in the organization
CREATE OR REPLACE FUNCTION user_has_role(org_id UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND status = 'ACTIVE'
          AND role = ANY(required_roles)
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Organizations Policies
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and Admins can update their organization"
    ON organizations FOR UPDATE
    USING (user_has_role(id, ARRAY['OWNER', 'ADMIN']));

-- 2. Profiles Policies
CREATE POLICY "Users can view all member profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- 3. Organization Members Policies
CREATE POLICY "Members can view membership in their organization"
    ON organization_members FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and Admins can manage organization members"
    ON organization_members FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN']));

-- 4. Brands Policies
CREATE POLICY "Members can view brands in their organization"
    ON brands FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners, Admins, and Analysts can insert brands"
    ON brands FOR INSERT
    WITH CHECK (organization_id IN (SELECT get_user_org_ids()) AND user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

CREATE POLICY "Owners, Admins, and Analysts can update brands"
    ON brands FOR UPDATE
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

CREATE POLICY "Owners and Admins can delete brands"
    ON brands FOR DELETE
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN']));

-- 5. Trusted Domains Policies
CREATE POLICY "Members can view trusted domains"
    ON trusted_domains FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can manage trusted domains"
    ON trusted_domains FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 6. Official Apps Policies
CREATE POLICY "Members can view official apps"
    ON official_apps FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can manage official apps"
    ON official_apps FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 7. Official Social Accounts Policies
CREATE POLICY "Members can view official social accounts"
    ON official_social_accounts FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can manage official social accounts"
    ON official_social_accounts FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 8. Brand Scans Policies
CREATE POLICY "Members can view brand scans"
    ON brand_scans FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can launch scans"
    ON brand_scans FOR INSERT
    WITH CHECK (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 9. Scan Candidates Policies
CREATE POLICY "Members can view candidates"
    ON scan_candidates FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can manage candidates"
    ON scan_candidates FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 10. Threats Policies
CREATE POLICY "Members can view threats"
    ON threats FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can manage threats"
    ON threats FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 11. Threat Evidence Policies
CREATE POLICY "Members can view threat evidence"
    ON threat_evidence FOR SELECT
    USING (threat_id IN (SELECT id FROM threats WHERE organization_id IN (SELECT get_user_org_ids())));

CREATE POLICY "Admins and Analysts can manage threat evidence"
    ON threat_evidence FOR ALL
    USING (threat_id IN (SELECT id FROM threats WHERE user_has_role(threats.organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST'])));

-- 12. URL Verifications Policies
CREATE POLICY "Members can view url verifications"
    ON url_verifications FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can create url verifications"
    ON url_verifications FOR INSERT
    WITH CHECK (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 13. Reports Policies
CREATE POLICY "Members can view reports"
    ON reports FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and Analysts can create reports"
    ON reports FOR ALL
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN', 'ANALYST']));

-- 14. Alerts Policies
CREATE POLICY "Members can view alerts"
    ON alerts FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can update their alerts (mark as read)"
    ON alerts FOR UPDATE
    USING (organization_id IN (SELECT get_user_org_ids()));

-- 15. Scan Events Policies
CREATE POLICY "Members can view scan events"
    ON scan_events FOR SELECT
    USING (scan_id IN (SELECT id FROM brand_scans WHERE organization_id IN (SELECT get_user_org_ids())));

-- 16. Audit Logs Policies
CREATE POLICY "Admins and Owners can view audit logs"
    ON audit_logs FOR SELECT
    USING (user_has_role(organization_id, ARRAY['OWNER', 'ADMIN']));

CREATE POLICY "System can record audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
