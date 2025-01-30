import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('notespad-panel-empty')
export class EmptyPanel extends LitElement {
    static styles = css``;

    render() {
        return html``;
    }
}