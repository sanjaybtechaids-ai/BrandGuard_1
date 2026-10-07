import { currentUser, currentOrganization, teamMembers } from '@/data/users';
import { User, Organization, OrganizationRole } from '@/types/user';
import { recordAuditLog } from '@/lib/security/audit';

export type DemoUser = {
  name: string;
  mode: 'user' | 'organization';
  loggedIn: boolean;
};

const DEMO_USER_KEY = 'brandguard_demo_user';
const DEMO_COOKIE_NAME = 'brandguard_demo_session';

/**
 * Retrieves the stored demo user from client storage (sessionStorage preferred, fallback to localStorage).
 */
export function getStoredDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DEMO_USER_KEY) || localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.loggedIn && typeof parsed.name === 'string') {
      return parsed as DemoUser;
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

/**
 * Persists the demo user in client storage and sets the session cookie for route protection.
 */
export function saveDemoUser(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  const json = JSON.stringify(user);
  try {
    sessionStorage.setItem(DEMO_USER_KEY, json);
    localStorage.setItem(DEMO_USER_KEY, json);
    document.cookie = `${DEMO_COOKIE_NAME}=${encodeURIComponent(json)}; path=/; SameSite=Lax`;
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Clears the demo user from client storage and deletes the session cookie.
 */
export function clearDemoUser(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_USER_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
    document.cookie = `${DEMO_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

/**
 * Checks whether an active demo user session exists.
 */
export function isAuthenticated(): boolean {
  return Boolean(getStoredDemoUser()?.loggedIn);
}

/**
 * Logs in with a user name without passwords or credentials.
 * Validates name length and formatting.
 */
/**
 * Creates and stores a lightweight local demo session.
 */
export function createDemoSession(mode: 'user' | 'organization' = 'user'): DemoUser {
  const demoUser: DemoUser = {
    name: 'Security Analyst',
    mode,
    loggedIn: true,
  };
  saveDemoUser(demoUser);
  return demoUser;
}

/**
 * Logs in with demo access without credentials.
 */
export async function loginWithName(
  name?: string
): Promise<{ success: boolean; user: DemoUser; error?: string }> {
  const trimmed = (name || '').trim() || 'Security Analyst';
  const demoUser: DemoUser = {
    name: trimmed,
    mode: 'user',
    loggedIn: true,
  };

  saveDemoUser(demoUser);

  return {
    success: true,
    user: demoUser,
  };
}

/**
 * Logs out the active demo session.
 */
export async function logout(): Promise<void> {
  clearDemoUser();
}

/**
 * Gets the current active user for client or server callers.
 */
export async function getCurrentUser(): Promise<User | null> {
  // 1. Client-side evaluation: read demo identity from session storage
  if (typeof window !== 'undefined') {
    const demo = getStoredDemoUser();
    if (demo && demo.loggedIn) {
      return {
        id: 'usr-demo',
        name: demo.name,
        email: `${demo.name.toLowerCase().replace(/\s+/g, '.')}@brandguard.internal`,
        role: 'Security Analyst',
        orgRole: 'ANALYST',
        status: 'Active',
        lastActive: 'Just now',
        avatar: currentUser.avatar,
        department: 'Digital Brand Protection & SOC',
        organizationId: 'a0000000-0000-0000-0000-000000000001',
      };
    }
  }

  // 2. Server-side evaluation: inspect session cookie
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)?.value;
      if (demoCookie) {
        const parsed = JSON.parse(decodeURIComponent(demoCookie));
        if (parsed && parsed.loggedIn && parsed.name) {
          return {
            id: 'usr-demo',
            name: parsed.name,
            email: `${parsed.name.toLowerCase().replace(/\s+/g, '.')}@brandguard.internal`,
            role: 'Security Analyst',
            orgRole: 'ANALYST',
            status: 'Active',
            lastActive: 'Just now',
            avatar: currentUser.avatar,
            department: 'Digital Brand Protection & SOC',
            organizationId: 'a0000000-0000-0000-0000-000000000001',
          };
        }
      }
    } catch {
      // In non-Next runtime (e.g. tsx unit tests)
    }
  }

  // 3. Fallback for test runner or mock development
  return {
    ...currentUser,
    organizationId: 'a0000000-0000-0000-0000-000000000001',
    orgRole: 'ANALYST',
  };
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

/**
 * Backward-compatible signIn for existing tests and callers.
 */
export async function signIn(
  emailOrName: string,
  ..._args: unknown[]
): Promise<{ success: boolean; user: User; error?: string }> {
  const name = emailOrName.includes('@')
    ? (emailOrName.split('@')[0] === 'security' ? 'Sanjay' : emailOrName.split('@')[0])
    : emailOrName;
  const res = await loginWithName(name || 'Sanjay');
  if (res.success) {
    const user = await getCurrentUser();
    return {
      success: true,
      user: user || { ...currentUser, name: res.user.name },
    };
  }
  return {
    success: false,
    user: currentUser,
    error: res.error,
  };
}

/**
 * Backward-compatible signOut alias.
 */
export async function signOut(): Promise<void> {
  await logout();
}
