import { NextRequest, NextResponse } from 'next/server';
import { brandDiscoveryService } from '@/services/brand-discovery.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const run = brandDiscoveryService.getDiscoveryRun(runId);

  if (!run) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Discovery run "${runId}" not found.`,
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: run,
  });
}
