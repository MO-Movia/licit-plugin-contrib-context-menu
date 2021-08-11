// A generic Context Menu ProseMirror Plugin
// [FS] IRAD-1528 2021-08-02
import {Schema} from 'prosemirror-model';
import {Plugin, PluginKey} from 'prosemirror-state';
const CMKEY = 'context-menu';

export default class ContextMenuPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey(CMKEY),
    });
  }

  // Plugin method that supplies plugin schema to editor
  getEffectiveSchema(schema: Schema): Schema {
    return schema;
  }
}
