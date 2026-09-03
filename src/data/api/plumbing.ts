import type { SymbolDoc } from '@/lib/api/model';

export default [
  {
    symbol: 'Mapping',
    plumbing: true,
    summary:
      'The packed atlas layout: which rectangle of the shared texture each text occupies. Built by Blotter; exported for custom pipelines.',
    intro:
      '<p>Internal plumbing, exported because a few advanced uses want it. A <code>Blotter</code> makes a new mapping on every build; you can read the one it holds through <code>boundsForText</code> on the instance instead.</p>',
    members: {
      toCanvas: {
        description:
          '<p>Draws every text into a single canvas, Y-flipped for WebGL upload. This is the atlas the shader samples.</p>',
      },
      boundsForText: {
        description:
          '<p>The rectangle a text occupies in the atlas, or <code>undefined</code>.</p>',
      },
    },
  },
  {
    symbol: 'MappingMaterial',
    plumbing: true,
    summary:
      'The built, renderable form of a Material for one Mapping: the composed THREE.ShaderMaterial and the per-text uniform interfaces.',
    intro:
      '<p>Internal plumbing. A <code>Blotter</code> builds one of these on every <code>update()</code> and renders through it. The per-text uniforms you reach through a <a href="/api/render-scope"><code>RenderScope</code></a> live here.</p>',
    members: {
      uniforms: {
        description: '<p>The material-wide uniform interfaces.</p>',
      },
      boundsForText: {
        description:
          '<p>The rectangle a text occupies in the atlas, or <code>undefined</code>.</p>',
      },
    },
  },
] satisfies SymbolDoc[];
