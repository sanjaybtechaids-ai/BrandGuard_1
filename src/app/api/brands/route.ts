import { NextRequest, NextResponse } from 'next/server';
import { getBrands, createBrand } from '@/services/brands.service';
import { authorizeApiRequest, unavailableResponse } from '@/lib/security/api-auth';
import { sanitizeAndValidateUrl } from '@/lib/security/url-security';

export async function GET() {
  const auth = await authorizeApiRequest('brands:view');
  if (auth.response) return auth.response;
  try {
    const allBrands = await getBrands(auth.user.organizationId);
    return NextResponse.json({ success: true, data: allBrands });
  } catch {
    return unavailableResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest('brands:manage');
    if (auth.response) return auth.response;
    const body = await req.json();
    if (!body.name || !body.website) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Brand name and official website are required.' },
        },
        { status: 400 }
      );
    }

    const { normalized } = sanitizeAndValidateUrl(body.website);
    const created = await createBrand({ ...body, website: normalized }, auth.user.organizationId);
    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION_OR_CREATION_ERROR', message: err instanceof Error ? err.message : 'Failed to create brand profile.' },
      },
      { status: err instanceof Error && err.message.includes('valid') ? 400 : 500 }
    );
  }
}
