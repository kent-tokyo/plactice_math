'use client';

import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { renderMathInText } from '@/lib/katex-utils';

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className }: MathTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const html = renderMathInText(text);
    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ['span', 'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace', 'annotation'],
      ADD_ATTR: ['aria-hidden', 'encoding', 'style'],
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    ref.current.replaceChildren(...Array.from(doc.body.childNodes).map(n => n.cloneNode(true)));
  }, [text]);

  return <span ref={ref} className={className} />;
}
