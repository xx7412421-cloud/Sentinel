import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { SecurityReport } from './interfaces/reporting.interface';

/**
 * Exposes executive security report endpoints.
 *
 * GET /reporting/security          — report for the last 30 days (default)
 * GET /reporting/security?days=7   — report for a custom window
 */
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('security')
  getSecurityReport(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ): SecurityReport {
    return this.reportingService.getSecurityReport(days);
  }
}
