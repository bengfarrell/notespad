import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import { TabsController } from '../../models/tabs.js';

import { RangeSelectEvent, TimelineEvent } from 'music-timeline';
import { Playback } from 'music-timeline/playback/audioplayback.js';
import 'music-timeline';
import { AppController } from '../../models/app.js';
import { AudioTrackTabConfig } from '../../models/tabfactory.js';

@customElement('notespad-tab-audiotrack')
export class AudioTrackTab extends LitElement {
    static styles = css`
    mt-audio {
        width: 100%;
        height: 100%;
    }`;

    protected tabsController = TabsController.attachHost(this);
    protected appController = AppController.attachHost(this);
    protected playbackController = Playback.attachHost(this);

    @property()
    guid: string = '';

    render() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;
        if (!tabData) return undefined;

        return html`<mt-audio
                waveformcolor="#ffffff44"
                  @seek=${(e: TimelineEvent) => this.playbackController.seek(e.time)}
                  @rangeselect=${(e: RangeSelectEvent) => {
            if (e.range) {
                this.playbackController.loop(...e.range as [number, number]);
            } else {
                this.playbackController.clearLoopRange();
            }
            this.appController.selectedRange = e.rangeAsSeconds;
            }}
          ${ref(AppController.timelineRef)} 
          .buffer=${tabData.buffer}
          .currentTime=${this.playbackController.currentTime}></mt-audio>`;
    }
}