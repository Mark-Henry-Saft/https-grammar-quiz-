
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(__dirname, 'assets', 'sounds');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const sampleRate = 44100;

function createWav(fileName, duration, generator, volume = 0.5) {
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(44 + numSamples * 2);

    // WAV Header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    for (let i = 0; i < numSamples; i++) {
        const tGlobal = i / sampleRate;
        let sample = generator(tGlobal);

        // Soft Clip
        if (sample > 1) sample = 1;
        if (sample < -1) sample = -1;

        buffer.writeInt16LE(Math.floor(sample * 0x7FFF * volume), 44 + i * 2);
    }

    fs.writeFileSync(path.join(destDir, fileName), buffer);
    console.log(`Generated ${fileName}`);
}

// 1. Correct (Ding - Simple Sine + Decay)
createWav('correct_v2.wav', 0.5, (t) => {
    const f = 523.25; // C5 (Softer than 880Hz)
    const decay = Math.exp(-8 * t);
    return Math.sin(2 * Math.PI * f * t) * decay;
}, 0.5);

// 2. Incorrect (Thud - Low Sine/Triangle + Fast Decay)
createWav('incorrect_v2.wav', 0.4, (t) => {
    const f = 60; // Low frequency thud
    const decay = Math.exp(-15 * t); // Fast decay
    return (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * (f * 1.5) * t)) * decay;
}, 0.8); // Increased volume from 0.6 to 0.8

// 3. Click (Short, high-frequency tick)
createWav('click_v2.wav', 0.05, (t) => {
    const f = 800; // Lowered from 1200 for more "body"
    const decay = Math.exp(-30 * t); // Slower decay for more audibility
    return Math.sin(2 * Math.PI * f * t) * decay;
}, 0.6); // Increased volume from 0.3 to 0.6

// 4. Fanfare (Chime - Simple Sine Arpeggio)
createWav('fanfare_v2.wav', 2.0, (t) => {
    // Simple Arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const times = [0.0, 0.15, 0.3, 0.45];

    let sample = 0;

    for (let i = 0; i < notes.length; i++) {
        const startTime = times[i];
        if (t >= startTime) {
            const localT = t - startTime;
            const decay = Math.exp(-5 * localT);
            sample += Math.sin(2 * Math.PI * notes[i] * localT) * decay * 0.3;
        }
    }

    return sample;
}, 0.5);
