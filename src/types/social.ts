import { SocialVerificationStatus, AppRelationshipType } from './brand';

export interface MonitoredSocial {
  id: string;
  username: string;
  displayName: string;
  brandId: string;
  brandName: string;
  platform: 'Instagram' | 'X' | 'YouTube' | 'Facebook' | 'TikTok' | 'LinkedIn' | 'Telegram';
  avatar: string;
  isOfficial: boolean;
  similarityScore: number;
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Trusted';
  status: 'Trusted' | 'Critical' | 'High' | 'Under Review' | 'Investigating' | 'Resolved';
  followers: string;
  verifiedBadge: boolean;
  detectedAt: string;
  profileUrl?: string;
  threatId?: string;
  verificationStatus?: SocialVerificationStatus;
  relationshipType?: AppRelationshipType;
  reasons?: string[];
  evidence?: string[];
}
