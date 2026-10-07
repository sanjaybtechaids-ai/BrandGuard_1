import { NextRequest, NextResponse } from 'next/server';
import { getBrandById } from '@/services/brands.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { getThreatsByBrand } from '@/services/threats.service';
import { getSuspiciousAppsByBrand } from '@/services/apps.service';
import { getSuspiciousSocialsByBrand } from '@/services/social.service';

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

  const [threats, suspiciousApps, suspiciousSocials] = await Promise.all([
    getThreatsByBrand(brand.id, auth.user.organizationId),
    getSuspiciousAppsByBrand(brand.id, auth.user.organizationId),
    getSuspiciousSocialsByBrand(brand.id, auth.user.organizationId),
  ]);

  const categories = [
    {
      category: 'Fake Apps',
      count: suspiciousApps.length + threats.filter((t) => t.type === 'FAKE_APP' || t.platform.includes('Play') || t.platform.includes('Store') || t.platform.includes('APK')).length,
    },
    {
      category: 'Fake Social',
      count: suspiciousSocials.length + threats.filter((t) => t.type === 'FAKE_SOCIAL' || t.platform.includes('Instagram') || t.platform.includes('X') || t.platform.includes('LinkedIn')).length,
    },
    {
      category: 'Fake Website',
      count: threats.filter((t) => t.type === 'FAKE_WEBSITE' || t.platform === 'Web').length,
    },
    {
      category: 'Phishing',
      count: threats.filter((t) => t.type === 'PHISHING' || t.impersonationTactics?.includes('Phishing Portal')).length,
    },
    {
      category: 'Look-alike Domain',
      count: threats.filter((t) => t.impersonationTactics?.includes('Domain Spoofing') || t.impersonationTactics?.includes('Typo-squatting')).length,
    },
  ];

  return NextResponse.json({
    success: true,
    data: categories,
  });
}
