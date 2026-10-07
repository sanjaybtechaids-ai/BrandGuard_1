import { currentUser, currentOrganization, teamMembers } from '@/data/users';
import { User, Organization, OrganizationRole } from '@/types/user';
import { createClient as createBrowserClient, isDemoMode, isSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { recordAuditLog } from '@/lib/security/audit';

/**
 * Gets the request actor from a verified Supabase session and an ACTIVE
 * organization_members row. Never use user_metadata as an authorization source.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_id', user.id)
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!membership) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        const orgRole = membership.role as OrganizationRole;
        return {
          id: user.id,
          name: profile?.full_name || user.user_metadata?.full_name || user.email || 'BrandGuard user',
          email: user.email || currentUser.email,
          role: orgRole === 'OWNER' || orgRole === 'ADMIN' ? 'Admin' : orgRole === 'VIEWER' ? 'Viewer' : 'Security Analyst',
          orgRole,
          status: 'Active',
          lastActive: 'Now',
          avatar: profile?.avatar_url || user.user_metadata?.avatar_url || currentUser.avatar,
          department: 'Digital Security',
          organizationId: membership.organization_id,
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  return isDemoMode()
    ? Promise.resolve({ ...currentUser, organizationId: 'a0000000-0000-0000-0000-000000000001', orgRole: 'ANALYST' })
    : Promise.resolve(null);
}

export async function getCurrentOrganization(): Promise<Organization> {
  return Promise.resolve({ ...currentOrganization });
}

export async function getTeamMembers(): Promise<User[]> {
  return Promise.resolve([...teamMembers]);
}

export async function inviteTeamMember(
  name: string,
  email: string,
  role: 'Admin' | 'Security Analyst' | 'Viewer' | OrganizationRole
): Promise<User> {
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role,
    orgRole: role === 'Admin' ? 'ADMIN' : role === 'Viewer' ? 'VIEWER' : 'ANALYST',
    status: 'Pending',
    lastActive: 'Just invited',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&auto=format&fit=crop&q=80',
    department: 'Digital Security',
    organizationId: 'a0000000-0000-0000-0000-000000000001',
  };
  teamMembers.push(newUser);

  await recordAuditLog({
    organizationId: 'a0000000-0000-0000-0000-000000000001',
    action: 'USER_INVITED',
    entityType: 'USER',
    entityId: newUser.id,
    metadata: { email, role },
  });

  return Promise.resolve(newUser);
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; user: User; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          user: currentUser,
          error: error.message,
        };
      }

      if (data.user) {
        const authUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || 'Sanjay',
          email: data.user.email || email,
          role: 'Security Analyst',
          orgRole: 'ANALYST',
          status: 'Active',
          lastActive: 'Just now',
          avatar: currentUser.avatar,
          department: 'Digital Security',
          organizationId: 'a0000000-0000-0000-0000-000000000001',
        };
        return { success: true, user: authUser };
      }
    } catch (err: unknown) {
      console.warn('[AuthService] Supabase signIn fallback:', err);
    }
  }

  // Graceful evaluation fallback for demo login
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: { ...currentUser, email },
      });
    }, 600);
  });
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthService] Supabase signOut warning:', err);
    }
  }
}
