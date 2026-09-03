import type { Section, SidebarGroup } from './nav';

export interface GuidePage {
  href: string;
  title: string;
  description: string;
  sections: readonly Section[];
}

export const GUIDE: readonly GuidePage[] = [
  {
    href: '/guide/getting-started',
    title: 'Getting started',
    description:
      'Install blotter.ts, put your first text on a canvas, and learn what happens underneath.',
    sections: [
      { id: 'why-blotter', title: 'Why Blotter' },
      { id: 'install', title: 'Install' },
      { id: 'first-text', title: 'Your first text' },
      { id: 'what-happened', title: 'What just happened' },
      { id: 'fonts', title: 'Fonts come first' },
      { id: 'where-next', title: 'Where next' },
    ],
  },
  {
    href: '/guide/texts-and-uniforms',
    title: 'Texts and uniforms',
    description:
      'Style texts, change them after the fact, and turn the dials on a running effect.',
    sections: [
      { id: 'text-properties', title: 'Text properties' },
      { id: 'changing-a-text', title: 'Changing a text' },
      { id: 'uniforms-are-live', title: 'Uniforms are live' },
      { id: 'per-text', title: 'Per-text overrides' },
      { id: 'pointer-events', title: 'Pointer events' },
      { id: 'lifecycle', title: 'Lifecycle' },
    ],
  },
  {
    href: '/guide/custom-materials',
    title: 'Custom materials',
    description:
      'Write your own effect as a Shadertoy-style fragment function, with uniforms you control.',
    sections: [
      { id: 'why-write-a-shader', title: 'Why write a shader' },
      { id: 'the-contract', title: 'The contract' },
      { id: 'first-material', title: 'A first material' },
      { id: 'declaring-uniforms', title: 'Declaring uniforms' },
      { id: 'shader-material', title: 'ShaderMaterial' },
      { id: 'subclassing', title: 'Subclassing' },
      { id: 'snippets', title: 'Shader snippets' },
      { id: 'gotchas', title: 'Gotchas' },
    ],
  },
  {
    href: '/guide/migrating',
    title: 'Migrating from Blotter.js',
    description:
      'Same renderer, new API. What changed, what stayed, and the classic example before and after.',
    sections: [
      { id: 'what-stayed', title: 'What stayed the same' },
      { id: 'what-changed', title: 'What changed' },
      { id: 'before-after', title: 'Before and after' },
      { id: 'behaviour-notes', title: 'Behaviour notes' },
      { id: 'credits', title: 'Credits' },
    ],
  },
];

export const guidePage = (href: string): GuidePage => {
  const page = GUIDE.find((p) => p.href === href);
  if (!page) throw new Error(`Unknown guide page ${href}`);
  return page;
};

export const guideGroups = (): SidebarGroup[] => [
  {
    label: 'Guide',
    items: GUIDE.map((p) => ({
      href: p.href,
      title: p.title,
      sections: p.sections,
    })),
  },
];
