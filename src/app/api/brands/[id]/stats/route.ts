import { NextRequest, NextResponse } from 'next/server';
import { getBrandById } from '@/services/brands.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { getThreatsByBrand } from '@/services/threats.service';
import { getOfficialAppsByBrand, getSuspiciousAppsByBrand } from '@/services/apps.service';
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

  const [threats, officialApps, suspiciousApps, verifiedSocials, suspiciousSocials] = await Promise.all([
    getThreatsByBrand(brand.id, auth.user.organizationId),
    getOfficialAppsByBrand(brand.id, auth.user.organizationId),
    getSuspiciousAppsByBrand(brand.id, auth.user.organizationId),
    getVerifiedSocialsByBrand(brand.id, auth.user.organizationId),
    getSuspiciousSocialsByBrand(brand.id, auth.user.organizationId),
  ]);

  const activeThreats = threats.filter((t) => t.status !== 'Resolved').length;
  const criticalThreats = threats.filter((t) => t.riskLevel === 'Critical').length;
  const highThreats = threats.filter((t) => t.riskLevel === 'High').length;
  const mediumThreats = threats.filter((t) => t.riskLevel === 'Medium').length;
  const lowThreats = threats.filter((t) => t.riskLevel === 'Low').length;

  let riskScore = 15;
  if (threats.length > 0) {
    riskScore = Math.max(...threats.map((t) => t.riskScore));
  } else if (brand.threatCount > 0) {
    riskScore = brand.criticalCount > 0 ? 88 : brand.highCount > 0 ? 72 : 45;
  }

  return NextResponse.json({
    success: true,
    data: {
      brandId: brand.id,
      brandName: brand.name,
      totalThreats: threats.length || brand.threatCount || 0,
      activeThreats: activeThreats || brand.threatCount || 0,
      criticalThreats: criticalThreats || brand.criticalCount || 0,
      highThreats: highThreats || brand.highCount || 0,
      mediumThreats: mediumThreats || brand.mediumCount || 0,
      lowThreats,
      officialApps: officialApps.length,
      suspiciousApps: suspiciousApps.length,
      verifiedSocialAccounts: verifiedSocials.length,
      suspiciousSocialAccounts: suspiciousSocials.length,
      riskScore,
      verificationConfidence: brand.verificationConfidence || 95,
    },
  });
}
