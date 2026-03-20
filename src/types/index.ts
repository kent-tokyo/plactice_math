export interface MathNode {
  id: string;
  label: string;
  area: 'foundations' | 'pure_algebra' | 'pure_analysis' | 'pure_geometry' | 'stochastic' | 'computational' | 'mathematical_modeling' | 'social';
  difficulty: 1 | 2 | 3 | 4 | 5;
  position: { x: number; y: number };
  description: string;
  prerequisites: string[];
}

export interface MathEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: MathNode[];
  edges: MathEdge[];
}

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface NodeProgress {
  nodeId: string;
  status: NodeStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
}

export interface Term {
  term: string;
  reading: string;
  en: string;
  definition: string;
}

export type AreaId = 'foundations' | 'pure_algebra' | 'pure_analysis' | 'pure_geometry' | 'stochastic' | 'computational' | 'mathematical_modeling' | 'social';

export interface AreaMeta {
  id: AreaId;
  label: string;
  position: { x: number; y: number };
  color: string;
  description: string;
}
