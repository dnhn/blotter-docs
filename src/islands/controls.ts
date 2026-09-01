import type { Material, Vec2 } from "blotter.ts";
import { Pane } from "tweakpane";
import type { Control } from "@/data/materials";

/** Apply legacy `setImmediate` values so the first frame already uses them. */
export function applyInitialValues(
  material: Material,
  controls: Control[],
): void {
  for (const control of controls) {
    if (control.kind !== "float" || control.initial === undefined) continue;
    const uniform = material.uniforms[control.uniform];
    if (uniform) uniform.value = control.initial;
  }
}

export function bindControls(
  container: HTMLElement,
  material: Material,
  controls: Control[],
): Pane {
  const pane = new Pane({ container, title: "uniforms" });

  for (const control of controls) {
    const uniform = material.uniforms[control.uniform];
    if (!uniform) continue;

    if (control.kind === "float") {
      const state = { value: uniform.value as number };
      pane
        .addBinding(state, "value", {
          label: control.uniform,
          min: control.min,
          max: control.max,
          step: control.step ?? 0.001,
        })
        .on("change", (ev) => {
          uniform.value = ev.value;
        });
    } else if (control.kind === "bool") {
      const state = { value: (uniform.value as number) > 0 };
      pane
        .addBinding(state, "value", { label: control.uniform })
        .on("change", (ev) => {
          uniform.value = ev.value ? 1 : 0;
        });
    } else {
      const [x, y] = uniform.value as Vec2;
      const state = { value: { x, y } };
      pane
        .addBinding(state, "value", {
          label: control.uniform,
          x: { min: control.min, max: control.max },
          y: {
            min: control.min,
            max: control.max,
            inverted: control.invertY ?? false,
          },
          picker: "inline",
          expanded: true,
        })
        .on("change", (ev) => {
          uniform.value = [ev.value.x, ev.value.y];
        });
    }
  }

  return pane;
}
