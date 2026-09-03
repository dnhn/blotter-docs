import type { SymbolDoc } from '@/lib/api/model';

export default {
  symbol: 'ShaderMaterial',
  summary:
    'A Material for a one-off shader: the mainImage string first, everything else second.',
  intro:
    '<p>Nothing more than a convenience constructor over <a href="/api/material"><code>Material</code></a>. Use it when you have a shader body in hand and do not want to subclass.</p>',
  example: `import { ShaderMaterial } from "blotter.ts";

const material = new ShaderMaterial(mainImage, {
  uniforms: { uAmount: { type: "1f", value: 0.05 } },
});`,
  members: {
    constructor: {
      description:
        '<p>Takes the GLSL body and an optional <a href="/api/types#MaterialOptions"><code>MaterialOptions</code></a> without its <code>mainImage</code> key.</p>',
    },
  },
} satisfies SymbolDoc;
