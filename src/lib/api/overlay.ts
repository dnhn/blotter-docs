import type { ApiModel, SymbolDoc } from './model';

type OverlayModule = SymbolDoc | readonly SymbolDoc[];

const modules = import.meta.glob<OverlayModule>('../../data/api/*.ts', {
  eager: true,
  import: 'default',
});

const STRICT = process.env.API_STRICT === '1';
const problems: string[] = [];

function warn(message: string): void {
  problems.push(message);
  console.warn(`[api] ${message}`);
}

/** Every overlay, keyed by symbol name. */
export function loadOverlays(): Map<string, SymbolDoc> {
  const docs = new Map<string, SymbolDoc>();
  for (const [file, mod] of Object.entries(modules)) {
    const list = Array.isArray(mod) ? mod : [mod as SymbolDoc];
    for (const doc of list) {
      if (docs.has(doc.symbol))
        warn(`${file}: duplicate overlay for ${doc.symbol}`);
      docs.set(doc.symbol, doc);
    }
  }
  return docs;
}

/** Attach prose to the model, warning about anything undocumented or misspelt. */
export function attachOverlays(
  model: ApiModel,
  installedVersion: string,
): ApiModel {
  const docs = loadOverlays();

  if (model.libraryVersion !== installedVersion) {
    warn(
      `api.json was generated from blotter.ts ${model.libraryVersion} but ${installedVersion} is installed; run \`pnpm api\``,
    );
  }

  for (const sym of model.symbols) {
    const doc = docs.get(sym.name);
    docs.delete(sym.name);
    if (!doc) {
      warn(`${sym.name}: no overlay in src/data/api`);
      continue;
    }
    sym.doc = doc;
    const hidden = new Set(doc.hidden ?? []);
    sym.members = sym.members.filter((m) => !hidden.has(m.name));

    const documented = new Set(Object.keys(doc.members ?? {}));
    for (const member of sym.members) {
      member.doc = doc.members?.[member.name];
      documented.delete(member.name);
      if (
        !member.doc &&
        !member.inheritedFrom &&
        !doc.plumbing &&
        sym.kind !== 'type' &&
        sym.kind !== 'interface'
      ) {
        warn(`${sym.name}.${member.name}: no description`);
      }
    }
    for (const stray of documented)
      warn(`${sym.name}.${stray}: overlay names a member that does not exist`);
  }
  for (const stray of docs.keys())
    warn(`overlay for ${stray} matches no exported symbol`);

  if (STRICT && problems.length) {
    throw new Error(`[api] ${problems.length} problem(s); see warnings above`);
  }
  return model;
}
