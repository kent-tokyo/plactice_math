'use client';

import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export default function SphereEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
    offset: 30,
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
