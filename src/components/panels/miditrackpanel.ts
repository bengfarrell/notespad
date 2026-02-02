import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { property } from 'lit/decorators.js';

import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-add.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-remove.js';

import { TabsController } from '../../models/tabs.js';
import { Playback } from 'music-timeline/playback/midi.js';
import { MIDITrackTabConfig, SonicPITrackTabConfig } from '../../models/tabfactory';
import { defaultPitchDetectOptions, pitchDetectToMIDITrack } from '../../utils/audio.js';
import { AppController } from '../../models/app.js';
import { MIDITimeline } from 'music-timeline';

@customElement('notespad-panel-miditrack')
export class MIDITrackPanel extends LitElement {
    static styles = css``;

    @property()
    guid: string = '';

    @property()
    segmentThreshold: number = defaultPitchDetectOptions.segmentThreshold;

    @property()
    confidenceThreshold: number = defaultPitchDetectOptions.confidenceThreshold;

    @property()
    minNoteLength: number = defaultPitchDetectOptions.minNoteLength;

    @property()
    inferOnset: boolean = defaultPitchDetectOptions.inferOnsets;

    @property()
    melodiaTrick: boolean = defaultPitchDetectOptions.melodiaTrick;

    @property()
    energyTolerance: number = defaultPitchDetectOptions.energyTolerance;

    @property()
    protected transposed = 0;

    protected tabsController = TabsController.attachHost(this);
    protected appController = AppController.attachHost(this);
    protected playbackController = Playback.attachHost(this);

    handleInstrumentChange(e: Event) {
        const instr = (e.target as HTMLInputElement).value;
        switch (instr) {
            case 'poly-synth':
                //this.playbackController.synth = 'poly-synth';
                break;
            case 'piano':
                ///this.playbackController.synth = 'piano';
                break;
            case 'sampled-piano':
                //this.playbackController.synth = 'sampled-piano';
                break;
        }
    }

    handlePitchDetectChange(e: Event) {
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDITrackTabConfig;
        if (tabData.pitchDetection === undefined) return;
        const target = e.target as HTMLInputElement;
        switch (target.id) {
            case 'segment-threshold':
                this.segmentThreshold = Number(target.value);
                break;
            case 'confidence-threshold':
                this.confidenceThreshold = Number(target.value);
                break;
            case 'min-note-length':
                this.minNoteLength = Number(target.value);
                break;
            case 'infer-onset':
                this.inferOnset = target.checked;
                break;
            case 'melodia-trick':
                this.melodiaTrick = target.checked;
                break;
            case 'energy-tolerance':
                this.energyTolerance = Number(target.value);
                break;
        }
        const track = pitchDetectToMIDITrack(tabData.pitchDetection, {
            segmentThreshold: this.segmentThreshold,
            confidenceThreshold: this.confidenceThreshold,
            minNoteLength: this.minNoteLength,
            inferOnsets: this.inferOnset,
            melodiaTrick: this.melodiaTrick,
            energyTolerance: this.energyTolerance
        }, this.transposed);

        tabData.track = track;
        if (this.appController.timelineRef?.value) {
            (this.appController.timelineRef.value as MIDITimeline).midiTrack = track;
            this.playbackController.data = track.sequence;
        }
    }

    handleTranspose(semitones: number) {
        this.transposed += semitones;
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDITrackTabConfig;
        tabData.track.events.forEach((event) => {
            event.note += semitones;
        });
        tabData.track.processTrack();
        if (this.appController.timelineRef?.value) {
            this.appController.timelineRef.value.refresh();
            this.playbackController.data = tabData.track.sequence;
        }
    }

    sonicPIExport() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDITrackTabConfig;
        TabsController.createTab(
            new SonicPITrackTabConfig(tabData.name + '-sonic-pi', tabData.track));
    }

    render() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDITrackTabConfig;
        return html`
            <sp-button @click=${this.sonicPIExport.bind(this)}>Export SonicPI</sp-button>
            <br />
            <sp-field-label>Instrument</sp-field-label>
            <sp-picker @change=${this.handleInstrumentChange.bind(this)} size="m" value="piano" label="Instrument">
                <sp-menu-item value="piano">Piano</sp-menu-item>
            </sp-picker>

            <br /><br />
            <sp-field-label>Transpose</sp-field-label>
            <sp-action-button @click=${() => this.handleTranspose(1)}><sp-icon-add slot="icon"></sp-icon-add></sp-action-button>
            <sp-action-button @click=${() => this.handleTranspose(-1)}><sp-icon-remove slot="icon"></sp-icon-remove></sp-action-button>
            
            <sp-field-label>Octave</sp-field-label>
            <sp-action-button @click=${() => this.handleTranspose(12)}><sp-icon-add slot="icon"></sp-icon-add></sp-action-button>
            <sp-action-button @click=${() => this.handleTranspose(-12)}><sp-icon-remove slot="icon"></sp-icon-remove></sp-action-button>
            
            <br /><br />
            <sp-field-label>Transposed by ${this.transposed} semitones</sp-field-label>
            <sp-action-button @click=${() => this.handleTranspose(-this.transposed)}>Reset</sp-action-button>
            
            
            <sp-field-label>Tempo: ${tabData.track.timeMeta.tempo}</sp-field-label>
            <sp-field-label>Division: ${tabData.track.timeMeta.division}</sp-field-label>
        
            ${tabData.pitchDetection ? html`
                <sp-field-label>Segment Threshold</sp-field-label>
                <sp-number-field id="segment-threshold" min=0 max=1 step=0.1 @change=${this.handlePitchDetectChange.bind(this)} value=${this.segmentThreshold}></sp-number-field>

                <sp-field-label>Confidence Threshold</sp-field-label>
                <sp-number-field id="confidence-threshold" min=0 max=1 step=0.1 @change=${this.handlePitchDetectChange.bind(this)} value=${this.confidenceThreshold}></sp-number-field>

                <sp-field-label>Minimum Note Length</sp-field-label>
                <sp-number-field id="min-note-length" min=0 max=20 step=1 @change=${this.handlePitchDetectChange.bind(this)} value=${this.minNoteLength}></sp-number-field>

                <sp-field-label>Infer Onset</sp-field-label>
                <sp-checkbox id="infer-onset" @change=${this.handlePitchDetectChange.bind(this)} ?checked=${this.inferOnset}></sp-checkbox>

                <sp-field-label>Melodia Trick</sp-field-label>
                <sp-checkbox id="melodia-trick" @change=${this.handlePitchDetectChange.bind(this)} ?checked=${this.melodiaTrick}></sp-checkbox>

                <sp-field-label>Energy Tolerance</sp-field-label>
                <sp-number-field id="energy-tolerance" @change=${this.handlePitchDetectChange.bind(this)} value=${this.energyTolerance}></sp-number-field>
                
            ` : undefined}
        `;
    }
}