import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/theme-dark.js';

import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close-circle.js';
import '@spectrum-web-components/toast/sp-toast.js';

import { style } from './app.css.js';
import '../playbackcontrols/playbackcontrols.js';

import { TabsController } from '../../models/tabs.js';

import '../filetabs/filetabs.js';
import '../tools-bar/tools-bar.js';
import { renderTab, renderPanel } from '../../models/tabfactory.js';
import { Toast } from '@spectrum-web-components/bundle';

export class GlobalAlertEvent extends Event {
  constructor(public message: string) {
      super('alert', { bubbles: true, composed: true });
  }
}

@customElement('notespad-app')
export class App extends LitElement {

  static styles = style;

  tabsController = TabsController.attachHost(this);

  @query('sp-toast')
  protected toast?: Toast;

  @state()
  protected toastMessage?: string = undefined;

  constructor() {
      super();
      this.addEventListener('alert',((e: GlobalAlertEvent) => {
         this.toastMessage = e.message;
         if (this.toast) this.toast.open = true;
      }) as EventListener);
  }

  render() {
    return html`
        <sp-theme system="spectrum" color="dark" scale="medium">
          <notespad-playback-controls></notespad-playback-controls>
            <div id="tab-container">
                ${renderTab(this.tabsController.currentTab)}
                ${renderPanel(this.tabsController.currentTab)}
            </div>
            <notespad-file-tabs></notespad-file-tabs>
            <notespad-tools-bar></notespad-tools-bar>

            <sp-toast variant="info">${this.toastMessage}</sp-toast>
        </sp-theme>`;
  }

}