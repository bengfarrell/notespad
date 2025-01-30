import { ReactiveController, ReactiveElement } from 'lit';
import { EventEmitter } from '../utils/eventemitter.js';
import { TabConfig } from './tabfactory.js';

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
        this.dispatchEvent(new Event(Tabs.TAB_CHANGE_EVENT));
    }

    get currentTabIndex() {
        return this._currentTabIndex;
    }

    findTabByGUID(guid: string) {
        return this._tabs[this._tabs.findIndex((tab) => tab?.guid === guid)];
    }

    createTab(tab: TabConfig) {
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