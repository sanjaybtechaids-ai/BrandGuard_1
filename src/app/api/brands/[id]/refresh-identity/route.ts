import { NextRequest, NextResponse } from 'next/server';
import { brandDiscoveryService } from '@/services/brand-discovery.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeApiRequest('brands:manage');
    if (auth.response) return auth.response;

    const refreshed = await brandDiscoveryService.refreshBrandIdentity(
      id,
      auth.user.organizationId!,
      auth.user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Brand identity refreshed successfully.',
      data: refreshed,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: err.message || 'Failed to refresh brand identity.',
        },
      },
      { status: 400 }
    );
  }
}
