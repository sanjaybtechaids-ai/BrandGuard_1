import { NextRequest, NextResponse } from 'next/server';
import { getBrandById } from '@/services/brands.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { getVerifiedSocialsByBrand, getSuspiciousSocialsByBrand } from '@/services/social.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeApiRequest('brands:view');
  if (auth.response) return auth.response;
  const brand = await getBrandById(id, auth.user.organizationId);

  if (!brand) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: `Brand with ID "${id}" was not found.` } },
      { status: 404 }
    );
  }

  const [verifiedSocials, suspiciousSocials] = await Promise.all([
    getVerifiedSocialsByBrand(brand.id, auth.user.organizationId),
    getSuspiciousSocialsByBrand(brand.id, auth.user.organizationId),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      brandId: brand.id,
      brandName: brand.name,
      verifiedSocials,
      suspiciousSocials,
    },
  });
}
