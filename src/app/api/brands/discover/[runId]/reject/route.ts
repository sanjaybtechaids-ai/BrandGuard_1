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

    let reason = 'User declined brand proposal';
    try {
      const body = await req.json();
      if (body.reason) reason = body.reason;
    } catch {
      // Optional body
    }

    await brandDiscoveryService.rejectDiscovery(
      runId,
      auth.user.organizationId!,
      auth.user.id,
      reason
    );

    return NextResponse.json({
      success: true,
      message: 'Discovery proposal rejected.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REJECTION_ERROR',
          message: err.message || 'Failed to reject discovery run.',
        },
      },
      { status: 400 }
    );
  }
}
