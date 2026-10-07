export interface Report {
  id: string;
  name: string;
  brand: string;
  date: string;
  threatsCount: number;
  createdBy: string;
  type: 'Threat Summary' | 'Full Brand Audit' | 'Monthly Executive Briefing' | 'Takedown Evidence Pack';
  fileSize: string;
  format: 'PDF' | 'CSV' | 'JSON';
  status: 'Ready' | 'Generating';
}

export interface ReportStats {
  totalReports: number;
  threatReports: number;
  monthlyReports: number;
  generatedReports: number;
}
