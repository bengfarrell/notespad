import { addPitchBendsToNoteEvents, BasicPitch, noteFramesToTime, outputToNotesPoly } from '@spotify/basic-pitch/esm';
import { NoteEventTime } from '@spotify/basic-pitch';
import { MIDITrack, NoteEvent } from 'music-timeline';

export const changeSampleRate = async (buffer: AudioBuffer, sampleRate: number, numChannels?: number) => {
    if (buffer.sampleRate === sampleRate) {
        return buffer;
    }

    if (!numChannels) {
        numChannels = buffer.numberOfChannels;
    }
    const offlineCtx = new OfflineAudioContext(numChannels,
        buffer.duration * sampleRate, sampleRate);

    const offlineSource = offlineCtx.createBufferSource();
    offlineSource.buffer = buffer;
    offlineSource.connect(offlineCtx.destination);
    offlineSource.start();
    return await offlineCtx.startRendering();
}

export const cloneAudioBuffer = (buffer: AudioBuffer) => {
    const audioBuffer = new AudioBuffer({
        length: buffer.length,
        numberOfChannels: buffer.numberOfChannels,
        sampleRate: buffer.sampleRate
    });
    for(let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
        const samples = buffer.getChannelData(channelI);
        audioBuffer.copyToChannel(samples, channelI);
    }
    return audioBuffer;
}

export const trimAudioBuffer = (buffer: AudioBuffer, startTime: number, endTime: number) => {
    const sampleRate = buffer.sampleRate;
    const startFrame = startTime * sampleRate;
    const endFrame = endTime * sampleRate;
    const channels = buffer.numberOfChannels;

    // Create a new AudioBuffer for the trimmed audio
    const trimmedBuffer = (new AudioContext).createBuffer(
        channels,
        (endFrame - startFrame),
        sampleRate
    );

    for (let channel = 0; channel < channels; channel++) {
        const sourceData = buffer.getChannelData(channel).subarray(startFrame, endFrame);
        trimmedBuffer.getChannelData(channel).set(sourceData);
    }

    return trimmedBuffer;
}


export interface PitchDetectionOutput {
    contours: number[][];
    frames: number[][];
    onsets: number[][];
}

export interface PitchDetectOptions {
    segmentThreshold: number; // onset detection threshold
    confidenceThreshold: number; // frame confidence threshold
    minNoteLength: number;
    inferOnsets?: boolean;
    maxFrequency?: number;
    minFrequency?: number;
    melodiaTrick?: boolean;
    energyTolerance?: number;
}

export const defaultPitchDetectOptions = {
    segmentThreshold: 0.25,
    confidenceThreshold: 0.25,
    minNoteLength: 5,
    inferOnsets: true,
    //maxFrequency?: number,
    //minFrequency?: number,
    melodiaTrick: true,
    energyTolerance: 11
}

export const extractPitch = async (buffer: AudioBuffer, output: { progress: number}): Promise<PitchDetectionOutput> => {
    if (buffer.sampleRate !== 22050) {
        buffer = await changeSampleRate(buffer, 22050, 1);
    }
    const basicPitch = new BasicPitch('https://d3pt2wmrvq3ftf.cloudfront.net/basicpitch/model/model.json');
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];
    await basicPitch.evaluateModel(buffer,
        (f: number[][], o: number[][], c: number[][]) => {
            frames.push(...f);
            onsets.push(...o);
            contours.push(...c);
        },
        (p: number) => {
            output.progress = p * 100;
        },
    );
    return { contours, frames, onsets };
}

export const pitchDetectToMIDITrack = (
    pitchDetection: PitchDetectionOutput,
    pitchDetectOptions: PitchDetectOptions = defaultPitchDetectOptions, transposed = 0,
   ): MIDITrack => {

    const notes: NoteEventTime[] = noteFramesToTime(
        addPitchBendsToNoteEvents(
            pitchDetection.contours,
            outputToNotesPoly(
                pitchDetection.frames,
                pitchDetection.onsets,
                pitchDetectOptions.segmentThreshold,
                pitchDetectOptions.confidenceThreshold,
                pitchDetectOptions.minNoteLength ),
        ),
    );

    const mapped_notes: NoteEvent[] = notes.map((note) => {
        return {
            time: note.startTimeSeconds * 1000,
            duration: note.durationSeconds * 1000,
            note: note.pitchMidi + transposed,
            // pitchBends?
            velocity: note.amplitude * 127,
        };
    });
    const track = new MIDITrack();
    track.events = mapped_notes.sort((a, b) => a.time - b.time);
    track.timeMeta.tempo = 500000;
    track.timeMeta.division = 480;
    track.processTrack();
    return track;


}