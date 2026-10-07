export type BackendThreatType =
  | 'FAKE_WEBSITE'
  | 'FAKE_APP'
  | 'FAKE_SOCIAL'
  | 'PHISHING'
  | 'BRAND_IMPERSONATION'
  | 'SUSPICIOUS_DOMAIN';

export interface ThreatEvidenceItem {
  id: string;
  threatId: string;
  signalType: string;
  signalValue?: number;
  description: string;
  severityWeight: number;
}

export interface Threat {
  id: string;
  organizationId?: string;
  brandId: string;
  brandName: string;
  name: string;
  candidateId?: string;
  candidateName: string;
  candidateDeveloper: string;
  candidateWebsite: string;
  candidateLogo: string;
  candidatePackage?: string;
  candidateHandle?: string;
  officialLogo: string;
  officialName: string;
  officialDeveloper: string;
  officialWebsite: string;
  platform: 'Google Play' | 'Apple App Store' | 'Instagram' | 'X' | 'YouTube' | 'Facebook' | 'Web APK' | string;
  url: string;
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
  nameSimilarity: number;
  logoSimilarity: number;
  descriptionSimilarity: number;
  developerMatch: boolean;
  domainMatch: boolean;
  packageMatch: boolean;
  detectedAt: string;
  type: 'app' | 'social' | 'website' | BackendThreatType;
  backendType?: BackendThreatType;
  aiExplanation: string;
  impersonationTactics: string[];
  recommendedActions: string[];
  evidenceList?: ThreatEvidenceItem[];
  createdAt?: string;
  updatedAt?: string;
}
