import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { basicSetup } from 'codemirror';

// Editor theme from the site tokens in global.css; follows light/dark.
const theme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--code-bg)',
    color: 'var(--code-fg)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-code)',
    maxWidth: '100%',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    lineHeight: '1.6',
  },
  '.cm-content': {
    caretColor: 'var(--code-fg)',
    padding: '20px 0',
  },
  '.cm-line': {
    padding: '0 20px',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--code-bg)',
    borderRight: '1px solid var(--rule)',
    color: 'var(--ink-3)',
    minWidth: '2.5rem',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    minWidth: '2.5rem',
    padding: '0 8px 0 4px',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--code-line)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--code-line)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
    {
      backgroundColor: 'var(--selection)',
    },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--code-fg)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--code-line)',
    outline: '1px solid var(--ink-3)',
  },
  '@media (width < 768px)': {
    '.cm-gutters': {
      display: 'none',
    },
  },
});

const highlight = HighlightStyle.define([
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment],
    color: 'var(--code-comment)',
    fontStyle: 'italic',
  },
  { tag: [tags.keyword, tags.operatorKeyword], color: 'var(--code-keyword)' },
  {
    tag: [tags.string, tags.special(tags.string)],
    color: 'var(--code-string)',
  },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--code-number)' },
  { tag: [tags.punctuation, tags.separator], color: 'var(--ink-2)' },
]);

export function mountEditor(
  parent: HTMLElement,
  doc: string,
  onChange: (doc: string) => void,
): EditorView {
  parent.replaceChildren();
  return new EditorView({
    parent,
    doc,
    extensions: [
      basicSetup,
      javascript(),
      theme,
      syntaxHighlighting(highlight),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString());
      }),
    ],
  });
}
