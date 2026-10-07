export type ScanType = 'FULL' | 'WEBSITE' | 'APPS' | 'SOCIAL' | 'QUICK';
export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ScanEvent {
  id: string;
  scanId: string;
  eventType: string;
  message: string;
  progress: number;
  createdAt: string;
}

export interface ScanCandidate {
  id: string;
  organizationId: string;
  brandId: string;
  scanId?: string;
  candidateType: 'APP' | 'SOCIAL' | 'WEBSITE' | 'DOMAIN';
  name: string;
  url?: string;
  username?: string;
  platform?: string;
  developerName?: string;
  packageId?: string;
  description?: string;
  logoUrl?: string;
  source: string;
  sourceUrl?: string;
  discoveryStatus: string;
  isDemoData: boolean;
  createdAt: string;
}

export interface BrandScan {
  id: string;
  organizationId: string;
  brandId: string;
  brandName?: string;
  startedBy: string;
  status: ScanStatus;
  scanType: ScanType;
  progress: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  candidatesCount?: number;
  threatsCount?: number;
  events?: ScanEvent[];
}
