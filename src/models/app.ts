import { ReactiveController, ReactiveElement } from 'lit';
import { createRef } from 'lit/directives/ref.js'
import { TimeSignature, Timeline, MIDITrack } from 'midi-sequence-timeline';

export const formatTimeSignature = (ts: TimeSignature): string => {
    return ts.numerator + '/' + ts.denominator;
}
export class App implements ReactiveController {
    hosts: ReactiveElement[] = [];

    _currentTrack = -1;

    _loadedTracks: MIDITrack[] = [];

    _pixelsPerBeat = 20;

    timelineRef = createRef<Timeline>();

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

    get tracks() {
        return this._loadedTracks;
    }

    loadTrack(tracks: MIDITrack | MIDITrack[], setAsCurrent = true) {
        if (Array.isArray(tracks)) {
            tracks.forEach((track) => this._loadedTracks.push(track));
        } else {
            this._loadedTracks.push(tracks);
        }
        if (setAsCurrent) {
            this._currentTrack = this._loadedTracks.length - 1;
        }
        this.hosts.forEach((host) => host.requestUpdate());
    }

    deleteTrack(index: number) {
        this._loadedTracks.splice(index, 1);
        if (this._currentTrack >= index) {
            this._currentTrack--;
        }
        this.hosts.forEach((host) => host.requestUpdate());
    }

    set currentTrackByIndex(index: number) {
        this._currentTrack = index;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get pixelsPerBeat() {
        return this._pixelsPerBeat;
    }

    set pixelsPerBeat(val: number) {
        this._pixelsPerBeat = val;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    set currentTrackIndex(val: number) {
        this._currentTrack = val;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get currentTrackIndex() {
        return this._currentTrack;
    }

    get currentTrack() {
        return this._loadedTracks[this._currentTrack];
    }

    hostConnected() {
        console.log('App connected');
    }

    hostDisconnected() {
        console.log('App disconnected');
    }
}

export const AppController = new App();