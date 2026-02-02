import { css } from 'lit';

export const styles = css`
    ul {
        overflow: auto;
        list-style-type: none;
        padding: 15px;
        margin: 0;
        width: calc(100% - 30px);
        height: calc(100% - 30px);
    }
    
    li {
        height: 75px;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #1a1a1a;
        margin-bottom: 10px;
        cursor: pointer;
        display: flex;
    }
    
    li:hover {
        background-color: #292929;
    }
    
    li .thumb-container {
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        height: 32px;
    }
    
    li .label {
        color: #cacaca;
        padding-bottom: 5px;
    }

    li .label.lower {
        padding-top: 5px;
        font-size: 10px;
    }
    
    li .audio-thumb .playhead {
        position: absolute;
        background-color: orange;
        width: 1px;
        height: 100%;
    }

    li .audio-thumb {
        display: inline-block;
        position: relative;
        margin-left: 15px;
        height: 30px;
        background-repeat: no-repeat;
        border: 1px solid #4a4a4a;
    }

    li .playback-container {
        display: flex;
        align-items: center;
        width: 100%;
    }
    
    li sp-button {
        align-self: center;
        margin-left: 10px;
        margin-right: 10px;
    }
`;