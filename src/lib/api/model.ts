/** Typed view of the TypeDoc JSON in src/generated/api.json, plus the prose overlay. */

export const KIND = {
  Module: 2,
  Namespace: 4,
  Variable: 32,
  Function: 64,
  Class: 128,
  Interface: 256,
  Constructor: 512,
  Property: 1024,
  Method: 2048,
  Accessor: 262144,
  TypeAlias: 2097152,
} as const;

export type EntryName = 'blotter.ts' | 'blotter.ts/materials';
export type SymbolKind =
  | 'class'
  | 'function'
  | 'namespace'
  | 'type'
  | 'interface'
  | 'variable';
export type MemberKind =
  | 'constructor'
  | 'property'
  | 'accessor'
  | 'method'
  | 'variable';

/** A piece of a rendered type: plain text, or a link to another symbol. */
export interface TypeToken {
  text: string;
  href?: string;
}

export interface Param {
  name: string;
  type: TypeToken[];
  optional: boolean;
  rest: boolean;
  defaultValue?: string;
  comment?: string;
}

export interface Signature {
  params: Param[];
  returns: TypeToken[];
  typeParams: string[];
  comment?: string;
}

/** Prose for one member, written in src/data/api. */
export interface MemberDoc {
  description: string;
  example?: string;
  see?: readonly string[];
}

/** Prose for one exported symbol, written in src/data/api. */
export interface SymbolDoc {
  symbol: string;
  summary: string;
  intro?: string;
  example?: string;
  members?: Record<string, MemberDoc>;
  /** Members to leave out of the page (internal plumbing without an @internal tag). */
  hidden?: readonly string[];
  /** Internal plumbing: members may go undocumented without a build warning. */
  plumbing?: boolean;
  /** Overrides the printed type of a type alias whose real shape is unreadable. */
  signature?: string;
}

export interface ApiMember {
  name: string;
  kind: MemberKind;
  type?: TypeToken[];
  signatures: Signature[];
  readonly: boolean;
  optional: boolean;
  /** Accessors: whether a setter exists. */
  settable?: boolean;
  inheritedFrom?: string;
  comment?: string;
  doc?: MemberDoc;
}

export interface ApiSymbol {
  name: string;
  slug: string;
  kind: SymbolKind;
  entry: EntryName;
  /** Where this symbol is documented. */
  href: string;
  extends?: TypeToken[];
  typeParams: string[];
  /** Type aliases: the aliased type. */
  type?: TypeToken[];
  /** Functions: overloads. */
  signatures: Signature[];
  members: ApiMember[];
  comment?: string;
  doc?: SymbolDoc;
}

export interface ApiModel {
  libraryVersion: string;
  symbols: ApiSymbol[];
}
