import { NextResponse } from 'next/server';
import { getMonitoredSocials } from '@/services/social.service';
import { authorizeApiRequest, unavailableResponse } from '@/lib/security/api-auth';

export async function GET() {
  const auth = await authorizeApiRequest('brands:view');
  if (auth.response) return auth.response;
  try {
    const accounts = await getMonitoredSocials(undefined, auth.user.organizationId);
    return NextResponse.json({ success: true, data: accounts });
  } catch {
    return unavailableResponse();
  }
}
