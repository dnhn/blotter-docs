import type { TextProperties } from 'blotter.ts';

export type MaterialClassName =
  | 'ChannelSplitMaterial'
  | 'FliesMaterial'
  | 'LiquidDistortMaterial'
  | 'RollingDistortMaterial'
  | 'SlidingDoorMaterial';

export type Control =
  | {
      kind: 'float';
      uniform: string;
      min: number;
      max: number;
      step?: number;
      /** Value applied before the first render (legacy `setImmediate`). */
      initial?: number;
    }
  | { kind: 'bool'; uniform: string }
  | {
      kind: 'vec2';
      uniform: string;
      min: number;
      max: number;
      /** Blotter UV space is bottom-up; invert the y axis of the picker. */
      invertY?: boolean;
    };

export interface MaterialEntry {
  slug: string;
  name: string;
  className: MaterialClassName;
  blurb: string;
  controls: Control[];
  tileText?: Partial<TextProperties>;
  demoText?: Partial<TextProperties>;
}

/** "B" in the materials grid tiles. `family` is resolved at runtime. */
export const TILE_TEXT: Partial<TextProperties> = {
  size: 68,
  leading: '68px',
  paddingTop: 26,
  paddingRight: 40,
  paddingBottom: 6,
  paddingLeft: 40,
  fill: '#202020',
};

/** Cropped "B" at the top of each material page. */
export const DEMO_TEXT: Partial<TextProperties> = {
  size: 187,
  leading: '187px',
  paddingTop: 126,
  paddingRight: 140,
  paddingBottom: 126,
  paddingLeft: 140,
  fill: '#202020',
};

export const materials: MaterialEntry[] = [
  {
    slug: 'channel-split',
    name: 'ChannelSplitMaterial',
    className: 'ChannelSplitMaterial',
    blurb:
      'Splits the red, green and blue channels of your text so they spread away from their original position, like a damaged VHS tape or the fringing of a projector.',
    controls: [
      { kind: 'float', uniform: 'uOffset', min: 0, max: 1, initial: 0.0175 },
      { kind: 'float', uniform: 'uRotation', min: 0, max: 360 },
      { kind: 'bool', uniform: 'uApplyBlur' },
      { kind: 'bool', uniform: 'uAnimateNoise' },
    ],
  },
  {
    slug: 'flies',
    name: 'FliesMaterial',
    className: 'FliesMaterial',
    blurb:
      'Veering in a tireless swarm, the FliesMaterial recreates your text as a cloud of animated points.',
    controls: [
      {
        kind: 'float',
        uniform: 'uPointCellWidth',
        min: 0,
        max: 0.1,
        initial: 0.012,
      },
      { kind: 'float', uniform: 'uPointRadius', min: 0, max: 1, initial: 0.85 },
      { kind: 'bool', uniform: 'uDodge' },
      {
        kind: 'vec2',
        uniform: 'uDodgePosition',
        min: 0,
        max: 1,
        invertY: true,
      },
      { kind: 'float', uniform: 'uDodgeSpread', min: 0, max: 1 },
      { kind: 'float', uniform: 'uSpeed', min: 0, max: 10, initial: 2 },
    ],
  },
  {
    slug: 'liquid-distort',
    name: 'LiquidDistortMaterial',
    className: 'LiquidDistortMaterial',
    blurb:
      'Like watching the tiles on the bottom of a swimming pool, the LiquidDistortMaterial washes over your text to apply a liquid-like distortion.',
    controls: [
      { kind: 'float', uniform: 'uSpeed', min: 0, max: 5 },
      { kind: 'float', uniform: 'uVolatility', min: 0, max: 1 },
      { kind: 'float', uniform: 'uSeed', min: 0, max: 20 },
    ],
  },
  {
    slug: 'rolling-distort',
    name: 'RollingDistortMaterial',
    className: 'RollingDistortMaterial',
    blurb:
      'A wave scrolls across your text in an endless loop, shoving the picture around as it moves, like the image on an old malfunctioning TV.',
    controls: [
      {
        kind: 'float',
        uniform: 'uSineDistortSpread',
        min: 0,
        max: 1,
        initial: 0.025,
      },
      { kind: 'float', uniform: 'uSineDistortCycleCount', min: 0, max: 7 },
      {
        kind: 'float',
        uniform: 'uSineDistortAmplitude',
        min: 0,
        max: 1,
        initial: 0.125,
      },
      { kind: 'float', uniform: 'uNoiseDistortVolatility', min: 0, max: 250 },
      { kind: 'float', uniform: 'uNoiseDistortAmplitude', min: 0, max: 1 },
      { kind: 'vec2', uniform: 'uDistortPosition', min: 0, max: 1 },
      { kind: 'float', uniform: 'uRotation', min: 0, max: 360 },
      { kind: 'float', uniform: 'uSpeed', min: 0, max: 10 },
    ],
  },
  {
    slug: 'sliding-door',
    name: 'SlidingDoorMaterial',
    className: 'SlidingDoorMaterial',
    blurb:
      'Multiplies your text into a series of segmented panes that slide in stunted progression, splitting and reorganising your text again and again.',
    controls: [
      {
        kind: 'float',
        uniform: 'uDivisions',
        min: 0,
        max: 30,
        step: 1,
        initial: 11,
      },
      { kind: 'float', uniform: 'uDivisionWidth', min: 0, max: 1 },
      { kind: 'bool', uniform: 'uAnimateHorizontal' },
      { kind: 'bool', uniform: 'uFlipAnimationDirection' },
      { kind: 'float', uniform: 'uSpeed', min: 0, max: 10 },
    ],
  },
];

export const materialBySlug = (
  slug: string | undefined,
): MaterialEntry | undefined => materials.find((m) => m.slug === slug);
