import { User, Organization } from '@/types/user';

export const currentUser: User = {
  id: 'usr-sanjay-01',
  name: 'Sanjay',
  email: 'sanjay@brandguard.internal',
  role: 'Security Analyst',
  status: 'Active',
  lastActive: 'Just now',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80',
  department: 'Digital Brand Protection & SOC',
};

export const availableOrganizations: Organization[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'ABC Technologies',
    domain: 'abc.com',
    plan: 'Enterprise Security Tier',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=96&auto=format&fit=crop&q=80',
    brandsCount: 6,
    membersCount: 5,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Apex CyberSec Group',
    domain: 'apex-cyber.io',
    plan: 'Advanced SOC Tier',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=96&auto=format&fit=crop&q=80',
    brandsCount: 3,
    membersCount: 4,
  },
];

export const currentOrganization: Organization = availableOrganizations[0];

export const teamMembers: User[] = [
  {
    id: 'usr-001',
    name: 'Sanjay',
    email: 'sanjay@brandguard.internal',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just now',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80',
    department: 'Digital Brand Protection & SOC',
  },
  {
    id: 'usr-002',
    name: 'Rahul',
    email: 'analyst@abc.com',
    role: 'Security Analyst',
    status: 'Active',
    lastActive: '12 mins ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&auto=format&fit=crop&q=80',
    department: 'Threat Intelligence',
  },
  {
    id: 'usr-003',
    name: 'Arun',
    email: 'viewer@abc.com',
    role: 'Viewer',
    status: 'Active',
    lastActive: '2 hours ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&auto=format&fit=crop&q=80',
    department: 'Legal & Trademark Compliance',
  },
  {
    id: 'usr-004',
    name: 'Elena Rostova',
    email: 'elena@abc.com',
    role: 'Security Analyst',
    status: 'Active',
    lastActive: '1 day ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&auto=format&fit=crop&q=80',
    department: 'Incident Response',
  },
  {
    id: 'usr-005',
    name: 'Marcus Vance',
    email: 'marcus@abc.com',
    role: 'Viewer',
    status: 'Pending',
    lastActive: 'Invited 2 days ago',
    department: 'Brand Marketing Oversight',
  },
];
