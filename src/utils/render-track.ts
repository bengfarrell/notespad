import { MIDITrack } from 'midi-sequence-timeline';

export const renderTrack = async (track: MIDITrack) => {
    const c = new OffscreenCanvas(600, 100);
    const ctx = c.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#5a8050';
        track.events.forEach((e) => {
            ctx.beginPath();
            ctx.roundRect(e.time / 10,  e.note - track.noteRange[0], e.duration / 10, 2, 5);
            ctx.fill();
        });
    }
    return URL.createObjectURL(await c.convertToBlob());
}