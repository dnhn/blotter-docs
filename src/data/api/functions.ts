import type { SymbolDoc } from '@/lib/api/model';

export default [
  {
    symbol: 'isWebGLSupported',
    summary: 'Whether this browser can create a WebGL context.',
    intro:
      '<p>The <code>Blotter</code> constructor throws without WebGL. Ask first, and leave the real text in place when the answer is no.</p>',
    example: `if (isWebGLSupported()) {
  const blotter = new Blotter(material, { texts: text });
  blotter.forText(text)?.appendTo(el);
} else {
  el.textContent = text.value;
}`,
  },
  {
    symbol: 'pixelRatio',
    summary:
      'The device pixel ratio Blotter will draw at, or 1 outside a browser.',
    intro:
      '<p>The default for <a href="/api/types#BlotterOptions"><code>BlotterOptions.ratio</code></a>. Safe to call during server rendering.</p>',
  },
  {
    symbol: 'filterTexts',
    summary:
      'Normalises a text, an array of texts, or nothing into an array of valid Text instances.',
    intro:
      '<p>What <code>Blotter</code> uses to accept <code>texts: text</code> and <code>texts: [a, b]</code> alike. Anything that is not a <code>Text</code> is dropped with a warning.</p>',
  },
] satisfies SymbolDoc[];
