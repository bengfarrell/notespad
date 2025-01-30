import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close-circle.js';

import { style } from './filetabs.css.js';
import { TabsController } from '../../models/tabs.js';

@customElement('notespad-file-tabs')
export class FileTabs extends LitElement {

  static styles = style;

  tabsController = TabsController.attachHost(this);

  render() {
    return html`
        ${this.tabsController.tabs.map((tab, index) => html`
          <button 
              @click=${() => this.tabsController.currentTabByIndex = index}
              ?selected=${this.tabsController.currentTabIndex === index}>
            <span>${tab?.name || 'Start here'}</span>
            <sp-action-button @click=${() => this.tabsController.deleteTab(index)} size="xs" quiet>
                <sp-icon-close-circle slot="icon"></sp-icon-close-circle>
            </sp-action-button></button>
        </button>`)}`;
  }
}