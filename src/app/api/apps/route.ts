import { NextResponse } from 'next/server';
import { getMonitoredApps } from '@/services/apps.service';
import { authorizeApiRequest, unavailableResponse } from '@/lib/security/api-auth';

export async function GET() {
  const auth = await authorizeApiRequest('brands:view');
  if (auth.response) return auth.response;
  try {
    const apps = await getMonitoredApps(undefined, auth.user.organizationId);
    return NextResponse.json({ success: true, data: apps });
  } catch {
    return unavailableResponse();
  }
}
