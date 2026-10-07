import { VerificationStatus } from '@/types/verification';
import { SourcePriorityLevel, ConfidenceSignalBreakdown } from '@/types/brand-discovery';

export interface ConfidenceEvaluationInputs {
  brandName: string;
  hasOfficialDomainMatch: boolean;
  hasOfficialWebsiteEvidence: boolean;
  hasOrganizationVerification: boolean;
  hasOfficialAppRelationship: boolean;
  hasOfficialSocialLink: boolean;
  hasCompanyRegistryMatch: boolean;
  hasTrademarkEvidence: boolean;
  brandNameSimilarityScore: number; // 0 to 1
  sourcePriority: SourcePriorityLevel;
  isThirdPartyOrAggregator?: boolean;
}

export interface BrandConfidenceResult {
  confidenceScore: number;
  verificationStatus: VerificationStatus;
  signals: ConfidenceSignalBreakdown[];
  reason: string;
}

/**
 * Calculates identity confidence using independent weighted signals.
 * Follows source priority hierarchy (LEVEL 1 to LEVEL 4).
 */
export function calculateBrandConfidence(inputs: ConfidenceEvaluationInputs): BrandConfidenceResult {
  const {
    hasOfficialDomainMatch,
    hasOfficialWebsiteEvidence,
    hasOrganizationVerification,
    hasOfficialAppRelationship,
    hasOfficialSocialLink,
    hasCompanyRegistryMatch,
    hasTrademarkEvidence,
    brandNameSimilarityScore,
    sourcePriority,
    isThirdPartyOrAggregator,
  } = inputs;

  const signals: ConfidenceSignalBreakdown[] = [];
  let score = 0;

  // 1. Official domain match (+25)
  const domainScore = hasOfficialDomainMatch ? 25 : 0;
  score += domainScore;
  signals.push({
    signal: 'OFFICIAL_DOMAIN_MATCH',
    score: domainScore,
    maxScore: 25,
    description: hasOfficialDomainMatch
      ? 'Exact or canonical domain matches brand namespace'
      : 'No verified official domain match',
    passed: hasOfficialDomainMatch,
  });

  // 2. Official website evidence (+20)
  const websiteScore = hasOfficialWebsiteEvidence ? 20 : 0;
  score += websiteScore;
  signals.push({
    signal: 'WEBSITE_EVIDENCE',
    score: websiteScore,
    maxScore: 20,
    description: hasOfficialWebsiteEvidence
      ? 'Valid TLS/SSL, rich metadata, and verified corporate digital footprint'
      : 'Insufficient website verification evidence',
    passed: hasOfficialWebsiteEvidence,
  });

  // 3. Organization verification (+20)
  const orgScore = hasOrganizationVerification ? 20 : 0;
  score += orgScore;
  signals.push({
    signal: 'ORGANIZATION_VERIFICATION',
    score: orgScore,
    maxScore: 20,
    description: hasOrganizationVerification
      ? 'Verified organization corporate identity and ownership anchor'
      : 'Unverified organization entity',
    passed: hasOrganizationVerification,
  });

  // 4. Official app relationship (+10)
  const appScore = hasOfficialAppRelationship ? 10 : 0;
  score += appScore;
  signals.push({
    signal: 'APP_STORE_RELATIONSHIP',
    score: appScore,
    maxScore: 10,
    description: hasOfficialAppRelationship
      ? 'Official developer publisher credentials on certified app stores'
      : 'No verified official app relationship',
    passed: hasOfficialAppRelationship,
  });

  // 5. Official social link (+10)
  const socialScore = hasOfficialSocialLink ? 10 : 0;
  score += socialScore;
  signals.push({
    signal: 'OFFICIAL_SOCIAL_OUTBOUND',
    score: socialScore,
    maxScore: 10,
    description: hasOfficialSocialLink
      ? 'Official outbound social links verified on root homepage'
      : 'No verified outbound social profiles',
    passed: hasOfficialSocialLink,
  });

  // 6. Company registry match (+5)
  const registryScore = hasCompanyRegistryMatch ? 5 : 0;
  score += registryScore;
  signals.push({
    signal: 'COMPANY_REGISTRY',
    score: registryScore,
    maxScore: 5,
    description: hasCompanyRegistryMatch
      ? 'Matched legal corporation in public corporate registrar'
      : 'No corporate registry match found',
    passed: hasCompanyRegistryMatch,
  });

  // 7. Trademark evidence (+5)
  const tmScore = hasTrademarkEvidence ? 5 : 0;
  score += tmScore;
  signals.push({
    signal: 'TRADEMARK_REGISTRATION',
    score: tmScore,
    maxScore: 5,
    description: hasTrademarkEvidence
      ? 'Active trademark registration verified with patent office records'
      : 'No trademark records attached',
    passed: hasTrademarkEvidence,
  });

  // 8. Brand name similarity (+5)
  const nameScore = Math.min(5, Math.round(brandNameSimilarityScore * 5));
  score += nameScore;
  signals.push({
    signal: 'BRAND_NAME_SIMILARITY',
    score: nameScore,
    maxScore: 5,
    description: `Brand name lexical congruence (${Math.round(brandNameSimilarityScore * 100)}%)`,
    passed: brandNameSimilarityScore >= 0.7,
  });

  // Clamp score between 0 and 100
  let finalScore = Math.min(100, Math.max(0, score));

  // SOURCE PRIORITY CONSTRAINT (Level 3 or 4 alone can never mark VERIFIED_OFFICIAL)
  if (sourcePriority === 'LEVEL_3' || sourcePriority === 'LEVEL_4') {
    if (finalScore >= 90) {
      finalScore = 85; // Capped at LIKELY_OFFICIAL or UNVERIFIED
    }
  }

  // False positive downgrade for news/wikipedia/fan aggregators
  if (isThirdPartyOrAggregator && finalScore > 40) {
    finalScore = 35;
  }

  // Classification mapping
  let verificationStatus: VerificationStatus = 'UNVERIFIED';
  if (finalScore >= 90) {
    verificationStatus = 'VERIFIED_OFFICIAL';
  } else if (finalScore >= 75) {
    verificationStatus = 'LIKELY_OFFICIAL';
  } else if (finalScore >= 40) {
    verificationStatus = 'UNVERIFIED';
  } else {
    verificationStatus = 'SUSPICIOUS';
  }

  return {
    confidenceScore: finalScore,
    verificationStatus,
    signals,
    reason: `Confidence computed at ${finalScore}% with status ${verificationStatus} across ${signals.filter((s) => s.passed).length} passing signals.`,
  };
}

/**
 * Checks if a candidate or URL is a non-impersonating informational source
 * (Wikipedia, News, Stock ticker, Fan site, Review aggregator) to prevent false-positive threats.
 */
export function isInformationalOrThirdPartySource(urlOrName: string): boolean {
  const lower = urlOrName.toLowerCase();
  const informationalPatterns = [
    'wikipedia.org',
    'wikimedia.org',
    'wikidata.org',
    'bloomberg.com',
    'reuters.com',
    'finance.yahoo.com',
    'investing.com',
    'marketwatch.com',
    'seekingalpha.com',
    'sec.gov',
    'forbes.com',
    'cnbc.com',
    'techcrunch.com',
    'wsj.com',
    'nytimes.com',
    'trustpilot.com',
    'glassdoor.com',
    'g2.com',
    'capterra.com',
    'reddit.com',
    'fandom.com',
    'wikia.com',
    'fanclub',
    'fanpage',
    'stock',
    'nasdaq.com',
    'nyse.com',
  ];

  return informationalPatterns.some((pattern) => lower.includes(pattern));
}
