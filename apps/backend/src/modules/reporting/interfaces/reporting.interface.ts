export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SeverityBreakdown {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ChainBreakdown {
  chain: string;
  count: number;
}

export interface SecurityReport {
  generatedAt: string;
  periodDays: number;
  totalAlerts: number;
  severityBreakdown: SeverityBreakdown;
  topChains: ChainBreakdown[];
  resolvedAlerts: number;
  unresolvedAlerts: number;
  criticalUnresolved: number;
}
