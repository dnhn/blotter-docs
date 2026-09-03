import type { SymbolDoc } from '@/lib/api/model';

export default {
  symbol: 'UniformInterface',
  summary:
    'The live handle for one uniform: a type, a validated value, and an update event its owner listens to.',
  intro: `<p>Every entry in <code>material.uniforms</code> and <code>scope.material.uniforms</code> is one of these. You do not construct them; Blotter builds them from the descriptors you pass to a material. Writing to <code>value</code> is validated against the type (a <code>"2f"</code> uniform wants a two-number array) and forwarded to the shader on the next frame.</p>`,
  example: `material.uniforms.uSpeed.value = 2;            // "1f"
material.uniforms.uCenter.value = [0.5, 0.5];  // "2f"`,
  members: {
    constructor: {
      description:
        '<p>Internal. Instances are created from <a href="/api/types#UniformDescriptor"><code>UniformDescriptor</code></a>s by the material that owns them.</p>',
    },
    type: {
      description:
        '<p>The GLSL vector size as a <a href="/api/types#UniformType"><code>UniformType</code></a>: <code>"1f"</code>, <code>"2f"</code>, <code>"3f"</code> or <code>"4f"</code>. Fixed for the life of the uniform.</p>',
    },
    value: {
      description:
        '<p>The current value, shaped by <code>type</code>: a number for <code>"1f"</code>, a tuple otherwise. Assigning validates, stores, and emits <code>update</code>; an invalid value throws.</p>',
    },
    toDescriptor: {
      description:
        '<p>The uniform as a plain <code>{ type, value }</code> object, suitable for passing to another material.</p>',
    },
  },
} satisfies SymbolDoc;
