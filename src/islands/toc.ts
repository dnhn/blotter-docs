/**
 * Marks the sidebar anchor for the section currently under the masthead.
 * Plain scroll maths rather than an IntersectionObserver: headings are short
 * and unevenly spaced, and "the last heading you passed" is what a reader
 * expects to see highlighted.
 */

const CURRENT = 'location';

interface Entry {
  link: HTMLAnchorElement;
  target: HTMLElement;
}

function mount(list: HTMLElement): void {
  if (list.dataset.mounted) return;
  list.dataset.mounted = 'true';

  const entries: Entry[] = [];
  for (const link of list.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    const id = decodeURIComponent(link.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) entries.push({ link, target });
  }
  if (!entries.length) return;

  // The sticky masthead (4rem) plus a little breathing room.
  const OFFSET = 64 + 24;

  let current: HTMLAnchorElement | undefined;
  const select = (link: HTMLAnchorElement | undefined) => {
    if (link === current) return;
    current?.removeAttribute('aria-current');
    link?.setAttribute('aria-current', CURRENT);
    current = link;
  };

  let queued = false;
  const update = () => {
    queued = false;
    const line = window.scrollY + OFFSET;
    // Past the end of the page the last section is the one being read.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    let active: Entry | undefined = atBottom ? entries.at(-1) : undefined;
    if (!active) {
      for (const entry of entries) {
        // Document coordinates: `offsetTop` would be relative to the nearest
        // positioned ancestor, which is the page's <main>.
        const top = entry.target.getBoundingClientRect().top + window.scrollY;
        if (top <= line) active = entry;
        else break;
      }
    }
    select(active?.link);
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

for (const list of document.querySelectorAll<HTMLElement>('[data-toc]')) {
  mount(list);
}

// No imports, so mark the file a module: island scripts otherwise share one
// global scope and their `mount` declarations collide.
export {};
