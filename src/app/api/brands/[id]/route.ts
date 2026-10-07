import { NextRequest, NextResponse } from 'next/server';
import { getBrandById, deleteBrand } from '@/services/brands.service';
import { authorizeApiRequest, unavailableResponse } from '@/lib/security/api-auth';

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
      {
        success: false,
        error: { code: 'NOT_FOUND', message: `Brand with ID "${id}" was not found.` },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: brand,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeApiRequest('brands:manage');
  if (auth.response) return auth.response;
  let deleted: boolean;
  try {
    deleted = await deleteBrand(id, auth.user.organizationId);
  } catch {
    return unavailableResponse('Unable to remove the protected brand.');
  }

  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: `Brand "${id}" not found.` },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Brand "${id}" removed from monitoring.`,
  });
}
