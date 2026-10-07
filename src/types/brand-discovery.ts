import { VerificationStatus } from './verification';

export type CandidateType = 'WEBSITE' | 'APP' | 'SOCIAL' | 'COMPANY' | 'TRADEMARK';

export type DiscoveryRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type SourcePriorityLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';

export interface BrandEvidenceItem {
  id?: string;
  type: string;
  source: string;
  priorityLevel: SourcePriorityLevel;
  description: string;
  confidence: number;
  value?: string | number | boolean;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface DiscoveredWebsite {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  logoUrl?: string;
  sslValid?: boolean;
  httpStatus?: number;
  confidence: number;
  verificationStatus: VerificationStatus;
  source: string;
  outboundSocials?: Array<{ platform: string; url: string; handle?: string }>;
  outboundAppLinks?: Array<{ platform: string; url: string }>;
  evidence: string[];
}

export interface DiscoveredApp {
  id?: string;
  name: string;
  platform: 'GOOGLE_PLAY' | 'APPLE_APP_STORE';
  developer: string;
  packageId?: string;
  bundleId?: string;
  storeUrl?: string;
  icon?: string;
  description?: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  source: string;
  discoveryTimestamp: string;
  evidence: string[];
  isDemoData?: boolean;
}

export interface DiscoveredSocial {
  id?: string;
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'X' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK';
  username: string;
  profileUrl: string;
  displayName?: string;
  source: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  discoveryTimestamp: string;
  evidence: string[];
  isDemoData?: boolean;
}

export interface DiscoveredBrandIdentity {
  name: string;
  legalName?: string;
  description?: string;
  category?: string;
  logoUrl?: string;
  heroImage?: string;
  brandVisual?: string;
  headquarters?: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  source: string;
}

export interface ConfidenceSignalBreakdown {
  signal: string;
  score: number;
  maxScore: number;
  description: string;
  passed: boolean;
}

export interface BrandDiscoveryResult {
  discoveryRunId: string;
  query: string;
  brand: DiscoveredBrandIdentity;
  officialWebsite: DiscoveredWebsite;
  apps: DiscoveredApp[];
  socialAccounts: DiscoveredSocial[];
  evidence: BrandEvidenceItem[];
  confidenceScore: number;
  verificationStatus: VerificationStatus;
  confidenceBreakdown: ConfidenceSignalBreakdown[];
  warnings?: string[];
  cached?: boolean;
  completedAt: string;
}

export interface BrandDiscoveryCandidate {
  id: string;
  discoveryRunId: string;
  organizationId: string;
  brandId?: string;
  candidateType: CandidateType;
  name: string;
  url?: string;
  platform?: string;
  source: string;
  confidenceScore: number;
  verificationStatus: VerificationStatus;
  evidence: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BrandDiscoveryRun {
  id: string;
  organizationId: string;
  query: string;
  status: DiscoveryRunStatus;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  createdBy?: string;
  result?: BrandDiscoveryResult;
}
