import katex from 'katex';

/**
 * Renders $...$ and $$...$$ math expressions in text to KaTeX HTML.
 */
export function renderMathInText(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Display math: $$...$$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return '<span class="text-red-400">[Math Error]</span>';
    }
  });

  // Inline math: $...$
  html = html.replace(/\$([^$\n]+?)\$/g, (_match, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return '<span class="text-red-400">[Math Error]</span>';
    }
  });

  return html;
}
