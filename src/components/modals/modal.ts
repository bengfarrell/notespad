import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close-circle.js';

import { style } from './modal.css.js';

@customElement('notespad-modal')
export class Modal extends LitElement {

    static styles = style;

    render() {
        return html`<slot></slot>
        <sp-action-button quiet @click=${() => this.dispatchEvent(new Event('modalclose', { bubbles: true, composed: true }))}>
            <sp-icon-close-circle slot="icon"></sp-icon-close-circle>
        </sp-action-button>`
    }
}