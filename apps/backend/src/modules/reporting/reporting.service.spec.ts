import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportingService],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSecurityReport', () => {
    it('returns a report with the requested periodDays', () => {
      const report = service.getSecurityReport(7);
      expect(report.periodDays).toBe(7);
    });

    it('defaults to 30 days when called with no argument', () => {
      const report = service.getSecurityReport();
      expect(report.periodDays).toBe(30);
    });

    it('totalAlerts equals sum of severityBreakdown', () => {
      const report = service.getSecurityReport();
      const { low, medium, high, critical } = report.severityBreakdown;
      expect(report.totalAlerts).toBe(low + medium + high + critical);
    });

    it('resolvedAlerts + unresolvedAlerts equals totalAlerts', () => {
      const report = service.getSecurityReport();
      expect(report.resolvedAlerts + report.unresolvedAlerts).toBe(report.totalAlerts);
    });

    it('returns a valid ISO timestamp in generatedAt', () => {
      const report = service.getSecurityReport();
      expect(() => new Date(report.generatedAt)).not.toThrow();
      expect(new Date(report.generatedAt).toISOString()).toBe(report.generatedAt);
    });

    it('topChains is a non-empty array', () => {
      const report = service.getSecurityReport();
      expect(Array.isArray(report.topChains)).toBe(true);
      expect(report.topChains.length).toBeGreaterThan(0);
    });

    it('each topChain has a chain name and a numeric count', () => {
      const report = service.getSecurityReport();
      report.topChains.forEach(c => {
        expect(typeof c.chain).toBe('string');
        expect(typeof c.count).toBe('number');
      });
    });

    it('criticalUnresolved equals severityBreakdown.critical', () => {
      const report = service.getSecurityReport();
      expect(report.criticalUnresolved).toBe(report.severityBreakdown.critical);
    });
  });
});
