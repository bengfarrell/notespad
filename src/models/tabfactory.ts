import { html } from 'lit';

import '../components/filetabs/emptytab.js';
import '../components/filetabs/midifiletab.js';
import '../components/filetabs/sonicpitracktab.js';
import '../components/filetabs/miditracktab.js';
import '../components/filetabs/audiotracktab.js';
import '../components/filetabs/audiomultitracktab.js';

import '../components/panels/emptypanel.js';
import '../components/panels/audiotrackpanel.js';
import '../components/panels/miditrackpanel.js';
import '../components/panels/sonicpitrackpanel.js';

import { MIDIFile, MIDITrack } from 'music-timeline';
import { calculateBPM, PitchDetectionOutput } from '../utils/audio.js';

export type TabType =  'MIDIFile' | 'MIDITrack' | 'AudioTrack' | 'AudioMultiTrack' | 'SonicPITrack' | 'Empty';
export interface AudioTrack {
    name: string
    buffer: AudioBuffer;
}

export class TabConfig {
    name: string;
    type: TabType;
    guid: string;

    get duration() {
        return 0;
    }

    async initialize() {}

    constructor(type: TabType, name: string) {
        this.type = type;
        this.name = name;
        this.guid = crypto.randomUUID();
    }
}

export class AudioMultiTrackTabConfig extends TabConfig {
    tracks: { name: string, buffer: AudioBuffer, maxAmplitude?: number }[];
    trackThumbs: string[] = [];

    constructor(name: string, tracks: AudioTrack[]) {
        super('AudioMultiTrack', name);
        this.tracks = tracks;
    }
}

export class AudioTrackTabConfig extends TabConfig {
    buffer: AudioBuffer;
    BPM?: number;
    beatOffset?: number;

    protected inferBPM = false;

    get duration() {
        return this.buffer.duration;
    }

    async initialize(): Promise<void> {
        await super.initialize();
        return new Promise((resolve) => {
            if (this.inferBPM) {
                calculateBPM(this.buffer).then((result) => {
                    this.BPM = result?.bpm;
                    this.beatOffset = result?.offset;
                    resolve();
                })
            } else {
                resolve();
            }
        });
    }

    constructor(name: string, buffer: AudioBuffer, inferBPM = false) {
        super('AudioTrack', name);
        this.buffer = buffer;
        this.inferBPM = inferBPM;
    }
}

export class SonicPITrackTabConfig extends TabConfig {
    get duration() {
        return this.track.duration;
    }
    constructor(
        name: string,
        public track: MIDITrack) {
        super('SonicPITrack', name);
    }
}


export class MIDITrackTabConfig extends TabConfig {
    get duration() {
        return this.track.duration;
    }
    constructor(
        name: string,
        public track: MIDITrack,
        public pitchDetection?: PitchDetectionOutput) {
        super('MIDITrack', name);
    }
}

export class MIDIFileTabConfig extends TabConfig {
    midi: MIDIFile
    trackThumbs: string[] = [];

    constructor(name: string, file: MIDIFile) {
        super('MIDIFile', name);
        this.midi = file;
    }
}

export const renderTab = (tab?: TabConfig) => {
    if (!tab) {
        return html`<notespad-tab-empty id="tab"></notespad-tab-empty>`;
    }
    switch (tab?.type) {
        case 'MIDIFile':
            return html`<notespad-tab-midifile id="tab" guid=${tab.guid}></notespad-tab-midifile>`;

        case 'MIDITrack':
            return html`<notespad-tab-miditrack id="tab" guid=${tab.guid}></notespad-tab-miditrack>`;

        case 'SonicPITrack':
            return html`<notespad-tab-sonicpitrack id="tab" guid=${tab.guid}></notespad-tab-sonicpitrack>`;

        case 'AudioTrack':
            return html`<notespad-tab-audiotrack id="tab" guid=${tab.guid}></notespad-tab-audiotrack>`;

        case 'AudioMultiTrack':
            return html`<notespad-tab-audio-multitrack id="tab" guid=${tab.guid}></notespad-tab-audio-multitrack>`;

        default:
            return html`<notespad-tab-empty id="tab" guid=${tab.guid}></notespad-tab-empty>`;
    }
}

export const renderPanel = (tab?: TabConfig) => {
    if (!tab) {
        return html`<notespad-panel-empty id="panel"></notespad-panel-empty>`;
    }
    switch (tab?.type) {
        case 'AudioTrack':
            return html`<notespad-panel-audiotrack id="panel" guid=${tab.guid}></notespad-panel-audiotrack>`;

        case 'MIDITrack':
            return html`<notespad-panel-miditrack id="panel" guid=${tab.guid}></notespad-panel-miditrack>`;

        case 'SonicPITrack':
            return html`<notespad-panel-sonicpitrack id="panel" guid=${tab.guid}></notespad-panel-sonicpitrack>`;


        default:
            return html`<notespad-panel-empty id="panel" guid=${tab.guid}></notespad-panel-empty>`;
    }
}