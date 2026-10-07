import { NextRequest, NextResponse } from 'next/server';
import { brandDiscoveryService } from '@/services/brand-discovery.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const auth = await authorizeApiRequest('brands:manage');
    if (auth.response) return auth.response;

    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const brand = await brandDiscoveryService.confirmDiscovery(
      runId,
      auth.user.organizationId!,
      auth.user.id,
      body as { brandName?: string; website?: string }
    );

    return NextResponse.json({
      success: true,
      message: `Brand "${brand.name}" verified and activated for continuous monitoring.`,
      brand,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIRMATION_ERROR',
          message: err.message || 'Failed to confirm brand profile.',
        },
      },
      { status: 400 }
    );
  }
}
