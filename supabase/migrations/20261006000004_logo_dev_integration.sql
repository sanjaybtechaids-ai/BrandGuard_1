-- ==============================================================================
-- BRANDGUARD AI - LOGO.DEV INTEGRATION & ASSET METADATA MIGRATION
-- Migration: 20261006000004_logo_dev_integration.sql
-- ==============================================================================

-- 1. Extend brands table with Logo.dev and provider metadata
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS logo_provider TEXT DEFAULT 'LOGO_DEV' CHECK (logo_provider IN ('LOGO_DEV', 'ORGANIZATION', 'OFFICIAL_WEBSITE', 'PROVIDER', 'FALLBACK')),
  ADD COLUMN IF NOT EXISTS logo_domain TEXT,
  ADD COLUMN IF NOT EXISTS logo_last_updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. Backfill existing brands with normalized logo_domain from official_website
UPDATE brands
SET
  logo_domain = lower(regexp_replace(regexp_replace(regexp_replace(official_website, '^https?://', ''), '^www\.', ''), '/.*$', '')),
  logo_provider = CASE
    WHEN logo_url IS NOT NULL AND logo_url NOT LIKE '%unsplash%' THEN 'ORGANIZATION'
    ELSE 'LOGO_DEV'
  END,
  logo_last_updated_at = timezone('utc'::text, now())
WHERE logo_domain IS NULL AND official_website IS NOT NULL;

-- 3. Create index on logo_domain for high-performance domain lookups
CREATE INDEX IF NOT EXISTS idx_brands_logo_domain ON brands(logo_domain);
CREATE INDEX IF NOT EXISTS idx_brands_logo_provider ON brands(logo_provider);
