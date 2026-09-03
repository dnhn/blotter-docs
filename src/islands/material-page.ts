import { DEMO_TEXT, materialBySlug } from '@/data/materials';
import { applyInitialValues, bindControls } from './controls';
import { createDemo, renderOnce } from './demo';
import { cssFamily, debounce, FACE } from './fonts';
import { MATERIAL_CLASSES } from './material-registry';

const DEMO_WORD = 'Blotter';

/** Banner type size from the banner width: big, but never clipped. */
const sizeFor = (width: number): number =>
  Math.round(Math.min(150, Math.max(56, width / 6)));

async function mount(root: HTMLElement): Promise<void> {
  const entry = materialBySlug(root.dataset.material);
  const demoEl = root.querySelector<HTMLElement>('[data-demo]');
  const controlsEl = root.querySelector<HTMLElement>('[data-controls]');
  if (!entry || !demoEl || root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  const material = new MATERIAL_CLASSES[entry.className]();
  applyInitialValues(material, entry.controls);

  const demo = await createDemo({
    el: demoEl,
    material,
    value: DEMO_WORD,
    props: {
      ...DEMO_TEXT,
      family: cssFamily(FACE.display),
      size: sizeFor(demoEl.clientWidth),
      ...entry.demoText,
    },
  });
  if (!demo) return;

  if (controlsEl)
    bindControls(controlsEl, demo.blotter, material, entry.controls);

  window.addEventListener(
    'resize',
    debounce(() => {
      const size = sizeFor(demoEl.clientWidth);
      if (size === demo.text.properties.size) return;
      demo.text.properties = { ...demo.text.properties, size };
      demo.blotter.update().then(() => renderOnce(demo.blotter));
    }, 250),
  );
}

for (const root of document.querySelectorAll<HTMLElement>('[data-material]')) {
  mount(root).catch(console.error);
}
