import { canonicalizeLookalikeText, normalizeBrandName } from './normalization';

export const SUSPICIOUS_KEYWORDS = [
  'support',
  'help',
  'desk',
  'service',
  'customer',
  'login',
  'signin',
  'auth',
  'portal',
  'verify',
  'verification',
  'account',
  'security',
  'recover',
  'reset',
  'password',
  'shop',
  'store',
  'outlet',
  'sale',
  'deals',
  'discount',
  'clearance',
  'official',
  'direct',
  'vip',
  'claim',
  'reward',
  'bonus',
  'free',
  'airdrop',
  'promo',
  'rewards',
];

/**
 * Standard Levenshtein distance algorithm.
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Normalized string similarity score between 0.0 and 1.0 (1.0 = identical).
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - distance / maxLen);
}

export interface LookalikeAnalysis {
  isLookalike: boolean;
  hasHomoglyph: boolean;
  detectedKeywords: string[];
  brandSubstringMatch: boolean;
  similarityRatio: number; // 0 - 100
  reasons: string[];
}

/**
 * Analyzes whether a candidate domain or hostname is attempting to impersonate a brand.
 */
export function analyzeLookalikeDomain(
  hostname: string,
  rootDomain: string,
  brandName: string,
  officialDomain: string
): LookalikeAnalysis {
  const normBrand = normalizeBrandName(brandName);
  const hostLower = hostname.toLowerCase();
  const domainLower = rootDomain.toLowerCase();
  const reasons: string[] = [];
  const detectedKeywords: string[] = [];

  // If domain is an exact match to the official domain, it's not a lookalike
  if (domainLower === officialDomain.toLowerCase()) {
    return {
      isLookalike: false,
      hasHomoglyph: false,
      detectedKeywords: [],
      brandSubstringMatch: true,
      similarityRatio: 100,
      reasons: ['Domain matches official brand domain exactly.'],
    };
  }

  // 1. Check brand name presence in hostname or rootDomain
  const domainLabel = domainLower.split('.')[0]; // e.g. "nike-support" in "nike-support.com"
  const brandInDomain = domainLabel.includes(normBrand);
  const brandInHost = hostLower.includes(normBrand);

  if (brandInDomain || brandInHost) {
    reasons.push(`Brand name "${brandName}" appears directly in hostname (${hostname}).`);
  }

  // 2. Homoglyph / Leetspeak character substitution check
  const canonicalDomainLabel = canonicalizeLookalikeText(domainLabel);
  const canonicalBrand = canonicalizeLookalikeText(normBrand);
  const hasHomoglyph =
    !brandInDomain &&
    canonicalDomainLabel.includes(canonicalBrand) &&
    domainLabel !== normBrand;

  if (hasHomoglyph) {
    reasons.push('Character substitution detected (e.g. number/symbol replacing letter).');
  }

  // 3. Suspicious keyword detection in domain or subdomain
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (domainLabel.includes(kw) || hostLower.includes(kw)) {
      detectedKeywords.push(kw);
    }
  }

  if (detectedKeywords.length > 0) {
    reasons.push(`Additional high-risk keyword(s) detected: ${detectedKeywords.slice(0, 3).join(', ')}.`);
  }

  // 4. Lexical similarity between official domain and candidate domain label
  const officialLabel = officialDomain.split('.')[0];
  const similarity = calculateStringSimilarity(domainLabel, officialLabel);
  const similarityRatio = Math.round(similarity * 100);

  if (similarityRatio >= 75 && similarityRatio < 100) {
    reasons.push(`High lexical domain similarity (${similarityRatio}%) to official domain.`);
  }

  const isLookalike =
    (brandInDomain || brandInHost || hasHomoglyph || similarityRatio >= 75) &&
    domainLower !== officialDomain.toLowerCase();

  return {
    isLookalike,
    hasHomoglyph,
    detectedKeywords,
    brandSubstringMatch: brandInDomain || brandInHost,
    similarityRatio,
    reasons,
  };
}
