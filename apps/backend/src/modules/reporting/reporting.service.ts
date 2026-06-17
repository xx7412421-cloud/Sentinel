import { Injectable } from '@nestjs/common';
import {
  SecurityReport,
  SeverityBreakdown,
  ChainBreakdown,
} from './interfaces/reporting.interface';

/**
 * Aggregates alert data into executive-level security reports.
 * In production this would query a database; the static data here
 * is the minimum viable implementation for the reporting interface.
 */
@Injectable()
export class ReportingService {
  /**
   * Returns a security summary for the given number of past days.
   * @param periodDays - Look-back window in days (default: 30)
   */
  getSecurityReport(periodDays = 30): SecurityReport {
    const severityBreakdown: SeverityBreakdown = {
      low: 12,
      medium: 8,
      high: 5,
      critical: 2,
    };

    const totalAlerts = Object.values(severityBreakdown).reduce((a, b) => a + b, 0);

    const topChains: ChainBreakdown[] = [
      { chain: 'Ethereum', count: 11 },
      { chain: 'Soroban', count: 9 },
      { chain: 'Polygon', count: 7 },
    ];

    return {
      generatedAt: new Date().toISOString(),
      periodDays,
      totalAlerts,
      severityBreakdown,
      topChains,
      resolvedAlerts: 20,
      unresolvedAlerts: totalAlerts - 20,
      criticalUnresolved: severityBreakdown.critical,
    };
  }
}
