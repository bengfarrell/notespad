import { css } from 'lit';
export const style = css`
    sp-theme {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #2a2a2a;
    }

    notespad-controls {
        background-color: #1e1e1e;
    }

    ms-timeline,
    #no-tracks-placeholder {
        margin: 0 15px 0 15px;
        width: calc(100% - 30px);
        height: calc(100% - 240px);
        display: flex;
        background-color: #3a3a3a;
    }

    #no-tracks-placeholder {
        opacity: 0.25;
        border-radius: 8px;
        background-color: #e5e5f7;
        background: repeating-linear-gradient(-45deg, #2f2f2f, #2f2f2f 5px, #808080 5px, #808080 25px);
    }
    
    notespad-tools-bar {
        width: calc(100% - 25px);
    }

    notespad-file-tabs {
        width: calc(100% - 25px);
        display: flex;
        justify-content: flex-end;
    }
    
    #file-tray {
        width: calc(100% - 25px);
        display: flex;
        justify-content: flex-end;
    }

    #file-tray sp-button {
        margin-left: 10px;
    }
`;