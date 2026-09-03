import type { SymbolDoc } from '@/lib/api/model';

export default {
  symbol: 'Blotter',
  summary:
    'The orchestrator: packs its texts into one atlas, renders them through the material in a single draw call, and hands each text its own canvas.',
  intro: `<p>Whenever you want a material applied to some texts, you make a <code>Blotter</code>. It measures the texts, bin-packs them into a shared texture, compiles the material into a shader that reads that texture, and runs a render loop on <code>requestAnimationFrame</code>. Every <code>Blotter</code> on the page draws through one shared WebGL context, so the cost of a second instance is a render target, not a context.</p>
<p>The constructor throws where WebGL is unavailable; check <a href="/api/functions#isWebGLSupported"><code>isWebGLSupported()</code></a> first when you need a plain-text fallback.</p>`,
  example: `import { Blotter, Text } from "blotter.ts";
import { ChannelSplitMaterial } from "blotter.ts/materials";

const text = new Text("Hello", { family: "serif", size: 96 });
const blotter = new Blotter(new ChannelSplitMaterial(), { texts: text });

blotter.forText(text)?.appendTo(document.body);
await blotter.ready;`,
  hidden: ['mappingMaterial'],
  members: {
    constructor: {
      description:
        '<p>Takes the material to draw with and an optional <a href="/api/types#BlotterOptions"><code>BlotterOptions</code></a>: the texts, the pixel ratio, and the three <code>auto*</code> switches. With the defaults the instance builds and starts rendering immediately.</p>',
    },
    ready: {
      description:
        '<p>A promise that resolves with the instance after its first successful build, and rejects if the material fails to compile. The <code>ready</code> event fires at the same moment; awaiting the promise is the usual way to wait.</p>',
    },
    ratio: {
      description:
        '<p>The pixel ratio the atlas is drawn at. Defaults to the device pixel ratio so text is crisp on high-density screens; read-only after construction.</p>',
    },
    autoplay: {
      description:
        '<p>Whether new render scopes start in the playing state. Set through the options; read-only afterwards.</p>',
    },
    autostart: {
      description:
        '<p>Whether the render loop is running. <code>start()</code> and <code>stop()</code> flip it, so it doubles as a "is this instance animating" check.</p>',
    },
    autobuild: {
      description:
        '<p>Whether the instance builds itself on construction and after changes. Set it to <code>false</code> in the options when you intend to add texts or swap the material before the first build, then call <code>update()</code> yourself.</p>',
    },
    material: {
      description:
        '<p>The material the texts are drawn with. Assigning a new one is the same as calling <code>setMaterial()</code>: it takes effect after the next <code>update()</code>.</p>',
    },
    texts: {
      description:
        '<p>The texts this instance draws, as a read-only array. Change the set with <code>addTexts()</code> and <code>removeTexts()</code>.</p>',
    },
    imageData: {
      description:
        '<p>The whole back buffer from the most recent frame as <code>ImageData</code>, or <code>undefined</code> before the first render. Each render scope copies its own rectangle out of this; you rarely need it directly.</p>',
    },
    setMaterial: {
      description:
        '<p>Replaces the material. The shader is recompiled on the next <code>update()</code>, which you call yourself.</p>',
    },
    addText: {
      description:
        '<p>Adds one text. An alias for <code>addTexts(text)</code>.</p>',
    },
    addTexts: {
      description:
        '<p>Adds one or more texts to be drawn. They join the atlas on the next <code>update()</code>, which you call yourself.</p>',
      example: `blotter.addTexts([a, b]);
await blotter.update();
blotter.forText(a)?.appendTo(el);`,
    },
    removeText: {
      description:
        '<p>Removes one text. An alias for <code>removeTexts(text)</code>.</p>',
    },
    removeTexts: {
      description:
        '<p>Removes one or more texts. Their canvases stop updating after the next <code>update()</code>; remove the elements from the DOM yourself.</p>',
    },
    update: {
      description:
        '<p>Rebuilds the atlas and the shader from the current texts and material, and resolves when the rebuild has settled. Concurrent calls coalesce: one build runs at a time with at most one more queued, so calling it in a burst is safe. Changing a text’s <code>value</code> or <code>properties</code>, or a material’s uniforms declaration, calls this for you; you only need it after <code>setMaterial</code>, <code>addTexts</code>, <code>removeTexts</code>, or when <code>autobuild</code> is off.</p>',
    },
    start: {
      description:
        '<p>Starts the render loop. Each frame updates the built-in uniforms, draws the atlas, and emits <code>render</code>.</p>',
    },
    stop: {
      description:
        '<p>Stops the render loop. The canvases keep their last frame. Uniform changes made while stopped are not visible until the loop runs again.</p>',
    },
    teardown: {
      description:
        '<p>Disposes the instance’s render target and removes every listener it registered on its texts and material. Call <code>stop()</code> first. The shared WebGL context stays alive for other instances.</p>',
    },
    forText: {
      description:
        '<p>The <a href="/api/render-scope"><code>RenderScope</code></a> for a text this instance draws, or <code>undefined</code> for a text it does not know. The scope is where the canvas and the per-text uniforms live.</p>',
      see: ['RenderScope'],
    },
    boundsForText: {
      description:
        '<p>The rectangle a text occupies in the back buffer, as <a href="/api/types#TextBounds"><code>TextBounds</code></a>. Width and height are the size of the text’s canvas; the offsets are an implementation detail of the atlas.</p>',
    },
    on: {
      description:
        '<p>Subscribes to an event and returns a function that unsubscribes. <code>ready</code> fires once after the first build, <code>update</code> after every later rebuild, <code>render</code> after every frame. Every emitter in Blotter shares this shape.</p>',
      example: `const off = blotter.on("render", (frame) => {
  if (frame > 600) off();
});`,
    },
    off: {
      description: '<p>Removes a handler added with <code>on</code>.</p>',
    },
  },
} satisfies SymbolDoc;
