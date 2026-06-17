import { Module } from '@nestjs/common';
import { DependencyTrackerController } from './dependency-tracker.controller';
import { DependencyTrackerService } from './dependency-tracker.service';

@Module({
  controllers: [DependencyTrackerController],
  providers: [DependencyTrackerService],
  exports: [DependencyTrackerService],
})
export class DependencyTrackerModule {}
