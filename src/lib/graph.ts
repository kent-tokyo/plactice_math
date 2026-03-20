import { getAllGraphData } from '@/data/graph';
import type { MathNode, NodeStatus } from '@/types';

const graphData = getAllGraphData();

export function getAllNodes(): MathNode[] {
  return graphData.nodes;
}

export function getAllEdges() {
  return graphData.edges;
}

export function getNode(nodeId: string): MathNode | undefined {
  return graphData.nodes.find(n => n.id === nodeId);
}

/**
 * Compute which nodes are available based on completed nodes.
 * A node is available if all its prerequisites are completed.
 * The root nodes (no prerequisites) start as available.
 */
export function computeNodeStatuses(
  completedNodeIds: Set<string>,
  inProgressNodeIds: Set<string>
): Map<string, NodeStatus> {
  const statuses = new Map<string, NodeStatus>();

  for (const node of graphData.nodes) {
    if (completedNodeIds.has(node.id)) {
      statuses.set(node.id, 'completed');
    } else if (inProgressNodeIds.has(node.id)) {
      statuses.set(node.id, 'in_progress');
    } else {
      const allPrereqsMet = node.prerequisites.length === 0 ||
        node.prerequisites.every(pid => completedNodeIds.has(pid));
      statuses.set(node.id, allPrereqsMet ? 'available' : 'locked');
    }
  }

  return statuses;
}
