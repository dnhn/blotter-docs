import {
  Blotter,
  isWebGLSupported,
  type Material,
  type RenderScope,
  Text,
  type TextProperties,
} from 'blotter.ts';
import { fontSpec, prefersReducedMotion, waitForFonts } from './fonts';
import { onThemeChange, readColor, toVec4 } from './theme';
import { watchVisibility } from './visibility';

export interface DemoOptions {
  el: HTMLElement;
  material: Material;
  value: string;
  props: Partial<TextProperties>;
  /** Stop the loop while the mount is scrolled out of view. */
  pauseOffscreen?: boolean;
}

export interface Demo {
  blotter: Blotter;
  scope: RenderScope;
  text: Text;
  destroy(): void;
}

const live = new Set<Demo>();

/**
 * Re-rasterise texts in the current theme's ink and composite against its
 * paper. Blotter bakes `fill` into the atlas, so a theme change is a rebuild;
 * property writes coalesce, so many texts still cost one build.
 */
export async function retint(
  blotter: Blotter,
  texts: readonly Text[],
): Promise<void> {
  const fill = readColor('--ink');
  for (const text of texts) text.properties = { ...text.properties, fill };
  const blend = blotter.material.uniforms.uBlendColor;
  if (blend) blend.value = toVec4(readColor('--paper'));
  await blotter.update();
  renderOnce(blotter);
}

onThemeChange(() => {
  for (const demo of live)
    retint(demo.blotter, [demo.text]).catch(console.error);
});

/**
 * Draw one frame on a stopped instance. `stop()` clears `autostart`, so a
 * uniform or property change under reduced motion would otherwise stay
 * invisible until the loop runs again.
 */
export function renderOnce(blotter: Blotter): void {
  if (blotter.autostart) return;
  const off = blotter.on('render', () => {
    off();
    blotter.stop();
  });
  blotter.start();
}

// Plain text in place of a canvas; `data-fallback` switches the mount's styling.
function fallback(el: HTMLElement, value: string): null {
  el.replaceChildren();
  el.textContent = value;
  el.dataset.fallback = 'true';
  return null;
}

/**
 * The one contract every canvas on the site uses: wait for the font,
 * build a single-text Blotter, append its canvas, resolve when ready.
 * Returns null (and renders plain text) when WebGL is unavailable.
 */
export async function createDemo(o: DemoOptions): Promise<Demo | null> {
  if (!isWebGLSupported()) return fallback(o.el, o.value);
  await waitForFonts([fontSpec(o.props)], o.value);

  try {
    const text = new Text(o.value, { fill: readColor('--ink'), ...o.props });
    const blotter = new Blotter(o.material, { texts: text });
    const scope = blotter.forText(text);
    if (!scope) throw new Error('Blotter returned no render scope');

    const blend = o.material.uniforms.uBlendColor;
    if (blend) blend.value = toVec4(readColor('--paper'));

    scope.appendTo(o.el);
    await blotter.ready;

    let unwatch = () => {};
    if (prefersReducedMotion()) {
      const off = blotter.on('render', () => {
        off();
        blotter.stop();
      });
    } else if (o.pauseOffscreen) {
      unwatch = watchVisibility(
        o.el,
        () => blotter.start(),
        () => blotter.stop(),
      );
    }

    const demo: Demo = {
      blotter,
      scope,
      text,
      destroy() {
        live.delete(demo);
        unwatch();
        blotter.stop();
        blotter.teardown();
        scope.domElement.remove();
      },
    };
    live.add(demo);
    return demo;
  } catch (error) {
    console.error(error);
    return fallback(o.el, o.value);
  }
}
