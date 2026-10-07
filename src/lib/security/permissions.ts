import { OrganizationRole } from '@/types/user';

export type PermissionAction =
  | 'org:manage'
  | 'users:manage'
  | 'brands:manage'
  | 'brands:view'
  | 'scans:start'
  | 'url:verify'
  | 'threats:investigate'
  | 'threats:view'
  | 'reports:generate'
  | 'reports:view'
  | 'alerts:manage';

const ROLE_PERMISSIONS: Record<OrganizationRole, PermissionAction[]> = {
  OWNER: [
    'org:manage',
    'users:manage',
    'brands:manage',
    'brands:view',
    'scans:start',
    'url:verify',
    'threats:investigate',
    'threats:view',
    'reports:generate',
    'reports:view',
    'alerts:manage',
  ],
  ADMIN: [
    'org:manage',
    'users:manage',
    'brands:manage',
    'brands:view',
    'scans:start',
    'url:verify',
    'threats:investigate',
    'threats:view',
    'reports:generate',
    'reports:view',
    'alerts:manage',
  ],
  ANALYST: [
    'brands:view',
    'brands:manage',
    'scans:start',
    'url:verify',
    'threats:investigate',
    'threats:view',
    'reports:generate',
    'reports:view',
    'alerts:manage',
  ],
  VIEWER: [
    'brands:view',
    'threats:view',
    'reports:view',
  ],
};

export function hasPermission(role: OrganizationRole, action: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function normalizeRole(role: string): OrganizationRole {
  const upper = role.toUpperCase();
  if (upper === 'OWNER') return 'OWNER';
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'ANALYST' || upper === 'SECURITY ANALYST') return 'ANALYST';
  return 'VIEWER';
}
