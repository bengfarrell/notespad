import { css } from 'lit';

export const style = css`
    :host {
        padding: 20px;
        display: flex;
        width: calc(100% - 40px);
    }
    
    h3 {
        margin: 0;
        color: var(--spectrum-alias-text-color);
    }
    
    .section {
        flex: 1;
        display: flex;
    }
    
    .section.start {
        justify-content: flex-start;
    }

    .section.middle {
        justify-content: center;
    }
        
    .section.end {
        justify-content: flex-end;
    }

    .section > sp-action-button,
    .section > sp-button {
        margin-top: 28px;
    }

    .section > sp-slider {
        margin-top: 36px;
    }

    .section > * {
        margin-bottom: auto;
        margin-top: auto;
        margin-right: 20px;
    }
    
`;