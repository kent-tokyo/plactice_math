/**
 * Build a search index JSON from all content files.
 * Reads public/content/{domain}/{nodeId}/{level}/content[.locale].json
 * and outputs public/search-index.json with plain-text content (no quiz).
 *
 * Usage: npx tsx scripts/build-search-index.ts
 */

import fs from 'fs';
import path from 'path';

interface SearchIndexEntry {
  nodeId: string;
  domain: string;
  label: string;
  labels?: { en?: string; zh?: string };
  area: string;
  number?: string;
  text: string;
  textEn?: string;
  textZh?: string;
}

interface ContentJson {
  nodeId?: string;
  content?: string;
  terms?: Array<{ term: string; definition: string }>;
  quiz?: unknown;
}

const CONTENT_DIR = path.resolve(__dirname, '../public/content');

// Load graph data to get node metadata
function loadGraphNodes(): Map<string, { label: string; labels?: { en?: string; zh?: string }; area: string; number?: string; domain: string }> {
  const domainsPath = path.resolve(__dirname, '../src/data/graph/domains.json');
  const domains = JSON.parse(fs.readFileSync(domainsPath, 'utf-8')) as Array<{ id: string; areaOrder: string[] }>;

  const nodeMap = new Map<string, { label: string; labels?: { en?: string; zh?: string }; area: string; number?: string; domain: string }>();

  for (const domain of domains) {
    const domainId = domain.id;
    // Load topic files for each domain
    const graphDir = path.resolve(__dirname, '../src/data/graph', domainId);

    // Math has split files, others have topics.json
    if (domainId === 'math') {
      for (const file of ['foundations.json', 'pure-math.json', 'applied-math.json']) {
        const filePath = path.resolve(graphDir, file);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          for (const node of data.nodes || []) {
            nodeMap.set(`${domainId}:${node.id}`, { label: node.label, labels: node.labels, area: node.area, number: node.number, domain: domainId });
          }
        }
      }
    } else {
      const topicsPath = path.resolve(graphDir, 'topics.json');
      if (fs.existsSync(topicsPath)) {
        const data = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
        for (const node of data.nodes || []) {
          nodeMap.set(`${domainId}:${node.id}`, { label: node.label, labels: node.labels, area: node.area, number: node.number, domain: domainId });
        }
      }
    }
  }

  return nodeMap;
}

/** Strip markdown/KaTeX syntax to produce plain text for search */
function toPlainText(text: string): string {
  return text
    // Remove display math $$...$$
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    // Remove inline math $...$
    .replace(/\$([^$\n]+?)\$/g, '$1')
    // Remove markdown headings
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function extractText(content: ContentJson): string {
  const parts: string[] = [];

  if (content.content) {
    parts.push(toPlainText(content.content));
  }

  if (content.terms) {
    for (const term of content.terms) {
      parts.push(term.term);
      parts.push(toPlainText(term.definition));
    }
  }

  // quiz is excluded

  return parts.join(' ');
}

function main() {
  const graphNodes = loadGraphNodes();
  const index: SearchIndexEntry[] = [];

  // Scan content directories: public/content/{domain}/{nodeId}/{level}/content.json
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Content directory not found:', CONTENT_DIR);
    process.exit(1);
  }

  const domains = fs.readdirSync(CONTENT_DIR).filter(d =>
    fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()
  );

  for (const domain of domains) {
    const domainDir = path.join(CONTENT_DIR, domain);
    const nodeIds = fs.readdirSync(domainDir).filter(d =>
      fs.statSync(path.join(domainDir, d)).isDirectory()
    );

    for (const nodeId of nodeIds) {
      const nodeDir = path.join(domainDir, nodeId);
      const levels = fs.readdirSync(nodeDir).filter(d =>
        fs.statSync(path.join(nodeDir, d)).isDirectory()
      );

      // Use the first available level (usually standard)
      const level = levels.includes('standard') ? 'standard' : levels[0];
      if (!level) continue;

      const levelDir = path.join(nodeDir, level);
      const contentPath = path.join(levelDir, 'content.json');
      if (!fs.existsSync(contentPath)) continue;

      const content: ContentJson = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
      const text = extractText(content);
      if (!text) continue;

      // Get node metadata from graph
      const meta = graphNodes.get(`${domain}:${nodeId}`);

      const entry: SearchIndexEntry = {
        nodeId,
        domain,
        label: meta?.label || nodeId,
        labels: meta?.labels,
        area: meta?.area || '',
        number: meta?.number,
        text,
      };

      // Load English content
      const enPath = path.join(levelDir, 'content.en.json');
      if (fs.existsSync(enPath)) {
        const enContent: ContentJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
        const enText = extractText(enContent);
        if (enText) entry.textEn = enText;
      }

      // Load Chinese content
      const zhPath = path.join(levelDir, 'content.zh.json');
      if (fs.existsSync(zhPath)) {
        const zhContent: ContentJson = JSON.parse(fs.readFileSync(zhPath, 'utf-8'));
        const zhText = extractText(zhContent);
        if (zhText) entry.textZh = zhText;
      }

      index.push(entry);
    }
  }

  // Sort by domain + number for consistent output
  index.sort((a, b) => {
    if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
    return (a.number || '').localeCompare(b.number || '');
  });

  const outPath = path.join(CONTENT_DIR, '..', 'search-index.json');
  fs.writeFileSync(outPath, JSON.stringify(index));
  console.log(`Search index built: ${index.length} entries → ${outPath}`);
}

main();
