import { getDomains } from '@/data/graph';
import DomainMapClient from './client';

export function generateStaticParams() {
  const domains = getDomains();
  return domains.map(d => ({ domain: d.id }));
}

export default async function DomainMapPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return <DomainMapClient domain={domain} />;
}
