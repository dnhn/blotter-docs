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
      /** Value applied before the first render. */
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
  /** A few words under the name in the gallery. */
  tagline: string;
  /** One sentence; the page's meta description. */
  description: string;
  controls: Control[];
  tileText?: Partial<TextProperties>;
  demoText?: Partial<TextProperties>;
}

/** "B" in the materials grid tiles. `family` and `fill` are resolved at runtime. */
export const TILE_TEXT: Partial<TextProperties> = {
  size: 96,
  leading: '96px',
  paddingTop: 40,
  paddingRight: 56,
  paddingBottom: 24,
  paddingLeft: 56,
};

/** The word in the banner of each material page; `size` follows the container. */
export const DEMO_TEXT: Partial<TextProperties> = {
  leading: 1.2,
  paddingTop: 40,
  paddingRight: 72,
  paddingBottom: 40,
  paddingLeft: 72,
};

export const materials: MaterialEntry[] = [
  {
    slug: 'channel-split',
    tagline: 'RGB channels drift apart',
    name: 'ChannelSplitMaterial',
    className: 'ChannelSplitMaterial',
    description:
      'Splits the red, green and blue channels of your text and lets them drift apart along an angle you choose, with an optional motion blur.',
    controls: [
      { kind: 'float', uniform: 'uOffset', min: 0, max: 1, initial: 0.0175 },
      { kind: 'float', uniform: 'uRotation', min: 0, max: 360 },
      { kind: 'bool', uniform: 'uApplyBlur' },
      { kind: 'bool', uniform: 'uAnimateNoise' },
    ],
  },
  {
    slug: 'flies',
    tagline: 'Text as a restless swarm',
    name: 'FliesMaterial',
    className: 'FliesMaterial',
    description:
      'Redraws your text as a swarm of points that wander their own cells and part around a position you feed them.',
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
    tagline: 'A pool-bottom ripple',
    name: 'LiquidDistortMaterial',
    className: 'LiquidDistortMaterial',
    description:
      'Bends your text through a slow field of noise, like tiles seen through moving water.',
    controls: [
      { kind: 'float', uniform: 'uSpeed', min: 0, max: 5 },
      { kind: 'float', uniform: 'uVolatility', min: 0, max: 1 },
      { kind: 'float', uniform: 'uSeed', min: 0, max: 20 },
    ],
  },
  {
    slug: 'rolling-distort',
    tagline: 'A wave rolls through',
    name: 'RollingDistortMaterial',
    className: 'RollingDistortMaterial',
    description:
      'Rolls a wave across your text with finer noise underneath, like the picture on a failing television.',
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
    tagline: 'Panes that slide and split',
    name: 'SlidingDoorMaterial',
    className: 'SlidingDoorMaterial',
    description:
      'Cuts your text into panes that slide out of their frames and back, one after another, without end.',
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
