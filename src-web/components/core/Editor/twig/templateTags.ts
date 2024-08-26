import { syntaxTree } from '@codemirror/language';
import type { Range } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view';
import { EditorView } from 'codemirror';
import type { TwigCompletionOption } from './completion';

class TemplateTagWidget extends WidgetType {
  readonly #clickListenerCallback: () => void;

  constructor(
    readonly option: TwigCompletionOption,
    readonly rawTag: string,
    readonly startPos: number,
  ) {
    super();
    this.#clickListenerCallback = () => {
      this.option.onClick?.(this.rawTag, this.startPos);
    };
  }

  eq(other: TemplateTagWidget) {
    return (
      this.option.name === other.option.name &&
      this.option.type === other.option.type &&
      this.option.value === other.option.value &&
      this.rawTag === other.rawTag &&
      this.startPos === other.startPos
    );
  }

  toDOM() {
    const elt = document.createElement('span');
    elt.className = `x-theme-templateTag template-tag ${
      this.option.invalid
        ? 'x-theme-templateTag--danger'
        : this.option.type === 'variable'
        ? 'x-theme-templateTag--primary'
        : 'x-theme-templateTag--info'
    }`;
    elt.title = this.option.invalid ? 'Not Found' : this.option.value ?? '';
    elt.setAttribute('data-tag-type', this.option.type);
    elt.textContent =
      this.option.type === 'variable'
        ? this.option.name
        : `${this.option.name}(${this.option.args.length ? '…' : ''})`;
    elt.addEventListener('click', this.#clickListenerCallback);
    return elt;
  }

  destroy(dom: HTMLElement) {
    dom.removeEventListener('click', this.#clickListenerCallback);
    super.destroy(dom);
  }

  ignoreEvent() {
    return false;
  }
}

function templateTags(
  view: EditorView,
  options: TwigCompletionOption[],
  onClickMissingVariable: (name: string, rawTag: string, startPos: number) => void,
): DecorationSet {
  const widgets: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        if (node.name == 'Tag') {
          // Don't decorate if the cursor is inside the match
          for (const r of view.state.selection.ranges) {
            if (r.from > node.from && r.to < node.to) {
              return;
            }
          }

          const rawTag = view.state.doc.sliceString(node.from, node.to);

          // TODO: Search `node.tree` instead of using Regex here
          const inner = rawTag.replace(/^\$\{\[\s*/, '').replace(/\s*]}$/, '');
          const name = inner.match(/(\w+)[(]/)?.[1] ?? inner;
          let option = options.find((v) => v.name === name);

          if (option == null) {
            option = {
              invalid: true,
              type: 'variable',
              name: inner,
              value: null,
              label: inner,
              onClick: () => onClickMissingVariable(name, rawTag, node.from),
            };
          }

          const widget = new TemplateTagWidget(option, rawTag, node.from);
          const deco = Decoration.replace({ widget, inclusive: true });
          widgets.push(deco.range(node.from, node.to));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

export function templateTagsPlugin(
  options: TwigCompletionOption[],
  onClickMissingVariable: (name: string, tagValue: string, startPos: number) => void,
) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = templateTags(view, options, onClickMissingVariable);
      }

      update(update: ViewUpdate) {
        this.decorations = templateTags(update.view, options, onClickMissingVariable);
      }
    },
    {
      decorations(v) {
        return v.decorations;
      },
      provide(plugin) {
        return EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        });
      },
      eventHandlers: {
        mousedown(e) {
          const target = e.target as HTMLElement;
          if (target.classList.contains('template-tag')) console.log('CLICKED TEMPLATE TAG');
          // return toggleBoolean(view, view.posAtDOM(target));
        },
      },
    },
  );
}
