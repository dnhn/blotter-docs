import type { SymbolDoc } from '@/lib/api/model';

export default {
  symbol: 'Text',
  summary:
    'A string and the styles to draw it with. One per word or title you want rendered.',
  intro: `<p>A <code>Text</code> is measured and rasterised when it is constructed, so the font it names must already be loaded. It is a live object: assigning a new <code>value</code> or new <code>properties</code> notifies every <code>Blotter</code> that draws it, and they rebuild.</p>
<p>Blotter is for short strings: single words, titles, text used as a graphic. A whole paragraph as one <code>Text</code> makes a very large atlas and a canvas nobody can select.</p>`,
  example: `import { Text } from "blotter.ts";

const text = new Text("observation", {
  family: "'Gloock', serif",
  size: 64,
  fill: "#1c1917",
  paddingLeft: 20,
  paddingRight: 20,
});`,
  members: {
    constructor: {
      description:
        '<p>Takes the string and an optional partial <a href="/api/types#TextProperties"><code>TextProperties</code></a>. Anything you leave out takes the default.</p>',
    },
    id: {
      description: '<p>A unique, read-only identifier for the instance.</p>',
    },
    value: {
      description:
        '<p>The string being drawn. Assigning a new one rebuilds every <code>Blotter</code> that draws this text.</p>',
    },
    properties: {
      description:
        '<p>The styles, as the full defaulted set when read. Assigning a partial object <em>replaces</em> them: it is merged over the defaults, not over the previous values, and then everything rebuilds. Spread the current properties first when you only want to change one.</p>',
      example: `text.properties = { ...text.properties, size: 90 };`,
    },
    update: {
      description:
        '<p>Notifies observers that this text changed. <code>value</code> and <code>properties</code> writes call it for you; call it yourself after a bulk edit.</p>',
    },
  },
} satisfies SymbolDoc;
