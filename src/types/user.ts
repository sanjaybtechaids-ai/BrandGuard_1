export type OrganizationRole = 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Security Analyst' | 'Viewer' | OrganizationRole;
  orgRole?: OrganizationRole;
  status: 'Active' | 'Pending' | 'Inactive';
  lastActive: string;
  avatar?: string;
  department?: string;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  domain: string;
  website?: string;
  plan: string;
  logo?: string;
  brandsCount: number;
  membersCount: number;
  createdAt?: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  user?: User;
  createdAt: string;
}
