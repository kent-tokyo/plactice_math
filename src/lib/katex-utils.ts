import katex from 'katex';

/**
 * Renders $...$ and $$...$$ math expressions in text to KaTeX HTML.
 * Math expressions are extracted first so that HTML escaping of non-math
 * text does not corrupt characters like < and > inside formulas.
 */
export function renderMathInText(text: string): string {
  const mathBlocks: { type: 'display' | 'inline'; tex: string }[] = [];
  let processed = text;

  // 1. Extract display math $$...$$ into placeholders
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match, tex) => {
    const idx = mathBlocks.length;
    mathBlocks.push({ type: 'display', tex });
    return `\x00MATH_${idx}\x00`;
  });

  // 2. Extract inline math $...$ into placeholders
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_match, tex) => {
    const idx = mathBlocks.length;
    mathBlocks.push({ type: 'inline', tex });
    return `\x00MATH_${idx}\x00`;
  });

  // 3. HTML-escape only the non-math parts
  processed = processed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 4. Render math blocks with KaTeX and restore
  processed = processed.replace(/\x00MATH_(\d+)\x00/g, (_match, idxStr) => {
    const { type, tex } = mathBlocks[Number(idxStr)];
    try {
      return katex.renderToString(tex.trim(), {
        displayMode: type === 'display',
        throwOnError: false,
      });
    } catch {
      return '<span class="text-red-400">[Math Error]</span>';
    }
  });

  return processed;
}
