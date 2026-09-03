import type { SymbolDoc } from '@/lib/api/model';

const material = (symbol: string, summary: string): SymbolDoc => ({
  symbol,
  summary,
  members: {
    constructor: {
      description: '<p>No arguments. Set uniforms after construction.</p>',
    },
  },
});

export default [
  material(
    'ChannelSplitMaterial',
    'Lets the red, green and blue channels drift apart along an angle, with an optional motion blur.',
  ),
  material(
    'FliesMaterial',
    'Redraws the text as a swarm of points that can dodge a position you feed it.',
  ),
  material(
    'LiquidDistortMaterial',
    'Bends the text through a slow field of noise, like tiles under water.',
  ),
  material(
    'RollingDistortMaterial',
    'Rolls a wave across the text with finer noise underneath, like a failing television.',
  ),
  material(
    'SlidingDoorMaterial',
    'Cuts the text into panes that slide out of their frames and back, one after another.',
  ),
] satisfies SymbolDoc[];
