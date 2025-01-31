import { css, html, LitElement } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { TabsController } from '../../models/tabs';
import { renderTrack } from '../../utils/render-track';
import { MIDITrack } from 'music-timeline';
import { MIDIFileTabConfig, MIDITrackTabConfig } from '../../models/tabfactory';
import { Playback } from 'music-timeline/playback/midiplayback.js';

@customElement('notespad-tab-midifile')
export class MIDIFileTab extends LitElement {
    static THUMB_WIDTH = 800;
    static THUMB_HEIGHT = 30;

    static styles = css`
        ul {
            overflow: auto;
            list-style-type: none;
            padding: 15px;
            margin: 0;
            width: calc(100% - 30px);
            height: calc(100% - 30px);
        }
        
        li {
            height: 75px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #1a1a1a;
            margin-bottom: 10px;
            cursor: pointer;
        }
        
        li:hover {
            background-color: #292929;
        }
        
        li .label {
            color: #cacaca;
            padding-bottom: 5px;
        }

        li .label.lower {
            padding-top: 5px;
            font-size: 10px;
        }

        ul {
            overflow: auto;
            list-style-type: none;
            padding: 15px;
            margin: 0;
            width: calc(100% - 30px);
            height: calc(100% - 30px);
        }

        li {
            height: 75px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #1a1a1a;
            margin-bottom: 10px;
            cursor: pointer;
        }

        li:hover {
            background-color: #292929;
        }

        li .thumb-container {
            width: 100%;
            overflow-x: auto;
            height: 32px;
        }

        li .label {
            color: #cacaca;
            padding-bottom: 5px;
        }

        li .label.lower {
            padding-top: 5px;
            font-size: 10px;
        }

        li .midi-thumb .playhead {
            position: absolute;
            background-color: orange;
            width: 1px;
            height: 100%;
        }

        li .midi-thumb {
            display: inline-block;
            position: relative;
            margin-left: 15px;
            height: 30px;
            background-repeat: no-repeat;
            border: 1px solid #4a4a4a;
        }

        li .playback-container {
            display: flex;
            align-items: center;
            width: 100%;
        }
    `;

    protected tabsController = TabsController.attachHost(this);
    protected playbackController = Playback.attachHost(this);

    @property()
    guid: string = '';

    @state()
    protected currentPlaybackIndex = -1;
    protected playbackTimer?: number;

    chooseTrack(track: MIDITrack, index: number) {
        TabsController.createTab(
            new MIDITrackTabConfig(
                track.name || `Untitled track #${index + 1}`,
                track));
    }

    connectedCallback() {
        super.connectedCallback();
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDIFileTabConfig;
        tabData.midi.tracks.forEach((track: MIDITrack, index: number) => {
            renderTrack(track, MIDIFileTab.THUMB_WIDTH, MIDIFileTab.THUMB_HEIGHT).then((thumb) => {
                tabData.trackThumbs[index] = thumb;
                this.requestUpdate();
            });
        });
    }

    playToggle(ev: Event, track: MIDITrack, index: number) {
        if (this.currentPlaybackIndex === index) {
            this.playbackController.pause();
            if (this.playbackTimer) {
                this.playbackTimer = undefined;
                clearInterval(this.playbackTimer);
            }
        } else {
            this.playbackController.data = track.sequence;
            this.playbackController.play();
            this.currentPlaybackIndex = index;
            this.playbackTimer = window.setInterval(() => {
                this.requestUpdate();
            }, 200);
        }
        ev.stopPropagation();
    }

    render() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as MIDIFileTabConfig;
        if (!tabData) return html``;

        return html`<ul>${tabData.midi.tracks.map((track: MIDITrack, index: number) => html`
                <li @click=${() => this.chooseTrack(track, index)}>
                    <div class="label">${track.name || `Untitled track #${index + 1}`}</div>
                    <div class="playback-container">
                        <sp-action-button @click=${(ev: Event) => this.playToggle(ev, track, index)} quiet>
                            ${(this.playbackController.isPlaying && this.currentPlaybackIndex === index) ? html`<sp-icon-pause-circle slot="icon"></sp-icon-pause-circle>` : html`<sp-icon-play-circle slot="icon"></sp-icon-play-circle>`}
                        </sp-action-button>
                        <div class="thumb-container">
                            <div class="midi-thumb" style="width: ${MIDIFileTab.THUMB_WIDTH}px; background-image: url('${tabData.trackThumbs[index]}')">
                                <div class="playhead" style="left: ${this.currentPlaybackIndex === index ? ((this.playbackController.currentTime / this.playbackController.duration) * MIDIFileTab.THUMB_WIDTH) : -1}px"></div>
                            </div>
                        </div>
                    </div>
                    <div class="label lower">${Math.round(track.duration)} seconds | ${120}BPM | ${track.timeSignature.numerator}/${track.timeSignature.denominator}</div>
                </li>
            `)}</ul>`;
    }
}