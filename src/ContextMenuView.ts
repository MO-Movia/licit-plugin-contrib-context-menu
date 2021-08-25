import {Plugin, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {CMGroup} from '@modusoperandi/licit-defs';
import {ContextMenu} from './ContextMenu';

export class ContextMenuView {
  contextMenu: ContextMenu;

  constructor(view: EditorView) {
    this.contextMenu = new ContextMenu(view);
    view.dom.parentNode.appendChild(this.contextMenu.dom);
    this.update(view);
  }

  update(view: EditorView): void {
    view.state.plugins.forEach((plugin) => this.addCM(plugin, view.state.tr));
  }

  addCM(plugin: Plugin, tr: Transaction): void {
    const groups = tr.getMeta(plugin) as CMGroup[];
    this.contextMenu.addGroups(groups);
  }

  destroy(): void {
    this.contextMenu.dom.remove();
  }
}
