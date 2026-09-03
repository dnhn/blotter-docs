import type { UniformType } from 'blotter.ts';
import type { MaterialClassName } from '@/data/materials';
import { MATERIAL_CLASSES } from '@/islands/material-registry';

/** Uniforms every material receives from the renderer; not part of a material's own API. */
const BUILT_IN = new Set([
  'uResolution',
  'uGlobalTime',
  'uTimeDelta',
  'uBlendColor',
  'uPixelRatio',
]);

export interface UniformSpec {
  name: string;
  type: UniformType;
  /** The library default, printed as JSON. */
  defaultValue: string;
}

/**
 * The uniforms a bundled material declares, read from a fresh instance at
 * build time. `Material` construction is DOM-free, so this runs in Node.
 */
export function materialUniforms(className: MaterialClassName): UniformSpec[] {
  const material = new MATERIAL_CLASSES[className]();
  return Object.entries(material.uniforms)
    .filter(([name]) => !BUILT_IN.has(name))
    .map(([name, uniform]) => ({
      name,
      type: uniform.type,
      defaultValue: JSON.stringify(uniform.value),
    }));
}
