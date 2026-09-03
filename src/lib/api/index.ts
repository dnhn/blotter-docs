import pkg from 'blotter.ts/package.json';
import type { JSONOutput } from 'typedoc';
import type { Section, SidebarGroup } from '@/data/nav';
import generated from '@/generated/api.json';
import type { ApiModel, ApiSymbol } from './model';
import { normalise } from './normalise';
import { attachOverlays } from './overlay';

interface Generated {
  meta: { libraryVersion: string; generatedAt: string };
  project: JSONOutput.ProjectReflection;
}

let cached: ApiModel | undefined;

/** The documented API: TypeDoc signatures plus the prose overlay. Built once per build. */
export function api(): ApiModel {
  if (!cached) {
    const data = generated as unknown as Generated;
    cached = attachOverlays(
      normalise(data.project, data.meta.libraryVersion),
      pkg.version,
    );
  }
  return cached;
}

export const symbolByName = (name: string): ApiSymbol | undefined =>
  api().symbols.find((s) => s.name === name);

export const symbolBySlug = (slug: string): ApiSymbol | undefined =>
  api().symbols.find(
    (s) => s.slug === slug && s.kind === 'class' && s.entry === 'blotter.ts',
  );

/** Documented classes with their own page, in sidebar order. */
export const CORE = [
  'Blotter',
  'Text',
  'Material',
  'ShaderMaterial',
  'RenderScope',
  'UniformInterface',
];
export const PLUMBING = ['Mapping', 'MappingMaterial'];

const pick = (names: readonly string[]): ApiSymbol[] =>
  names.map((n) => symbolByName(n)).filter((s): s is ApiSymbol => Boolean(s));

export const coreClasses = (): ApiSymbol[] => pick(CORE);
export const plumbingClasses = (): ApiSymbol[] => pick(PLUMBING);
export const functions = (): ApiSymbol[] =>
  api().symbols.filter((s) => s.kind === 'function');
export const types = (): ApiSymbol[] =>
  api().symbols.filter((s) => s.kind === 'type' || s.kind === 'interface');
export const materialClasses = (): ApiSymbol[] =>
  api().symbols.filter((s) => s.entry === 'blotter.ts/materials');
export const shadersNamespace = (): ApiSymbol | undefined =>
  symbolByName('shaders');

const memberSections = (sym: ApiSymbol): Section[] =>
  sym.members.map((m) => ({ id: m.name, title: m.name }));

/** Sidebar for every /api page. */
export function apiGroups(): SidebarGroup[] {
  const classItem = (s: ApiSymbol) => ({
    href: s.href,
    title: s.name,
    sections: memberSections(s),
  });
  return [
    { label: 'API', items: [{ href: '/api', title: 'Overview' }] },
    { label: 'Core', items: coreClasses().map(classItem) },
    { label: 'Plumbing', items: plumbingClasses().map(classItem) },
    {
      label: 'Reference',
      items: [
        {
          href: '/api/functions',
          title: 'Functions',
          sections: functions().map((f) => ({ id: f.name, title: f.name })),
        },
        {
          href: '/api/shaders',
          title: 'Shaders',
          sections: (shadersNamespace()?.members ?? []).map((m) => ({
            id: m.name,
            title: m.name,
          })),
        },
        {
          href: '/api/types',
          title: 'Types',
          sections: types().map((t) => ({ id: t.name, title: t.name })),
        },
        {
          href: '/api/materials',
          title: 'Materials',
          sections: materialClasses().map((m) => ({
            id: m.name,
            title: m.name,
          })),
        },
      ],
    },
  ];
}

/** Link target for a symbol name, for "see also" lists. */
export const hrefForName = (name: string): string | undefined =>
  symbolByName(name)?.href;
