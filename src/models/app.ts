import { ReactiveController, ReactiveElement } from 'lit';
import { createRef } from 'lit/directives/ref.js'
import { TabsController } from './tabs.js';
import { AudioTimeline, MIDITimeline } from 'music-timeline';
import { Playback as MIDITrackPlayback } from 'music-timeline/playback/midi.js';
import { Playback as AudioTrackPlayback } from 'music-timeline/playback/audio.js';
import { Playback as MetronomePlayback } from 'music-timeline/playback/metronome.js';

export class App implements ReactiveController {
    hosts: ReactiveElement[] = [];

    _zoomPercent = 100;

    _useMetronome = false;

    _beatsPerMeasure = 4;

    _beatsPerMinute = 120;

    _beatOffsetSeconds = 0;

    timelineRef = createRef<MIDITimeline | AudioTimeline>();

    _selectedRange?: number[];

    attachHost(host: ReactiveElement) {
        this.hosts.push(host);
        return this;
    }

    set selectedRange(range: number[] | undefined) {
        this._selectedRange = range;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get selectedRange() {
        return this._selectedRange;
    }

    get zoomPercent() {
        return this._zoomPercent;
    }

    zoomTo(percentage: number, pivotTime?: number) {
        this.timelineRef.value?.zoomTo(percentage, pivotTime);
        this._zoomPercent = this.timelineRef.value?.zoomPercent ?? 100;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    zoomIn(percentage: number, pivotTime?: number) {
        this.timelineRef.value?.zoomIn(percentage, pivotTime);
        this._zoomPercent = this.timelineRef.value?.zoomPercent ?? 100;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    zoomOut(percentage: number, pivotTime?: number) {
        this.timelineRef.value?.zoomOut(percentage, pivotTime);
        this._zoomPercent = this.timelineRef.value?.zoomPercent ?? 100;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    zoomByMeasure(numMeasures: number, pivotTime?: number) {
        this.timelineRef.value?.zoomByMeasure(numMeasures, pivotTime);
        this._zoomPercent = this.timelineRef.value?.zoomPercent ?? 100;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get beatsPerMeasure() {
        return this._beatsPerMeasure;
    }

    set beatsPerMeasure(val) {
        this._beatsPerMeasure = val;
        MetronomePlayback.beatsPerMeasure = this.beatsPerMeasure;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get beatsPerMinute() {
        return this._beatsPerMinute;
    }

    set beatsPerMinute(val) {
        this._beatsPerMinute = val;
        MetronomePlayback.BPM = this.beatsPerMinute;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get beatOffsetSeconds() {
        return this._beatOffsetSeconds;
    }

    set beatOffsetSeconds(val) {
        this._beatOffsetSeconds= val;
        MetronomePlayback.beatOffset = this.beatOffsetSeconds;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    updatePlaybackTime() {
        if (this.player.isPlaying) {
            if (this.timelineRef.value) {
                this.timelineRef.value.currentTime = this.player.currentTime;
                this.hosts.forEach((host) => host.requestUpdate());
            }
            requestAnimationFrame(this.updatePlaybackTime.bind(this));
        }
    }

    get isPlaying() {
        return this.player.isPlaying;
    }

    get canPlay() {
        return TabsController.currentTab?.type === 'MIDITrack' || TabsController.currentTab?.type === 'AudioTrack';
    }

    get player() {
        return TabsController.currentTab?.type === 'MIDITrack' ? MIDITrackPlayback : AudioTrackPlayback;
    }

    get useMetronome() {
        return this._useMetronome;
    }

    set useMetronome(val) {
        this._useMetronome = val;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    hostConnected() {
        console.log('App connected');
    }

    hostDisconnected() {
        console.log('App disconnected');
    }
}

export const AppController = new App();