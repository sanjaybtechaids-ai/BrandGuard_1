export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  timestamp: string;
  read: boolean;
  targetUrl: string;
  brandName: string;
  platform?: string;
  threatId?: string;
}
