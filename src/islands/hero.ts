import {
  Blotter,
  isWebGLSupported,
  type RenderScope,
  Text,
  type TextProperties,
} from 'blotter.ts';
import { ChannelSplitMaterial } from 'blotter.ts/materials';
import { heroLayouts } from '@/data/hero-layouts';
import { retint } from './demo';
import {
  cssFamily,
  debounce,
  FACE,
  prefersReducedMotion,
  WEIGHT,
  waitForFonts,
} from './fonts';
import { onThemeChange, readColor, toVec4 } from './theme';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
/** Thirteen sizes, smallest to largest; the layouts below expect this order. */
const SIZES = [17, 17, 26, 26, 26, 26, 78, 78, 78, 104, 104, 156, 208];
/** The layouts were drawn for a band this wide; sizes scale with it. */
const DESIGN_WIDTH = 900;

function shuffle<T>(input: readonly T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}

const pick = <T>(list: readonly T[]): T =>
  list[Math.floor(Math.random() * list.length)] as T;

interface Center {
  scope: RenderScope;
  x: number;
  y: number;
}

async function mountHero(el: HTMLElement): Promise<void> {
  if (el.dataset.mounted) return;
  el.dataset.mounted = 'true';

  if (!isWebGLSupported()) {
    el.dataset.fallback = 'true';
    el.textContent = 'B';
    return;
  }

  const family = cssFamily(FACE.body);
  const base: Partial<TextProperties> = {
    family,
    weight: WEIGHT.bodySemibold,
    leading: 1,
    fill: readColor('--ink'),
    paddingLeft: 60,
    paddingRight: 60,
    paddingTop: 50,
    paddingBottom: 50,
  };

  const scale = Math.min(1.2, Math.max(0.55, el.clientWidth / DESIGN_WIDTH));
  const sizes = SIZES.map((size) => Math.max(12, Math.round(size * scale)));

  await waitForFonts(
    [...new Set(sizes)].map(
      (size) => `${WEIGHT.bodySemibold} ${size}px ${family}`,
    ),
    LETTERS.join(''),
  );

  const texts = shuffle(LETTERS)
    .slice(0, sizes.length)
    .map((letter, i) => new Text(letter, { ...base, size: sizes[i] }));

  const material = new ChannelSplitMaterial();
  const blend = material.uniforms.uBlendColor;
  if (blend) blend.value = toVec4(readColor('--paper'));
  const blotter = new Blotter(material, { texts });
  onThemeChange(() => retint(blotter, texts).catch(console.error));
  const scopes = texts
    .map((text) => blotter.forText(text))
    .filter((scope): scope is RenderScope => scope !== undefined);

  const layout = pick(heroLayouts);
  scopes.forEach((scope, i) => {
    const position = layout[i];
    if (!position) return;
    scope.domElement.style.left = position[0];
    scope.domElement.style.top = position[1];
    scope.appendTo(el);
  });

  await blotter.ready;

  let centers: Center[] = [];
  const pageSize = () => ({
    w: document.documentElement.scrollWidth,
    h: document.documentElement.scrollHeight,
  });

  const measure = () => {
    const { w, h } = pageSize();
    centers = scopes.map((scope) => {
      const r = scope.domElement.getBoundingClientRect();
      return {
        scope,
        x: (r.left + window.scrollX + r.width / 2) / w,
        y: (r.top + window.scrollY + r.height / 2) / h,
      };
    });
  };

  // Aim every letter's channel split at a page-normalised point.
  const aim = (px: number, py: number) => {
    for (const { scope, x, y } of centers) {
      const angle = (Math.atan2(py - y, px - x) * 180) / Math.PI + 180;
      // Legacy formula: the split widens with distance, capped at 0.2.
      const blur = Math.min(0.2, Math.hypot(px - x, py - y));
      const uniforms = scope.material.uniforms;
      if (uniforms.uRotation) uniforms.uRotation.value = angle;
      if (uniforms.uOffset) uniforms.uOffset.value = blur;
    }
  };

  measure();
  const { w, h } = pageSize();
  const rect = el.getBoundingClientRect();
  aim(
    (rect.left + window.scrollX + rect.width / 2) / w,
    (rect.top + window.scrollY + rect.height / 2) / h,
  );

  if (prefersReducedMotion()) {
    const off = blotter.on('render', () => {
      off();
      blotter.stop();
    });
    return;
  }

  window.addEventListener('resize', debounce(measure, 250));
  document.addEventListener('mousemove', (event) => {
    const size = pageSize();
    aim(event.pageX / size.w, event.pageY / size.h);
  });
}

for (const el of document.querySelectorAll<HTMLElement>('[data-hero]')) {
  mountHero(el).catch(console.error);
}
