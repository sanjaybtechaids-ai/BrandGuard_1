import { NextRequest, NextResponse } from 'next/server';
import { getBrandById } from '@/services/brands.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { getThreatsByBrand } from '@/services/threats.service';

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

  const threats = await getThreatsByBrand(brand.id, auth.user.organizationId);

  const distribution = {
    low: threats.filter((t) => t.riskLevel === 'Low').length,
    medium: threats.filter((t) => t.riskLevel === 'Medium').length,
    high: threats.filter((t) => t.riskLevel === 'High').length,
    critical: threats.filter((t) => t.riskLevel === 'Critical').length,
  };

  // If threats list is empty but brand has summary counts, use them as fallback
  if (threats.length === 0 && brand.threatCount > 0) {
    distribution.critical = brand.criticalCount || 0;
    distribution.high = brand.highCount || 0;
    distribution.medium = brand.mediumCount || 0;
    distribution.low = Math.max(0, brand.threatCount - distribution.critical - distribution.high - distribution.medium);
  }

  return NextResponse.json({
    success: true,
    data: distribution,
  });
}
