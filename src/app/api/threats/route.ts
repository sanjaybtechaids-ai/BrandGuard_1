import { NextRequest, NextResponse } from 'next/server';
import { getThreats, createThreat, filterThreats } from '@/services/threats.service';
import { authorizeApiRequest, unavailableResponse } from '@/lib/security/api-auth';

export async function GET(req: NextRequest) {
  const auth = await authorizeApiRequest('threats:view');
  if (auth.response) return auth.response;
  const url = new URL(req.url);
  const brand = url.searchParams.get('brand') || undefined;
  const platform = url.searchParams.get('platform') || undefined;
  const riskLevel = url.searchParams.get('riskLevel') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const search = url.searchParams.get('search') || undefined;

  if (brand || platform || riskLevel || status || search) {
    try {
      const filtered = await filterThreats({ brand, platform, riskLevel, status, search }, auth.user.organizationId);
      return NextResponse.json({ success: true, data: filtered });
    } catch {
      return unavailableResponse();
    }
  }

  try {
    const allThreats = await getThreats(auth.user.organizationId);
    return NextResponse.json({ success: true, data: allThreats });
  } catch {
    return unavailableResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest('threats:investigate');
    if (auth.response) return auth.response;
    const body = await req.json();
    if (!body.brandId) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'brandId is required.' } }, { status: 400 });
    }
    const created = await createThreat({ ...body, organizationId: auth.user.organizationId });
    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { code: 'CREATION_FAILED', message: 'Failed to create threat record.' } },
      { status: 500 }
    );
  }
}
