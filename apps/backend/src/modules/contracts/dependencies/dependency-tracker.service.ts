import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  AddDependencyDto,
  ContractNode,
  DependencyGraph,
  RegisterContractDto,
  RiskLevel,
} from './interfaces/dependency-tracker.interface';

const RISK_ORDER: RiskLevel[] = ['none', 'low', 'medium', 'high', 'critical'];

function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;
}

/**
 * Tracks dependency relationships between monitored smart contracts and
 * propagates risk levels through the dependency graph.
 *
 * All state is held in memory; swap the private maps for a database
 * repository when persistence is needed.
 */
@Injectable()
export class DependencyTrackerService {
  private readonly contracts = new Map<string, ContractNode>();

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  registerContract(dto: RegisterContractDto): ContractNode {
    const key = this.key(dto.address, dto.chain);
    if (this.contracts.has(key)) {
      throw new ConflictException(
        `Contract ${dto.address} on chain ${dto.chain} is already registered`,
      );
    }
    const node: ContractNode = {
      address: dto.address,
      chain: dto.chain,
      label: dto.label,
      risk: dto.risk ?? 'none',
      dependencies: [],
    };
    this.contracts.set(key, node);
    return node;
  }

  // -------------------------------------------------------------------------
  // Dependency management
  // -------------------------------------------------------------------------

  addDependency(dto: AddDependencyDto): ContractNode {
    const fromKey = this.key(dto.from, dto.chain);
    const source = this.contracts.get(fromKey);
    if (!source) {
      throw new NotFoundException(`Contract ${dto.from} on chain ${dto.chain} is not registered`);
    }

    const alreadyExists = source.dependencies.some(d => d.address === dto.to);
    if (alreadyExists) {
      throw new ConflictException(`Dependency from ${dto.from} to ${dto.to} already exists`);
    }

    source.dependencies.push({
      address: dto.to,
      chain: dto.chain,
      label: dto.label,
      risk: dto.risk ?? 'none',
    });

    return source;
  }

  // -------------------------------------------------------------------------
  // Graph query
  // -------------------------------------------------------------------------

  getGraph(address: string, chain: string): DependencyGraph {
    const rootKey = this.key(address, chain);
    if (!this.contracts.has(rootKey)) {
      throw new NotFoundException(`Contract ${address} on chain ${chain} is not registered`);
    }

    const visited = new Set<string>();
    const nodes: ContractNode[] = [];
    this.traverse(address, chain, visited, nodes);

    const propagatedRisk = nodes.reduce<RiskLevel>((acc, node) => {
      const nodeMax = node.dependencies.reduce((a, d) => maxRisk(a, d.risk), node.risk);
      return maxRisk(acc, nodeMax);
    }, 'none');

    return { root: address, nodes, propagatedRisk };
  }

  getAll(): ContractNode[] {
    return Array.from(this.contracts.values());
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private traverse(
    address: string,
    chain: string,
    visited: Set<string>,
    nodes: ContractNode[],
  ): void {
    const key = this.key(address, chain);
    if (visited.has(key)) return;
    visited.add(key);

    const node = this.contracts.get(key);
    if (!node) return;
    nodes.push(node);

    for (const dep of node.dependencies) {
      this.traverse(dep.address, dep.chain ?? chain, visited, nodes);
    }
  }

  private key(address: string, chain: string): string {
    return `${chain}:${address.toLowerCase()}`;
  }
}
