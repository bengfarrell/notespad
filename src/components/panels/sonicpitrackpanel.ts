import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { property } from 'lit/decorators.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-copy.js';

import { TabsController } from '../../models/tabs.js';
import { AppController } from '../../models/app.js';
import { GlobalAlertEvent } from '../app/app.js';
import { SonicPITrackTabConfig } from '../../models/tabfactory.js';
import { playSleepSyntax } from '../../utils/sonic-pi-exporter';

@customElement('notespad-panel-sonicpitrack')
export class SonicPITrackPanel extends LitElement {
    static styles = css``;

    @property()
    guid: string = '';

    async copyToClipboard() {
        const tabData = this.tabsController.findTabByGUID(this.guid) as SonicPITrackTabConfig;
        if (!tabData) return undefined;
        await navigator.clipboard.writeText(playSleepSyntax(tabData.track));
        this.dispatchEvent(new GlobalAlertEvent('Sonic PI code copied to clipboard'))
    }

    protected tabsController = TabsController.attachHost(this);
    protected appController = AppController.attachHost(this);
    render() {
        return html`<sp-button @click=${this.copyToClipboard.bind(this)}><sp-icon-copy slot="icon"></sp-icon-copy>Copy to Clipboard</sp-button>`;
    }
}