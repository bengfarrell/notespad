import { css } from 'lit';

export const style = css`
    :host {
        padding: 20px;
        display: flex;
        width: calc(100% - 40px);
        color: var(--spectrum-alias-text-color);
    }
    
    h3 {
        margin: 0;
    }
    
    .section {
        flex: 1;
        display: flex;
    }
    
    .section.start {
        justify-content: flex-start;
        flex-direction: column;
        max-width: 280px;
        margin-right: auto;
    }

    .section.middle {
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
        margin-top: 5px;
    }
        
    .section.end {
        justify-content: flex-end;
        max-width: 280px;
    }

    .section.end > sp-action-button,
    .section.end > sp-button {
        margin-top: 23px;
    }
    
    .section.end > sp-slider {
        margin-top: 22px;
    }

    .section > .zoom-selector sp-action-menu {
        width: 90px;
    }

    .section > * {
        margin-bottom: auto;
        margin-right: 10px;
    }
    
    .row {
        display: flex;
        flex-wrap: wrap;
    }
    
    .well {
        background-color: #333333;
        padding: 10px;
        border-radius: 8px;
        margin-top: 8px;
    }
    
    .row .grid-item {
        margin-right: 15px;
    }
    
    .row .grid-item.time-signature {
        width: 80px;
    }
    
    .disabled {
        opacity: 0.4;
    }

    .use-metronome-label {
       color: #9a9a9a;
    }
    
    sp-number-field {
        --spectrum-component-height-100: 20px;
        --spectrum-textfield-placeholder-font-size: 12px;
        --spectrum-in-field-button-width-stacked-medium: 32px;
    }

    sp-number-field#bpm {
        --spectrum-text-field-minimum-width-multiplier: 0.5;
        width: 62px;
    }

    sp-number-field#grid-offset {
        width: 62px;
    }

    sp-number-field#time-signature-numerator {
        --spectrum-text-field-minimum-width-multiplier: 0.5;
        --spectrum-in-field-button-width-stacked-medium: 15px;
        --spectrum-textfield-spacing-inline: 6px;
        width: 32px;
    }

    #time-signature-denominator {
        margin-top: 1px;
        font-size: 12px;
        font-weight: bold;
    }
    
`;