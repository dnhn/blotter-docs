/**
 * Site search over the Pagefind index that `pnpm build` writes to /pagefind.
 * The dialog is in Search.astro; this wires the trigger, shortcuts and results.
 */

interface SubResult {
  title: string;
  url: string;
  excerpt: string;
}

interface ResultData {
  url: string;
  meta: { title?: string };
  excerpt: string;
  sub_results: SubResult[];
}

interface Pagefind {
  init(): Promise<void>;
  search(
    query: string,
  ): Promise<{ results: { data(): Promise<ResultData> }[] }>;
}

const MAX_RESULTS = 8;
const MAX_SUB = 3;

let pagefind: Promise<Pagefind | null> | undefined;

function loadPagefind(): Promise<Pagefind | null> {
  pagefind ??= import(
    /* @vite-ignore */ `${window.location.origin}/pagefind/pagefind.js`
  )
    .then(async (mod: Pagefind) => {
      await mod.init();
      return mod;
    })
    .catch(() => null);
  return pagefind;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const stripHash = (url: string): string => url.replace(/\/$/, '');

function renderResults(
  container: HTMLElement,
  results: ResultData[],
  query: string,
): void {
  if (!results.length) {
    container.innerHTML = `<p class="px-3 py-6 text-center text-ink-3">Nothing for “${escapeHtml(query)}”.</p>`;
    return;
  }
  container.innerHTML = results
    .map((r) => {
      const title = escapeHtml(r.meta.title ?? r.url);
      const subs = r.sub_results
        .filter((s) => s.title !== r.meta.title)
        .slice(0, MAX_SUB)
        .map(
          (s) =>
            `<li><a href="${s.url}" class="block rounded-sm px-3 py-1.5 hover:bg-surface focus-visible:bg-surface"><span class="text-caption text-ink-2">${escapeHtml(s.title)}</span><span class="mt-0.5 block text-caption text-ink-3">${s.excerpt}</span></a></li>`,
        )
        .join('');
      return `<li class="mb-1"><a href="${stripHash(r.url)}" class="block rounded-sm px-3 py-2 hover:bg-surface focus-visible:bg-surface"><span class="font-medium text-ink">${title}</span><span class="mt-0.5 block text-caption text-ink-2">${r.excerpt}</span></a>${subs ? `<ul class="ml-3 list-none border-l border-rule p-0">${subs}</ul>` : ''}</li>`;
    })
    .join('');
}

function mount(dialog: HTMLDialogElement): void {
  if (dialog.dataset.mounted) return;
  dialog.dataset.mounted = 'true';

  const input = dialog.querySelector<HTMLInputElement>('[data-search-input]');
  const results = dialog.querySelector<HTMLElement>('[data-search-results]');
  if (!input || !results) return;

  let latest = 0;
  const run = async () => {
    const query = input.value.trim();
    const id = ++latest;
    if (!query) {
      results.innerHTML = '';
      return;
    }
    const pf = await loadPagefind();
    if (id !== latest) return;
    if (!pf) {
      results.innerHTML =
        '<p class="px-3 py-6 text-center text-ink-3">The search index is written by <code>pnpm build</code>. Run <code>pnpm preview</code> to try it.</p>';
      return;
    }
    const { results: hits } = await pf.search(query);
    const data = await Promise.all(
      hits.slice(0, MAX_RESULTS).map((h) => h.data()),
    );
    if (id !== latest) return;
    renderResults(results, data, query);
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });

  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    input.select();
    void loadPagefind();
  };

  for (const trigger of document.querySelectorAll<HTMLElement>(
    '[data-search-open]',
  )) {
    trigger.addEventListener('click', open);
  }

  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable ||
      target?.closest('.cm-editor');
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dialog.open ? dialog.close() : open();
    } else if (event.key === '/' && !typing && !dialog.open) {
      event.preventDefault();
      open();
    }
  });

  // Arrow keys move between results; Enter follows the focused link.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = [...results.querySelectorAll<HTMLAnchorElement>('a')];
    if (!links.length) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      event.key === 'ArrowDown'
        ? links[Math.min(index + 1, links.length - 1)]
        : index <= 0
          ? input
          : links[index - 1];
    next?.focus();
  });

  // Close on backdrop click.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

for (const dialog of document.querySelectorAll<HTMLDialogElement>(
  'dialog[data-search]',
)) {
  mount(dialog);
}

// No imports, so mark the file a module: island scripts otherwise share one
// global scope and their `mount` declarations collide.
export {};
