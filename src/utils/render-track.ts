import { MIDITrack } from 'music-timeline';
import { renderWaveform } from 'music-timeline/utils/renderwaveform.js';

export const renderTrack = async (track: MIDITrack | Float32Array[], width: number, height: number) => {
    const c = new OffscreenCanvas(width, height);
    const ctx = c.getContext('2d');
    let result;
    if (ctx) {
        ctx.fillStyle = '#ffffff';
        if (Array.isArray(track)) {
            result = renderWaveform(ctx, width, height, track as Float32Array[], 0.8);
        } else {
            ctx.fillStyle = '#5a8050';
            (track as MIDITrack).events.forEach((e) => {
                ctx.beginPath();
                ctx.roundRect(e.time / 10,  e.note - (track as MIDITrack).noteRange[0], e.duration / 10, 2, 5);
                ctx.fill();
            });
        }
    }
    return { image: URL.createObjectURL(await c.convertToBlob()), maxAmplitude: result?.maxAmplitude };
}