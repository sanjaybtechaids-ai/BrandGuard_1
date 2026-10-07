import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { hasPermission, normalizeRole, type PermissionAction } from '@/lib/security/permissions';
import type { User } from '@/types/user';

export type ApiAuthorization =
  | { user: User; response?: never }
  | { user?: never; response: NextResponse };

/**
 * Resolves the authenticated actor from the Supabase session. Roles always come
 * from the actor's organization membership; callers must never supply a role in
 * a request header or body.
 */
export async function authorizeApiRequest(
  permission?: PermissionAction
): Promise<ApiAuthorization> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this request.' },
        },
        { status: 401 }
      ),
    };
  }

  if (permission && !hasPermission(normalizeRole(user.orgRole || user.role), permission)) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Your organization role does not permit this action.' },
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export function unavailableResponse(message = 'The data service is temporarily unavailable.') {
  return NextResponse.json(
    { success: false, error: { code: 'SERVICE_UNAVAILABLE', message } },
    { status: 503 }
  );
}
