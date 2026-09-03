import { materialBySlug, TILE_TEXT } from '@/data/materials';
import { createDemo } from './demo';
import { cssFamily, FACE } from './fonts';
import { MATERIAL_CLASSES } from './material-registry';

const family = cssFamily(FACE.display);

for (const el of document.querySelectorAll<HTMLElement>('[data-tile]')) {
  const entry = materialBySlug(el.dataset.tile);
  if (!entry || el.dataset.mounted) continue;
  el.dataset.mounted = 'true';

  const material = new MATERIAL_CLASSES[entry.className]();
  createDemo({
    el,
    material,
    value: 'B',
    props: { ...TILE_TEXT, family, ...entry.tileText },
    pauseOffscreen: true,
  }).catch(console.error);
}
