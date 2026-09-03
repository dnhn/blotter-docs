import type { SymbolDoc } from '@/lib/api/model';

export default {
  symbol: 'RenderScope',
  summary:
    'Per-text output: the canvas for one text, and the place to set uniforms for that text alone.',
  intro: `<p>You never construct a scope. A <code>Blotter</code> makes one for each of its texts, and you fetch it with <a href="/api/blotter#forText"><code>blotter.forText(text)</code></a>. Its <code>domElement</code> is a high-DPI canvas that copies the text’s rectangle out of the shared back buffer every frame; put it wherever the text should appear.</p>
<p>Its <code>material</code> carries a copy of the material’s uniforms scoped to this one text, which is how several texts can share a shader and still behave differently. Those per-text uniforms exist after the first build, so read them after <code>await blotter.ready</code>.</p>`,
  example: `const scope = blotter.forText(text);
if (scope) {
  scope.appendTo(document.querySelector("#title"));
  scope.on("mouseenter", () => { scope.material.uniforms.uOffset.value = 0.1; });
  scope.on("mouseleave", () => { scope.material.uniforms.uOffset.value = 0.02; });
}`,
  members: {
    constructor: {
      description:
        '<p>Internal. Scopes are created by the <code>Blotter</code> that owns them.</p>',
    },
    text: {
      description:
        '<p>The <a href="/api/text"><code>Text</code></a> this scope draws.</p>',
    },
    domElement: {
      description:
        '<p>The output <code>canvas</code>, with a 2D context holding the latest frame. Append it directly, or use <code>appendTo</code>.</p>',
    },
    material: {
      description:
        '<p>The per-text view of the material: <code>material.uniforms</code> holds copies of every uniform that apply to this text only. Set a value here to change one text without touching its siblings.</p>',
    },
    playing: {
      description:
        '<p>Whether the scope copies a new frame each tick. Starts as the owning instance’s <code>autoplay</code>.</p>',
    },
    timeDelta: {
      description: '<p>Seconds since this scope’s previous frame.</p>',
    },
    frameCount: {
      description: '<p>How many frames this scope has drawn.</p>',
    },
    play: {
      description:
        '<p>Resumes drawing this text. The rest of the instance is unaffected.</p>',
    },
    pause: {
      description:
        '<p>Stops drawing this text while the instance keeps rendering. The canvas keeps its last frame.</p>',
    },
    appendTo: {
      description:
        '<p>Appends <code>domElement</code> to an element and returns the scope for chaining. Pointer events are wired up only when the canvas is appended this way.</p>',
    },
    on: {
      description:
        '<p>Subscribes to an event and returns an unsubscribe function. <code>ready</code> and <code>update</code> mirror the instance’s events for this text; <code>render</code> receives the frame count; the pointer events receive the position normalised to the canvas as <code>{ x, y }</code> from 0 to 1, with <code>y</code> growing downwards as in the DOM.</p>',
      see: ['RenderScopeEvents'],
    },
    off: {
      description: '<p>Removes a handler added with <code>on</code>.</p>',
    },
  },
} satisfies SymbolDoc;
