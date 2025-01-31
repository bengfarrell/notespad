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

    #tab-container {
        margin: 0 15px 0 15px;
        width: calc(100% - 30px);
        height: calc(100% - 240px);
        display: flex;
    }
    
    #tab {
        width: calc(100% - 250px);
        border: solid #6a6a6a 1px;
        border-radius: 8px;
        background-color: #3a3a3a;
    }
    
    #panel {
        width: 250px;
        border: solid #6a6a6a 1px;
        border-radius: 8px;
        background-color: #3a3a3a;
        margin-left: 5px;
        padding: 10px;
        height: calc(100% - 22px);
        overflow-y: auto;
    }

    notespad-tools-bar {
        width: calc(100% - 25px);
    }

    notespad-file-tabs {
        width: calc(100% - 25px);
        display: flex;
        justify-content: flex-end;
    }
    
    sp-toast {
        position: absolute;
        width: 100%;
        top: 20px;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
`;