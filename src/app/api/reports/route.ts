import { NextRequest, NextResponse } from 'next/server';
import {
  getReports,
  generateNewReport,
  getReportStats,
  createThreatReport,
} from '@/services/reports.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId') || undefined;
  const brandName = searchParams.get('brand') || undefined;

  const [reports, stats] = await Promise.all([
    getReports(brandId, brandName),
    getReportStats(brandId, brandName),
  ]);

  return NextResponse.json({
    success: true,
    data: { reports, stats },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'REPORT_UNOFFICIAL_WEBSITE' || body.action === 'CREATE_THREAT_REPORT') {
      const report = await createThreatReport({
        brandId: body.brandId,
        brandName: body.brandName || body.brand || 'Apple',
        threatId: body.threatId,
        reportedUrl: body.reportedUrl || body.url || '',
        riskScore: body.riskScore || 85,
        riskLevel: body.riskLevel || 'Critical',
        evidence: body.evidence || [],
        notes: body.notes || '',
      });

      return NextResponse.json({
        success: true,
        data: report,
      });
    }

    const { brand, type } = body;
    const generated = await generateNewReport(brand || 'Nike', type || 'Threat Summary');
    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { code: 'REPORT_FAILED', message: 'Failed to generate report.' } },
      { status: 500 }
    );
  }
}
