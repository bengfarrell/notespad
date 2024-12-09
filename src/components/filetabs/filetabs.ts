import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close-circle.js';

import { style } from './filetabs.css.js';
import { AppController } from '../../models/app.js';

@customElement('notespad-file-tabs')
export class FileTabs extends LitElement {

  static styles = style;

  appController = AppController.attachHost(this);

  render() {
    return html`
        ${this.appController.tracks.map((track, index) => html`
          <button 
              @click=${() => this.appController.currentTrackByIndex = index}
              ?selected=${this.appController.currentTrackIndex === index}>
            <span>${track.name}</span>
            <sp-action-button @click=${() => this.appController.deleteTrack(index)} size="xs" quiet>
                <sp-icon-close-circle slot="icon"></sp-icon-close-circle>
            </sp-action-button></button>
        </button>`)}`;
  }
}