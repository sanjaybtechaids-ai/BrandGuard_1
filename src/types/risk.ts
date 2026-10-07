import { VerificationEvidence, VerificationSignal } from './verification';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskBreakdown {
  domainSimilarityScore: number;       // 0 - 25
  brandNameSimilarityScore: number;     // 0 - 20
  trustedDomainMismatchScore: number;   // 0 - 20
  officialRelationshipMissingScore: number; // 0 - 15
  suspiciousRedirectScore: number;      // 0 - 10
  metadataSimilarityScore: number;      // 0 - 5
  suspiciousKeywordsScore: number;      // 0 - 5
  totalRiskScore: number;               // 0 - 100
  confidenceScore: number;              // 0 - 100
  riskLevel: RiskLevel;
}

export interface RiskEvaluationResult {
  riskScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  breakdown: RiskBreakdown;
  evidence: VerificationEvidence[];
  signals: VerificationSignal[];
  explanation: string;
}
