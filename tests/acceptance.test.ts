/**
 * BrandGuard AI - Comprehensive Acceptance & Unit Test Suite
 * Tests all 10 acceptance requirements and security barriers.
 */

import { sanitizeAndValidateUrl, isPrivateOrReservedIp } from '../src/lib/security/url-security';
import { normalizeUrlToDomain, extractRootDomain, normalizeBrandName } from '../src/lib/risk/normalization';
import { calculateStringSimilarity, analyzeLookalikeDomain } from '../src/lib/risk/similarity';
import { urlVerificationService } from '../src/services/url-verification.service';
import { signIn } from '../src/services/auth.service';
import { hasPermission } from '../src/lib/security/permissions';
import { getThreats, createThreat } from '../src/services/threats.service';
import { getAlerts } from '../src/services/alerts.service';
import { brandDiscoveryService } from '../src/services/brand-discovery.service';
import { isInformationalOrThirdPartySource } from '../src/lib/risk/brand-confidence';
import { getBrands, createBrand, deleteBrand, refreshBrandLogo } from '../src/services/brands.service';
import { matchAppToBrand, matchSocialToBrand } from '../src/lib/risk/entity-matching';
import { getOfficialAppsByBrand, getSuspiciousAppsByBrand } from '../src/services/apps.service';
import { getVerifiedSocialsByBrand, getSuspiciousSocialsByBrand } from '../src/services/social.service';
import { getThreatsByBrand } from '../src/services/threats.service';
import { LogoService } from '../src/services/logo.service';
import { createThreatReport, getReports } from '../src/services/reports.service';
import { scanService } from '../src/services/scan.service';

async function runAcceptanceTests() {
  console.log('\n============================================================');
  console.log('🛡️  BRANDGUARD AI - BACKEND ACCEPTANCE TEST SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // Test 1: User logs in -> Authenticated user
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: User Authentication & Organization Context ---');
  const loginRes = await signIn('security@abc.com', 'password123');
  assert(loginRes.success === true, 'Test 1.1: Authentication succeeds for valid security analyst');
  assert(loginRes.user.name === 'Sanjay', 'Test 1.2: Authenticated user matches Sanjay');
  assert(
    loginRes.user.role === 'Security Analyst' || loginRes.user.orgRole === 'ANALYST',
    'Test 1.3: User possesses Security Analyst role'
  );

  // ---------------------------------------------------------------------------
  // Test 2: User pastes valid URL -> URL verification starts
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Valid URL Handling & Normalization ---');
  const validUrlRes = await urlVerificationService.verifyUrl('https://nike.com/products');
  assert(validUrlRes.status !== 'INVALID', 'Test 2.1: Valid URL triggers verification analysis');
  assert(validUrlRes.rootDomain === 'nike.com', 'Test 2.2: Normalized root domain is nike.com');

  // ---------------------------------------------------------------------------
  // Test 3: User pastes invalid URL -> Friendly validation error
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Invalid URL Validation ---');
  const invalidUrlRes = await urlVerificationService.verifyUrl('not-a-valid-url-at-all');
  assert(invalidUrlRes.status === 'INVALID', 'Test 3.1: Malformed input classified as INVALID');
  assert(
    invalidUrlRes.evidence.some((e) => e.signalType === 'URL_VALIDATION_ERROR'),
    'Test 3.2: Friendly validation error evidence returned'
  );

  // ---------------------------------------------------------------------------
  // Test 4: Verified trusted domain -> VERIFIED_OFFICIAL
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 4: Trusted Domain Matching ---');
  const trustedRes = await urlVerificationService.verifyUrl('https://nike.com');
  assert(trustedRes.status === 'VERIFIED_OFFICIAL', 'Test 4.1: nike.com classified as VERIFIED_OFFICIAL');
  assert(trustedRes.confidenceScore >= 95, 'Test 4.2: Confidence score is >= 95%');
  assert(trustedRes.riskScore <= 10, 'Test 4.3: Risk score is low (<= 10)');
  assert(
    trustedRes.evidence.some((e) => e.signalType === 'TRUSTED_DOMAIN_MATCH'),
    'Test 4.4: Trusted domain match evidence included'
  );

  // ---------------------------------------------------------------------------
  // Test 5: Unknown domain -> UNVERIFIED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: Unknown Third-Party Domain ---');
  const unknownRes = await urlVerificationService.verifyUrl('https://random-unrelated-domain-123.com');
  console.log('Test 5 details:', { status: unknownRes.status, risk: unknownRes.riskScore, brand: unknownRes.brand, expl: unknownRes.explanation });
  assert(unknownRes.status === 'UNVERIFIED', 'Test 5.1: Unknown domain classified as UNVERIFIED');
  assert(unknownRes.riskScore < 60, 'Test 5.2: Generic unknown domain is not marked malicious prematurely');

  // ---------------------------------------------------------------------------
  // Test 6: Look-alike suspicious domain -> POTENTIAL IMPERSONATION / SUSPICIOUS
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 6: Look-alike & Impersonation Detection ---');
  const suspiciousRes = await urlVerificationService.verifyUrl('https://nike-support-example.com');
  assert(suspiciousRes.status === 'SUSPICIOUS', 'Test 6.1: nike-support-example.com classified as SUSPICIOUS');
  assert(suspiciousRes.riskScore >= 65, 'Test 6.2: Risk score is high (>= 65)');
  assert(
    suspiciousRes.evidence.some((e) => e.signalType === 'LOOKALIKE_DOMAIN' || e.signalType === 'SUSPICIOUS_KEYWORD'),
    'Test 6.3: Lookalike or suspicious keyword evidence present'
  );

  // ---------------------------------------------------------------------------
  // Test 7: Domain Normalization & Root Domain Extraction
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 7: Domain Normalization Edge Cases ---');
  const norm1 = normalizeUrlToDomain('https://www.nike.com/about/news?id=1#hero');
  assert(norm1.rootDomain === 'nike.com', 'Test 7.1: www.nike.com/about/news resolves to nike.com');

  const norm2 = normalizeUrlToDomain('http://store.nike.co.uk/cart');
  assert(norm2.rootDomain === 'nike.co.uk', 'Test 7.2: Two-level TLD co.uk correctly resolves to nike.co.uk');

  const normBrand = normalizeBrandName('Nike, Inc. Corporation');
  assert(normBrand === 'nike', 'Test 7.3: Legal suffixes stripped cleanly');

  // ---------------------------------------------------------------------------
  // Test 8: Role Permissions Matrix
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 8: Role-Based Access Control (RBAC) ---');
  assert(hasPermission('OWNER', 'org:manage') === true, 'Test 8.1: OWNER has org:manage permission');
  assert(hasPermission('ANALYST', 'url:verify') === true, 'Test 8.2: ANALYST has url:verify permission');
  assert(hasPermission('ANALYST', 'scans:start') === true, 'Test 8.3: ANALYST has scans:start permission');
  assert(hasPermission('VIEWER', 'scans:start') === false, 'Test 8.4: VIEWER cannot start scans');
  assert(hasPermission('VIEWER', 'brands:manage') === false, 'Test 8.5: VIEWER cannot manage brands');

  // ---------------------------------------------------------------------------
  // Test 9: SSRF & Private IP Protection
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 9: SSRF & Cloud Metadata Protection Barrier ---');
  assert(isPrivateOrReservedIp('127.0.0.1') === true, 'Test 9.1: Loopback 127.0.0.1 is blocked');
  assert(isPrivateOrReservedIp('10.0.0.1') === true, 'Test 9.2: Private IP 10.0.0.1 is blocked');
  assert(isPrivateOrReservedIp('192.168.1.1') === true, 'Test 9.3: Private IP 192.168.1.1 is blocked');
  assert(isPrivateOrReservedIp('169.254.169.254') === true, 'Test 9.4: AWS/GCP Metadata 169.254.169.254 is blocked');
  assert(isPrivateOrReservedIp('::1') === true, 'Test 9.5: IPv6 loopback ::1 is blocked');
  assert(isPrivateOrReservedIp('8.8.8.8') === false, 'Test 9.6: Public IP 8.8.8.8 is allowed');

  // Verify URL validator rejects localhost
  let localhostBlocked = false;
  try {
    sanitizeAndValidateUrl('http://localhost:3000/internal');
  } catch (err: any) {
    if (err.code === 'BLOCKED_HOSTNAME') localhostBlocked = true;
  }
  assert(localhostBlocked, 'Test 9.7: Localhost URL is blocked by URL sanitizer');

  // ---------------------------------------------------------------------------
  // Test 10: Suspicious result conversion into Threat
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 10: Escalation to Threat Incident & SOC Alerts ---');
  if (suspiciousRes.id) {
    const threatRes = await urlVerificationService.createThreatFromVerification(
      suspiciousRes.id,
      'Forensic Threat: nike-support-example.com'
    );
    assert(threatRes.success === true, 'Test 10.1: Threat created from suspicious verification');
    assert(threatRes.threat.name.includes('nike-support-example.com'), 'Test 10.2: Threat metadata captures domain');

    const allThreats = await getThreats();
    assert(
      allThreats.some((t) => t.id === threatRes.threat.id),
      'Test 10.3: Newly created threat appears in active Threats Ledger'
    );

    const allAlerts = await getAlerts();
    assert(
      allAlerts.some((a) => a.threatId === threatRes.threat.id),
      'Test 10.4: SOC Alert dispatched and visible in notifications'
    );
  }

  // ---------------------------------------------------------------------------
  // Test 11: Brand Auto-Discovery Pipeline ("Nike")
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 11: Brand Auto-Discovery Pipeline (Nike) ---');
  const nikeDiscovery = await brandDiscoveryService.discoverBrand(
    'Nike',
    'a0000000-0000-0000-0000-000000000001',
    'usr-sanjay-analyst',
    true
  );
  assert(nikeDiscovery.brand.name === 'Nike', 'Test 11.1: Brand identity identified as Nike');
  assert(nikeDiscovery.officialWebsite.domain === 'nike.com', 'Test 11.2: Official website discovered as nike.com');
  assert(nikeDiscovery.apps.length >= 2, 'Test 11.3: Official mobile apps discovered across Google Play & Apple App Store');
  assert(nikeDiscovery.socialAccounts.length >= 3, 'Test 11.4: Official social accounts discovered via verified anchors');
  assert(nikeDiscovery.confidenceScore >= 90, 'Test 11.5: Confidence score >= 90% (VERIFIED_OFFICIAL)');
  assert(nikeDiscovery.verificationStatus === 'VERIFIED_OFFICIAL', 'Test 11.6: Status classified as VERIFIED_OFFICIAL');
  assert(nikeDiscovery.evidence.length >= 3, 'Test 11.7: Comprehensive evidence signals collected');

  // ---------------------------------------------------------------------------
  // Test 12: Brand Auto-Discovery Pipeline ("Apple")
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 12: Brand Auto-Discovery Pipeline (Apple) ---');
  const appleDiscovery = await brandDiscoveryService.discoverBrand(
    'Apple',
    'a0000000-0000-0000-0000-000000000001',
    'usr-sanjay-analyst',
    true
  );
  assert(appleDiscovery.brand.name === 'Apple', 'Test 12.1: Brand identity identified as Apple');
  assert(appleDiscovery.officialWebsite.domain === 'apple.com', 'Test 12.2: Official website discovered as apple.com');
  assert(appleDiscovery.confidenceScore >= 90, 'Test 12.3: Apple identity confidence >= 90%');
  assert(appleDiscovery.verificationStatus === 'VERIFIED_OFFICIAL', 'Test 12.4: Apple classified as VERIFIED_OFFICIAL');

  // ---------------------------------------------------------------------------
  // Test 13: Unknown Brand Graceful Degradation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 13: Unknown Brand Discovery & Graceful Degradation ---');
  const unknownDiscovery = await brandDiscoveryService.discoverBrand(
    'AcmeFictional992',
    'a0000000-0000-0000-0000-000000000001',
    'usr-sanjay-analyst',
    true
  );
  assert(unknownDiscovery.brand.name.includes('AcmeFictional992'), 'Test 13.1: Inferred identity created for unknown brand');
  assert(unknownDiscovery.verificationStatus !== 'VERIFIED_OFFICIAL', 'Test 13.2: Unknown brand is NOT blindly marked VERIFIED_OFFICIAL');
  assert(unknownDiscovery.confidenceScore < 90, 'Test 13.3: Unknown brand confidence is capped appropriately');

  // ---------------------------------------------------------------------------
  // Test 14: False Positive Protection (Section 19)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 14: False-Positive Protection & Informational Source Filtering ---');
  assert(isInformationalOrThirdPartySource('https://en.wikipedia.org/wiki/Nike,_Inc.') === true, 'Test 14.1: Wikipedia page recognized as informational source');
  assert(isInformationalOrThirdPartySource('https://www.bloomberg.com/quote/NKE:US') === true, 'Test 14.2: Stock ticker quote recognized as financial source');
  assert(isInformationalOrThirdPartySource('https://techcrunch.com/news/nike-innovation') === true, 'Test 14.3: News publication recognized as news media');
  assert(isInformationalOrThirdPartySource('https://nike-support-login.com') === false, 'Test 14.4: Impersonating credential harvester correctly NOT whitelisted');

  // ---------------------------------------------------------------------------
  // Test 15: Role-Based Access Control (RBAC) on Discovery
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 15: RBAC Authorization on Brand Discovery Engine ---');
  assert(hasPermission('OWNER', 'brands:manage') === true, 'Test 15.1: OWNER has permission to manage and discover brands');
  assert(hasPermission('ADMIN', 'brands:manage') === true, 'Test 15.2: ADMIN has permission to manage and discover brands');
  assert(hasPermission('ANALYST', 'brands:manage') === true, 'Test 15.3: ANALYST has permission to manage and discover brands');
  assert(hasPermission('VIEWER', 'brands:manage') === false, 'Test 15.4: VIEWER is strictly read-only and blocked from discovery/addition');

  // ---------------------------------------------------------------------------
  // Test 16: User Confirmation & Trusted Identity Graph Creation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 16: Brand Confirmation & Trusted Identity Anchoring ---');
  const confirmedBrand = await brandDiscoveryService.confirmDiscovery(
    nikeDiscovery.discoveryRunId,
    'a0000000-0000-0000-0000-000000000001',
    'usr-sanjay-analyst'
  );
  assert(confirmedBrand.name === 'Nike', 'Test 16.1: Confirmed brand name matches Nike');
  assert(confirmedBrand.verificationStatus === 'Verified', 'Test 16.2: Confirmed brand verified in organization graph');
  assert(confirmedBrand.officialApps.length >= 2, 'Test 16.3: Official apps anchored to brand profile');
  assert(confirmedBrand.officialSocials.length >= 3, 'Test 16.4: Official social channels anchored to brand profile');

  // ---------------------------------------------------------------------------
  // Test 17: Caching & Identity Refresh Engine
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 17: Caching & Identity Refresh Engine ---');
  const cachedDiscovery = await brandDiscoveryService.discoverBrand(
    'Nike',
    'a0000000-0000-0000-0000-000000000001',
    'usr-sanjay-analyst',
    false
  );
  assert(cachedDiscovery.cached === true, 'Test 17.1: Subsequent discovery within TTL returns cached result');

  const refreshedIdentity = await brandDiscoveryService.refreshBrandIdentity(
    confirmedBrand.id,
    'a0000000-0000-0000-0000-000000000001',
    'usr-sanjay-analyst'
  );
  assert(refreshedIdentity.confidenceScore >= 90, 'Test 17.2: Refreshed identity re-evaluates multi-source signals');
  assert(refreshedIdentity.cached === false, 'Test 17.3: Explicit refresh bypasses cache to obtain fresh state');

  // ---------------------------------------------------------------------------
  // Test 18: Full-Screen Apple-Style Brand Showcase Data Model & Sync
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 18: Apple-Style Brand Showcase Data Model & Sync ---');
  const allBrands = await getBrands();
  assert(allBrands.length >= 2, 'Test 18.1: Multiple brands exist in organization directory');
  assert(
    allBrands.every((b) => Boolean(b.name && b.website)),
    'Test 18.2: All brands have valid corporate names and official website anchors'
  );
  assert(
    allBrands.some((b) => Boolean(b.heroImage || b.brandVisual)),
    'Test 18.3: Brands feature high-resolution hero visuals for full-screen showcase'
  );

  const threatsList = await getThreats();
  assert(Array.isArray(threatsList), 'Test 18.4: Threats ledger loaded successfully for live metrics derivation');

  // ---------------------------------------------------------------------------
  // Test 19: Dynamic Brand Addition & Deletion Synchronization
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 19: Dynamic Brand Addition & Deletion Synchronization ---');
  const newTestBrand = await createBrand({
    name: 'Samsung',
    company: 'Samsung Electronics Co., Ltd.',
    website: 'samsung.com',
    heroImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1600&auto=format&fit=crop&q=85',
    category: 'Consumer Electronics & Semiconductors',
  });
  assert(newTestBrand.id.includes('samsung'), 'Test 19.1: New brand created with normalized ID');

  const afterAddBrands = await getBrands();
  assert(
    afterAddBrands.some((b) => b.id === newTestBrand.id),
    'Test 19.2: Newly created brand immediately appears in organization brands list'
  );

  const deleted = await deleteBrand(newTestBrand.id);
  assert(deleted === true, 'Test 19.3: Brand deletion successfully completed');

  const afterDeleteBrands = await getBrands();
  assert(
    !afterDeleteBrands.some((b) => b.id === newTestBrand.id),
    'Test 19.4: Deleted brand cleanly removed from organization brands list'
  );

  // ---------------------------------------------------------------------------
  // Test 20: Entity Matching, False-Positive Protection & Brand Data Isolation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 20: Entity Matching, False-Positive Protection & Brand Isolation ---');

  // 20.1: Multi-signal Entity Matching - Tata Brand
  const tataBrand = {
    id: 'br-tata-001',
    name: 'Tata',
    website: 'tata.com',
    company: 'Tata Sons Private Limited',
  };

  const legitimateTataApp = matchAppToBrand(
    {
      name: 'Tata Neu',
      developer: 'Tata Digital Private Limited',
      packageId: 'com.tatadigital.tcp',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.tatadigital.tcp',
    },
    tataBrand
  );
  assert(
    legitimateTataApp.matched === true && legitimateTataApp.confidence >= 80,
    'Test 20.1: Legitimate Tata Neu app is VERIFIED via developer match + package ID'
  );

  // 20.2: False-Positive Rejections for Tata (The exact problem from Screenshot 2)
  const taptapApp = matchAppToBrand(
    {
      name: 'Taptap Send: Money Transfer',
      developer: 'Taptap Send, Inc.',
      packageId: 'com.taptapsend.app',
    },
    tataBrand
  );
  assert(
    taptapApp.matched === false && taptapApp.relationship === 'UNRELATED',
    'Test 20.2: Taptap Send is REJECTED as UNRELATED for Tata (developer: Taptap Send, Inc.)'
  );

  const tantanApp = matchAppToBrand(
    {
      name: 'tantan - Global Dating App',
      developer: 'Hello Planet PTE. LTD.',
      packageId: 'com.tantantribe.app',
    },
    tataBrand
  );
  assert(
    tantanApp.matched === false && tantanApp.relationship === 'UNRELATED',
    'Test 20.3: Tantan is REJECTED as UNRELATED for Tata (developer: Hello Planet PTE. LTD.)'
  );

  const tadaApp = matchAppToBrand(
    {
      name: 'TADA – Ride Hailing',
      developer: 'MVL Foundation',
      packageId: 'io.mvlchain.tada',
    },
    tataBrand
  );
  assert(
    tadaApp.matched === false && tadaApp.relationship === 'UNRELATED',
    'Test 20.4: TADA is REJECTED as UNRELATED for Tata (developer: MVL Foundation)'
  );

  const tataLandApp = matchAppToBrand(
    {
      name: 'TataLand',
      developer: 'Hainan Xinhe Network',
      packageId: 'com.xinhe.tataparty',
    },
    tataBrand
  );
  assert(
    tataLandApp.matched === false && tataLandApp.relationship === 'UNRELATED',
    'Test 20.5: TataLand is REJECTED as UNRELATED for Tata (developer: Hainan Xinhe)'
  );

  // 20.3: Suspicious App Detection for Nike
  const nikeBrand = {
    id: 'br-nike-001',
    name: 'Nike',
    website: 'nike.com',
    company: 'Nike, Inc.',
  };

  const suspiciousNikeApp = matchAppToBrand(
    {
      name: 'Nike Shopping Official',
      developer: 'Fake App Studio',
      packageId: 'com.nike.shoppro',
    },
    nikeBrand
  );
  assert(
    suspiciousNikeApp.matched === false && suspiciousNikeApp.relationship === 'SUSPICIOUS',
    'Test 20.6: Nike Shopping from Fake App Studio is flagged as SUSPICIOUS (never Verified)'
  );

  // 20.4: Social Account Verification & Suspicious Detection
  const verifiedNikeSocial = matchSocialToBrand(
    {
      platform: 'Instagram',
      handle: '@nike',
      url: 'https://instagram.com/nike',
      verified: true,
    },
    nikeBrand
  );
  assert(
    verifiedNikeSocial.matched === true && verifiedNikeSocial.confidence >= 80,
    'Test 20.7: Official @nike Instagram account is VERIFIED_OFFICIAL'
  );

  const fakeNikeSocial = matchSocialToBrand(
    {
      platform: 'Instagram',
      handle: '@nike_support_help',
      url: 'https://instagram.com/nike_support_help',
      verified: false,
    },
    nikeBrand
  );
  assert(
    fakeNikeSocial.matched === false && fakeNikeSocial.status === 'SUSPICIOUS',
    'Test 20.8: @nike_support_help is flagged as SUSPICIOUS impersonator'
  );

  // 20.5: Strict Brand-Specific Data Isolation
  const orgId = 'a0000000-0000-0000-0000-000000000001';
  const nikeApps = await getOfficialAppsByBrand('br-nike-001', orgId);
  const appleApps = await getOfficialAppsByBrand('br-apple-001', orgId);
  const tataApps = await getOfficialAppsByBrand('br-tata-001', orgId);

  assert(
    nikeApps.length > 0 && nikeApps.every((a) => !a.name.toLowerCase().includes('apple') && !a.name.toLowerCase().includes('tata')),
    'Test 20.9: Brand A (Nike) NEVER displays Brand B (Apple/Tata) official applications'
  );

  assert(
    appleApps.length > 0 && appleApps.every((a) => !a.name.toLowerCase().includes('nike') && !a.name.toLowerCase().includes('tata')),
    'Test 20.10: Brand B (Apple) NEVER displays Brand A (Nike/Tata) official applications'
  );

  assert(
    tataApps.length > 0 && tataApps.every((a) => a.developer.toLowerCase().includes('tata')),
    'Test 20.11: Tata official applications contain ONLY verified Tata developer entities'
  );

  const nikeSocials = await getVerifiedSocialsByBrand('br-nike-001', orgId);
  assert(
    nikeSocials.length > 0 && nikeSocials.every((s) => s.handle.toLowerCase().includes('nike')),
    'Test 20.12: Nike social accounts contain ONLY verified Nike handles'
  );

  const nikeThreats = await getThreatsByBrand('br-nike-001', orgId);
  assert(
    nikeThreats.length > 0 && nikeThreats.every((t) => t.brandId === 'br-nike-001' || t.brandName?.toLowerCase() === 'nike'),
    'Test 20.13: Brand threat ledger strictly queries WHERE brand_id = requestedBrandId'
  );

  // ---------------------------------------------------------------------------
  // Test 21: Logo.dev Integration & Domain-First Resolution
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 21: Logo.dev Domain-First Resolution & Security ---');

  // 21.1: Domain Normalization
  assert(LogoService.cleanDomain('https://www.nike.com/us/en_us') === 'nike.com', 'Test 21.1: cleanDomain extracts nike.com from full URL');
  assert(LogoService.cleanDomain('http://apple.com') === 'apple.com', 'Test 21.2: cleanDomain normalizes apple.com');
  assert(LogoService.cleanDomain('www.microsoft.com') === 'microsoft.com', 'Test 21.3: cleanDomain strips www prefix');

  // 21.2: Enterprise Fallback Initials
  assert(LogoService.getBrandInitials('Microsoft') === 'MS', 'Test 21.4: Microsoft initials match MS');
  assert(LogoService.getBrandInitials('Apple') === 'A', 'Test 21.5: Apple initials match A');
  assert(LogoService.getBrandInitials('Nike') === 'NI', 'Test 21.6: Nike initials match NI');
  assert(LogoService.getBrandInitials('Tata') === 'TA', 'Test 21.7: Tata initials match TA');
  assert(LogoService.getBrandInitials('Amazon') === 'AM', 'Test 21.8: Amazon initials match AM');
  assert(LogoService.getBrandInitials('Google') === 'G', 'Test 21.9: Google initials match G');
  assert(LogoService.getBrandInitials('Samsung') === 'SA', 'Test 21.10: Samsung initials match SA');
  assert(LogoService.getBrandInitials('Adidas') === 'AD', 'Test 21.11: Adidas initials match AD');

  // 21.3: Logo.dev CDN URL Generation
  const nikeLogoUrl = LogoService.getBrandLogoUrl('nike.com');
  assert(nikeLogoUrl.includes('img.logo.dev/nike.com'), 'Test 21.12: CDN URL points to img.logo.dev/nike.com');
  assert(!nikeLogoUrl.includes('YOUR_NEW_ROTATED_SECRET_KEY'), 'Test 21.13: CDN URL NEVER contains server secret key');

  // 21.4: Domain-First Logo Resolution Priority
  const resolvedNike = LogoService.resolveBrandLogo({
    name: 'Nike',
    official_website: 'https://www.nike.com',
  });
  assert(resolvedNike.domain === 'nike.com', 'Test 21.14: Domain-first resolution identifies nike.com');
  assert(resolvedNike.provider === 'LOGO_DEV', 'Test 21.15: Provider is LOGO_DEV for official domain');

  // Organization-provided logo preserves provider
  const orgBrand = LogoService.resolveBrandLogo({
    name: 'Custom Brand',
    logo_url: 'https://custom-org.com/uploaded-logo.png',
    logo_provider: 'ORGANIZATION',
  });
  assert(orgBrand.provider === 'ORGANIZATION', 'Test 21.16: Organization-uploaded logo is NOT overwritten');

  // 21.5: Brand Creation Auto-Resolves Logo.dev
  const createdTestBrand = await createBrand({
    name: 'Test Logo Brand',
    description: 'Automated test brand for Logo.dev verification',
    website: 'https://www.adidas.com',
    threatCount: 0,
    status: 'Active',
  }, orgId);
  assert(createdTestBrand.logo_provider === 'LOGO_DEV', 'Test 21.17: Newly created brand has LOGO_DEV provider');
  assert(createdTestBrand.logo_domain === 'adidas.com', 'Test 21.18: Newly created brand stores normalized domain adidas.com');
  assert(typeof createdTestBrand.logo_url === 'string' && createdTestBrand.logo_url.length > 0, 'Test 21.19: Newly created brand stores resolved logo_url');

  // 21.6: Logo Refresh
  const refreshed = await refreshBrandLogo(createdTestBrand.id, orgId);
  assert(refreshed.logo_provider === 'LOGO_DEV', 'Test 21.20: Refreshed brand retains LOGO_DEV provider');

  // Clean up test brand
  await deleteBrand(createdTestBrand.id, orgId);

  // 21.7: Existing Brands Backfilled
  const existingOrgBrands = await getBrands(orgId);
  assert(
    existingOrgBrands.every((b) => Boolean(b.logo_url || b.logo) && Boolean(b.logo_provider)),
    'Test 21.21: All existing brands have resolved logo_url and logo_provider'
  );

  // ---------------------------------------------------------------------------
  // Test 22: Mandatory Multi-Brand Cross-Contamination Barrier (Prompt Section 36)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 22: Mandatory Multi-Brand Cross-Contamination Barrier ---');

  // Create Brand A and Brand B
  const brandA = await createBrand({
    name: 'Brand Alpha',
    company: 'Brand Alpha Technologies Inc.',
    website: 'brandalpha.com',
  }, orgId);

  const brandB = await createBrand({
    name: 'Brand Beta',
    company: 'Brand Beta Systems Corp.',
    website: 'brandbeta.com',
    officialApps: [
      {
        id: 'app-beta-official',
        name: 'Brand Beta Official App',
        developer: 'Brand Beta Systems Corp.',
        platform: 'Google Play',
        icon: '/brands/default.svg',
        packageId: 'com.brandbeta.official',
        isOfficial: true,
      },
    ],
  }, orgId);

  // Add threat to Brand A
  const threatA = await createThreat({
    brandId: brandA.id,
    brandName: brandA.name,
    organizationId: orgId,
    name: 'Brand Alpha Phishing Portal',
    url: 'https://brandalpha-fake-login.com',
    riskScore: 92,
    riskLevel: 'Critical',
    type: 'FAKE_WEBSITE',
  });

  // Query Brand A and Brand B threats
  const threatsForA = await getThreatsByBrand(brandA.id, orgId);
  const threatsForB = await getThreatsByBrand(brandB.id, orgId);

  assert(
    threatsForA.some((t) => t.id === threatA.id || t.name === threatA.name),
    'Test 22.1: Brand A displays its own threat'
  );
  assert(
    !threatsForB.some((t) => t.id === threatA.id || t.name === threatA.name || t.brandId === brandA.id),
    'Test 22.2: Brand B does NOT display Brand A threats'
  );

  // Query Brand A and Brand B apps
  const appsForA = await getOfficialAppsByBrand(brandA.id, orgId);
  const appsForB = await getOfficialAppsByBrand(brandB.id, orgId);

  assert(
    appsForB.some((a) => a.name.includes('Brand Beta')),
    'Test 22.3: Brand B displays its own official apps'
  );
  assert(
    !appsForA.some((a) => a.name.includes('Brand Beta') || a.brandId === brandB.id),
    'Test 22.4: Brand A does NOT display Brand B apps'
  );

  // Clean up
  await deleteBrand(brandA.id, orgId);
  await deleteBrand(brandB.id, orgId);

  // ---------------------------------------------------------------------------
  // Test 23: Brand Data Cleanup & Official Brand Logo Resolver
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 23: Brand Data Cleanup & Official Brand Logo Resolver ---');
  const orgABrands = await getBrands(orgId);

  // 23.1 - 23.4: Unwanted Demo/Test Brands Removal
  assert(!orgABrands.some((b) => b.name === 'ABC Technologies' || b.id === 'abc-tech'), 'Test 23.1: ABC Technologies removed from organization brands list');
  assert(!orgABrands.some((b) => b.name === 'NordicPay' || b.id === 'nordic-pay'), 'Test 23.2: NordicPay removed from organization brands list');
  assert(!orgABrands.some((b) => b.name === 'HyperCloud AI' || b.id === 'hypercloud'), 'Test 23.3: HyperCloud AI removed from organization brands list');
  assert(!orgABrands.some((b) => b.name === 'Solaris Health' || b.id === 'solaris-health'), 'Test 23.4: Solaris Health removed from organization brands list');

  // 23.5: Legitimate Brands Directory Integrity
  const legitimateNames = ['Nike', 'Apple', 'Microsoft', 'Tata', 'Samsung', 'Adidas'];
  assert(orgABrands.length === 6, `Test 23.5: Exactly 6 legitimate brands enrolled in Org A (found ${orgABrands.length})`);
  assert(
    legitimateNames.every((name) => orgABrands.some((b) => b.name.toLowerCase() === name.toLowerCase())),
    'Test 23.6: All legitimate brands present (Nike, Apple, Microsoft, Tata, Samsung, Adidas)'
  );

  // 23.7: Official Canonical Domain Integrity
  const expectedDomains: Record<string, string> = {
    nike: 'nike.com',
    apple: 'apple.com',
    microsoft: 'microsoft.com',
    tata: 'tata.com',
    samsung: 'samsung.com',
    adidas: 'adidas.com',
  };
  assert(
    orgABrands.every((b) => {
      const exp = expectedDomains[b.id.toLowerCase()];
      const actualDomain = b.canonical_domain || b.canonicalDomain || b.logo_domain || b.logoDomain;
      return exp ? actualDomain === exp : true;
    }),
    'Test 23.7: Every legitimate brand has correct canonical_domain matching official website'
  );

  // 23.8: Section 11 Domain Normalization Multi-Test
  assert(LogoService.cleanDomain('https://www.nike.com/') === 'nike.com', 'Test 23.8a: https://www.nike.com/ -> nike.com');
  assert(LogoService.cleanDomain('www.nike.com') === 'nike.com', 'Test 23.8b: www.nike.com -> nike.com');
  assert(LogoService.cleanDomain('HTTPS://NIKE.COM/') === 'nike.com', 'Test 23.8c: HTTPS://NIKE.COM/ -> nike.com');
  assert(LogoService.cleanDomain('nike.com/path') === 'nike.com', 'Test 23.8d: nike.com/path -> nike.com');
  assert(LogoService.cleanDomain('nike.com?test=1') === 'nike.com', 'Test 23.8e: nike.com?test=1 -> nike.com');
  assert(LogoService.cleanDomain('nike.com:443') === 'nike.com', 'Test 23.8f: nike.com:443 -> nike.com');

  // 23.9: Logo Cache Key Isolation
  const resolvedTata = LogoService.resolveBrandLogo({
    id: 'tata',
    name: 'Tata',
    canonical_domain: 'tata.com',
  });
  assert(resolvedTata.domain === 'tata.com', 'Test 23.9a: Initial resolution resolves to tata.com');
  const cachedTata = LogoService.getCachedLogo('tata');
  assert(cachedTata !== undefined && cachedTata.domain === 'tata.com', 'Test 23.9b: Logo cache stores and retrieves under brand.id / canonical domain');

  // 23.10: Dynamic Resolution for New Brand
  const resolvedAmazon = LogoService.resolveBrandLogo({
    name: 'Amazon',
    canonical_domain: 'amazon.com',
  });
  assert(resolvedAmazon.domain === 'amazon.com', 'Test 23.10: New legitimate brand Amazon automatically resolves to amazon.com');
  assert(resolvedAmazon.provider === 'LOGO_DEV', 'Test 23.11: New legitimate brand uses LOGO_DEV provider');

  // 23.12: Graceful Degradation to Initials for Unverified Entity Without Domain
  const resolvedUnknown = LogoService.resolveBrandLogo({
    name: 'Unknown Enterprise XYZ',
  });
  assert(resolvedUnknown.isFallback === true, 'Test 23.12: Entity without valid domain falls back to initials');
  assert(resolvedUnknown.initials.length > 0, 'Test 23.13: Initials fallback generated successfully');

  // ---------------------------------------------------------------------------
  // Test 24: New Brand Discovery & Full Persistence (Sony) (Part 1, 2, 3, 12, 13, 14, 15)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 24: New Brand Discovery & Persistence (Sony) ---');
  const sonyDiscovery = await brandDiscoveryService.discoverBrand(
    'Sony',
    orgId,
    'usr-sanjay-analyst',
    true
  );
  assert(sonyDiscovery.brand.name.toLowerCase() === 'sony', 'Test 24.1: Brand name identified as Sony');
  assert(sonyDiscovery.officialWebsite.domain.includes('sony'), 'Test 24.2: Sony official website discovered');
  assert(sonyDiscovery.apps.length > 0, 'Test 24.3: Sony official applications discovered');
  assert(sonyDiscovery.socialAccounts.length > 0, 'Test 24.4: Sony official social channels discovered');

  // Confirm discovery and verify persistence to backend
  const confirmedSony = await brandDiscoveryService.confirmDiscovery(
    sonyDiscovery.discoveryRunId,
    orgId,
    'usr-sanjay-analyst'
  );
  assert(Boolean(confirmedSony.id), 'Test 24.5: Sony assigned persistent Brand UUID');
  assert(confirmedSony.verificationStatus === 'Verified', 'Test 24.6: Sony verification status is Verified');
  assert(confirmedSony.canonical_domain === 'sony.com' || confirmedSony.canonicalDomain === 'sony.com', 'Test 24.7: Canonical domain persisted as sony.com');

  // Query official apps using confirmedSony.id (Part 14)
  const sonyOfficialApps = await getOfficialAppsByBrand(confirmedSony.id, orgId);
  assert(sonyOfficialApps.length > 0, `Test 24.8: Official apps queried by brand UUID (${sonyOfficialApps.length} found, not empty)`);
  assert(sonyOfficialApps.every((a) => a.brandId === confirmedSony.id || a.isOfficial), 'Test 24.9: All returned apps reference Sony brand UUID');

  // Query official social accounts using confirmedSony.id (Part 15)
  const sonyOfficialSocials = await getVerifiedSocialsByBrand(confirmedSony.id, orgId);
  assert(sonyOfficialSocials.length > 0, `Test 24.10: Verified social accounts queried by brand UUID (${sonyOfficialSocials.length} found, not empty)`);

  // ---------------------------------------------------------------------------
  // Test 25: Brand Context Isolation & Threat Deduplication (Part 6, 16, 17, 18, 42)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 25: Brand Context Isolation & Threat Deduplication ---');
  const appleOfficialApps = await getOfficialAppsByBrand('apple', orgId);
  assert(
    !appleOfficialApps.some((a) => a.brandId === confirmedSony.id || a.name.toLowerCase().includes('sony')),
    'Test 25.1: Apple context NEVER displays Sony applications'
  );
  assert(
    !sonyOfficialApps.some((a) => a.brandId === 'apple' || a.name.toLowerCase().includes('apple')),
    'Test 25.2: Sony context NEVER displays Apple applications'
  );

  // Threat creation & deduplication test (Sony Support Helpdesk duplicate prevention)
  const sonyThreat1 = await createThreat({
    brandId: confirmedSony.id,
    brandName: confirmedSony.name,
    organizationId: orgId,
    name: 'Sony Support Helpdesk',
    url: 'https://sony-support-help.com',
    riskScore: 88,
    riskLevel: 'High',
    type: 'FAKE_WEBSITE',
  });
  assert(Boolean(sonyThreat1.id), 'Test 25.3: Threat created for Sony');

  // Attempt to create identical threat
  const sonyThreat2 = await createThreat({
    brandId: confirmedSony.id,
    brandName: confirmedSony.name,
    organizationId: orgId,
    name: 'Sony Support Helpdesk',
    url: 'https://sony-support-help.com',
    riskScore: 88,
    riskLevel: 'High',
    type: 'FAKE_WEBSITE',
  });
  assert(sonyThreat1.id === sonyThreat2.id, 'Test 25.4: Duplicate threat creation returns existing threat record without duplicating');

  const sonyThreats = await getThreatsByBrand(confirmedSony.id, orgId);
  const helpdeskThreats = sonyThreats.filter((t) => t.url === 'https://sony-support-help.com' || t.name === 'Sony Support Helpdesk');
  assert(helpdeskThreats.length === 1, `Test 25.5: Threat ledger contains exactly 1 unique instance of Sony Support Helpdesk (found ${helpdeskThreats.length})`);

  // Clean up Sony
  await deleteBrand(confirmedSony.id, orgId);

  // ---------------------------------------------------------------------------
  // Test 26: Reporting Workflow & Audit (Part 21, 22, 23, 24, 58, 59)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 26: Reporting Workflow & Audit ---');
  const threatReport = await createThreatReport({
    brandId: 'apple',
    brandName: 'Apple',
    threatId: 'threat-apple-phish',
    reportedUrl: 'https://apple-security-verify.com',
    riskScore: 92,
    riskLevel: 'Critical',
    evidence: ['Brand name similarity: 96%', 'Domain typosquat: detected'],
    notes: 'Suspicious credential intake portal',
    organizationId: orgId,
  });

  assert(Boolean(threatReport.id), 'Test 26.1: Threat incident report generated');
  assert(threatReport.brand === 'Apple', 'Test 26.2: Report scoped to Apple');
  assert((threatReport as any).reportedUrl === 'https://apple-security-verify.com', 'Test 26.3: Candidate URL captured');
  assert((threatReport as any).riskScore === 92, 'Test 26.4: Risk score captured');

  // Verify report retrieved via getReports
  const appleReports = await getReports('apple', 'Apple');
  assert(
    appleReports.some((r) => r.id === threatReport.id),
    'Test 26.5: Generated report appears in Apple brand reports list'
  );

  // Duplicate submission check
  const duplicateReport = await createThreatReport({
    brandId: 'apple',
    brandName: 'Apple',
    threatId: 'threat-apple-phish',
    reportedUrl: 'https://apple-security-verify.com',
    riskScore: 92,
    organizationId: orgId,
  });
  assert(threatReport.id === duplicateReport.id, 'Test 26.6: Re-submitting report for same threat returns existing report record without duplicating');

  // ---------------------------------------------------------------------------
  // Test 27: Brand-Specific Scan Pipeline & Real Brand UUID Isolation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 27: Brand-Specific Scan Pipeline & Real Brand UUID Isolation ---');

  // Test 27.1: Missing brandId rejects scan
  let brandRequiredThrown = false;
  try {
    await scanService.startScan('', 'FULL', 'usr-sanjay-analyst', orgId);
  } catch (err: any) {
    brandRequiredThrown = err.message.includes('BRAND_REQUIRED');
  }
  assert(brandRequiredThrown, 'Test 27.1: Missing brandId strictly rejects scan with BRAND_REQUIRED error');

  // Test 27.2: Attempt to scan deleted brand strictly rejects with INVALID_BRAND (Part 67)
  let deletedBrandRejected = false;
  try {
    await scanService.startScan(confirmedSony.id, 'FULL', 'usr-sanjay-analyst', orgId);
  } catch (err: any) {
    deletedBrandRejected = err.message.includes('INVALID_BRAND');
  }
  assert(deletedBrandRejected, 'Test 27.2: Deleted brand strictly rejects scan with INVALID_BRAND error');

  // Test 27.3: Scan Apple creates scan with Apple brandId
  const appleScan = await scanService.startScan('apple', 'FULL', 'usr-sanjay-analyst', orgId);
  assert(Boolean(appleScan.id), 'Test 27.3: Brand scan created for Apple');
  assert(appleScan.brandName === 'Apple', 'Test 27.4: Scan record brandName is strictly Apple');
  assert(appleScan.organizationId === orgId, 'Test 27.5: Scan record scoped to authorized organization');

  // Test 27.4: Scan Nike creates scan with Nike brandId
  const nikeScan = await scanService.startScan('nike', 'APPS', 'usr-sanjay-analyst', orgId);
  assert(Boolean(nikeScan.id), 'Test 27.6: Brand scan created for Nike');
  assert(nikeScan.brandId === 'nike', 'Test 27.7: Nike scan record brandId matches Nike UUID');
  assert(nikeScan.brandName === 'Nike', 'Test 27.8: Nike scan target is strictly Nike');

  // Test 27.5: Scan history isolation (getScansByBrand)
  const appleScans = scanService.getScansByBrand('apple', orgId);
  const nikeScans = scanService.getScansByBrand('nike', orgId);

  assert(
    appleScans.some((s) => s.id === appleScan.id),
    'Test 27.9: Apple scan appears in Apple scan history'
  );
  assert(
    !appleScans.some((s) => s.id === nikeScan.id || s.brandName === 'Nike'),
    'Test 27.10: Apple scan history NEVER contains Nike scans'
  );
  assert(
    nikeScans.some((s) => s.id === nikeScan.id),
    'Test 27.11: Nike scan appears in Nike scan history'
  );
  assert(
    !nikeScans.some((s) => s.id === appleScan.id || s.brandName === 'Apple'),
    'Test 27.12: Nike scan history NEVER contains Apple scans'
  );

  console.log('\n============================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
