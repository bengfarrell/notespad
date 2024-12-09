import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-brackets-square.js';

import { style } from './tools-bar.css.js';
import { AppController } from '../../models/app';

@customElement('notespad-tools-bar')
export class ToolsBar extends LitElement {

    static styles = style;

    appController = AppController.attachHost(this);

    render() {
        return html`
        <sp-action-button @click=${this.copyAndTrim.bind(this)} ?disabled=${!this.appController.selectedRange}>
            <sp-icon-brackets-square slot="icon"></sp-icon-brackets-square>
        </sp-action-button>`
    }

    copyAndTrim() {
        if (this.appController.selectedRange) {
        const copy = this.appController.currentTrack.clone('');
        copy.name += ' (copy)';
        copy.trim(this.appController.selectedRange[0] * this.appController.currentTrack.BPM, this.appController.selectedRange[1] * this.appController.currentTrack.BPM);
        this.appController.loadTrack(copy);
        }
    }
}