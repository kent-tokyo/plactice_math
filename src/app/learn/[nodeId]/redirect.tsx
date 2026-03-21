'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyLearnRedirect({ nodeId }: { nodeId: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/math/learn/${nodeId}`);
  }, [router, nodeId]);
  return null;
}
