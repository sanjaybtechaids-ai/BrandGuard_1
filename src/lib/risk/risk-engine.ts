import { VerificationStatus, SafeMetadata } from '@/types/verification';
import { RiskBreakdown, RiskEvaluationResult, RiskLevel } from '@/types/risk';
import { analyzeLookalikeDomain, calculateStringSimilarity } from './similarity';
import { buildVerificationEvidence } from './evidence';
import { normalizeBrandName, extractRootDomain } from './normalization';

export interface EvaluateRiskParams {
  submittedUrl: string;
  normalizedUrl: string;
  hostname: string;
  rootDomain: string;
  brandName?: string;
  officialDomain?: string;
  trustedDomains?: string[];
  metadata: SafeMetadata;
}

export function evaluateUrlRisk(params: EvaluateRiskParams): {
  status: VerificationStatus;
  riskScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  breakdown: RiskBreakdown;
  evaluation: RiskEvaluationResult;
} {
  const {
    submittedUrl,
    normalizedUrl,
    hostname,
    rootDomain,
    brandName = 'Brand',
    officialDomain = '',
    trustedDomains = [],
    metadata,
  } = params;

  // 1. Trusted Domain Match checks
  const trustedDomainSet = new Set(trustedDomains.map((d) => d.toLowerCase()));
  if (officialDomain) {
    trustedDomainSet.add(officialDomain.toLowerCase());
  }

  const isTrustedDomainMatch =
    trustedDomainSet.has(rootDomain.toLowerCase()) ||
    trustedDomainSet.has(hostname.toLowerCase());

  const officialRoot = officialDomain ? extractRootDomain(officialDomain) : '';
  const isRootDomainMatch =
    Boolean(officialRoot) &&
    rootDomain.toLowerCase() === officialRoot.toLowerCase();

  // 2. Lookalike domain analysis
  const lookalike = analyzeLookalikeDomain(
    hostname,
    rootDomain,
    brandName,
    officialDomain || rootDomain
  );

  // 3. Brand name and domain lexical similarities
  const normBrand = normalizeBrandName(brandName);
  const brandSimilarity = lookalike.brandSubstringMatch
    ? 1.0
    : calculateStringSimilarity(rootDomain.split('.')[0], normBrand);

  const redirected = Boolean(
    metadata.finalUrl &&
    extractRootDomain(new URL(metadata.finalUrl).hostname) !== rootDomain
  );

  // 4. Calculate Risk Breakdown according to the 0-100 specification (Section 21)
  let domainSimilarityScore = 0;       // 0 - 25
  let brandNameSimilarityScore = 0;     // 0 - 20
  let trustedDomainMismatchScore = 0;   // 0 - 20
  let officialRelationshipMissingScore = 0; // 0 - 15
  let suspiciousRedirectScore = 0;      // 0 - 10
  let metadataSimilarityScore = 0;      // 0 - 5
  let suspiciousKeywordsScore = 0;      // 0 - 5

  if (!isTrustedDomainMatch && !isRootDomainMatch) {
    // Domain similarity risk (Lookalike domains score higher risk)
    if (lookalike.isLookalike) {
      const effectiveRatio = lookalike.brandSubstringMatch
        ? Math.max(lookalike.similarityRatio, 65)
        : lookalike.hasHomoglyph
          ? Math.max(lookalike.similarityRatio, 75)
          : lookalike.similarityRatio;
      domainSimilarityScore = Math.min(25, Math.round((effectiveRatio / 100) * 25));
    }

    // Brand name similarity risk
    if (brandSimilarity > 0.6) {
      brandNameSimilarityScore = Math.min(20, Math.round(brandSimilarity * 20));
    }

    // Trusted domain mismatch penalty
    trustedDomainMismatchScore = 20;

    // Official relationship missing
    officialRelationshipMissingScore = 15;

    // Suspicious redirect
    if (redirected) {
      suspiciousRedirectScore = 10;
    }

    // Suspicious keywords penalty
    if (lookalike.detectedKeywords.length > 0) {
      suspiciousKeywordsScore = Math.min(5, Math.round(lookalike.detectedKeywords.length * 2.5));
    }

    // Page metadata impersonation
    if (metadata.title && metadata.title.toLowerCase().includes(normBrand)) {
      metadataSimilarityScore = 5;
    }
  }

  const rawTotalRisk =
    domainSimilarityScore +
    brandNameSimilarityScore +
    trustedDomainMismatchScore +
    officialRelationshipMissingScore +
    suspiciousRedirectScore +
    metadataSimilarityScore +
    suspiciousKeywordsScore;

  const totalRiskScore = Math.min(100, Math.max(0, Math.round(rawTotalRisk)));

  // Determine Risk Level
  let riskLevel: RiskLevel = 'LOW';
  if (totalRiskScore >= 81) riskLevel = 'CRITICAL';
  else if (totalRiskScore >= 61) riskLevel = 'HIGH';
  else if (totalRiskScore >= 31) riskLevel = 'MEDIUM';

  // 5. Build structured evidence and signals
  const { evidence, signals } = buildVerificationEvidence({
    trustedDomainMatch: isTrustedDomainMatch,
    rootDomainMatch: isRootDomainMatch,
    domainName: rootDomain,
    brandName,
    lookalike,
    metadata,
    redirected,
  });

  // 6. Apply Trust Model Rules (Section 3 & Section 29)
  let status: VerificationStatus;
  let confidenceScore = 85;
  let explanation = '';

  const isSelfOrGeneric =
    !brandName ||
    brandName === 'Brand' ||
    normalizeBrandName(brandName) === normalizeBrandName(rootDomain.split('.')[0]);

  if (isTrustedDomainMatch) {
    status = 'VERIFIED_OFFICIAL';
    confidenceScore = 98;
    explanation = `Verified official domain for ${brandName}. Matches cryptographic or organization-verified profile.`;
  } else if (isRootDomainMatch) {
    status = 'LIKELY_OFFICIAL';
    confidenceScore = 82;
    explanation = `Host belongs to root domain "${officialRoot}". Appears official but domain claim has not yet undergone DNS/Meta tag verification.`;
  } else if (
    !isSelfOrGeneric &&
    lookalike.isLookalike &&
    (lookalike.detectedKeywords.length > 0 || lookalike.brandSubstringMatch || lookalike.similarityRatio >= 75)
  ) {
    status = 'SUSPICIOUS';
    confidenceScore = 88;
    explanation = `High risk of brand impersonation. Domain "${rootDomain}" uses the "${brandName}" identity without authorization${
      lookalike.detectedKeywords.length > 0 ? ` and contains suspicious keywords (${lookalike.detectedKeywords.join(', ')})` : ''
    }.`;
  } else if (!isSelfOrGeneric && totalRiskScore >= 60) {
    status = 'SUSPICIOUS';
    confidenceScore = 84;
    explanation = `Strong impersonation indicators detected. The domain exhibits high similarity to ${brandName} but is not owned by the organization.`;
  } else {
    status = 'UNVERIFIED';
    confidenceScore = 65;
    explanation = `Domain "${rootDomain}" has no verified connection to organization trusted brands. Relationship is unverified.`;
  }

  const breakdown: RiskBreakdown = {
    domainSimilarityScore,
    brandNameSimilarityScore,
    trustedDomainMismatchScore,
    officialRelationshipMissingScore,
    suspiciousRedirectScore,
    metadataSimilarityScore,
    suspiciousKeywordsScore,
    totalRiskScore: status === 'VERIFIED_OFFICIAL' ? 4 : totalRiskScore,
    confidenceScore,
    riskLevel: status === 'VERIFIED_OFFICIAL' ? 'LOW' : riskLevel,
  };

  const finalRiskScore = status === 'VERIFIED_OFFICIAL' ? 4 : totalRiskScore;

  const evaluation: RiskEvaluationResult = {
    riskScore: finalRiskScore,
    confidenceScore,
    riskLevel: breakdown.riskLevel,
    breakdown,
    evidence,
    signals,
    explanation,
  };

  return {
    status,
    riskScore: finalRiskScore,
    confidenceScore,
    riskLevel: breakdown.riskLevel,
    breakdown,
    evaluation,
  };
}
