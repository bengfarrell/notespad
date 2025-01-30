import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { property } from 'lit/decorators.js';

import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-download.js';

import { Demucs, ProgressEvent, CompleteEvent, LogEvent } from 'demucs-wasm';
import { TabsController } from '../../models/tabs.js';
import { AppController } from '../../models/app.js';
import { GlobalAlertEvent } from '../app/app.js';
import { defaultPitchDetectOptions, extractPitch, pitchDetectToMIDITrack, trimAudioBuffer } from '../../utils/audio.js';
import { AudioMultiTrackTabConfig, AudioTrackTabConfig, MIDITrackTabConfig } from '../../models/tabfactory.js';
import * as lame from '@breezystack/lamejs';

@customElement('notespad-panel-audiotrack')
export class AudioTrackPanel extends LitElement {
    static styles = css``;

    @property()
    guid: string = '';

    @state()
    protected isProcessing = false;

    @state()
    progress = 0;

    protected tabsController = TabsController.attachHost(this);
    protected appController = AppController.attachHost(this);

    handleSeparate(model: string) {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;


        const buffer = this.appController.selectedRange ? trimAudioBuffer(tabData.buffer,
                this.appController.selectedRange[0],
                this.appController.selectedRange[1]) : tabData.buffer;

        // Separate the audio track from the timeline
        const dmx = new Demucs(model, './workers/worker.js', 'https://d3pt2wmrvq3ftf.cloudfront.net/demucs/models/');
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);

        dmx.addEventListener('ready', () => {
            dmx.process([leftChannel, rightChannel]);
            this.isProcessing = true;
            this.progress = 0;
        });

        dmx.addEventListener('progress', (e: ProgressEvent ) => {
            this.progress = e.progress * 100;
        });

        dmx.addEventListener('log', (e: LogEvent ) => {
            console.log(e.message);
        });

        dmx.addEventListener('complete', (e: CompleteEvent) => {
            const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;
            this.dispatchEvent(new GlobalAlertEvent(`Audio named ${tabData.name} has been separated into ${e.audio.length} tracks`));
            this.isProcessing = false;

            const tracks = e.audio.map((audio, index) => {
                let stemName = '';
                switch (index) {
                    case 0:
                        stemName = model === 'demucs-free-6s' ? stemName = 'drums' : 'vocals';
                        break;
                    case 1:
                        stemName = model === 'demucs-free-6s' ? stemName = 'bass' : 'karaoke mix';
                        break;
                    case 2:
                        stemName = 'other';
                        break;
                    case 3:
                        stemName = 'vocals';
                        break;
                }
                const buffer = new AudioBuffer({
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    length: audio.left.length });
                buffer.getChannelData(0).set(audio.left);
                buffer.getChannelData(1).set(audio.right);
                return { name: `${tabData.name} - ${stemName}`, buffer };
            });
            TabsController.createTab(new AudioMultiTrackTabConfig((tabData.name || `Untitled audio`) + '- separated', tracks));
        });
    }

    async handlePitch() {
        this.isProcessing = true;
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;


        const pitchDetection = await extractPitch(tabData.buffer, this);
        const track = pitchDetectToMIDITrack(pitchDetection, defaultPitchDetectOptions);
        this.isProcessing = false;
        TabsController.createTab(new MIDITrackTabConfig(tabData.name || `Untitled audio`, track, pitchDetection));
    }

    async handleDownload() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;
        const mp3encoder = new lame.Mp3Encoder(tabData.buffer.numberOfChannels, tabData.buffer.sampleRate, 128);
        const sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier

        const left = this.FloatArray2Int16(tabData.buffer.getChannelData(0));
        const right = this.FloatArray2Int16(tabData.buffer.getChannelData(1));
        const mp3Data = [];
        for (var i = 0; i < left.length; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            const rightChunk = right.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }
        var mp3buf = mp3encoder.flush();   //finish writing mp3
        if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
        }

        var blob = new Blob(mp3Data, {type: 'audio/mp3'});
        var url = window.URL.createObjectURL(blob);
        const download = document.createElement('a');
        download.download = `${tabData.name}.mp3`;
        download.href = url;
        download.click();
    }

    FloatArray2Int16(floatbuffer: Float32Array) {
        var int16Buffer = new Int16Array(floatbuffer.length);
        for (var i = 0, len = floatbuffer.length; i < len; i++) {
            if (floatbuffer[i] < 0) {
                int16Buffer[i] = 0x8000 * floatbuffer[i];
            } else {
                int16Buffer[i] = 0x7FFF * floatbuffer[i];
            }
        }
        return int16Buffer;
    }
    async handleMultiTrack() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;
        const response = await fetch("./samples/startrek.mp3");
        const context = new AudioContext();
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        TabsController.createTab(new AudioMultiTrackTabConfig(tabData?.name || `Untitled audio`, [
            {
                name: `${tabData.name} - vocals`,
                buffer: tabData.buffer
            },
            {
                name: `${tabData.name} - guitar`,
                buffer: buffer
            },
            {
                name: `${tabData.name} - bass`,
                buffer: tabData.buffer
            },
            {
                name: `${tabData.name} - drums`,
                buffer: buffer
            },
        ]));
    }

    render() {
        return html`
            <sp-button @click=${this.handleMultiTrack.bind(this)}>Test</sp-button>
            <sp-button @click=${() => this.handleSeparate('demucs-free-6s')}>Separate all</sp-button>
            <sp-button @click=${() => this.handleSeparate('demucs-karaoke')}>Separate vocals only</sp-button>
            <sp-button @click=${this.handlePitch.bind(this)}>Pitch</sp-button>
            <sp-button @click=${this.handleDownload.bind(this)}><sp-icon-download slot="icon"></sp-icon-download>Download as MP3</sp-button>
            <br /><br />
            ${this.isProcessing ? html`<sp-progress-circle size="l" progress=${this.progress}></sp-progress-circle>
            <sp-field-label>Progress: ${Math.floor(this.progress)}%</sp-field-label>` : undefined}`;
    }
}