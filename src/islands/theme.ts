export type Theme = 'light' | 'dark';

const KEY = 'theme';
const media = matchMedia('(prefers-color-scheme: dark)');

export function storedTheme(): Theme | undefined {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : undefined;
  } catch {
    return undefined;
  }
}

const systemTheme = (): Theme => (media.matches ? 'dark' : 'light');

/** The theme in effect: the `data-theme` attribute, else the OS preference. */
export function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return attr === 'dark' || attr === 'light' ? attr : systemTheme();
}

function announce(theme: Theme): void {
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

/** Choose a theme explicitly and remember it. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage may be unavailable; the attribute still applies for this page.
  }
  document.documentElement.dataset.theme = theme;
  announce(theme);
}

/** Runs `cb` after every theme change, including OS changes when nothing is stored. */
export function onThemeChange(cb: (theme: Theme) => void): () => void {
  const onEvent = () => cb(currentTheme());
  // With no stored choice the attribute stays off and CSS already follows the
  // OS; the islands only need telling. Pinning the attribute here would freeze
  // a value the browser may still correct.
  const onMedia = () => {
    if (!storedTheme()) announce(systemTheme());
  };
  document.addEventListener('themechange', onEvent);
  media.addEventListener('change', onMedia);
  return () => {
    document.removeEventListener('themechange', onEvent);
    media.removeEventListener('change', onMedia);
  };
}

let probe: HTMLElement | undefined;

/** A colour token resolved for the current theme, as `rgb(r, g, b)`. */
export function readColor(
  token: '--ink' | '--paper' | '--surface' | '--accent',
): string {
  if (!probe) {
    probe = document.createElement('span');
    probe.hidden = true;
    document.body.append(probe);
  }
  probe.style.color = `var(${token})`;
  return getComputedStyle(probe).color;
}

const channels = (rgb: string): number[] =>
  (rgb.match(/[\d.]+/g) ?? ['0', '0', '0'])
    .slice(0, 3)
    .map((n) => Number(n) / 255);

export const toVec3 = (rgb: string): [number, number, number] => {
  const [r = 0, g = 0, b = 0] = channels(rgb);
  return [r, g, b];
};

export const toVec4 = (rgb: string): [number, number, number, number] => [
  ...toVec3(rgb),
  1,
];
