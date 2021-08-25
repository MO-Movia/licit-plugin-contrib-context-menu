// A generic Context Menu ProseMirror Plugin
// [FS] IRAD-1528 2021-08-02
import {EditorView} from '@remirror/pm/view';
import {Schema} from 'prosemirror-model';
import {Plugin, PluginKey, Transaction} from 'prosemirror-state';
import {ContextMenuView} from './ContextMenuView';
const CMKEY = 'context-menu';

export default class ContextMenuPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey(CMKEY),
      view(editorView: EditorView) {
        return new ContextMenuView(editorView);
      },
      props: {
        handleClick(view: EditorView): boolean {
          view.state.plugins.forEach((plugin) =>
            (this as ContextMenuPlugin).handleMouseClick(plugin, view.state.tr)
          );
          return false;
        },
      },
    });
  }

  handleMouseClick(plugin: Plugin, tr: Transaction): void {
    console.log('handleMouseClick' + plugin + ' ' + tr);
  }

  // Plugin method that supplies plugin schema to editor
  getEffectiveSchema(schema: Schema): Schema {
    return schema;
  }
}
