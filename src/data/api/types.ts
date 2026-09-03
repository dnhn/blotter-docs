import type { SymbolDoc } from '@/lib/api/model';

export default [
  {
    symbol: 'TextProperties',
    summary:
      'The styles a Text is drawn with. Every field is optional on construction.',
    members: {
      family: {
        description:
          'Any CSS font-family list. Default <code>"sans-serif"</code>.',
      },
      size: { description: 'Font size in pixels. Default <code>12</code>.' },
      leading: {
        description:
          'Line height as a unitless multiplier, or a string in px or %. Default <code>1.5</code>; keep it above 1.',
      },
      fill: { description: 'Text colour. Default <code>"#000"</code>.' },
      style: {
        description:
          '<code>"normal"</code> or <code>"italic"</code>. Default <code>"normal"</code>.',
      },
      weight: {
        description: 'A number or string, as in CSS. Default <code>400</code>.',
      },
      padding: {
        description:
          'Space around the text in pixels, on every side. Default <code>0</code>.',
      },
      paddingTop: { description: 'Per-side override.' },
      paddingRight: { description: 'Per-side override.' },
      paddingBottom: { description: 'Per-side override.' },
      paddingLeft: { description: 'Per-side override.' },
    },
  },
  {
    symbol: 'TextEvents',
    summary:
      'The events a Text emits: update, whenever its value or properties change.',
  },
  {
    symbol: 'TextBounds',
    summary: 'A rectangle in the atlas: x, y, width and height in pixels.',
  },
  {
    symbol: 'BlotterOptions',
    summary: 'Options for the Blotter constructor.',
    members: {
      texts: { description: 'A text or an array of texts to draw.' },
      ratio: {
        description:
          'Pixel ratio for every output canvas. Default: the device pixel ratio.',
      },
      autobuild: {
        description:
          'Build on construction and after changes. Default <code>true</code>.',
      },
      autostart: {
        description:
          'Start the render loop immediately. Default <code>true</code>.',
      },
      autoplay: {
        description:
          'New render scopes start playing. Default <code>true</code>.',
      },
    },
  },
  {
    symbol: 'BlotterEvents',
    summary:
      'The events a Blotter emits: ready after the first build, update after later rebuilds, render every frame with the frame count.',
  },
  {
    symbol: 'RenderScopeEvents',
    summary:
      'The events a RenderScope emits: ready, update and render for this text, plus the pointer events with a normalised position.',
  },
  {
    symbol: 'MaterialOptions',
    summary: 'Options for the Material constructor.',
    members: {
      mainImage: { description: 'The GLSL body. Omit for the passthrough.' },
      uniforms: { description: 'Uniform declarations by name.' },
    },
  },
  {
    symbol: 'MaterialEvents',
    summary:
      'The events a Material emits: update when the shader or uniform set changes, and update:uniform with the name of a uniform whose value changed.',
  },
  {
    symbol: 'UniformType',
    summary: 'The four GLSL vector sizes a uniform can have.',
  },
  {
    symbol: 'UniformValueMap',
    summary:
      'The value shape for each UniformType: a number for "1f", a tuple otherwise.',
  },
  {
    symbol: 'UniformDescriptor',
    summary:
      'What you write when declaring a uniform: a type and a matching initial value.',
    signature: `type UniformDescriptor =
  | { type: "1f"; value: number }
  | { type: "2f"; value: Vec2 }
  | { type: "3f"; value: Vec3 }
  | { type: "4f"; value: Vec4 }`,
  },
  {
    symbol: 'UniformMap',
    summary: 'Uniform descriptors keyed by name, as passed to a material.',
  },
  {
    symbol: 'UniformInterfaceMap',
    summary:
      'Live UniformInterface handles keyed by name, as read from material.uniforms.',
  },
  {
    symbol: 'Vec2',
    summary: 'A two-number tuple.',
  },
  {
    symbol: 'Vec3',
    summary: 'A three-number tuple.',
  },
  {
    symbol: 'Vec4',
    summary: 'A four-number tuple.',
  },
] satisfies SymbolDoc[];
