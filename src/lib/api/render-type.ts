import type { JSONOutput } from 'typedoc';
import type { Param, Signature, TypeToken } from './model';

export type Resolver = (id: number) => string | undefined;

const join = (parts: TypeToken[][], sep: string): TypeToken[] =>
  parts.flatMap((p, i) => (i ? [{ text: sep }, ...p] : p));

const literal = (value: unknown): string => {
  if (value && typeof value === 'object' && 'value' in value) {
    const big = value as { value: string; negative?: boolean };
    return `${big.negative ? '-' : ''}${big.value}n`;
  }
  return JSON.stringify(value);
};

/** Flatten a TypeDoc type into tokens, linking references to documented symbols. */
export function renderType(
  t: JSONOutput.SomeType | undefined,
  resolve: Resolver,
): TypeToken[] {
  if (!t) return [{ text: 'unknown' }];
  const r = (x: JSONOutput.SomeType | undefined) => renderType(x, resolve);

  switch (t.type) {
    case 'intrinsic':
      return [{ text: t.name }];
    case 'literal':
      return [{ text: literal(t.value) }];
    case 'reference': {
      const head: TypeToken = {
        text: t.package === 'three' ? `THREE.${t.name}` : t.name,
      };
      if (typeof t.target === 'number') head.href = resolve(t.target);
      const out = [head];
      if (t.typeArguments?.length) {
        out.push({ text: '<' }, ...join(t.typeArguments.map(r), ', '), {
          text: '>',
        });
      }
      return out;
    }
    case 'union':
      return join(t.types.map(r), ' | ');
    case 'intersection':
      return join(t.types.map(r), ' & ');
    case 'array': {
      const el = r(t.elementType);
      const wrap = t.elementType.type === 'union';
      return wrap
        ? [{ text: '(' }, ...el, { text: ')[]' }]
        : [...el, { text: '[]' }];
    }
    case 'tuple':
      return [
        { text: '[' },
        ...join((t.elements ?? []).map(r), ', '),
        { text: ']' },
      ];
    case 'namedTupleMember':
      return [
        { text: `${t.name}${t.isOptional ? '?' : ''}: ` },
        ...r(t.element),
      ];
    case 'optional':
      return [...r(t.elementType), { text: '?' }];
    case 'rest':
      return [{ text: '...' }, ...r(t.elementType)];
    case 'typeOperator':
      return [{ text: `${t.operator} ` }, ...r(t.target)];
    case 'indexedAccess':
      return [
        ...r(t.objectType),
        { text: '[' },
        ...r(t.indexType),
        { text: ']' },
      ];
    case 'query':
      return [{ text: 'typeof ' }, ...r(t.queryType)];
    case 'predicate':
      return t.targetType
        ? [{ text: `${t.name} is ` }, ...r(t.targetType)]
        : [{ text: t.name }];
    case 'mapped':
      return [
        { text: `{ [${t.parameter} in ` },
        ...r(t.parameterType),
        { text: ']: ' },
        ...r(t.templateType),
        { text: ' }' },
      ];
    case 'conditional':
      return [
        ...r(t.checkType),
        { text: ' extends ' },
        ...r(t.extendsType),
        { text: ' ? ' },
        ...r(t.trueType),
        { text: ' : ' },
        ...r(t.falseType),
      ];
    case 'templateLiteral':
      return [{ text: '`…`' }];
    case 'reflection':
      return renderDeclaration(t.declaration, resolve);
    case 'inferred':
      return [{ text: `infer ${t.name}` }];
    case 'unknown':
      return [{ text: t.name }];
    default:
      return [{ text: 'unknown' }];
  }
}

function renderDeclaration(
  d: JSONOutput.DeclarationReflection,
  resolve: Resolver,
): TypeToken[] {
  const first = d.signatures?.[0];
  if (first && !d.children?.length) {
    return [
      { text: '(' },
      ...renderParams(first, resolve),
      { text: ') => ' },
      ...renderType(first.type, resolve),
    ];
  }
  const out: TypeToken[] = [{ text: '{ ' }];
  (d.children ?? []).forEach((c, i) => {
    if (i) out.push({ text: '; ' });
    out.push({ text: `${c.name}${c.flags.isOptional ? '?' : ''}: ` });
    const sig = c.signatures?.[0];
    if (sig) {
      out.push(
        { text: '(' },
        ...renderParams(sig, resolve),
        { text: ') => ' },
        ...renderType(sig.type, resolve),
      );
    } else {
      out.push(...renderType(c.type, resolve));
    }
  });
  out.push({ text: ' }' });
  return out;
}

export function renderParams(
  s: JSONOutput.SignatureReflection,
  resolve: Resolver,
): TypeToken[] {
  return join(
    (s.parameters ?? []).map((p) => [
      {
        text: `${p.flags.isRest ? '...' : ''}${p.name}${p.flags.isOptional ? '?' : ''}: `,
      },
      ...renderType(p.type, resolve),
    ]),
    ', ',
  );
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Typographic apostrophes for prose lifted from the library's doc comments. */
const curlyApostrophes = (s: string): string =>
  s.replace(/(?<=[A-Za-z])'(?=[A-Za-z])/g, '\u2019');

/** A TypeDoc comment summary as a small HTML fragment. */
export function commentHtml(
  comment: JSONOutput.Comment | undefined,
): string | undefined {
  if (!comment?.summary?.length) return undefined;
  return comment.summary
    .map((part) => {
      if (part.kind === 'code') {
        return `<code>${escapeHtml(part.text.replace(/^`|`$/g, ''))}</code>`;
      }
      if (part.kind === 'inline-tag')
        return `<code>${escapeHtml(part.text)}</code>`;
      return curlyApostrophes(escapeHtml(part.text));
    })
    .join('')
    .trim();
}

export function toSignature(
  s: JSONOutput.SignatureReflection,
  resolve: Resolver,
): Signature {
  const params: Param[] = (s.parameters ?? []).map((p) => ({
    name: p.name,
    type: renderType(p.type, resolve),
    optional: Boolean(p.flags.isOptional),
    rest: Boolean(p.flags.isRest),
    defaultValue: p.defaultValue,
    comment: commentHtml(p.comment),
  }));
  return {
    params,
    returns: renderType(s.type, resolve),
    typeParams: (s.typeParameters ?? []).map((tp) => tp.name),
    comment: commentHtml(s.comment),
  };
}
