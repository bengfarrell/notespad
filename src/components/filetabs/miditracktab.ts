import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import { AppController } from '../../models/app.js';
import { TabsController } from '../../models/tabs.js';
import { RangeSelectEvent, TimelineEvent } from 'music-timeline';
import 'music-timeline';
import { Playback } from 'music-timeline/playback/midi.js';
import { MIDITrackTabConfig } from '../../models/tabfactory';

@customElement('notespad-tab-miditrack')
export class MIDIFileTab extends LitElement {
    static styles = css`
        mt-midi {
            width: 100%;
            height: 100%;
        }
    `;

    @property()
    guid: string = '';

    protected appController = AppController.attachHost(this);
    protected playbackController = Playback.attachHost(this);
    tabsController = TabsController.attachHost(this);

    render() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDITrackTabConfig;
        if (!tabData) return undefined;

        return html`<mt-midi
                    beatspermeasure=${this.appController.beatsPerMeasure}
                    beatsperminute=${this.appController.beatsPerMinute}
                    @seek=${(e: TimelineEvent) => this.playbackController.seek(e.time)}
                    @rangeselect=${(e: RangeSelectEvent) => {
                        if (e.range) {
                            this.playbackController.loop(...e.range as [number, number]);
                        } else {
                            this.playbackController.clearLoopRange();
                        }
                        this.appController.selectedRange = e.range;
                    }}
                    ${ref(AppController.timelineRef)} 
                    .midiTrack=${tabData.track}
                    .currentTime=${this.playbackController.currentTime}></mt-midi>`;
    }
}