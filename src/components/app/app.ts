import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';

import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/theme-dark.js';

import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close-circle.js';

import { style } from './app.css.js';
import '../playbackcontrols/playbackcontrols.js';
import 'midi-sequence-timeline';
import { Playback } from 'midi-sequence-timeline/playback/timedplayback.js';

import { AppController } from '../../models/app.js';
import { MIDIFile, TimelineEvent } from 'midi-sequence-timeline';

import '../filetabs/filetabs.js';
import '../tools-bar/tools-bar.js';
import '../modals/modal.js';
import '../modals/import.js';
import '../modals/export.js';

@customElement('notespad-app')
export class App extends LitElement {

  static styles = style;

  appController = AppController.attachHost(this);
  playbackController = Playback.attachHost(this);

  @state()
  modal: string | undefined = undefined;

  constructor() {
      super();
      this.loadSample();
  }

  loadSample() {
      MIDIFile.Load('samples/cheers.mid').then(file => {
          this.appController.loadTrack(file.tracks[0].clone('Cheers'));
      });
  }

  render() {
    return html`
        <sp-theme system="spectrum" color="dark" scale="medium">
          <notespad-playback-controls></notespad-playback-controls>
          ${this.appController.currentTrack ? 
              html`<ms-timeline
                  @seek=${(e: TimelineEvent) => this.playbackController.seek(e.time)}
                  @rangeselect=${(e: TimelineEvent) => {
                      if (e.range) {
                          this.playbackController.loop(...e.range as [number, number]);   
                      } else {
                          this.playbackController.cancelLoop();
                      }
                      this.appController.selectedRange = e.range;
                    }}
                  ${ref(AppController.timelineRef)} 
                  .midiTrack=${this.appController.currentTrack}
                  .currentTime=${this.playbackController.currentTime}></ms-timeline>` : html`<div id="no-tracks-placeholder"></div>`}
            <notespad-file-tabs></notespad-file-tabs>
            <notespad-tools-bar></notespad-tools-bar>

            <div id="file-tray">
                <sp-button variant="primary">New</sp-button>
                <sp-button variant="primary" @click=${() => this.modal = 'import'}>Import</sp-button>
                <sp-button variant="primary" @click=${() => this.modal = 'export'}>Export</sp-button>
            </div>

            ${this.modal ? html`<notespad-modal @modalclose=${() => this.modal = undefined }>
                ${this.renderModal()}
            </notespad-modal>` : undefined}
        </sp-theme>`;
  }

  renderModal() {
    switch (this.modal) {
        case 'import':
            return html`<notespad-import-modal></notespad-import-modal>`;

        case 'export':
            return html`<notespad-export-modal></notespad-export-modal>`;
        default:
            return undefined;
    }
  }

}