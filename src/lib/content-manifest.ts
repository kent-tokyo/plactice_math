interface ManifestEntry {
  levels: string[];
  hasIllustration: Record<string, boolean>;
}

type Manifest = Record<string, ManifestEntry>;

const cache = new Map<string, Manifest>();

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function getContentBasePath(): string {
  return BASE_PATH;
}

async function fetchManifest(domain?: string): Promise<Manifest> {
  const key = domain || '_default';
  if (cache.has(key)) return cache.get(key)!;

  // Try domain-specific manifest first, then fallback to root
  const urls = domain
    ? [`${BASE_PATH}/content/${domain}/manifest.json`, `${BASE_PATH}/content/manifest.json`]
    : [`${BASE_PATH}/content/manifest.json`];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        cache.set(key, data);
        return data;
      }
    } catch { /* try next */ }
  }

  return {};
}

export async function getManifest(): Promise<Manifest> {
  return fetchManifest();
}

export async function getAvailableLevels(nodeId: string, domain?: string): Promise<string[]> {
  const manifest = await fetchManifest(domain);
  return manifest[nodeId]?.levels ?? [];
}

export async function hasIllustration(nodeId: string, level: string, domain?: string): Promise<boolean> {
  const manifest = await fetchManifest(domain);
  return manifest[nodeId]?.hasIllustration[level] ?? false;
}
