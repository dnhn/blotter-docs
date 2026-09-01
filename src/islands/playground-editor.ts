import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { basicSetup } from 'codemirror';

// Legacy editor palette: everything #DCDCDC on #202020, comments #8E8E8E.
// Legacy editor palette via the Tailwind theme tokens in global.css.
const theme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--color-ink)',
      color: 'var(--color-editor-fg)',
      fontFamily: 'var(--font-ubuntu-mono)',
      fontSize: 'var(--text-editor)',
      maxWidth: '100%',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      lineHeight: '20px',
    },
    '.cm-content': {
      caretColor: 'var(--color-editor-fg)',
      padding: '26px 0',
      textShadow: '0 0 3px var(--color-editor-glow)',
    },
    '.cm-line': {
      padding: '0 26px',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--color-ink)',
      borderRight: '1px solid var(--color-editor-rule)',
      color: 'var(--color-editor-fg)',
      minWidth: '26px',
      paddingTop: '26px',
      textShadow: '0 0 4px #aaaaaa',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      minWidth: '26px',
      padding: '0 6px 0 4px',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--color-editor-line)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--color-editor-line)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'var(--color-editor-line)',
      },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--color-editor-fg)',
    },
    '.cm-matchingBracket': {
      backgroundColor: 'var(--color-editor-line)',
      outline: '1px solid var(--color-editor-muted)',
    },
    '@media (width < 728px)': {
      '.cm-gutters': {
        display: 'none',
      },
    },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment],
    color: '#8e8e8e',
  },
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
