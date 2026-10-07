export type VerificationStatus =
  | 'VERIFIED_OFFICIAL'
  | 'LIKELY_OFFICIAL'
  | 'UNVERIFIED'
  | 'SUSPICIOUS'
  | 'INVALID';

export type DomainVerificationMethod =
  | 'ORGANIZATION_CLAIM'
  | 'DNS_TXT'
  | 'META_TAG'
  | 'MANUAL_VERIFICATION'
  | 'OFFICIAL_SOURCE';

export interface VerificationSignal {
  signal: string;
  result: boolean | number;
  description: string;
  weight?: number;
}

export interface VerificationEvidence {
  signalType: string;
  description: string;
  status: 'passed' | 'warning' | 'failed' | 'neutral';
  value?: string | number | boolean;
}

export interface SafeMetadata {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  favicon?: string;
  canonicalUrl?: string;
  finalUrl?: string;
  httpStatus?: number;
  sslValid?: boolean;
  contentType?: string;
}

export interface UrlVerificationResult {
  id?: string;
  url: string;
  normalizedUrl: string;
  hostname: string;
  rootDomain: string;
  brand?: string;
  brandId?: string;
  status: VerificationStatus;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  metadata: SafeMetadata;
  evidence: VerificationEvidence[];
  signals: VerificationSignal[];
  explanation?: string;
  recommendedAction?: 'VERIFY_DOMAIN' | 'INVESTIGATE' | 'CREATE_THREAT' | 'TRUST' | 'RETRY';
  threatCreated?: boolean;
  threatId?: string;
  createdAt: string;
}

export interface TrustedDomain {
  id: string;
  organizationId: string;
  brandId: string;
  domain: string;
  verificationMethod: DomainVerificationMethod;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  verificationToken?: string;
  verifiedAt?: string;
  createdAt: string;
}
