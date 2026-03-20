'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import DOMPurify from 'dompurify';

interface ConceptViewProps {
  content: string;
  diagrams: { name: string; svg: string }[];
  illustrationUrl?: string | null;
  label?: string;
}

function adaptSvgForTheme(svg: string): string {
  return svg
    .replace(/fill="#e4e4e7"/g, 'fill="currentColor"')
    .replace(/fill='#e4e4e7'/g, "fill='currentColor'")
    .replace(/stroke="#e4e4e7"/g, 'stroke="currentColor"')
    .replace(/stroke='#e4e4e7'/g, "stroke='currentColor'");
}

/**
 * Renders MDX concept content with KaTeX math and SVG diagrams.
 * Content is sourced from local MDX files (author-controlled, not user input)
 * and sanitized with DOMPurify before DOM insertion.
 */
export default function ConceptView({ content, diagrams, illustrationUrl, label }: ConceptViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;

    // Build HTML from MDX content
    let html = mdxToHtml(content);

    // Replace diagram placeholders with sanitized SVGs (with theme adaptation)
    for (const diagram of diagrams) {
      const placeholder = `&lt;Diagram src=&quot;${diagram.name}&quot; /&gt;`;
      const themedSvg = adaptSvgForTheme(diagram.svg);
      const sanitizedSvg = DOMPurify.sanitize(themedSvg, { USE_PROFILES: { svg: true } });
      html = html.replace(placeholder, `<div class="my-6 flex justify-center text-zinc-800 dark:text-zinc-200">${sanitizedSvg}</div>`);
    }

    // Process display math: $$...$$ -> KaTeX
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return '<span class="text-red-400">[Math Error]</span>';
      }
    });

    // Process inline math: $...$ -> KaTeX
    html = html.replace(/\$([^$\n]+?)\$/g, (_match, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return '<span class="text-red-400">[Math Error]</span>';
      }
    });

    // Sanitize final output (author-controlled content + KaTeX output)
    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ['span', 'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace', 'annotation', 'svg', 'path', 'circle', 'rect', 'line', 'text', 'g', 'defs', 'marker', 'polygon', 'polyline', 'ellipse', 'use'],
      ADD_ATTR: ['xmlns', 'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'transform', 'text-anchor', 'font-size', 'font-family', 'dominant-baseline', 'marker-end', 'marker-start', 'points', 'rx', 'ry', 'href', 'xlink:href', 'opacity', 'fill-opacity', 'stroke-dasharray', 'aria-hidden', 'encoding', 'style'],
    });

    // Safe: content is author-controlled and sanitized by DOMPurify
    // Using a DOM parser to set the content
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    el.replaceChildren(...Array.from(doc.body.childNodes).map(n => n.cloneNode(true)));
  }, [content, diagrams]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
      />
      <div
        ref={contentRef}
        className="prose prose-zinc dark:prose-invert max-w-none
          prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100
          prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
          prose-li:text-zinc-700 dark:prose-li:text-zinc-300
          prose-code:text-amber-700 dark:prose-code:text-amber-300 prose-code:bg-amber-50 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700 prose-blockquote:text-zinc-500 dark:prose-blockquote:text-zinc-400"
      />
      {illustrationUrl && (
        <div className="my-10">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {label || '概念'} — ビジュアルガイド
              </span>
            </div>
            <img
              src={illustrationUrl}
              alt={`${label || '概念'}のビジュアルガイド`}
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}

function mdxToHtml(mdx: string): string {
  let html = mdx;

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  html = html.replace(/^(?!<[hulo]|<block|<li|<Diagram)(.+)$/gm, '<p>$1</p>');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}
