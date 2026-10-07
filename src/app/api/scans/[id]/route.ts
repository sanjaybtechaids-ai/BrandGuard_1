import { NextRequest, NextResponse } from 'next/server';
import { scanService } from '@/services/scan.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scan = scanService.getScan(id);

  if (!scan) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: `Scan "${id}" was not found.` } },
      { status: 404 }
    );
  }

  const candidates = scanService.getScanCandidates(id);

  return NextResponse.json({
    success: true,
    data: {
      scan,
      candidates,
    },
  });
}
