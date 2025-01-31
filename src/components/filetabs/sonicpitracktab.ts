import { css, html, LitElement, } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-play-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-pause-circle.js';

import { TabsController } from '../../models/tabs.js';

import 'prismjs';
import 'prismjs/components/prism-ruby';
import { prismcss } from './prism.css';
import { playSleepSyntax } from '../../utils/sonic-pi-exporter';
import { SonicPITrackTabConfig } from '../../models/tabfactory';

declare global {
    interface Prism {
        languages: {
            ruby: any;
        }
    }
}
@customElement('notespad-tab-sonicpitrack')
export class SonicPITrackTab extends LitElement {
    @state()
    protected code: string = '';

    static styles = [ prismcss, css`
        #code {
            white-space: pre-wrap;
            color: #9a9a9a;
            overflow-y: scroll;
            width: calc(100% - 30px);
            height: calc(100% - 30px);
            display: inline-block;
            font-size: 18px;
            border-radius: 8px;
            padding: 15px;
            background-color: #1a1a1a;
        }
        
        h2 {
            color: #a1a1a1;
        }
    `];

    @property()
    guid: string = '';

    tabsController = TabsController.attachHost(this);

    connectedCallback() {
        super.connectedCallback();
        const tabData = this.tabsController.findTabByGUID(this.guid) as SonicPITrackTabConfig;
        if (!tabData) return undefined;
        this.code = playSleepSyntax(tabData.track);
    }


    render() {
        return html`
        <div id="code"><code class="ruby">${unsafeHTML(Prism.highlight(this.code, Prism.languages.ruby, 'ruby'))}</code></div>`;
    }
}