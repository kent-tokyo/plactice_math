import { getAllGraphData, getDomains } from '@/data/graph';
import LearnPageClient from '@/components/learn/LearnPageClient';
import type { DomainId } from '@/types/domain';

export function generateStaticParams() {
  const domains = getDomains();
  const params: { domain: string; nodeId: string }[] = [];
  for (const domain of domains) {
    const { nodes } = getAllGraphData(domain.id as DomainId);
    for (const node of nodes) {
      params.push({ domain: domain.id, nodeId: node.id });
    }
  }
  return params;
}

export default async function LearnPage({ params }: { params: Promise<{ domain: string; nodeId: string }> }) {
  const { domain, nodeId } = await params;
  return <LearnPageClient nodeId={nodeId} domain={domain as DomainId} />;
}
