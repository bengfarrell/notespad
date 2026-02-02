import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import { TabsController } from '../../models/tabs.js';

import { AudioTimeline, RangeSelectEvent, TimelineEvent } from 'music-timeline';
import { Playback } from 'music-timeline/playback/audio.js';
import { Playback as MetronomePlayback, MetronomeEvent } from 'music-timeline/playback/metronome.js';
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

    @query('mt-audio')
    timeline?: AudioTimeline;

    constructor() {
        super();
        MetronomePlayback.addEventListener(MetronomeEvent.eventName, () => {
            if (Playback.isPlaying && this.timeline) {
                const playbackTime = Playback.currentTime;
                const beatsPerSecond = this.timeline.beatsPerMinute / 60;
                this.timeline.highlightBeat(Math.floor(beatsPerSecond * playbackTime + MetronomePlayback.beatOffset));
            }
        });
    }

    render() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioTrackTabConfig;
        if (!tabData) return undefined;

        if (tabData.BPM && tabData.beatOffset) {
            this.appController.beatsPerMinute = tabData.BPM;
            this.appController.beatOffsetSeconds = tabData.beatOffset;
        }

        return html`<mt-audio
                waveformcolor="#ffff0088"
                beatoffsetseconds=${this.appController.beatOffsetSeconds}
                beatspermeasure=${this.appController.beatsPerMeasure}
                beatsperminute=${this.appController.beatsPerMinute}
                  @seek=${(e: TimelineEvent) => this.playbackController.seek(e.time) }
                  @rangeselect=${(e: RangeSelectEvent) => {
                    if (e.range) {
                        this.playbackController.loop(...e.range as [number, number]);
                    } else {
                        this.playbackController.clearLoopRange();
                    }
                    this.appController.selectedRange = e.range;
                    }}
                  ${ref(AppController.timelineRef)} 
                  .buffer=${tabData.buffer}
                  .currentTime=${this.playbackController.currentTime}></mt-audio>`;
    }
}