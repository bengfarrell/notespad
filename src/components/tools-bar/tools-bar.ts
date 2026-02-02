import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-brackets-square.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-rail-right-open.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-rail-right-close.js';

import { style } from './tools-bar.css.js';
import { AppController } from '../../models/app.js';
import { TabsController } from '../../models/tabs.js';
import { AudioTrackTabConfig } from '../../models/tabfactory.js';
import { trimAudioBuffer } from '../../utils/audio.js';

@customElement('notespad-tools-bar')
export class ToolsBar extends LitElement {

    static styles = style;

    protected appController = AppController.attachHost(this);
    protected tabsController = TabsController.attachHost(this);

    render() {
        return html`
             <sp-action-button @click=${this.copyAndTrim.bind(this)} ?disabled=${!this.appController.selectedRange}>
                <sp-icon-brackets-square slot="icon"></sp-icon-brackets-square>
            </sp-action-button>`;
    }

    handleTimeSignature(event: InputEvent) {
        this.appController.beatsPerMeasure = Number((event.target as HTMLInputElement).value);
    }

    copyAndTrim() {
        const tabData = this.tabsController.currentTab;
        if (this.appController.selectedRange && tabData) {
            const trimmedBuffer = trimAudioBuffer(
                (tabData as AudioTrackTabConfig).buffer,
                this.appController.selectedRange[0],
                this.appController.selectedRange[1]);
            this.tabsController.createTab(new AudioTrackTabConfig( tabData.name + ' (copy)', trimmedBuffer, true));
        }
    }
}