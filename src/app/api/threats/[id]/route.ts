import { NextRequest, NextResponse } from 'next/server';
import { getThreatById, updateThreatStatus } from '@/services/threats.service';
import { authorizeApiRequest } from '@/lib/security/api-auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeApiRequest('threats:view');
  if (auth.response) return auth.response;
  const threat = await getThreatById(id, auth.user.organizationId);

  if (!threat) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: `Threat "${id}" was not found.` } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: threat,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeApiRequest('threats:investigate');
  if (auth.response) return auth.response;
  const body = await req.json();

  if (!body.status) {
    return NextResponse.json(
      { success: false, error: { code: 'MISSING_STATUS', message: 'Status is required.' } },
      { status: 400 }
    );
  }

  if (!['New', 'Investigating', 'Resolved'].includes(body.status)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_STATUS', message: 'Status must be New, Investigating, or Resolved.' } },
      { status: 400 }
    );
  }
  const updated = await updateThreatStatus(id, body.status, auth.user.organizationId);
  if (!updated) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: `Threat "${id}" was not found.` } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: updated,
  });
}
