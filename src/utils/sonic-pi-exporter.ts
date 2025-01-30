import { MIDITrack } from 'music-timeline';

export const NOTES = [ 'C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

export const getNotation = (note: number): string => {
    return NOTES[note % NOTES.length] + Math.floor(note / NOTES.length - 2);
}
/*const formatVal = (num: number): number => {
    const formattedNumber = new Intl.NumberFormat('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
    return parseFloat(formattedNumber);
}*/

export const playSleepSyntax = (_track: MIDITrack) => {
    /*const cmds: string[] = track.sequence.map((e, index) => {
        const delta = index === 0 ? track.sequence[index].time : track.sequence[index].time - track.sequence[index-1].time;
        const play = `  play :${getNotation(e.note)}, sustain: ${formatVal(e.duration)}, amp: ${formatVal(e.velocity / 127)}`;

        if (delta === 0) {
            // no sleep at beginning
            return play;
        }
        return `  sleep ${formatVal(delta)}\r\n${play}`;
    });*/
    return ''; //`live_loop :myloop do\r\n` + cmds.join('\r\n') + '\r\nend';
}