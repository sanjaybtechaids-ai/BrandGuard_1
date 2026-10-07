import { AppVerificationStatus, AppRelationshipType } from './brand';

export interface MonitoredApp {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  developer: string;
  platform: 'Google Play' | 'Apple App Store' | 'Third-Party APK';
  icon: string;
  isOfficial: boolean;
  similarityScore: number;
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Trusted';
  status: 'Trusted' | 'Critical' | 'High' | 'Under Review' | 'Investigating' | 'Resolved';
  packageId: string;
  bundleId?: string;
  downloads: string;
  rating: number;
  detectedAt: string;
  storeUrl?: string;
  threatId?: string;
  verificationStatus?: AppVerificationStatus;
  relationshipType?: AppRelationshipType;
  reasons?: string[];
  evidence?: string[];
}
