import { html, LitElement } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-play-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-pause-circle.js';

import { Playback } from 'music-timeline/playback/audio.js';

import { TabsController } from '../../models/tabs.js';
import { renderTrack } from '../../utils/render-track.js';
import { AudioMultiTrackTabConfig, AudioTrackTabConfig } from '../../models/tabfactory.js';

import { styles } from './audiomultitracktab.css';

@customElement('notespad-tab-audio-multitrack')
export class AudioMultiTrackTab extends LitElement {
    static THUMB_WIDTH = 800;
    static THUMB_HEIGHT = 30;

    static styles = styles;
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
            renderTrack(source, AudioMultiTrackTab.THUMB_WIDTH, AudioMultiTrackTab.THUMB_HEIGHT ).then((result) => {
                tabData.trackThumbs[index] = result.image;
                tabData.tracks[index].maxAmplitude = result.maxAmplitude;
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

        return html`<ul>${tabData.tracks.map((track: { name: string, buffer: AudioBuffer, maxAmplitude?: number }, index: number) => html`
                ${ (track.maxAmplitude || 0) > 0.01 ? html`<li>
                    <div>
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
                    </div>
                    <sp-button variant="primary" @click=${() => this.chooseTrack(track.buffer)}>Load</sp-button>
                </li>` : undefined }
            `)}</ul>`;
    }
}