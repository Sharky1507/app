import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import type { LanguageSupport } from '@codemirror/language';
import {
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';

import { searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import type { EnvironmentVariable, TemplateFunction } from '@yaakapp/api';
import { graphql, graphqlLanguageSupport } from 'cm6-graphql';
import { EditorView } from 'codemirror';
import type { EditorProps } from './index';
import { pairs } from './pairs/extension';
import { text } from './text/extension';
import { twig } from './twig/extension';
import { url } from './url/extension';

export const syntaxHighlightStyle = HighlightStyle.define([
  {
    tag: [t.documentMeta, t.blockComment, t.lineComment, t.docComment, t.comment],
    color: 'var(--textSubtlest)',
    fontStyle: 'italic',
  },
  {
    tag: [t.paren, t.bracket, t.brace],
    color: 'var(--textSubtle)',
  },
  {
    tag: [t.link, t.name, t.tagName, t.angleBracket, t.docString, t.number],
    color: 'var(--info)',
  },
  { tag: [t.variableName], color: 'var(--success)' },
  { tag: [t.bool], color: 'var(--warning)' },
  { tag: [t.attributeName, t.propertyName], color: 'var(--primary)' },
  { tag: [t.attributeValue], color: 'var(--warning)' },
  { tag: [t.string], color: 'var(--notice)' },
  { tag: [t.atom, t.meta, t.operator, t.bool, t.null, t.keyword], color: 'var(--danger)' },
]);

const syntaxTheme = EditorView.theme({}, { dark: true });

const syntaxExtensions: Record<string, LanguageSupport> = {
  'application/graphql': graphqlLanguageSupport(),
  'application/json': json(),
  'application/javascript': javascript(),
  'text/html': xml(), // HTML as xml because HTML is oddly slow
  'application/xml': xml(),
  'text/xml': xml(),
  url: url(),
  pairs: pairs(),
};

export function getLanguageExtension({
  contentType,
  useTemplating = false,
  environmentVariables,
  autocomplete,
  templateFunctions,
  onClickVariable,
  onClickFunction,
  onClickMissingVariable,
}: {
  environmentVariables: EnvironmentVariable[];
  templateFunctions: TemplateFunction[];
  onClickFunction: (option: TemplateFunction, tagValue: string, startPos: number) => void;
  onClickVariable: (option: EnvironmentVariable, tagValue: string, startPos: number) => void;
  onClickMissingVariable: (name: string, tagValue: string, startPos: number) => void;
} & Pick<EditorProps, 'contentType' | 'useTemplating' | 'autocomplete'>) {
  const justContentType = contentType?.split(';')[0] ?? contentType ?? '';
  if (justContentType === 'application/graphql') {
    return graphql();
  }
  const base = syntaxExtensions[justContentType] ?? text();
  if (!useTemplating) {
    return base;
  }

  return twig({
    base,
    environmentVariables,
    templateFunctions,
    autocomplete,
    onClickFunction,
    onClickVariable,
    onClickMissingVariable,
  });
}

export const baseExtensions = [
  highlightSpecialChars(),
  history(),
  dropCursor(),
  drawSelection(),
  autocompletion({
    tooltipClass: () => 'x-theme-menu',
    closeOnBlur: true, // Set to `false` for debugging in devtools without closing it
    compareCompletions: (a, b) => {
      // Don't sort completions at all, only on boost
      return (a.boost ?? 0) - (b.boost ?? 0);
    },
  }),
  syntaxHighlighting(syntaxHighlightStyle),
  syntaxTheme,
  EditorState.allowMultipleSelections.of(true),
];

export const multiLineExtensions = [
  lineNumbers(),
  foldGutter({
    markerDOM: (open) => {
      const el = document.createElement('div');
      el.classList.add('fold-gutter-icon');
      el.tabIndex = -1;
      if (open) {
        el.setAttribute('data-open', '');
      }
      return el;
    },
  }),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLineGutter(),
  keymap.of([
    indentWithTab,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];
