import {
  Blotter,
  isWebGLSupported,
  type Material,
  type RenderScope,
  Text,
  type TextProperties,
} from "blotter.ts";
import { fontSpec, prefersReducedMotion, waitForFonts } from "./fonts";

export interface DemoOptions {
  el: HTMLElement;
  material: Material;
  value: string;
  props: Partial<TextProperties>;
}

export interface Demo {
  blotter: Blotter;
  scope: RenderScope;
  text: Text;
  destroy(): void;
}

// Plain text in place of a canvas; `data-fallback` switches the mount's styling.
function fallback(el: HTMLElement, value: string): null {
  el.replaceChildren();
  el.textContent = value;
  el.dataset.fallback = "true";
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
    const text = new Text(o.value, o.props);
    const blotter = new Blotter(o.material, { texts: text });
    const scope = blotter.forText(text);
    if (!scope) throw new Error("Blotter returned no render scope");

    scope.appendTo(o.el);
    await blotter.ready;

    if (prefersReducedMotion()) {
      const off = blotter.on("render", () => {
        off();
        blotter.stop();
      });
    }

    return {
      blotter,
      scope,
      text,
      destroy() {
        blotter.stop();
        blotter.teardown();
        scope.domElement.remove();
      },
    };
  } catch (error) {
    console.error(error);
    return fallback(o.el, o.value);
  }
}
