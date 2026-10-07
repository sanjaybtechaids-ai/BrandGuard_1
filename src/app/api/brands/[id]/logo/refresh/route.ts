import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/security/api-auth';
import { normalizeRole } from '@/lib/security/permissions';
import { refreshBrandLogo } from '@/services/brands.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeApiRequest('brands:manage');
    if (auth.response) return auth.response;

    // Role check: Only OWNER or ADMIN can manually refresh a brand logo
    const effectiveRole = normalizeRole(auth.user.orgRole || auth.user.role || 'ANALYST');

    if (effectiveRole !== 'OWNER' && effectiveRole !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only Organization OWNER or ADMIN roles are permitted to refresh brand logo assets.',
          },
        },
        { status: 403 }
      );
    }

    const updatedBrand = await refreshBrandLogo(id, auth.user.organizationId);

    return NextResponse.json({
      success: true,
      message: `Logo for brand "${updatedBrand.name}" refreshed successfully from Logo.dev.`,
      data: updatedBrand,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGO_REFRESH_ERROR',
          message: err.message || 'Failed to refresh brand logo asset.',
        },
      },
      { status: 400 }
    );
  }
}
