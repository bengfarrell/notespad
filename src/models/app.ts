import { ReactiveController, ReactiveElement } from 'lit';
import { createRef } from 'lit/directives/ref.js'
import { TimeSignature, MIDITimeline } from 'music-timeline';

export const formatTimeSignature = (ts: TimeSignature): string => {
    return ts.numerator + '/' + ts.denominator;
}

export class App implements ReactiveController {
    hosts: ReactiveElement[] = [];

    _pixelsPerBeat = 20;

    timelineRef = createRef<MIDITimeline>();

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

    get pixelsPerBeat() {
        return this._pixelsPerBeat;
    }

    set pixelsPerBeat(val: number) {
        this._pixelsPerBeat = val;
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