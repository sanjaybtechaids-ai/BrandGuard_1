import { ScanCandidate } from '@/types/scan';

export interface DataProvenance {
  source: string;
  method: 'LIVE_FETCH' | 'DNS_QUERY' | 'OFFICIAL_REGISTRY' | 'SEED_DATABASE';
  timestamp: string;
  isDemoData: boolean;
  provenanceLabel: 'TRUSTED_SEED_DATA' | 'DEMO_DATA' | 'VERIFIED_LIVE_DATA';
}

export interface BrandResult {
  id: string;
  name: string;
  domain: string;
  confidence: number;
  provenance: DataProvenance;
}

export interface BrandDetails {
  id: string;
  name: string;
  website: string;
  trustedDomains: string[];
  provenance: DataProvenance;
}

export interface BrandDataProvider {
  searchBrand(query: string): Promise<BrandResult[]>;
  getBrandDetails(id: string): Promise<BrandDetails | null>;
}

export interface AppDataProvider {
  searchApps(brandName: string): Promise<ScanCandidate[]>;
}

export interface SocialDataProvider {
  searchAccounts(brandName: string): Promise<ScanCandidate[]>;
}

export interface TrademarkDataProvider {
  verifyTrademark(brandName: string): Promise<{ registered: boolean; serial?: string; provenance: DataProvenance }>;
}
