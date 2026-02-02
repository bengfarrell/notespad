import { css } from 'lit';

export const style = css`
    sp-button {
        margin-top: 5px; 
        margin-left: 5px;
    }
    
    button {
        background-color: #2a2a2a;
        color: #fff;
        border-left: solid #6a6a6a 1px;
        border-right: solid #6a6a6a 1px;
        border-bottom: solid #6a6a6a 1px;
        border-top: none;
        padding: 5px 10px;
        border-radius: 0 0 8px 8px;
        cursor: pointer;
        margin-left: 2px;
    }

    button[selected] {
        background-color: #3a3a3a;
        border-left: solid #9a9a9a 1px;
        border-right: solid #9a9a9a 1px;
        border-bottom: solid #9a9a9a 1px;
    }

    button:hover {
        background-color: #6a6a6a;
    }

    button span {
        font-size: 11px;
        color: #9a9a9a;
        margin-top: 4px;
        display: inline-block;
    }

    button[selected] span {
        color: #cacaca;
    }
    
    button > sp-action-button {
        color: #9a9a9a;
        margin-left: 10px;
    }
`;