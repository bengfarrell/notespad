import { css } from 'lit';
export const style = css`
    :host {
        position: absolute;
        width: calc(100% - 85px);
        height: calc(100% - 85px);
        border-radius: 8px;
        margin: 25px;
        padding: 25px;
        border: 1px solid #4a4a4a;
        background-color: #2a2a2a;
    }

    sp-action-button {
        position: absolute;
        top: 0;
        right: 0;
    }
`;