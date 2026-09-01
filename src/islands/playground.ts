import * as core from 'blotter.ts';
import * as mats from 'blotter.ts/materials';
import { debounce } from './fonts';

type Modules = Record<string, object>;

/**
 * A module map whose `Blotter` records every instance it creates, so a
 * re-run can tear down the previous run's canvases before building new ones.
 */
function createModules(live: Set<core.Blotter>): Modules {
  class TrackedBlotter extends core.Blotter {
    constructor(...args: ConstructorParameters<typeof core.Blotter>) {
      super(...args);
      live.add(this);
    }
  }
  return {
    'blotter.ts': { ...core, Blotter: TrackedBlotter },
    'blotter.ts/materials': { ...mats },
  };
}

const MODULE_NAMES = ['blotter.ts', 'blotter.ts/materials'];
const IMPORT_RE =
  /^\s*import\s+(type\s+)?(\{[^}]*\})\s*from\s*["']([^"']+)["'];?/gm;

/** Rewrite the two supported `import { … } from` forms into destructuring. */
export function rewriteImports(src: string): string {
  const out = src.replace(
    IMPORT_RE,
    (_match, isType: string | undefined, names: string, spec: string) => {
      if (isType) return '';
      if (!MODULE_NAMES.includes(spec)) {
        throw new Error(
          `Unknown module "${spec}". Available: ${MODULE_NAMES.join(', ')}`,
        );
      }
      return `const ${names.replace(/\s+as\s+/g, ': ')} = __modules[${JSON.stringify(spec)}];`;
    },
  );
  if (/^\s*import\s/m.test(out)) {
    throw new Error(
      'Only `import { ... } from "blotter.ts" | "blotter.ts/materials"` is supported.',
    );
  }
  return out;
}

type AsyncFunctionConstructor = new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

const AsyncFunction = Object.getPrototypeOf(async () => {})
  .constructor as AsyncFunctionConstructor;

interface Runner {
  run(src: string): Promise<void>;
}

function createRunner(output: HTMLElement, errorEl: HTMLElement): Runner {
  const live = new Set<core.Blotter>();
  const modules = createModules(live);

  return {
    async run(src) {
      for (const blotter of live) {
        blotter.stop();
        blotter.teardown();
      }
      live.clear();
      output.replaceChildren();
      errorEl.textContent = '';
      errorEl.hidden = true;

      try {
        const body = rewriteImports(src);
        await document.fonts.ready;
        await new AsyncFunction('__modules', 'output', body)(modules, output);
      } catch (error) {
        errorEl.hidden = false;
        errorEl.textContent =
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error);
        console.error(error);
      }
    },
  };
}

function mount(root: HTMLElement): void {
  if (root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  const pre = root.querySelector('pre');
  const editorEl = root.querySelector<HTMLElement>('[data-editor]');
  const output = root.querySelector<HTMLElement>('[data-output]');
  const errorEl = root.querySelector<HTMLElement>('[data-error]');
  if (!pre || !editorEl || !output || !errorEl) return;

  const code = (pre.textContent ?? '').replace(/\n$/, '');
  const runner = createRunner(output, errorEl);
  let current = code;

  // Canvas first, editor later: the static <pre> is enough to run.
  void runner.run(code);

  import('./playground-editor')
    .then(({ mountEditor }) => {
      mountEditor(
        editorEl,
        code,
        debounce((next: string) => {
          if (next === current) return;
          current = next;
          void runner.run(next);
        }, 800),
      );
    })
    .catch(console.error);
}

for (const root of document.querySelectorAll<HTMLElement>(
  '[data-playground]',
)) {
  mount(root);
}
