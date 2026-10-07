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

  // Group threats by date
  const dateCounts: Record<string, number> = {};

  // Seed last 7 days window
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateCounts[dateKey] = 0;
  }

  // Aggregate actual threat records
  threats.forEach((t) => {
    let dateStr = 'Today';
    if (t.createdAt) {
      try {
        const d = new Date(t.createdAt);
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        dateStr = 'Today';
      }
    }
    if (dateCounts[dateStr] !== undefined) {
      dateCounts[dateStr] += 1;
    } else {
      dateCounts[dateStr] = 1;
    }
  });

  // If no threats exist, dateCounts will have 0s
  const trend = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    success: true,
    data: trend,
  });
}
