import { NextRequest, NextResponse } from 'next/server';
import { urlVerificationService } from '@/services/url-verification.service';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { SecurityUrlError } from '@/lib/security/url-security';

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest('url:verify');
    if (auth.response) return auth.response;
    // 1. Rate limiting check (30 requests/minute per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateCheck = checkRateLimit(`verify-url:${ip}`, 30, 60000);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many verification requests. Please wait a minute before retrying.',
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Check if this is an escalation to Threat
    if (body.action === 'CREATE_THREAT') {
      if (!body.verificationId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_VERIFICATION_ID',
              message: 'verificationId is required to escalate to threat.',
            },
          },
          { status: 400 }
        );
      }

      const threatResult = await urlVerificationService.createThreatFromVerification(
        body.verificationId,
        body.customTitle,
        auth.user.organizationId
      );

      return NextResponse.json({
        success: true,
        data: threatResult,
      });
    }

    const { url, brandId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'A valid URL string is required.',
          },
        },
        { status: 400 }
      );
    }

    // 2. Perform verification
    const result = await urlVerificationService.verifyUrl(url, brandId, auth.user.organizationId, auth.user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const status = err instanceof SecurityUrlError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err instanceof SecurityUrlError ? err.code : 'INTERNAL_SERVER_ERROR',
          message: err instanceof SecurityUrlError ? err.message : 'An unexpected security engine error occurred during verification.',
        },
      },
      { status }
    );
  }
}

export async function GET() {
  const auth = await authorizeApiRequest('url:verify');
  if (auth.response) return auth.response;
  const recent = urlVerificationService.getRecentVerifications(auth.user.organizationId);
  return NextResponse.json({
    success: true,
    data: recent,
  });
}
