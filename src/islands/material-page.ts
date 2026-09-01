import { DEMO_TEXT, materialBySlug } from "../data/materials";
import { applyInitialValues, bindControls } from "./controls";
import { createDemo } from "./demo";
import { cssFamily } from "./fonts";
import { MATERIAL_CLASSES } from "./material-registry";

async function mount(root: HTMLElement): Promise<void> {
  const entry = materialBySlug(root.dataset.material);
  const demoEl = root.querySelector<HTMLElement>("[data-demo]");
  const controlsEl = root.querySelector<HTMLElement>("[data-controls]");
  if (!entry || !demoEl || root.dataset.mounted) return;
  root.dataset.mounted = "true";

  const material = new MATERIAL_CLASSES[entry.className]();
  applyInitialValues(material, entry.controls);

  const demo = await createDemo({
    el: demoEl,
    material,
    value: "B",
    props: {
      ...DEMO_TEXT,
      family: cssFamily("--font-fraunces"),
      ...entry.demoText,
    },
  });

  if (demo && controlsEl) bindControls(controlsEl, material, entry.controls);
}

for (const root of document.querySelectorAll<HTMLElement>("[data-material]")) {
  mount(root).catch(console.error);
}
