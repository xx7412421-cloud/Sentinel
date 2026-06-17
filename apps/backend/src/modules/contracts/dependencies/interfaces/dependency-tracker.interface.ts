export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface ContractDependency {
  /** Address of the upstream contract this contract depends on */
  address: string;
  /** Human-readable label (e.g. "UniswapV3Router") */
  label?: string;
  /** Chain/network identifier */
  chain: string;
  /** Propagated risk level coming from this dependency */
  risk: RiskLevel;
}

export interface ContractNode {
  address: string;
  label?: string;
  chain: string;
  /** Intrinsic risk assigned to this contract */
  risk: RiskLevel;
  /** Direct dependencies of this contract */
  dependencies: ContractDependency[];
}

export interface DependencyGraph {
  /** The root contract whose graph was requested */
  root: string;
  /** All nodes reachable from the root (including the root itself) */
  nodes: ContractNode[];
  /** Highest risk level found anywhere in the graph */
  propagatedRisk: RiskLevel;
}

export interface AddDependencyDto {
  /** Source contract (dependent) */
  from: string;
  /** Target contract (dependency) */
  to: string;
  chain: string;
  label?: string;
  risk?: RiskLevel;
}

export interface RegisterContractDto {
  address: string;
  chain: string;
  label?: string;
  risk?: RiskLevel;
}
