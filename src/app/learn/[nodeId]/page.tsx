import { getAllGraphData } from '@/data/graph';
import LearnPageClient from '@/components/learn/LearnPageClient';

export function generateStaticParams() {
  const { nodes } = getAllGraphData();
  return nodes.map(node => ({ nodeId: node.id }));
}

export default async function LearnPage({ params }: { params: Promise<{ nodeId: string }> }) {
  const { nodeId } = await params;
  return <LearnPageClient nodeId={nodeId} />;
}
