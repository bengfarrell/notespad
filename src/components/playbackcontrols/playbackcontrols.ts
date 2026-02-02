import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-play.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-pause.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-zoom-in.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-zoom-out.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-down.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-divider.js';
import '@spectrum-web-components/action-menu/sync/sp-action-menu.js';
import '@spectrum-web-components/slider/sp-slider.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/switch/sp-switch.js';

import { AppController } from '../../models/app.js';

import { style } from './playbackcontrols.css.js';
import { TabsController } from '../../models/tabs.js';
import { Checkbox } from '@spectrum-web-components/bundle';

@customElement('notespad-playback-controls')
export class PlaybackControls extends LitElement {
    static styles = style;

    protected tabsController = TabsController.attachHost(this);
    protected appController = AppController.attachHost(this);

    protected useMetronome = false;

    app = AppController.attachHost(this);

    async togglePlayback() {
        if (!this.app.isPlaying) {
            this.app.player.play(this.useMetronome);
            this.app.updatePlaybackTime();
        } else {
            await this.app.player.pause();
        }
        this.requestUpdate();
    }

    setZoomLevel(event: Event) {
        const zoomType = (event.target as HTMLInputElement).value.split('-')[0];
        const zoomAmount = Number((event.target as HTMLInputElement).value.split('-')[1]);
        if (zoomType === 'measure') {
            this.app.zoomByMeasure(zoomAmount);
        } else {
            this.app.zoomTo(zoomAmount);
        }
    }

    zoomIn() {
        this.app.zoomIn(5);
    }

    zoomOut() {
        this.app.zoomOut(5);
    }

    formatTime(seconds: number) {
        const dateObj = new Date(seconds * 1000);
        const minutes = dateObj.getUTCMinutes();
        seconds = dateObj.getSeconds();

        return minutes.toString().padStart(2, '0')
            + ':' + seconds.toString().padStart(2, '0');
    }

    handleZoomSlider(event: Event) {
        this.app.zoomTo(Number((event.target as HTMLInputElement).value));
    }

    render() {
        return html`
            <div class="start section well">
                <div class="row">
                    <div class="grid-item">
                        <sp-field-label>BPM</sp-field-label>
                        <sp-number-field
                                label="BPM"
                                id="bpm"
                                hide-stepper
                                @input=${(event: Event) => {
                                    const input = event.target as HTMLInputElement;
                                    this.appController.beatsPerMinute = Number(input.value);
                                }}
                                value=${this.appController.beatsPerMinute}
                                size="m"
                        ></sp-number-field>
                    </div>
    
                    <div class="grid-item time-signature">
                        <sp-field-label>Time Signature</sp-field-label>
                        <div class="row"><sp-number-field
                                label="Time Signature"
                                id="time-signature-numerator"
                                hide-stepper
                                @input=${(event: Event) => {
                                    const input = event.target as HTMLInputElement;
                                    this.appController.beatsPerMeasure = Number(input.value);
                                }}
                                value=${this.appController.beatsPerMeasure}
                                size="m"
                        ></sp-number-field><span id="time-signature-denominator">/ 4</span></div>
                    </div>
                    <div class="grid-item">
                        <sp-field-label>Grid Offset</sp-field-label>
                        <sp-number-field
                                label="Grid Offset"
                                id="grid-offset"
                                hide-stepper
                                @input=${(event: Event) => {
                                    const input = event.target as HTMLInputElement;
                                    this.appController.beatOffsetSeconds = Number(input.value);
                                }}
                                value=${this.appController.beatOffsetSeconds}
                                size="m"></sp-number-field>
                    </div>
                    <sp-switch style="margin-top: 5px;" size="s" @change=${(event: InputEvent) => this.useMetronome = (event.target as Checkbox).checked}><span class="use-metronome-label">use metronome</span></sp-switch>
                </div>
            </div>
            <div class="middle section">
                <sp-action-button
                        aria-label="Play button"
                        ?disabled=${!this.app.canPlay}
                        quiet
                        @click=${this.togglePlayback.bind(this)}>
                    ${this.app.isPlaying ? html`<sp-icon-pause slot="icon"></sp-icon-pause>` : html`<sp-icon-play slot="icon"></sp-icon-play>`}
                </sp-action-button>
                ${this.tabsController.currentTab ? html`
                    <h3>${this.tabsController.currentTab?.name || 'Untitled Track'}</h3>` : html`<h3 class="disabled">No track loaded</h3>`}
                <sp-field-label class="${this.tabsController.currentTab ? '' : 'disabled'}">${this.formatTime(this.app.player.currentTime)} / ${this.formatTime(this.app.player.duration)}</sp-field-label>
            </div>
                
            <div class="end section well">
                <div class="zoom-selector">
                    <sp-field-label ?disabled=${!this.app.canPlay}>Zoom</sp-field-label>
                    <sp-action-menu size="m" ?disabled=${!this.app.canPlay} @change=${this.setZoomLevel.bind(this)}>
                        <span slot="label">${this.app.zoomPercent}%</span>
                        <sp-icon-chevron-down slot="icon"></sp-icon-chevron-down>
                        <sp-menu-item value="percent-100">100% (Fit entire sequence)</sp-menu-item>
                        <sp-menu-item value="percent-125">125%</sp-menu-item>
                        <sp-menu-item value="percent-150">150%</sp-menu-item>
                        <sp-menu-item value="percent-175">175%</sp-menu-item>
                        <sp-menu-item value="percent-200">200%</sp-menu-item>
                        <sp-menu-item value="percent-250">250%</sp-menu-item>
                        <sp-menu-item value="percent-300">300%</sp-menu-item>
                        <sp-menu-item value="percent-400">400%</sp-menu-item>
                        <sp-menu-item value="percent-600">600%</sp-menu-item>
                        <sp-menu-item value="percent-1000">1000%</sp-menu-item>
                        <sp-menu-divider></sp-menu-divider>
                        <sp-menu-item value=${this.app.beatsPerMeasure * this.app.beatsPerMinute}>One Measure</sp-menu-item>
                        <sp-menu-item value="measure-2">Two Measures</sp-menu-item>
                        <sp-menu-item value="measure-4">Four Measures</sp-menu-item>
                        <sp-menu-item value="measure-8">Eight Measures</sp-menu-item>
                    </sp-action-menu>
                </div>
                <sp-action-button
                        aria-label="Zoom out"
                        ?disabled=${!this.app.canPlay}
                        quiet
                        @click=${this.zoomOut.bind(this)}>
                    <sp-icon-zoom-out slot="icon"></sp-icon-zoom-out>
                </sp-action-button>
                <sp-slider 
                        value=${this.app.zoomPercent}
                        @input=${this.handleZoomSlider.bind(this)}
                        ?disabled=${!this.app.canPlay}
                        label-visibility="none" min="1" max="2000"></sp-slider>
                <sp-action-button
                        aria-label="Zoom out"
                        ?disabled=${!this.app.canPlay}
                        quiet
                        @click=${this.zoomIn.bind(this)}>
                    <sp-icon-zoom-in slot="icon"></sp-icon-zoom-in>
                </sp-action-button>
            </div>`;
    }
}