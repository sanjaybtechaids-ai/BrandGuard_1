export interface DashboardStats {
  totalBrands: { value: number; change: string; isPositive: boolean; note: string };
  threatsDetected: { value: number; change: string; isPositive: boolean; note: string };
  criticalThreats: { value: number; change: string; isPositive: boolean; note: string };
  underInvestigation: { value: number; change: string; isPositive: boolean; note: string };
}

export interface ThreatTrendPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const dashboardStats: DashboardStats = {
  totalBrands: {
    value: 5,
    change: '+1 this month',
    isPositive: true,
    note: 'All 5 brands active & monitoring',
  },
  threatsDetected: {
    value: 42,
    change: '+8.4%',
    isPositive: false,
    note: 'Scanned 172 apps & socials',
  },
  criticalThreats: {
    value: 5,
    change: '+2 new today',
    isPositive: false,
    note: 'Requires immediate action',
  },
  underInvestigation: {
    value: 12,
    change: '4 in legal review',
    isPositive: true,
    note: 'Average response: 4.2h',
  },
};

export const threatTrends7Days: ThreatTrendPoint[] = [
  { date: 'Mon', critical: 3, high: 6, medium: 8, low: 12 },
  { date: 'Tue', critical: 4, high: 7, medium: 9, low: 14 },
  { date: 'Wed', critical: 2, high: 8, medium: 11, low: 15 },
  { date: 'Thu', critical: 5, high: 9, medium: 12, low: 16 },
  { date: 'Fri', critical: 4, high: 11, medium: 14, low: 18 },
  { date: 'Sat', critical: 6, high: 12, medium: 15, low: 19 },
  { date: 'Sun', critical: 5, high: 14, medium: 16, low: 22 },
];

export const threatTrends30Days: ThreatTrendPoint[] = [
  { date: 'Week 1', critical: 12, high: 24, medium: 32, low: 45 },
  { date: 'Week 2', critical: 15, high: 28, medium: 39, low: 52 },
  { date: 'Week 3', critical: 18, high: 35, medium: 46, low: 60 },
  { date: 'Week 4', critical: 22, high: 42, medium: 54, low: 71 },
];

export const threatTrends90Days: ThreatTrendPoint[] = [
  { date: 'Month 1', critical: 38, high: 72, medium: 94, low: 130 },
  { date: 'Month 2', critical: 45, high: 86, medium: 112, low: 154 },
  { date: 'Month 3', critical: 58, high: 110, medium: 148, low: 195 },
];
