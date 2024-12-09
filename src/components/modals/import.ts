import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/illustrated-message/sp-illustrated-message.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';

import { MIDIFile, MIDITrack } from 'midi-sequence-timeline';
import { AppController } from '../../models/app.js';
import { renderTrack } from '../../utils/render-track';

@customElement('notespad-import-modal')
export class ImportModal extends LitElement {

    file?: MIDIFile;

    thumbs: string[] = [];

    appController = AppController.attachHost(this);

    static styles = css`
        h2 {
            color: #a1a1a1;
        }
        ul {
            overflow: auto;
            list-style-type: none;
            padding: 0;
            width: 100%;
            height: calc(100% - 110px);
        }
        
        li {
            height: 75px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #1a1a1a;
            background-color: #242424;
            margin-bottom: 10px;
            display: flex;
        }
        
        li > div {
            width: 100%;
        }
        
        li sp-checkbox {
            margin-right: 20px;
        }
        
        li .midi-thumb {
            height: 30px;
            background-repeat: no-repeat;
        }
        
        li .label {
            color: #9a9a9a;
            padding-bottom: 5px;
        }

        li .label.lower {
            padding-top: 5px;
            font-size: 10px;
        }
        
        #lower-tray {
            width: 100%;
            display: flex;
            justify-content: flex-end;
        }
    `;

    constructor() {
        super();
        MIDIFile.Load('samples/cheers.mid').then((file) => {
            this.thumbs = [];
            this.file = file;
            this.file.tracks.forEach((track, index) => {
                renderTrack(track).then((thumb) => {
                    this.thumbs[index] = thumb;
                    this.requestUpdate();
                });
            });
            this.requestUpdate();
        });
    }

    render() {
        if (!this.file) {
            return html`
                <sp-illustrated-message
                        heading="Drag and Drop Your MIDI File"
                        description="load and select your track">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="150"
                         height="103"
                         viewBox="0 0 150 103">
                        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z"
                        ></path>
                    </svg>
                    <sp-button variant="primary" @click=${this.handleFileOpen.bind(this)}>Choose a file...</sp-button>
                </sp-illustrated-message>
            `
        } else {
            return html`<h2>Choose tracks to import:</h2>
                <ul>${this.file.tracks.map((track, index) => html`
                <li>
                    <sp-checkbox></sp-checkbox>
                    <div>
                        <div class="label">${track.name || `Untitled track #${index + 1}`}</div>
                        <div class="midi-thumb" style="background: url('${this.thumbs[index]}')"></div>
                        <div class="label lower">${Math.round(track.duration)} seconds | ${track.BPM}BPM | ${track.timeSignature.numerator}/${track.timeSignature.denominator}</div>
                    </div>
                </li>
            `)}</ul>
            <div id="lower-tray">
                <sp-button @click=${this.import.bind(this)}>Import</sp-button>
            </div>`;
        }
    }

    import() {
        const checkboxes = this.shadowRoot?.querySelectorAll('sp-checkbox');
        if (checkboxes) {
            const tracks: MIDITrack[] = [];
            checkboxes.forEach((checkbox, index) => {
                if (checkbox.checked) {
                    const clone = this.file?.tracks[index].clone(`Untitled track #${index + 1}`);
                    if (clone) tracks.push(clone);
                }
            });
            this.appController.loadTrack(tracks, true);
        }
        this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
    }


    async handleFileOpen(_file: string | File) {
        this.file = await MIDIFile.Load('samples/cheers.mid');
        /*if (typeof file === 'string') {
            this.file = await MIDIFile.Load(file);
            this.requestUpdate();
        } else {
            console.log('TODO: Loading MIDI file:', file);
        }*/
        this.requestUpdate();
    }

}