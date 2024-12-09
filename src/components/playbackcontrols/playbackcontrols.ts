import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-play.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-pause.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-zoom-in.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-zoom-out.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-divider.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/slider/sp-slider.js';
import '@spectrum-web-components/number-field/sp-number-field.js';

import { formatTimeSignature } from '../../models/app.js';
import { Playback } from 'midi-sequence-timeline/playback/timedplayback.js';

import { style } from './playbackcontrols.css.js';
import { AppController } from '../../models/app.js';

@customElement('notespad-playback-controls')
export class PlaybackControls extends LitElement {
    static styles = style;

    isPlaying = false;

    app = AppController.attachHost(this);

    playback = Playback.attachHost(this);

    get canPlay() {
        return !this.app.currentTrack;
    }

    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.playback.sequence = this.app.currentTrack?.sequence || [];
            this.playback.play();
        } else {
            this.playback.pause();
        }
    }

    setZoomLevel(event: Event) {
        const timeline = this.app.timelineRef.value;
        if (timeline) {
            const tWidth = timeline.contentWidth;
            const zoomOption = (event.target as HTMLInputElement).value;

            switch (zoomOption) {
                case 'Fit entire sequence (100%)':
                    this.app.pixelsPerBeat = tWidth / (Math.ceil(this.app.currentTrack?.duration || 0) + 1);
                    break;
                case '50%':
                    this.app.pixelsPerBeat = tWidth / (Math.ceil(this.app.currentTrack?.duration || 0) + 1) * 2;
                    break;
                case '25%':
                    this.app.pixelsPerBeat = tWidth / (Math.ceil(this.app.currentTrack?.duration || 0) + 1) * 4;
                    break;
                case '10%':
                    this.app.pixelsPerBeat = tWidth / (Math.ceil(this.app.currentTrack?.duration || 0) + 1) * 10;
                    break;
                case 'One Measure':
                    this.app.pixelsPerBeat = tWidth / (this.app.currentTrack?.timeSignature.numerator|| 0);
                    break;
                case 'Two Measures':
                    this.app.pixelsPerBeat = tWidth / (this.app.currentTrack?.timeSignature.numerator|| 0) * 0.5;
                    break;
                case 'Four Measures':
                    this.app.pixelsPerBeat = tWidth / (this.app.currentTrack?.timeSignature.numerator|| 0) * 0.25;
                    break;
                case 'Eight Measures':
                    this.app.pixelsPerBeat = tWidth / (this.app.currentTrack?.timeSignature.numerator|| 0) * 0.125;
                    break;
            }
        }
    }

    get zoomPercentage() {
            const timeline = this.app.timelineRef.value;
            if (timeline) {
                const tWidth = timeline.contentWidth;
                return Math.round(this.app.pixelsPerBeat / (tWidth / (Math.ceil(this.app.currentTrack?.duration || 0) + 1)));
            }
            return 100;
    }

    zoomIn() {
        this.app.pixelsPerBeat *= 1.5;
    }

    zoomOut() {
        this.app.pixelsPerBeat *= 0.95;
    }

    handleZoomSlider(event: Event) {
        const timeline = this.app.timelineRef.value;
        if (timeline) {
            const tWidth = timeline.contentWidth;
            this.app.pixelsPerBeat = tWidth / (Math.ceil(this.app.currentTrack?.duration || 0) + 1) * Number((event.target as HTMLInputElement).value);
        }
    }

    render() {
        return html`
            <div class="start section">
                ${this.app.currentTrack ? html`<div>
                    <h3>${this.app.currentTrack?.name || 'Untitled Track'}</h3>
                    <sp-field-label>Time Signature: ${this.app.currentTrack?.timeSignature ? formatTimeSignature(this.app.currentTrack.timeSignature) : ' / '}</sp-field-label>
                </div>` : html`<h3>No track loaded</h3>`}
                <div>
                    <sp-field-label>BPM</sp-field-label>
                    <sp-number-field
                            ?disabled=${this.canPlay}
                            label="BPM"
                            @input=${(_event: Event) => {
                                //const input = event.target as HTMLInputElement;
                               // this.app.currentTrack.BPM = Number(input.value);
                            }}
                            value=${this.app.currentTrack?.BPM || 120}
                            size="m"
                    ></sp-number-field>
                </div>
            </div>
            <div class="middle section">
                <sp-action-button
                        aria-label="Play button"
                        ?disabled=${this.canPlay}
                        quiet
                        @click=${this.togglePlayback.bind(this)}>
                    ${this.playback.isPlaying ? html`<sp-icon-pause slot="icon"></sp-icon-pause>` : html`<sp-icon-play slot="icon"></sp-icon-play>`}
                </sp-action-button>
            </div>
                
            <div class="end section">
                <div>
                    <sp-field-label ?disabled=${this.canPlay}>Zoom</sp-field-label>
                    <sp-picker ?disabled=${this.canPlay} @change=${this.setZoomLevel.bind(this)}>
                        <sp-menu-item>Fit entire sequence (100%)</sp-menu-item>
                        <sp-menu-item>50%</sp-menu-item>
                        <sp-menu-item>25%</sp-menu-item>
                        <sp-menu-item>10%</sp-menu-item>
                        <sp-menu-divider></sp-menu-divider>
                        <sp-menu-item>One Measure</sp-menu-item>
                        <sp-menu-item>Two Measures</sp-menu-item>
                        <sp-menu-item>Four Measures</sp-menu-item>
                        <sp-menu-item>Eight Measures</sp-menu-item>
                    </sp-picker>
                </div>
                <sp-action-button
                        aria-label="Zoom out"
                        ?disabled=${this.canPlay}
                        quiet
                        @click=${this.zoomOut.bind(this)}>
                    <sp-icon-zoom-out slot="icon"></sp-icon-zoom-out>
                </sp-action-button>
                <sp-slider 
                        value=${this.zoomPercentage} 
                        @input=${this.handleZoomSlider.bind(this)}
                        ?disabled=${this.canPlay}
                        label-visibility="none" min="1" max="90"></sp-slider>
                <sp-action-button
                        aria-label="Zoom out"
                        ?disabled=${this.canPlay}
                        quiet
                        @click=${this.zoomIn.bind(this)}>
                    <sp-icon-zoom-in slot="icon"></sp-icon-zoom-in>
                </sp-action-button>
            </div>`;
    }
}