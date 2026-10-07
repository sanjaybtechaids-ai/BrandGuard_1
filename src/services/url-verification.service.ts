import {
  sanitizeAndValidateUrl,
  fetchSafePublicMetadata,
  SecurityUrlError,
} from '@/lib/security/url-security';
import { normalizeUrlToDomain } from '@/lib/risk/normalization';
import { evaluateUrlRisk } from '@/lib/risk/risk-engine';
import { brandResolverService } from './brand-resolver.service';
import { UrlVerificationResult, VerificationStatus, SafeMetadata } from '@/types/verification';
import { recordAuditLog } from '@/lib/security/audit';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createThreat } from '@/services/threats.service';
import { Threat } from '@/types/threat';
import { threats } from '@/data/threats';
import { alertsList } from '@/data/alerts';

// In-memory verification storage for instantaneous retrieval and demo resilience
export const verificationHistory: UrlVerificationResult[] = [];
const verificationOrganizations = new Map<string, string>();

export class UrlVerificationService {
  /**
   * Primary verification entry point.
   */
  async verifyUrl(
    rawUrl: string,
    brandId?: string,
    organizationId: string = 'a0000000-0000-0000-0000-000000000001',
    userId: string = 'usr-sanjay-analyst'
  ): Promise<UrlVerificationResult> {
    const startTime = Date.now();

    // 1. Validate URL & check SSRF constraints
    let sanitized: { parsed: URL; normalized: string };
    try {
      sanitized = sanitizeAndValidateUrl(rawUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid URL';
      const invalidResult: UrlVerificationResult = {
        id: `verif-err-${Date.now()}`,
        url: rawUrl,
        normalizedUrl: rawUrl,
        hostname: '',
        rootDomain: '',
        status: 'INVALID',
        riskScore: 100,
        confidenceScore: 0,
        metadata: {},
        evidence: [
          {
            signalType: 'URL_VALIDATION_ERROR',
            description: message,
            status: 'failed',
          },
        ],
        signals: [],
        explanation: `Analysis halted: ${message}`,
        recommendedAction: 'RETRY',
        createdAt: new Date().toISOString(),
      };
      verificationHistory.unshift(invalidResult);
      return invalidResult;
    }

    const { normalizedUrl, hostname, rootDomain } = normalizeUrlToDomain(sanitized.normalized);

    // 2. Resolve brand and trusted domains
    const resolved = await brandResolverService.resolveBrandFromUrl(normalizedUrl, brandId, organizationId);

    // 3. Fetch safe public metadata (SSRF-protected)
    let metadata: SafeMetadata = {};
    try {
      metadata = await fetchSafePublicMetadata(normalizedUrl);
    } catch (err: unknown) {
      // A failed public-network probe is not evidence about a website. Preserve
      // the verification result but never manufacture page metadata.
      metadata = {
        finalUrl: normalizedUrl,
        httpStatus: 0,
        sslValid: normalizedUrl.startsWith('https://'),
      };
    }

    // 4. Run deterministic risk engine
    const { status, riskScore, confidenceScore, evaluation } = evaluateUrlRisk({
      submittedUrl: rawUrl,
      normalizedUrl,
      hostname,
      rootDomain,
      brandName: resolved.brandName,
      officialDomain: resolved.officialDomain,
      trustedDomains: resolved.trustedDomains,
      metadata,
    });

    // 5. Build final result
    let recommendedAction: UrlVerificationResult['recommendedAction'] = 'INVESTIGATE';
    if (status === 'VERIFIED_OFFICIAL') recommendedAction = 'TRUST';
    else if (status === 'LIKELY_OFFICIAL') recommendedAction = 'VERIFY_DOMAIN';
    else if (status === 'SUSPICIOUS') recommendedAction = 'CREATE_THREAT';

    const result: UrlVerificationResult = {
      id: `verif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: rawUrl,
      normalizedUrl,
      hostname,
      rootDomain,
      brand: resolved.brandName,
      brandId: resolved.brandId,
      status,
      riskScore,
      confidenceScore,
      metadata,
      evidence: evaluation.evidence,
      signals: evaluation.signals,
      explanation: evaluation.explanation,
      recommendedAction,
      threatCreated: false,
      createdAt: new Date().toISOString(),
    };

    // Store in memory history
    verificationHistory.unshift(result);
    if (verificationHistory.length > 50) verificationHistory.pop();
    if (result.id) verificationOrganizations.set(result.id, organizationId);

    // 6. Record Audit Log
    await recordAuditLog({
      organizationId,
      userId,
      action: 'URL_VERIFIED',
      entityType: 'URL_VERIFICATION',
      entityId: result.id,
      metadata: {
        url: normalizedUrl,
        hostname,
        brand: resolved.brandName,
        status,
        riskScore,
        durationMs: Date.now() - startTime,
      },
    });

    // 7. Persist to Supabase if live database is active
    if (isSupabaseConfigured()) {
      const supabase = await createServerClient();
      const { error } = await supabase.from('url_verifications').insert({
          organization_id: organizationId,
          brand_id: resolved.brandId || null,
          submitted_url: rawUrl,
          normalized_url: normalizedUrl,
          hostname,
          root_domain: rootDomain,
          verification_status: status,
          risk_score: riskScore,
          confidence_score: confidenceScore,
          title: metadata.title || null,
          description: metadata.description || null,
          favicon_url: metadata.favicon || null,
          final_url: metadata.finalUrl || null,
          http_status: metadata.httpStatus || null,
          ssl_valid: metadata.sslValid ?? true,
          domain_match: status === 'VERIFIED_OFFICIAL',
          trusted_domain_match: status === 'VERIFIED_OFFICIAL',
          brand_name_similarity: evaluation.breakdown.brandNameSimilarityScore,
          description_similarity: evaluation.breakdown.metadataSimilarityScore,
          evidence: evaluation.evidence,
          created_by: userId.includes('usr-') ? null : userId,
      });
      if (error) throw new Error(`Unable to record URL verification: ${error.message}`);
    }

    return result;
  }

  /**
   * Converts a suspicious verification result into a monitored Threat incident.
   */
  async createThreatFromVerification(
    verificationId: string,
    customTitle?: string,
    organizationId: string = 'a0000000-0000-0000-0000-000000000001'
  ): Promise<{ success: boolean; threat: Threat }> {
    const item = verificationHistory.find((v) => v.id === verificationId);
    if (!item) {
      throw new Error(`Verification record with ID "${verificationId}" was not found.`);
    }
    if (verificationOrganizations.get(verificationId) && verificationOrganizations.get(verificationId) !== organizationId) {
      throw new Error('The verification record is outside the active organization.');
    }

    const threatId = `threat-custom-${Date.now()}`;
    const newThreat: Threat = {
      id: threatId,
      brandId: item.brandId || 'nike',
      brandName: item.brand || 'Nike',
      name: customTitle || `Suspected Impersonation: ${item.rootDomain}`,
      candidateName: item.metadata.title || `${item.brand} Portal (${item.rootDomain})`,
      candidateDeveloper: 'Unregistered Offshore Entity',
      candidateWebsite: item.normalizedUrl,
      candidateLogo: item.metadata.favicon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=96&auto=format&fit=crop&q=80',
      officialLogo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=96&auto=format&fit=crop&q=80',
      officialName: `${item.brand}, Inc. Official`,
      officialDeveloper: `${item.brand}, Inc.`,
      officialWebsite: `https://${item.brand?.toLowerCase() || 'nike'}.com`,
      platform: 'Web APK',
      url: item.normalizedUrl,
      riskScore: item.riskScore,
      riskLevel: item.riskScore >= 80 ? 'Critical' : item.riskScore >= 60 ? 'High' : 'Medium',
      status: 'New',
      nameSimilarity: 92,
      logoSimilarity: 88,
      descriptionSimilarity: 75,
      developerMatch: false,
      domainMatch: false,
      packageMatch: false,
      detectedAt: 'Just now (URL Verification)',
      type: 'FAKE_WEBSITE',
      aiExplanation: item.explanation || 'Created from automated BrandGuard URL Verification inspection.',
      impersonationTactics: [
        'Domain Typosquatting / Lookalike',
        'Unauthorized Brand Asset Reproduction',
        'Unverified Web Endpoint',
      ],
      recommendedActions: [
        'Initiate registrar takedown notice (ICANN UDRP)',
        'Add domain to corporate endpoint blocklist',
        'Issue brand security advisory to customers',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persistedThreat = isSupabaseConfigured()
      ? await createThreat({ ...newThreat, organizationId })
      : newThreat;

    if (!isSupabaseConfigured()) {
      threats.unshift(newThreat);
    }

    // Create an alert item so SOC analyst sees the notification
    if (!isSupabaseConfigured()) {
      alertsList.unshift({
        id: `alt-${Date.now()}`,
        title: `New Incident Created: ${newThreat.name}`,
        description: `Risk score ${newThreat.riskScore}/100 detected on ${item.rootDomain}. Investigating.`,
        severity: newThreat.riskLevel,
        timestamp: 'Just now',
        read: false,
        targetUrl: item.normalizedUrl,
        brandName: item.brand || 'Nike',
        threatId,
      });
    }

    item.threatCreated = true;
    item.threatId = threatId;

    // Audit log
    await recordAuditLog({
      organizationId,
      action: 'THREAT_CREATED',
      entityType: 'THREAT',
      entityId: threatId,
      metadata: {
        sourceVerificationId: verificationId,
        url: item.normalizedUrl,
        riskScore: item.riskScore,
      },
    });

    return { success: true, threat: persistedThreat };
  }

  getRecentVerifications(organizationId?: string): UrlVerificationResult[] {
    return organizationId
      ? verificationHistory.filter((item) => item.id && verificationOrganizations.get(item.id) === organizationId)
      : [...verificationHistory];
  }
}

export const urlVerificationService = new UrlVerificationService();
