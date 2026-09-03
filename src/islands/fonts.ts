import type { TextProperties } from 'blotter.ts';

/** The three faces registered in astro.config.ts, by role. */
export const FACE = {
  display: '--font-face-display',
  body: '--font-face-body',
  mono: '--font-face-mono',
} as const;

/** Weights those faces are loaded at; Blotter must not ask for others. */
export const WEIGHT = {
  display: 400,
  body: 400,
  bodyMedium: 500,
  bodySemibold: 600,
} as const;

/** Resolve a font-family list from a CSS custom property on `:root`. */
export const cssFamily = (variable: string): string =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim() || 'sans-serif';

/** CSS `font` shorthand for `document.fonts.load()`. */
export const fontSpec = (props: Partial<TextProperties>): string =>
  `${props.style ?? 'normal'} ${props.weight ?? 400} ${props.size ?? 12}px ${props.family ?? 'sans-serif'}`;

/**
 * Blotter rasterises text at construction, so every face it needs must be
 * loaded first. The Fonts API only fetches a face on use; `load()` forces it.
 */
export async function waitForFonts(
  specs: string[],
  sample = 'blotter',
): Promise<void> {
  await Promise.all(
    specs.map((spec) => document.fonts.load(spec, sample).catch(() => [])),
  );
  await document.fonts.ready;
}

export const prefersReducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

const HASHED_FAMILY = /^(.+)-[0-9a-f]{16}$/;

/**
 * Astro's Fonts API registers each face under a hashed family name
 * (`Fraunces-14c6…`). Re-declare every such face under its plain name so
 * page code and the playground can say `family: "'EB Garamond', serif"`.
 */
export function ensureFontAliases(): void {
  if (document.head.querySelector('style[data-font-aliases]')) return;
  const rules: string[] = [];

  for (const sheet of document.styleSheets) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of cssRules) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const family = rule.style
        .getPropertyValue('font-family')
        .trim()
        .replace(/^"|"$/g, '');
      const match = HASHED_FAMILY.exec(family);
      if (!match?.[1]) continue;
      rules.push(
        rule.cssText.replace(
          /font-family:\s*[^;]+;/,
          `font-family: ${JSON.stringify(match[1])};`,
        ),
      );
    }
  }

  const style = document.createElement('style');
  style.dataset.fontAliases = 'true';
  style.textContent = rules.join('\n');
  document.head.append(style);
}

ensureFontAliases();
