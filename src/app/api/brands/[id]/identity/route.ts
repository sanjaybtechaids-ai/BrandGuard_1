import { NextRequest, NextResponse } from 'next/server';
import { brandDiscoveryService } from '@/services/brand-discovery.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { getBrandById } from '@/services/brands.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeApiRequest('brands:view');
    if (auth.response) return auth.response;
    const brand = await getBrandById(id, auth.user.organizationId);
    if (!brand) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Brand "${id}" not found.` } },
        { status: 404 }
      );
    }
    const identity = await brandDiscoveryService.getBrandIdentity(brand.id);

    if (!identity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Brand "${id}" not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: identity,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'IDENTITY_ERROR',
          message: err.message || 'Failed to retrieve brand identity.',
        },
      },
      { status: 500 }
    );
  }
}
