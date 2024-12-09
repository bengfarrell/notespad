import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { AppController } from '../../models/app.js';
import { playSleepSyntax } from '../../utils/sonic-pi-exporter';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-copy.js';
import '@spectrum-web-components/toast/sp-toast.js';

import 'prismjs';
import 'prismjs/components/prism-ruby';
import { prismcss } from './prism.css';

declare global {
    interface Prism {
        languages: {
            ruby: any;
        }
    }
}

@customElement('notespad-export-modal')
export class ExportModal extends LitElement {
    appController = AppController.attachHost(this);

    @state()
    protected code: string = '';

    static styles = [ prismcss, css`
        #code {
            white-space: pre-wrap;
            color: #9a9a9a;
            overflow-y: scroll;
            width: calc(100% - 30px);
            height: calc(100% - 150px);
            display: inline-block;
            font-size: 18px;
            border-radius: 8px;
            padding: 15px;
            background-color: #1a1a1a;
            margin-bottom: 15px;
        }
        
        h2 {
            color: #a1a1a1;
        }

        #lower-tray {
            width: 100%;
            display: flex;
            justify-content: flex-end;
        }

        #toast-container {
            position: absolute;
            width: 100%;
            top: 20px;
            text-align: center;
        }
    `];

    async copyToClipboard() {
        await navigator.clipboard.writeText(this.code);
        this.shadowRoot!.querySelector('sp-toast')!.open = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this.code = playSleepSyntax(this.appController.currentTrack);
    }

    render() {
        return html`<h2>Export to Sonic PI:</h2>
        <div id="code"><code class="ruby">${unsafeHTML(Prism.highlight(this.code, Prism.languages.ruby, 'ruby'))}</code></div>
        <div id="lower-tray">
            <sp-button @click=${this.copyToClipboard.bind(this)}><sp-icon-copy slot="icon"></sp-icon-copy>Copy to Clipboard</sp-button>
        </div>

        <div id="toast-container">
            <sp-toast timeout="6000" variant="positive">
                Sonic PI loop copied to clipboard.
            </sp-toast>
        </div>`;
    }
}