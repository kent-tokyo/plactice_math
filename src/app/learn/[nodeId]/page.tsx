import { getAllGraphData } from '@/data/graph';
import LegacyLearnRedirect from './redirect';

export function generateStaticParams() {
  const { nodes } = getAllGraphData('math');
  return nodes.map(node => ({ nodeId: node.id }));
}

export default async function LearnPage({ params }: { params: Promise<{ nodeId: string }> }) {
  const { nodeId } = await params;
  return <LegacyLearnRedirect nodeId={nodeId} />;
}
