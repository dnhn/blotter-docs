import type { JSONOutput } from 'typedoc';
import {
  type ApiMember,
  type ApiModel,
  type ApiSymbol,
  type EntryName,
  KIND,
  type MemberKind,
  type SymbolKind,
} from './model';
import { commentHtml, renderType, toSignature } from './render-type';

const ENTRIES: Record<string, EntryName> = {
  index: 'blotter.ts',
  materials: 'blotter.ts/materials',
};

export const kebab = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function symbolKind(kind: number): SymbolKind | undefined {
  switch (kind) {
    case KIND.Class:
      return 'class';
    case KIND.Function:
      return 'function';
    case KIND.Namespace:
      return 'namespace';
    case KIND.Interface:
      return 'interface';
    case KIND.TypeAlias:
      return 'type';
    case KIND.Variable:
      return 'variable';
    default:
      return undefined;
  }
}

function memberKind(kind: number): MemberKind | undefined {
  switch (kind) {
    case KIND.Constructor:
      return 'constructor';
    case KIND.Property:
      return 'property';
    case KIND.Accessor:
      return 'accessor';
    case KIND.Method:
      return 'method';
    case KIND.Variable:
      return 'variable';
    default:
      return undefined;
  }
}

/** Where each kind of symbol lives on the site. */
export function hrefFor(
  kind: SymbolKind,
  name: string,
  entry: EntryName,
): string {
  if (entry === 'blotter.ts/materials') return `/api/materials#${name}`;
  switch (kind) {
    case 'class':
      return `/api/${kebab(name)}`;
    case 'function':
      return `/api/functions#${name}`;
    case 'namespace':
      return '/api/shaders';
    default:
      return `/api/types#${name}`;
  }
}

const ORDER: Record<MemberKind, number> = {
  constructor: 0,
  property: 1,
  accessor: 1,
  variable: 1,
  method: 2,
};

export function normalise(
  project: JSONOutput.ProjectReflection,
  libraryVersion: string,
): ApiModel {
  const shells: { ref: JSONOutput.DeclarationReflection; sym: ApiSymbol }[] =
    [];
  const hrefById = new Map<number, string>();

  for (const mod of project.children ?? []) {
    const entry = ENTRIES[mod.name];
    if (!entry) continue;
    for (const ref of mod.children ?? []) {
      const kind = symbolKind(ref.kind);
      if (!kind) continue;
      const href = hrefFor(kind, ref.name, entry);
      hrefById.set(ref.id, href);
      shells.push({
        ref,
        sym: {
          name: ref.name,
          slug: kebab(ref.name),
          kind,
          entry,
          href,
          typeParams: (ref.typeParameters ?? []).map((t) => t.name),
          signatures: [],
          members: [],
          comment: commentHtml(ref.comment),
        },
      });
    }
  }

  const resolve = (id: number) => hrefById.get(id);

  for (const { ref, sym } of shells) {
    sym.extends = ref.extendedTypes?.length
      ? ref.extendedTypes.flatMap((t, i) => [
          ...(i ? [{ text: ', ' }] : []),
          ...renderType(t, resolve),
        ])
      : undefined;
    sym.type = ref.type ? renderType(ref.type, resolve) : undefined;
    sym.signatures = (ref.signatures ?? []).map((s) => toSignature(s, resolve));

    const members: ApiMember[] = [];
    for (const child of ref.children ?? []) {
      const kind = memberKind(child.kind);
      if (!kind || child.flags.isPrivate || child.flags.isProtected) continue;
      const getter = child.getSignature;
      members.push({
        name: child.name,
        kind,
        type: getter
          ? renderType(getter.type, resolve)
          : child.type
            ? renderType(child.type, resolve)
            : undefined,
        signatures: (child.signatures ?? []).map((s) =>
          toSignature(s, resolve),
        ),
        readonly:
          Boolean(child.flags.isReadonly) ||
          (kind === 'accessor' && !child.setSignature),
        optional: Boolean(child.flags.isOptional),
        settable: kind === 'accessor' ? Boolean(child.setSignature) : undefined,
        inheritedFrom: child.inheritedFrom?.name,
        comment:
          commentHtml(child.comment) ??
          commentHtml(getter?.comment) ??
          commentHtml(child.signatures?.[0]?.comment),
      });
    }
    members.sort((a, b) => {
      const byKind = ORDER[a.kind] - ORDER[b.kind];
      if (byKind) return byKind;
      return (
        Number(Boolean(a.inheritedFrom)) - Number(Boolean(b.inheritedFrom))
      );
    });
    sym.members = members;
  }

  return { libraryVersion, symbols: shells.map((s) => s.sym) };
}
