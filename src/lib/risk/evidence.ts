import { VerificationEvidence, VerificationSignal } from '@/types/verification';
import { LookalikeAnalysis } from './similarity';
import { SafeMetadata } from '@/types/verification';

export function buildVerificationEvidence(params: {
  trustedDomainMatch: boolean;
  rootDomainMatch: boolean;
  domainName: string;
  brandName: string;
  lookalike: LookalikeAnalysis;
  metadata: SafeMetadata;
  redirected: boolean;
}): {
  evidence: VerificationEvidence[];
  signals: VerificationSignal[];
} {
  const {
    trustedDomainMatch,
    rootDomainMatch,
    domainName,
    brandName,
    lookalike,
    metadata,
    redirected,
  } = params;

  const evidence: VerificationEvidence[] = [];
  const signals: VerificationSignal[] = [];

  // 1. Trusted domain check
  if (trustedDomainMatch) {
    evidence.push({
      signalType: 'TRUSTED_DOMAIN_MATCH',
      description: 'Domain is explicitly registered and verified in organization trusted domains.',
      status: 'passed',
      value: true,
    });
    signals.push({
      signal: 'TRUSTED_DOMAIN_MATCH',
      result: true,
      description: 'Verified organization domain',
      weight: 1.0,
    });
  } else if (rootDomainMatch) {
    evidence.push({
      signalType: 'ROOT_DOMAIN_MATCH',
      description: `Domain is a valid subdomain under official root domain (${domainName}).`,
      status: 'passed',
      value: true,
    });
    signals.push({
      signal: 'ROOT_DOMAIN_MATCH',
      result: true,
      description: 'Subdomain matches verified brand root',
      weight: 0.9,
    });
  } else {
    evidence.push({
      signalType: 'TRUSTED_DOMAIN_MISMATCH',
      description: `Domain "${domainName}" is not registered in organization trusted domains.`,
      status: 'warning',
      value: false,
    });
    signals.push({
      signal: 'TRUSTED_DOMAIN_MISMATCH',
      result: false,
      description: 'Domain not in trusted list',
      weight: 0.8,
    });
  }

  // 2. Lookalike domain signals
  if (lookalike.isLookalike && !trustedDomainMatch && !rootDomainMatch) {
    for (const reason of lookalike.reasons) {
      evidence.push({
        signalType: 'LOOKALIKE_DOMAIN',
        description: reason,
        status: 'failed',
      });
    }

    signals.push({
      signal: 'LOOKALIKE_DOMAIN',
      result: lookalike.similarityRatio,
      description: `Lookalike domain indicator (${lookalike.similarityRatio}% similarity)`,
      weight: 1.0,
    });
  }

  // 3. Character substitution / homoglyph
  if (lookalike.hasHomoglyph) {
    evidence.push({
      signalType: 'HOMOGLYPH_SUBSTITUTION',
      description: 'Character substitution detected (e.g. number/symbol substituting a letter).',
      status: 'failed',
    });
  }

  // 4. Suspicious keywords
  if (lookalike.detectedKeywords.length > 0 && !trustedDomainMatch) {
    evidence.push({
      signalType: 'SUSPICIOUS_KEYWORD',
      description: `Suspicious high-risk keyword(s) present: ${lookalike.detectedKeywords.join(', ')}.`,
      status: 'failed',
      value: lookalike.detectedKeywords.join(', '),
    });
    signals.push({
      signal: 'SUSPICIOUS_KEYWORD',
      result: true,
      description: 'Suspicious keywords detected',
      weight: 0.9,
    });
  }

  // 5. Page metadata analysis
  if (metadata.title) {
    const titleLower = metadata.title.toLowerCase();
    const brandLower = brandName.toLowerCase();
    const mentionsBrand = titleLower.includes(brandLower);

    if (mentionsBrand && !trustedDomainMatch && !rootDomainMatch) {
      evidence.push({
        signalType: 'PAGE_TITLE_IMPERSONATION',
        description: `External page title claims to represent "${brandName}" ("${metadata.title}").`,
        status: 'failed',
        value: metadata.title,
      });
      signals.push({
        signal: 'PAGE_TITLE_IMPERSONATION',
        result: true,
        description: 'Page title claims brand identity without verified domain',
        weight: 0.85,
      });
    } else if (mentionsBrand && (trustedDomainMatch || rootDomainMatch)) {
      evidence.push({
        signalType: 'OFFICIAL_TITLE_MATCH',
        description: `Page title accurately matches official brand profile: "${metadata.title}".`,
        status: 'passed',
        value: metadata.title,
      });
    }
  }

  // 6. Suspicious redirect
  if (redirected) {
    evidence.push({
      signalType: 'SUSPICIOUS_REDIRECT',
      description: `URL redirects to a different target: ${metadata.finalUrl}`,
      status: 'warning',
      value: metadata.finalUrl,
    });
  }

  // 7. Reachability & SSL
  if (metadata.httpStatus && metadata.httpStatus >= 200 && metadata.httpStatus < 400) {
    evidence.push({
      signalType: 'WEBSITE_REACHABLE',
      description: `Website is active and reachable (HTTP ${metadata.httpStatus}).`,
      status: 'neutral',
      value: metadata.httpStatus,
    });
  }

  return { evidence, signals };
}
