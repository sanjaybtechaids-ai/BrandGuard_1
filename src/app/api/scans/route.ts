import { NextRequest, NextResponse } from 'next/server';
import { scanService } from '@/services/scan.service';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { ScanType } from '@/types/scan';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId');
  const organizationId = searchParams.get('organizationId') || undefined;

  if (brandId) {
    const scans = scanService.getScansByBrand(brandId, organizationId);
    return NextResponse.json({
      success: true,
      data: scans,
    });
  }

  const scans = scanService.getAllScans(organizationId);
  return NextResponse.json({
    success: true,
    data: scans,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeApiRequest('scans:start');
  if (auth.response) return auth.response;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const rate = checkRateLimit(`scan:${ip}`, 10, 300000);
  if (!rate.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many scan requests. Please wait a few moments.' },
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const brandId = body.brandId;
  const scanType: ScanType = body.scanType || 'FULL';

  if (!brandId || typeof brandId !== 'string' || brandId.trim() === '') {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BRAND_REQUIRED', message: 'Select a brand before starting a scan.' },
      },
      { status: 400 }
    );
  }

  try {
    const scan = await scanService.startScan(
      brandId.trim(),
      scanType,
      auth.user.id,
      auth.user.organizationId
    );

    return NextResponse.json({
      success: true,
      data: scan,
    });
  } catch (err: any) {
    const msg = err.message || '';
    if (msg.includes('BRAND_REQUIRED')) {
      return NextResponse.json({ success: false, error: { code: 'BRAND_REQUIRED', message: msg } }, { status: 400 });
    }
    if (msg.includes('INVALID_BRAND')) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_BRAND', message: msg } }, { status: 404 });
    }
    if (msg.includes('FORBIDDEN')) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: msg } }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: { code: 'SCAN_FAILED', message: msg } }, { status: 500 });
  }
}
