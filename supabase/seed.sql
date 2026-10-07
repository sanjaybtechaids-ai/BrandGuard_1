-- ==============================================================================
-- BrandGuard AI - Multi-Tenant Seed Data
-- Database Seed: supabase/seed.sql
-- ==============================================================================

-- 1. Organizations
INSERT INTO organizations (id, name, slug, logo_url, website) VALUES
('a0000000-0000-0000-0000-000000000001', 'ABC Technologies', 'abc-technologies', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80', 'https://abctechnologies.io'),
('b0000000-0000-0000-0000-000000000002', 'Competitor Corp (Isolated Tenant)', 'competitor-corp', 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=128&auto=format&fit=crop&q=80', 'https://competitor.example')
ON CONFLICT (id) DO NOTHING;

-- 2. Trusted Brands for ABC Technologies
INSERT INTO brands (id, organization_id, name, legal_name, description, category, logo_url, official_website, verification_status, verification_confidence, headquarters, founded_year) VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Nike', 'Nike, Inc.', 'Global athletic footwear, apparel, equipment, and accessories corporation.', 'Apparel & Footwear', '/brands/nike.svg', 'https://nike.com', 'VERIFIED', 100, 'Beaverton, Oregon, USA', 1964),
('b0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Adidas', 'Adidas AG', 'Multinational corporation specializing in the design and manufacture of athletic shoes, clothing, and accessories.', 'Sportswear', '/brands/adidas.svg', 'https://adidas.com', 'VERIFIED', 98, 'Herzogenaurach, Germany', 1949),
('b0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Apple', 'Apple Inc.', 'Multinational technology company focused on consumer electronics, software, and online services.', 'Consumer Tech', '/brands/apple.svg', 'https://apple.com', 'VERIFIED', 100, 'Cupertino, California, USA', 1976),
('b0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Samsung', 'Samsung Electronics Co., Ltd.', 'South Korean multinational major appliance and consumer electronics corporation.', 'Electronics', '/brands/samsung.svg', 'https://samsung.com', 'VERIFIED', 95, 'Suwon, South Korea', 1969),
('b0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Microsoft', 'Microsoft Corporation', 'American multinational technology company producing computer software, consumer electronics, and personal computers.', 'Enterprise Software & Cloud', '/brands/microsoft.svg', 'https://microsoft.com', 'VERIFIED', 99, 'Redmond, Washington, USA', 1975),
('b0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Amazon', 'Amazon.com, Inc.', 'Multinational technology company focusing on e-commerce, cloud computing, online advertising, and digital streaming.', 'E-Commerce & Cloud', '/brands/amazon.svg', 'https://amazon.com', 'VERIFIED', 99, 'Seattle, Washington, USA', 1994),
('b0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Google', 'Google LLC / Alphabet Inc.', 'American multinational technology corporation specializing in online search, cloud computing, and computer software.', 'Internet & AI', '/brands/google.svg', 'https://google.com', 'VERIFIED', 100, 'Mountain View, California, USA', 1998),
('b0000001-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Tata', 'Tata Sons Private Limited', 'Indian multinational conglomerate operating across automotive, steel, chemicals, and IT.', 'Conglomerate', '/brands/tata.svg', 'https://tata.com', 'VERIFIED', 95, 'Mumbai, Maharashtra, India', 1868),
('b0000001-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Infosys', 'Infosys Limited', 'Global leader in next-generation digital services and consulting.', 'Information Technology', '/brands/infosys.svg', 'https://infosys.com', 'VERIFIED', 96, 'Bengaluru, Karnataka, India', 1981),
('b0000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Flipkart', 'Flipkart Internet Private Limited', 'India’s leading e-commerce marketplace offering millions of products across categories.', 'E-Commerce Marketplace', '/brands/flipkart.svg', 'https://flipkart.com', 'VERIFIED', 94, 'Bengaluru, Karnataka, India', 2007)
ON CONFLICT (id) DO NOTHING;

-- 3. Trusted Domains (Explicitly verified organization domains)
INSERT INTO trusted_domains (id, organization_id, brand_id, domain, verification_method, verification_status, verified_at) VALUES
('d0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'nike.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'snkrs.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 'adidas.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'apple.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000004', 'samsung.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000005', 'microsoft.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000006', 'amazon.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000007', 'google.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008', 'tata.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000009', 'infosys.com', 'DNS_TXT', 'VERIFIED', now()),
('d0000001-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 'flipkart.com', 'DNS_TXT', 'VERIFIED', now())
ON CONFLICT (id) DO NOTHING;

-- 4. Threats (Demonstrating verified forensics vs impersonators)
INSERT INTO threats (id, organization_id, brand_id, type, severity, risk_score, status, title, summary, url, candidate_name, platform) VALUES
('c0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'FAKE_WEBSITE', 'CRITICAL', 94, 'NEW', 'Critical Impersonation: nike-shoes-outlet-sale.shop', 'Typosquatting & counterfeit footwear shop scraping Nike official assets and collecting credit card numbers.', 'https://nike-shoes-outlet-sale.shop', 'Nike Shoes Outlet Direct', 'Web APK'),
('c0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'SUSPICIOUS_DOMAIN', 'HIGH', 87, 'INVESTIGATING', 'Look-alike Support Domain: nike-support-example.com', 'Fraudulent support desk domain mimicking official Nike support channels and harvesting customer credentials.', 'https://nike-support-example.com', 'Nike Customer Help Portal', 'Web APK'),
('c0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'FAKE_APP', 'CRITICAL', 91, 'NEW', 'Rogue App Package: com.shoes.nike.club', 'Third-party APK masquerading as Nike Run Club with suspicious SMS and contact permissions.', 'https://apkpure.fake/nike-run-club-pro', 'Nike Running Club Pro 2026', 'Third-Party APK')
ON CONFLICT (id) DO NOTHING;

-- 5. Threat Evidence
INSERT INTO threat_evidence (id, threat_id, signal_type, signal_value, description, severity_weight) VALUES
('e0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'DOMAIN_MISMATCH', 100, 'Host domain nike-shoes-outlet-sale.shop is not in organization trusted domain list.', 1.0),
('e0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'NAME_SIMILARITY', 96, 'High lexical similarity to official brand name Nike.', 0.9),
('e0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002', 'DOMAIN_SIMILARITY', 89, 'Look-alike domain containing brand name combined with suspicious keyword "support".', 0.95),
('e0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'TRUSTED_DOMAIN_MISMATCH', 100, 'Destination server is hosted on bulletproof offshore registrar with no verified SSL relationship.', 1.0)
ON CONFLICT (id) DO NOTHING;

-- 6. Official Apps Seed
INSERT INTO official_apps (id, organization_id, brand_id, name, platform, developer_name, package_id, store_url, verification_status, verification_confidence, relationship_type) VALUES
('oa-000001-0001', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Nike Run Club', 'Google Play', 'Nike, Inc.', 'com.nike.plusgps', 'https://play.google.com/store/apps/details?id=com.nike.plusgps', 'VERIFIED', 100, 'DIRECT_OFFICIAL'),
('oa-000001-0002', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'Apple Store', 'Apple App Store', 'Apple Inc.', 'com.apple.store', 'https://apps.apple.com/app/com.apple.store', 'VERIFIED', 100, 'DIRECT_OFFICIAL'),
('oa-000001-0003', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000005', 'Microsoft Teams', 'Google Play', 'Microsoft Corporation', 'com.microsoft.teams', 'https://play.google.com/store/apps/details?id=com.microsoft.teams', 'VERIFIED', 100, 'DIRECT_OFFICIAL'),
('oa-000001-0004', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008', 'Tata Neu - Rewarding Super App', 'Google Play', 'Tata Digital Limited', 'com.tatadigital.tcp', 'https://play.google.com/store/apps/details?id=com.tatadigital.tcp', 'VERIFIED', 98, 'DIRECT_OFFICIAL')
ON CONFLICT (id) DO NOTHING;

-- 7. Official Social Accounts Seed
INSERT INTO official_social_accounts (id, organization_id, brand_id, platform, username, profile_url, verification_status, verification_confidence, relationship_type) VALUES
('os-000001-0001', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Instagram', '@nike', 'https://instagram.com/nike', 'VERIFIED_OFFICIAL', 100, 'DIRECT_OFFICIAL'),
('os-000001-0002', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'Instagram', '@apple', 'https://instagram.com/apple', 'VERIFIED_OFFICIAL', 100, 'DIRECT_OFFICIAL'),
('os-000001-0003', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000005', 'LinkedIn', 'Microsoft', 'https://linkedin.com/company/microsoft', 'VERIFIED_OFFICIAL', 100, 'DIRECT_OFFICIAL'),
('os-000001-0004', 'a0000000-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008', 'LinkedIn', 'tata-companies', 'https://linkedin.com/company/tata-companies', 'VERIFIED_OFFICIAL', 98, 'DIRECT_OFFICIAL')
ON CONFLICT (id) DO NOTHING;

