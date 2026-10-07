import { NextRequest, NextResponse } from 'next/server';
import { urlVerificationService } from '@/services/url-verification.service';
import { verifyBrandDomain } from '@/services/brands.service';
import { extractRootDomain } from '@/lib/risk/normalization';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { sanitizeAndValidateUrl, SecurityUrlError } from '@/lib/security/url-security';

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest('url:verify');
    if (auth.response) return auth.response;
    const { brandId, url, method } = await req.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_URL', message: 'Target domain or URL is required.' },
        },
        { status: 400 }
      );
    }

    const { normalized } = sanitizeAndValidateUrl(url);
    const domain = extractRootDomain(normalized);

    // If method is provided (e.g. DNS_TXT), complete domain registration verification
    if (brandId && method) {
      await verifyBrandDomain(brandId, domain, method);
    }

    const verification = await urlVerificationService.verifyUrl(normalized, brandId, auth.user.organizationId, auth.user.id);

    return NextResponse.json({
      success: true,
      data: {
        status: verification.status,
        riskScore: verification.riskScore,
        confidenceScore: verification.confidenceScore,
        domain,
        brand: verification.brand,
        evidence: verification.evidence,
        signals: verification.signals,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: { code: err instanceof SecurityUrlError ? err.code : 'VERIFICATION_ERROR', message: err instanceof SecurityUrlError ? err.message : 'Domain verification failed.' },
      },
      { status: err instanceof SecurityUrlError ? 400 : 500 }
    );
  }
}
