import { NextRequest, NextResponse } from 'next/server';
import { brandDiscoveryService } from '@/services/brand-discovery.service';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { authorizeApiRequest } from '@/lib/security/api-auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check per IP / Organization
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateCheck = checkRateLimit(`brand-discovery:${ip}`, 20, 60000); // 20 discoveries per min

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many brand discovery requests. Please wait before retrying.',
          },
        },
        { status: 429 }
      );
    }

    // 2. Authenticate and enforce RBAC
    const auth = await authorizeApiRequest('brands:manage');
    if (auth.response) return auth.response;

    const body = await req.json();
    const { query, refresh = false } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'A brand name query is required.',
          },
        },
        { status: 400 }
      );
    }

    const orgId = auth.user.organizationId!;
    const discoveryResult = await brandDiscoveryService.discoverBrand(
      query,
      orgId,
      auth.user.id,
      Boolean(refresh)
    );

    return NextResponse.json({
      success: true,
      discoveryRunId: discoveryResult.discoveryRunId,
      brand: {
        name: discoveryResult.brand.name,
        legalName: discoveryResult.brand.legalName,
        category: discoveryResult.brand.category,
        description: discoveryResult.brand.description,
        logoUrl: discoveryResult.brand.logoUrl,
        confidence: discoveryResult.brand.confidence,
        status: discoveryResult.brand.verificationStatus,
      },
      officialWebsite: {
        url: discoveryResult.officialWebsite.url,
        domain: discoveryResult.officialWebsite.domain,
        confidence: discoveryResult.officialWebsite.confidence,
        status: discoveryResult.officialWebsite.verificationStatus,
        evidence: discoveryResult.officialWebsite.evidence,
      },
      apps: discoveryResult.apps.map((a) => ({
        id: a.id,
        name: a.name,
        platform: a.platform,
        developer: a.developer,
        packageId: a.packageId,
        bundleId: a.bundleId,
        storeUrl: a.storeUrl,
        icon: a.icon,
        confidence: a.confidence,
        status: a.verificationStatus,
        evidence: a.evidence,
      })),
      socialAccounts: discoveryResult.socialAccounts.map((s) => ({
        id: s.id,
        platform: s.platform,
        username: s.username,
        profileUrl: s.profileUrl,
        displayName: s.displayName,
        confidence: s.confidence,
        status: s.verificationStatus,
        evidence: s.evidence,
      })),
      evidence: discoveryResult.evidence.map((e) => ({
        type: e.type,
        source: e.source,
        description: e.description,
        confidence: e.confidence,
        priorityLevel: e.priorityLevel,
      })),
      confidenceScore: discoveryResult.confidenceScore,
      verificationStatus: discoveryResult.verificationStatus,
      confidenceBreakdown: discoveryResult.confidenceBreakdown,
      warnings: discoveryResult.warnings,
      cached: discoveryResult.cached,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DISCOVERY_ERROR',
          message: err.message || 'An error occurred during brand discovery.',
        },
      },
      { status: 500 }
    );
  }
}
