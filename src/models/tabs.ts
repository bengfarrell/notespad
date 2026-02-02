import { ReactiveController, ReactiveElement } from 'lit';
import { EventEmitter } from '../utils/eventemitter.js';
import { AudioTrackTabConfig, MIDITrackTabConfig, TabConfig } from './tabfactory.js';
import { Playback as AudioPlayback } from 'music-timeline/playback/audio.js';
import { Playback as MIDIPlayback } from 'music-timeline/playback/midi.js';
import { AppController } from '../models/app.js';

export class Tabs extends EventEmitter implements ReactiveController {
    static TAB_CHANGE_EVENT = 'tabchange';

    hosts: ReactiveElement[] = [];

    _currentTabIndex = 0;

    _tabs: (TabConfig | undefined)[] = [ undefined ];

    attachHost(host: ReactiveElement) {
        this.hosts.push(host);
        return this;
    }

    set currentTabByIndex(index: number) {
        this._currentTabIndex = index;
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get currentTab() {
        return this._tabs[this._currentTabIndex];
    }

    set currentTabIndex(index: number) {
        this._currentTabIndex = index;
        this.refreshPlayer();
        this.dispatchEvent(new Event(Tabs.TAB_CHANGE_EVENT));
    }

    async refreshPlayer() {
        await AudioPlayback.stop();
        await MIDIPlayback.stop();

        if (AppController.timelineRef.value) {
            AppController.timelineRef.value.currentTime = 0;
            AppController.timelineRef.value.clearSelectionRange();
        }

        if (this.currentTab?.type === 'MIDITrack') {
            AppController.beatsPerMeasure = (this.currentTab as MIDITrackTabConfig)?.track?.timeSignature.numerator
            AppController.beatsPerMinute = 1000000 * 60 / ((this.currentTab as MIDITrackTabConfig)?.track?.timeMeta.tempo || 1000000);
            MIDIPlayback.data = (this.currentTab as MIDITrackTabConfig).track.sequence;
        } else if (this.currentTab?.type === 'AudioTrack'){
            AppController.beatsPerMeasure = 4;
            AudioPlayback.data = (this.currentTab as AudioTrackTabConfig).buffer;
        }
    }

    get currentTabIndex() {
        return this._currentTabIndex;
    }

    findTabByGUID(guid: string) {
        return this._tabs[this._tabs.findIndex((tab) => tab?.guid === guid)];
    }

    async createTab(tab: TabConfig) {
        await tab.initialize();
        this._tabs.push(tab);
        this.currentTabIndex = this._tabs.length - 1;
        this.hosts.forEach((host) => host.requestUpdate());

    }

    deleteTab(index: number) {
        this._tabs.splice(index, 1);
        if (this._currentTabIndex >= index) {
            this.currentTabIndex--;
        }
        this.hosts.forEach((host) => host.requestUpdate());
    }

    get tabs() {
        return this._tabs;
    }

    hostConnected() {
        console.log('App connected');
    }

    hostDisconnected() {
        console.log('App disconnected');
    }
}

export const TabsController = new Tabs();