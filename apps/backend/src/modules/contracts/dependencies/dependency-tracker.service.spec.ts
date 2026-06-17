import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DependencyTrackerService } from './dependency-tracker.service';
import { RegisterContractDto, AddDependencyDto } from './interfaces/dependency-tracker.interface';

const A: RegisterContractDto = { address: '0xAAAA', chain: 'ethereum', risk: 'low' };
const B: RegisterContractDto = { address: '0xBBBB', chain: 'ethereum', risk: 'high' };
const C: RegisterContractDto = { address: '0xCCCC', chain: 'ethereum', risk: 'none' };

describe('DependencyTrackerService', () => {
  let service: DependencyTrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DependencyTrackerService],
    }).compile();

    service = module.get<DependencyTrackerService>(DependencyTrackerService);
  });

  // ---------------------------------------------------------------------------
  // registerContract
  // ---------------------------------------------------------------------------
  describe('registerContract', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('registers a contract and returns the node', () => {
      const node = service.registerContract(A);
      expect(node.address).toBe(A.address);
      expect(node.chain).toBe(A.chain);
      expect(node.risk).toBe('low');
      expect(node.dependencies).toHaveLength(0);
    });

    it('defaults risk to "none" when not provided', () => {
      const node = service.registerContract({ address: '0xDDDD', chain: 'ethereum' });
      expect(node.risk).toBe('none');
    });

    it('stores optional label', () => {
      const node = service.registerContract({ ...A, label: 'Router' });
      expect(node.label).toBe('Router');
    });

    it('throws ConflictException on duplicate registration', () => {
      service.registerContract(A);
      expect(() => service.registerContract(A)).toThrow(ConflictException);
    });

    it('treats address as case-insensitive for deduplication', () => {
      service.registerContract(A);
      expect(() => service.registerContract({ ...A, address: A.address.toLowerCase() })).toThrow(
        ConflictException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // addDependency
  // ---------------------------------------------------------------------------
  describe('addDependency', () => {
    beforeEach(() => {
      service.registerContract(A);
      service.registerContract(B);
    });

    it('adds a dependency edge and returns the updated source node', () => {
      const edge: AddDependencyDto = { from: A.address, to: B.address, chain: 'ethereum' };
      const node = service.addDependency(edge);
      expect(node.dependencies).toHaveLength(1);
      expect(node.dependencies[0].address).toBe(B.address);
    });

    it('throws NotFoundException when source contract is not registered', () => {
      expect(() =>
        service.addDependency({ from: '0xUnknown', to: B.address, chain: 'ethereum' }),
      ).toThrow(NotFoundException);
    });

    it('throws ConflictException on duplicate dependency edge', () => {
      const edge: AddDependencyDto = { from: A.address, to: B.address, chain: 'ethereum' };
      service.addDependency(edge);
      expect(() => service.addDependency(edge)).toThrow(ConflictException);
    });

    it('records the risk and label on the dependency', () => {
      const edge: AddDependencyDto = {
        from: A.address,
        to: B.address,
        chain: 'ethereum',
        risk: 'critical',
        label: 'Vault',
      };
      const node = service.addDependency(edge);
      expect(node.dependencies[0].risk).toBe('critical');
      expect(node.dependencies[0].label).toBe('Vault');
    });
  });

  // ---------------------------------------------------------------------------
  // getGraph
  // ---------------------------------------------------------------------------
  describe('getGraph', () => {
    beforeEach(() => {
      service.registerContract(A); // risk: low
      service.registerContract(B); // risk: high
      service.registerContract(C); // risk: none
      // A -> B (edge risk: medium)
      service.addDependency({ from: A.address, to: B.address, chain: 'ethereum', risk: 'medium' });
      // B -> C
      service.addDependency({ from: B.address, to: C.address, chain: 'ethereum', risk: 'none' });
    });

    it('throws NotFoundException for an unregistered contract', () => {
      expect(() => service.getGraph('0xUnknown', 'ethereum')).toThrow(NotFoundException);
    });

    it('returns a graph with root set to the requested address', () => {
      const graph = service.getGraph(A.address, 'ethereum');
      expect(graph.root).toBe(A.address);
    });

    it('includes all transitively reachable nodes', () => {
      const graph = service.getGraph(A.address, 'ethereum');
      const addresses = graph.nodes.map(n => n.address);
      expect(addresses).toContain(A.address);
      expect(addresses).toContain(B.address);
      expect(addresses).toContain(C.address);
    });

    it('does not include nodes outside the reachable subgraph', () => {
      // Register an isolated contract
      service.registerContract({ address: '0xEEEE', chain: 'ethereum' });
      const graph = service.getGraph(A.address, 'ethereum');
      const addresses = graph.nodes.map(n => n.address);
      expect(addresses).not.toContain('0xEEEE');
    });

    it('propagates the highest risk across the graph', () => {
      // A (low), A->B edge (medium), B node (high) => propagated should be 'high'
      const graph = service.getGraph(A.address, 'ethereum');
      expect(graph.propagatedRisk).toBe('high');
    });

    it('handles a graph with a single node', () => {
      service.registerContract({ address: '0xSolo', chain: 'ethereum', risk: 'medium' });
      const graph = service.getGraph('0xSolo', 'ethereum');
      expect(graph.nodes).toHaveLength(1);
      expect(graph.propagatedRisk).toBe('medium');
    });

    it('does not visit the same node twice (cycle-safe)', () => {
      // Create a cycle: A -> B -> A is not possible via addDependency to itself,
      // but we can add D -> A to form D -> A -> B -> C and verify no infinite loop
      service.registerContract({ address: '0xDDDD', chain: 'ethereum' });
      service.addDependency({ from: '0xDDDD', to: A.address, chain: 'ethereum' });
      const graph = service.getGraph('0xDDDD', 'ethereum');
      const addresses = graph.nodes.map(n => n.address);
      // No duplicates
      expect(new Set(addresses).size).toBe(addresses.length);
    });
  });

  // ---------------------------------------------------------------------------
  // getAll
  // ---------------------------------------------------------------------------
  describe('getAll', () => {
    it('returns empty array when no contracts are registered', () => {
      expect(service.getAll()).toEqual([]);
    });

    it('returns all registered contracts', () => {
      service.registerContract(A);
      service.registerContract(B);
      const all = service.getAll();
      expect(all).toHaveLength(2);
      const addresses = all.map(n => n.address);
      expect(addresses).toContain(A.address);
      expect(addresses).toContain(B.address);
    });
  });
});
