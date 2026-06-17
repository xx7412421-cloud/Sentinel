import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DependencyTrackerService } from './dependency-tracker.service';
import {
  AddDependencyDto,
  ContractNode,
  DependencyGraph,
  RegisterContractDto,
} from './interfaces/dependency-tracker.interface';

/**
 * REST API for the Contract Dependency Tracker.
 *
 * POST /contracts/dependencies/register        — register a contract
 * POST /contracts/dependencies                 — add a dependency edge
 * GET  /contracts/dependencies                 — list all registered contracts
 * GET  /contracts/dependencies/graph/:address  — full dependency graph for a contract
 */
@Controller('contracts/dependencies')
export class DependencyTrackerController {
  constructor(private readonly trackerService: DependencyTrackerService) {}

  @Post('register')
  register(@Body() dto: RegisterContractDto): ContractNode {
    return this.trackerService.registerContract(dto);
  }

  @Post()
  addDependency(@Body() dto: AddDependencyDto): ContractNode {
    return this.trackerService.addDependency(dto);
  }

  @Get()
  getAll(): ContractNode[] {
    return this.trackerService.getAll();
  }

  @Get('graph/:address')
  getGraph(@Param('address') address: string, @Query('chain') chain: string): DependencyGraph {
    return this.trackerService.getGraph(address, chain);
  }
}
