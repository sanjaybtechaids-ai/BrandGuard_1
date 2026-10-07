import { TrustedDomain } from './verification';

export type AppVerificationStatus =
  | 'VERIFIED'
  | 'LIKELY_OFFICIAL'
  | 'UNVERIFIED'
  | 'SUSPICIOUS'
  | 'REJECTED';

export type AppRelationshipType =
  | 'DIRECT_OFFICIAL'
  | 'SUBSIDIARY_OFFICIAL'
  | 'BRAND_ECOSYSTEM'
  | 'PARTNER'
  | 'UNRELATED'
  | 'SUSPICIOUS';

export type SocialVerificationStatus =
  | 'VERIFIED_OFFICIAL'
  | 'LIKELY_OFFICIAL'
  | 'UNVERIFIED'
  | 'SUSPICIOUS';

export type BrandRelationshipType =
  | 'PARENT_COMPANY'
  | 'SUBSIDIARY'
  | 'OWNED_BRAND'
  | 'DIGITAL_PLATFORM'
  | 'PRODUCT'
  | 'PARTNER';

export type DataSourceType = 'LIVE' | 'OFFICIAL' | 'PROVIDER' | 'DEMO';

export interface OfficialApp {
  id: string;
  brandId?: string;
  organizationId?: string;
  name: string;
  developer: string;
  platform: 'Google Play' | 'Apple App Store';
  icon: string;
  packageId: string;
  bundleId?: string;
  storeUrl?: string;
  description?: string;
  isOfficial: boolean;
  verificationStatus?: AppVerificationStatus;
  verificationConfidence?: number; // 0 - 100
  relationshipType?: AppRelationshipType;
  developerMatch?: boolean;
  packageMatch?: boolean;
  websiteMatch?: boolean;
  brandMatch?: boolean;
  source?: string;
  sourceUrl?: string;
  sourceType?: string;
  evidence?: string[];
  reasons?: string[];
  lastVerifiedAt?: string;
}

export interface OfficialSocial {
  id: string;
  brandId?: string;
  organizationId?: string;
  platform: 'Instagram' | 'X' | 'YouTube' | 'Facebook' | 'TikTok' | 'LinkedIn' | 'Telegram';
  handle: string;
  url: string;
  avatar?: string;
  verified: boolean;
  isOfficial: boolean;
  verificationStatus?: SocialVerificationStatus;
  verificationConfidence?: number; // 0 - 100
  relationshipType?: AppRelationshipType;
  followers?: string;
  source?: string;
  sourceUrl?: string;
  sourceType?: string;
  evidence?: string[];
  reasons?: string[];
  lastVerifiedAt?: string;
}

export type LogoProvider =
  | 'LOGO_DEV'
  | 'ORGANIZATION'
  | 'OFFICIAL_WEBSITE'
  | 'PROVIDER'
  | 'FALLBACK';

export interface Brand {
  id: string;
  organizationId?: string;
  name: string;
  legalName?: string;
  website: string;
  officialWebsite?: string;
  official_website?: string;
  logo: string;
  logoUrl?: string;
  logo_url?: string;
  logoProvider?: LogoProvider;
  logo_provider?: LogoProvider;
  logoDomain?: string;
  logo_domain?: string;
  canonicalDomain?: string;
  canonical_domain?: string;
  logoSource?: LogoProvider;
  logo_source?: LogoProvider;
  logoLastUpdatedAt?: string;
  logo_last_updated_at?: string;
  heroImage?: string;
  brandVisual?: string;
  company: string;
  verificationStatus: 'Verified' | 'Pending' | 'Unverified';
  verificationConfidence?: number; // 0 - 100
  officialAppsCount: number;
  officialSocialsCount: number;
  threatCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lastScan: string;
  status: 'Active' | 'Scanning' | 'Paused';
  officialApps: OfficialApp[];
  officialSocials: OfficialSocial[];
  trustedDomains?: TrustedDomain[];
  description?: string;
  category?: string;
  headquarters?: string;
  foundedYear?: number;
  parentBrandId?: string;
  relationshipType?: BrandRelationshipType;
  dataSource?: DataSourceType;
  createdAt?: string;
  updatedAt?: string;
}
