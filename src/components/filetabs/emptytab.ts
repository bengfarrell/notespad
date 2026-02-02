import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@spectrum-web-components/illustrated-message/sp-illustrated-message.js';

import { TabsController } from '../../models/tabs.js';
import { MIDIFile } from 'music-timeline';
import { AudioTrackTabConfig, MIDIFileTabConfig } from '../../models/tabfactory';

@customElement('notespad-tab-empty')
export class EmptyTab extends LitElement {
    static styles = css`
        input[type="file"] {    
            display: none;
        }

        sp-illustrated-message {
            border: 2px dashed transparent;
        }

        sp-illustrated-message[dragover] {
            border: 2px dashed #d1d1d1;
            background-color: #ffffff22;
            border-radius: 8px;
        }
        
        #no-tracks-placeholder {
            height: 100%;
            width: 100%;
            border-radius: 8px;
            background-color: #e5e5f7;
            background: repeating-linear-gradient(-45deg, #2f2f2f33, #2f2f2f33 5px, #80808033 5px, #80808033 25px);
        }
    `;

    @state()
    protected dragOver = false;

    render() {
        return html`<div id="no-tracks-placeholder">
            <sp-illustrated-message
                    ?dragover=${this.dragOver}
                    @drop=${this.dropHandler.bind(this)}
                    @dragover=${this.dragOverHandler.bind(this)}
                    @dragleave=${this.dragLeaveHandler.bind(this)}
                    heading="Drag and Drop Your File"
                    description="MP3 or MIDI are supported">
                <svg xmlns="http://www.w3.org/2000/svg"
                     width="150"
                     height="103"
                     viewBox="0 0 150 103">
                    <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z"
                    ></path>
                </svg>
                <sp-button variant="primary" @click=${() => this.shadowRoot?.querySelector('input')?.click()}>Choose a file...</sp-button>
            </sp-illustrated-message>
        </div><input type="file" id="file" @change=${this.handleFileOpen.bind(this)} accept=".mp3, .mid">`;
    }

    dragOverHandler(ev: DragEvent) {
        ev.preventDefault();
        this.dragOver = true;

    }

    dragLeaveHandler(ev: DragEvent) {
        ev.preventDefault();
        this.dragOver = false;
    }

    async dropHandler(ev: DragEvent) {
        ev.preventDefault();
        this.dragOver = false;

        if (ev.dataTransfer?.items[0]) {
            if (ev.dataTransfer?.items[0].kind === 'file') {
                const file = ev.dataTransfer?.items[0].getAsFile();
                if (file) await this.loadFile(file);
            }
        }
    }

    async handleFileOpen(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) await this.loadFile(file);
        this.requestUpdate();
    }

    async loadFile(file: File) {
        switch (file.type) {
            case 'audio/mpeg':
                const context = new AudioContext();
                file.arrayBuffer().then((buffer) => {
                    context.decodeAudioData(buffer).then(audioBuffer => {
                        TabsController.createTab(new AudioTrackTabConfig(file.name, audioBuffer, true));
                    });
                });
                break;
            case 'audio/midi':
                const midifile = await MIDIFile.Load(file);
                TabsController.createTab(new MIDIFileTabConfig(midifile.name, midifile));
                break;
        }
    }
}