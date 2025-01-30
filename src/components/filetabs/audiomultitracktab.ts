import { css, html, LitElement } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-play-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-pause-circle.js';

import { Playback } from 'music-timeline/playback/audioplayback.js';

import { TabsController } from '../../models/tabs.js';
import { renderTrack } from '../../utils/render-track.js';
import { AudioMultiTrackTabConfig, AudioTrackTabConfig } from '../../models/tabfactory.js';

@customElement('notespad-tab-audio-multitrack')
export class AudioMultiTrackTab extends LitElement {
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
        
        li .audio-thumb .playhead {
            position: absolute;
            background-color: orange;
            width: 1px;
            height: 100%;
        }

        li .audio-thumb {
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

    chooseTrack(track: AudioBuffer) {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioMultiTrackTabConfig;
        TabsController.createTab(new AudioTrackTabConfig(tabData.name + '- separated', track));
    }

    connectedCallback() {
        super.connectedCallback();
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioMultiTrackTabConfig;
        tabData.tracks.forEach((track, index: number) => {
            const source = [];
            for (let i = 0; i < track.buffer.numberOfChannels; i++) {
                source.push(track.buffer.getChannelData(i));
            }
            renderTrack(source, AudioMultiTrackTab.THUMB_WIDTH, AudioMultiTrackTab.THUMB_HEIGHT ).then((thumb) => {
                tabData.trackThumbs[index] = thumb;
                this.requestUpdate();
            });
        });
    }

    async playToggle(ev: Event, buffer: AudioBuffer, index: number) {
        if (this.currentPlaybackIndex !== index) {
            await this.playbackController.stop();
            this.playbackController.data = buffer;
            this.currentPlaybackIndex = index;
        }
        if (this.playbackController.isPlaying) {
            await this.playbackController.pause();
            if (this.playbackTimer) {
                this.playbackTimer = undefined;
                clearInterval(this.playbackTimer);
            }
        } else {
            await this.playbackController.play();
            this.playbackTimer = window.setInterval(() => {
                this.requestUpdate();
            }, 200);
        }
        ev.stopPropagation();
        this.requestUpdate();
    }

    handleTime(ev: MouseEvent) {
        const bounds = (ev.target as HTMLDivElement).getBoundingClientRect();
        const time = (ev.clientX - bounds.left) / AudioMultiTrackTab.THUMB_WIDTH * this.playbackController.duration;
        this.playbackController.seek(time);
        ev.stopPropagation();
    }

    render() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as AudioMultiTrackTabConfig;
        if (!tabData) return html``;

        return html`<ul>${tabData.tracks.map((track: { name: string, buffer: AudioBuffer }, index: number) => html`
                <li @click=${() => this.chooseTrack(track.buffer)}>
                    <div class="label">${track.name || `Untitled track #${index + 1}`}</div>
                    <div class="playback-container">
                        <sp-action-button @click=${(e: Event) => this.playToggle(e, track.buffer, index)} quiet>
                            ${(this.playbackController.isPlaying && this.currentPlaybackIndex === index) ? html`<sp-icon-pause-circle slot="icon"></sp-icon-pause-circle>` : html`<sp-icon-play-circle slot="icon"></sp-icon-play-circle>`}
                        </sp-action-button>
                        <div class="thumb-container">
                            <div class="audio-thumb" @click=${this.handleTime.bind(this)} style="width: ${AudioMultiTrackTab.THUMB_WIDTH}px; background-image: url('${tabData.trackThumbs[index]}')">
                                <div class="playhead" style="left: ${this.currentPlaybackIndex === index ? ((this.playbackController.currentTime / this.playbackController.duration) * AudioMultiTrackTab.THUMB_WIDTH) : -1}px"></div>
                            </div>
                        </div>
                    </div>
                    <div class="label lower">${Math.round(track.buffer.duration)} seconds</div>
                </li>
            `)}</ul>`;
    }
}