-- Migration: 20261006000003_entity_matching_and_brand_isolation.sql
-- Digital Risk Protection - Entity Matching, Brand Relationship Graph, and Brand Isolation

-- 1. Extend Brands Table with Hierarchy and Data Source metadata
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS parent_brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS relationship_type TEXT CHECK (relationship_type IN ('PARENT_COMPANY', 'SUBSIDIARY', 'OWNED_BRAND', 'DIGITAL_PLATFORM', 'PRODUCT', 'PARTNER')),
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'LIVE' CHECK (data_source IN ('LIVE', 'OFFICIAL', 'PROVIDER', 'DEMO'));

-- 2. Extend Official Apps with Multi-Signal Verification and Relationship Fields
ALTER TABLE official_apps
  ADD COLUMN IF NOT EXISTS bundle_id TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'LIKELY_OFFICIAL', 'UNVERIFIED', 'SUSPICIOUS', 'REJECTED')),
  ADD COLUMN IF NOT EXISTS verification_confidence INTEGER DEFAULT 95 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'DIRECT_OFFICIAL' CHECK (relationship_type IN ('DIRECT_OFFICIAL', 'SUBSIDIARY_OFFICIAL', 'BRAND_ECOSYSTEM', 'PARTNER', 'UNRELATED', 'SUSPICIOUS')),
  ADD COLUMN IF NOT EXISTS developer_match BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS package_match BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS website_match BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS brand_match BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reasons JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT now();

-- 3. Extend Official Social Accounts with Verification Metadata
ALTER TABLE official_social_accounts
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'VERIFIED_OFFICIAL' CHECK (verification_status IN ('VERIFIED_OFFICIAL', 'LIKELY_OFFICIAL', 'UNVERIFIED', 'SUSPICIOUS')),
  ADD COLUMN IF NOT EXISTS verification_confidence INTEGER DEFAULT 95 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'DIRECT_OFFICIAL' CHECK (relationship_type IN ('DIRECT_OFFICIAL', 'SUBSIDIARY_OFFICIAL', 'BRAND_ECOSYSTEM', 'PARTNER', 'UNRELATED', 'SUSPICIOUS')),
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reasons JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT now();

-- 4. Performance Indexes (Part 47)
CREATE INDEX IF NOT EXISTS idx_brands_org ON brands(organization_id);
CREATE INDEX IF NOT EXISTS idx_brands_parent ON brands(parent_brand_id);
CREATE INDEX IF NOT EXISTS idx_official_apps_org_brand ON official_apps(organization_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_official_apps_status ON official_apps(verification_status);
CREATE INDEX IF NOT EXISTS idx_official_social_org_brand ON official_social_accounts(organization_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_threats_org_brand ON threats(organization_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_threat_evidence_threat ON threat_evidence(threat_id);
CREATE INDEX IF NOT EXISTS idx_brand_scans_org_brand ON brand_scans(organization_id, brand_id);
