import type { SymbolDoc } from '@/lib/api/model';

export default {
  symbol: 'Material',
  summary:
    'A fragment shader with named uniforms. The plain Material draws text unchanged; subclasses and options make effects.',
  intro: `<p>A material is a Shadertoy-style <code>mainImage</code> function plus the uniforms it reads. Blotter wraps the function in a full fragment shader, declares your uniforms alongside its built-ins (<code>uResolution</code>, <code>uGlobalTime</code>, <code>uTimeDelta</code>, <code>uBlendColor</code>, <code>uPixelRatio</code>), and exposes each uniform as a live <a href="/api/uniform-interface"><code>UniformInterface</code></a>.</p>
<p>Construct it with no options for a passthrough, pass <code>mainImage</code> and <code>uniforms</code> for a one-off, or subclass it for an effect you will reuse. The <a href="/guide/custom-materials">custom materials guide</a> walks through all three.</p>`,
  example: `import { Material } from "blotter.ts";

const material = new Material({
  mainImage: \`
    void mainImage( out vec4 mainImage, in vec2 fragCoord ) {
      vec2 uv = fragCoord / uResolution;
      uv.x += sin(uv.y * 20.0 + uGlobalTime) * uAmount;
      mainImage = textTexture(uv);
    }
  \`,
  uniforms: { uAmount: { type: "1f", value: 0.01 } },
});`,
  members: {
    constructor: {
      description:
        '<p>Takes an optional <a href="/api/types#MaterialOptions"><code>MaterialOptions</code></a> with the shader body and the uniform declarations.</p>',
    },
    mainImage: {
      description:
        '<p>The GLSL body: a <code>mainImage(out vec4, in vec2)</code> function that samples the text with <code>textTexture(uv)</code>. Assigning a falsy value restores the passthrough. A new value takes effect after the owning <code>Blotter</code> rebuilds.</p>',
    },
    uniforms: {
      description:
        '<p>The live uniforms, keyed by name. Reading gives <a href="/api/types#UniformInterfaceMap"><code>UniformInterfaceMap</code></a>; assign to a uniform’s <code>value</code> to change the running effect. Assigning a whole new map replaces every uniform and triggers a rebuild. The built-in uniforms always win over user uniforms with the same name.</p>',
    },
    update: {
      description:
        '<p>Notifies observers that the material changed, which makes every <code>Blotter</code> using it rebuild. Setting <code>mainImage</code> or <code>uniforms</code> calls it for you.</p>',
    },
  },
} satisfies SymbolDoc;
