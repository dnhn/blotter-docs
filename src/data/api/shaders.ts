import type { SymbolDoc } from '@/lib/api/model';

const snippet = (description: string) => ({
  description: `<p>${description}</p>`,
});

export default {
  symbol: 'shaders',
  summary:
    'GLSL helpers as strings, ready to interpolate at the top of a mainImage. The bundled materials are built from them.',
  intro:
    '<p>Each export is a string of GLSL function declarations. Put it before your <code>mainImage</code> in the shader body and call the functions it defines. Expand a snippet below to read exactly what it declares.</p>',
  members: {
    blending: snippet(
      'Photoshop-style blend modes as functions of two colours: <code>normalBlend</code>, <code>multiplyBlend</code>, <code>screenBlend</code>, <code>overlayBlend</code> and more.',
    ),
    blinnPhongSpecular: snippet(
      'A Blinn-Phong specular term for faking a highlight on the text.',
    ),
    easing: snippet(
      'The Penner easing curves (<code>quadraticIn</code>, <code>cubicInOut</code>, <code>elasticOut</code>…) for shaping time.',
    ),
    gamma: snippet(
      'sRGB to linear and back: <code>toLinear</code> and <code>toGamma</code>.',
    ),
    inf: snippet('A large constant standing in for infinity.'),
    lineMath: snippet(
      'Distance from a point to a line or segment, projections, and intersections.',
    ),
    map: snippet('Remap a value from one range to another.'),
    noise: snippet('One-dimensional value noise.'),
    noise2d: snippet(
      'Two-dimensional simplex noise: <code>snoise(vec2)</code>.',
    ),
    noise3d: snippet(
      'Three-dimensional simplex noise: <code>snoise(vec3)</code>. The usual choice for animating a 2D field over time.',
    ),
    noise4d: snippet(
      'Four-dimensional simplex noise: <code>snoise(vec4)</code>.',
    ),
    pi: snippet(
      '<code>PI</code>, <code>TWO_PI</code> and <code>HALF_PI</code>.',
    ),
    random: snippet(
      'A hash-based pseudo-random number for a <code>vec2</code> seed.',
    ),
  },
} satisfies SymbolDoc;
