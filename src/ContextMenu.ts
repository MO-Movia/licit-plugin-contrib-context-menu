// Always needs this, as application loads this styles.
//import '../style/contextmenu.css';
import {EditorView} from 'prosemirror-view';
import {Action, CMGroup, CMElement} from '@modusoperandi/licit-defs';

const CONTXTMENU = 'context-menu';
const SPAN = 'span';
const DIV = 'div';
const UL = 'ul';
const LI = 'li';
const NONE = 'none';
const SCROLLCLASS = 'context-menu-scroll';
const MOUSEDOWN = 'mousedown';
const KEYDOWN = 'keydown';

export class ContextMenu {
  groups: CMGroup[];
  dom: HTMLElement;
  view: EditorView;

  constructor(view: EditorView) {
    this.view = view;
    this.groups = [];
    this.dom = document.createElement(DIV);
    this.dom.appendChild(document.createElement(UL));
  }

  addGroups(groups: CMGroup[]): void {
    groups.forEach((group) => this.addGroup(group));
  }

  addGroup(group: CMGroup): void {
    const div = document.createElement(DIV);
    if (div) {
      if (group.scrollable) {
        div.className = SCROLLCLASS;
      }
      if (group.elements) {
        this.addItems(group.elements, div);
      }
      if (group.endHR) {
        this.addSeparator(div);
      }
      this.dom.childNodes[0].appendChild(div);
    }
    this.groups.push(group);
  }

  addItems(items: CMElement[], div: HTMLElement): void {
    items.forEach((item) => this.addItem(item, div));
  }

  addItemText(name: string, li: HTMLElement): void {
    const span = document.createElement(SPAN);
    if (span) {
      span.className = 'context-menu-item-name';
      if (name) {
        span.textContent = name;
        span.title = name;
      }
      li.appendChild(span);
    }
  }

  addSubMenuItem(groups: CMGroup[], li: HTMLElement): void {
    const arrow = document.createElement(SPAN);
    if (arrow) {
      arrow.className = 'arrow';
      this.createHTMLFragment('&#9658;', arrow);
      li.appendChild(arrow);
    }

    const submenu = new ContextMenu(this.view);
    submenu.addGroups(groups);

    submenu.dom.style.display = NONE;

    li.appendChild(submenu.dom);
  }

  registerEvents(item: CMElement, li: HTMLElement): void {
    li.onmouseover = function () {
      (li.getElementsByClassName(CONTXTMENU)[0] as HTMLElement).style.display =
        '';
    };
    li.onmouseout = function () {
      (li.getElementsByClassName(CONTXTMENU)[0] as HTMLElement).style.display =
        NONE;
    };
    li.onmousedown = item.defaultAction;
  }

  addSeparator(div: HTMLElement): void {
    const hr = document.createElement(SPAN);
    if (hr) {
      hr.className = 'hr';
      this.createHTMLFragment('<hr />', hr);
      div.appendChild(hr);
    }
  }

  addActions(actions: Action[], li: HTMLElement): void {
    actions.forEach((action) => this.addAction(action, li));
  }

  addAction(action: Action, li: HTMLElement): void {
    const span = document.createElement('span');
    if (span) {
      span.className = 'img';
      const image = document.createElement('img');
      if (image) {
        image.className = 'btn';
        image.id = action.tooltip ? action.tooltip : '';
        image.src = action.image ? action.image : '';
        image.onmousedown = action.handler;
        span.appendChild(image);
      }
      li.appendChild(span);
    }
  }

  addItem(item: CMElement, div: HTMLElement): void {
    const li = document.createElement(LI);
    if (li) {
      this.addItemText(item.name, li);

      if (item.submenu) {
        this.addSubMenuItem(item.submenu, li);
      }

      this.registerEvents(item, li);

      if (item.actions) {
        this.addActions(item.actions, li);
      }

      div.appendChild(li);
    }
  }

  createHTMLFragment(html: string, ele: HTMLElement): void {
    const fragment = document.createDocumentFragment();
    const parser = new DOMParser();
    const htmlNode = parser.parseFromString(
      `<${SPAN}>${html}</${SPAN}>`,
      'text/html'
    );
    if (htmlNode.documentElement) {
      const elements = htmlNode.documentElement.querySelectorAll(SPAN);
      elements.forEach((element) => {
        fragment.appendChild(element);
      });
      ele.appendChild(fragment);
    }
  }

  showMenu(event: Event): void {
    if (event.preventDefault) {
      event.preventDefault();
    }

    // set x and y position of context menu
    if (event instanceof MouseEvent) {
      const offset = 4;
      const position = this.getPosition(event);
      const positionX = position.x;
      const positionY = position.y;
      const menuWidth = this.dom.offsetWidth + offset;
      const menuHeight = this.dom.offsetHeight + offset;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (windowWidth - positionX < menuWidth) {
        this.dom.style.left = String(windowWidth - menuWidth) + 'px';
      } else {
        this.dom.style.left = String(positionX) + 'px';
      }

      const offsetTop = 30;
      if (windowHeight - positionY < menuHeight) {
        this.dom.style.top =
          String(windowHeight - menuHeight - offsetTop) + 'px';
      } else {
        this.dom.style.top = String(positionY - offsetTop) + 'px';
      }
      const offsetHeight = 150;
      this.dom.style.maxHeight = String(windowHeight - offsetHeight) + 'px';
      document.addEventListener(MOUSEDOWN, this.hideMenu.bind(this));
    }
    document.addEventListener(KEYDOWN, this.hideMenu.bind(this));
  }

  // get the position to show context menu
  getPosition(e: MouseEvent): {x: number; y: number} {
    let posX = 0;
    let posY = 0;
    if (e.pageX || e.pageY) {
      posX = e.pageX;
      posY = e.pageY;
    } else if (e.clientX || e.clientY) {
      posX =
        e.clientX +
        (document.body ? document.body.scrollLeft : 0) +
        (document.documentElement ? document.documentElement.scrollLeft : 0);
      posY =
        e.clientY +
        (document.body ? document.body.scrollTop : 0) +
        (document.documentElement ? document.documentElement.scrollTop : 0);
    }
    return {
      x: posX,
      y: posY,
    };
  }

  hideMenu(e: Event): void {
    const tgtEle = e.target;
    if (tgtEle instanceof HTMLElement && SCROLLCLASS === tgtEle.className) {
      e.preventDefault();
      return;
    }
    if (this.dom && this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
      const timeout = 100;
      // To retain Cursor position after closing the context menu
      window.setTimeout(() => {
        this.view.focus();
        return true;
      }, timeout);
    }
    document.removeEventListener(MOUSEDOWN, this.hideMenu);
    document.removeEventListener(KEYDOWN, this.hideMenu);
  }
}
