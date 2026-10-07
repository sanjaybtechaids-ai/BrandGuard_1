import { NextRequest, NextResponse } from 'next/server';
import {
  generateDomainVerificationChallenge,
  verifyBrandDomain,
} from '@/services/brands.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeApiRequest('brands:manage');
  if (auth.response) return auth.response;
  const body = await req.json();
  const { domain, action = 'check', method = 'DNS_TXT' } = body;

  if (!domain) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_DOMAIN', message: 'Domain is required.' } },
      { status: 400 }
    );
  }

  if (action === 'challenge') {
    const challenge = await generateDomainVerificationChallenge(id, domain, method);
    return NextResponse.json({
      success: true,
      data: challenge,
    });
  }

  const result = await verifyBrandDomain(id, domain, method);
  return NextResponse.json({
    success: true,
    data: result,
  });
}
