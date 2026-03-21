'use client';

import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export default function SphereEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;

  // Increase offset when nodes are mostly vertical (small horizontal gap)
  // to prevent edges from overlapping node boxes
  const dx = Math.abs(targetX - sourceX);
  const dy = Math.abs(targetY - sourceY);
  const isVertical = dy > dx * 0.8;
  const offset = isVertical ? 50 : 30;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
    offset,
  });

  return (
    <BaseEdge
      {...props}
      path={edgePath}
      className="[&>path]:!stroke-zinc-300 dark:[&>path]:!stroke-zinc-600"
      style={{ strokeWidth: 2 }}
    />
  );
}
