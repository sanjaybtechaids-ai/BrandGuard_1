import { reportsList, reportStats } from '@/data/reports';
import { Report, ReportStats } from '@/types/report';
import { updateThreatStatus } from './threats.service';

export interface CreateThreatReportParams {
  brandId?: string;
  brandName: string;
  threatId?: string;
  reportedUrl: string;
  riskScore: number;
  riskLevel?: string;
  evidence?: string[];
  reportType?: string;
  notes?: string;
  organizationId?: string;
}

export async function getReportStats(brandId?: string, brandName?: string): Promise<ReportStats> {
  if (!brandId && !brandName) {
    return Promise.resolve({ ...reportStats });
  }

  const bId = (brandId || '').toLowerCase();
  const bName = (brandName || '').toLowerCase();

  const filtered = reportsList.filter((r) => {
    const rBrand = r.brand.toLowerCase();
    return rBrand === bName || (r as any).brandId?.toLowerCase() === bId;
  });

  return Promise.resolve({
    totalReports: filtered.length,
    threatReports: filtered.filter((r) => r.type === 'Threat Summary' || r.type === 'Takedown Evidence Pack').length,
    monthlyReports: filtered.filter((r) => r.type === 'Monthly Executive Briefing' || r.type === 'Full Brand Audit').length,
    generatedReports: filtered.length,
  });
}

export async function getReports(brandId?: string, brandName?: string): Promise<Report[]> {
  if (!brandId && !brandName) {
    return Promise.resolve([...reportsList]);
  }

  const bId = (brandId || '').toLowerCase();
  const bName = (brandName || '').toLowerCase();

  const filtered = reportsList.filter((r) => {
    const rBrand = r.brand.toLowerCase();
    return rBrand === bName || (r as any).brandId?.toLowerCase() === bId;
  });

  return Promise.resolve(filtered);
}

export async function generateNewReport(brand: string, type: Report['type']): Promise<Report> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReport: Report = {
        id: `rep-${Date.now()}`,
        name: `${brand} - ${type} (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`,
        brand,
        date: 'Today',
        threatsCount: 4,
        createdBy: 'Security Analyst',
        type,
        fileSize: '3.1 MB',
        format: 'PDF',
        status: 'Ready',
      };
      reportsList.unshift(newReport);
      resolve(newReport);
    }, 800);
  });
}

export async function createThreatReport(params: CreateThreatReportParams): Promise<Report> {
  const {
    brandId,
    brandName,
    threatId,
    reportedUrl,
    riskScore,
    riskLevel = 'Critical',
    evidence = [],
    notes = '',
  } = params;

  // Prevent duplicate report creation for the exact same threat/URL
  const existing = reportsList.find(
    (r) =>
      (threatId && (r as any).threatId === threatId) ||
      (reportedUrl && (r as any).reportedUrl === reportedUrl && r.brand.toLowerCase() === brandName.toLowerCase())
  );

  if (existing) {
    return existing;
  }

  const reportId = `rep-${Date.now()}`;
  const newReport: Report = {
    id: reportId,
    name: `${brandName} - Unofficial Website Incident Dossier`,
    brand: brandName,
    date: 'Today',
    threatsCount: 1,
    createdBy: 'Security Analyst',
    type: 'Takedown Evidence Pack',
    fileSize: '2.4 MB',
    format: 'PDF',
    status: 'Ready',
  };

  // Add metadata fields
  (newReport as any).brandId = brandId;
  (newReport as any).threatId = threatId;
  (newReport as any).reportedUrl = reportedUrl;
  (newReport as any).riskScore = riskScore;
  (newReport as any).riskLevel = riskLevel;
  (newReport as any).evidence = evidence;
  (newReport as any).notes = notes;
  (newReport as any).reportStatus = 'SUBMITTED';
  (newReport as any).createdAt = new Date().toISOString();

  reportsList.unshift(newReport);

  // Transition threat status if threatId provided
  if (threatId) {
    try {
      await updateThreatStatus(threatId, 'Investigating', params.organizationId);
    } catch {
      // Non-critical
    }
  }

  return newReport;
}
