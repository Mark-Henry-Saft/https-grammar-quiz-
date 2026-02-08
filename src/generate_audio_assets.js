
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

// 1. Correct (Double Ding - "Ding-Ding")
createWav('correct_v3.wav', 0.6, (t) => {
    // Two dings: 0.0s and 0.1s
    // High C (C6) and even higher (E6) to sound like a service bell
    const f1 = 1046.50; // C6
    const f2 = 1318.51; // E6

    let sample = 0;

    // First Ding
    const decay1 = Math.exp(-10 * t);
    sample += Math.sin(2 * Math.PI * f1 * t) * decay1 * 0.5;

    // Second Ding (delayed 100ms)
    if (t > 0.1) {
        const t2 = t - 0.1;
        const decay2 = Math.exp(-10 * t2);
        sample += Math.sin(2 * Math.PI * f2 * t2) * decay2 * 0.5;
    }

    return sample;
}, 0.6);

// 2. Incorrect (Fail - Distinct "Buzzer/Fail")
createWav('incorrect_v3.wav', 0.6, (t) => {
    // Descending Sawtooth/Square hybrid for a "Game Show Wrong Answer" feel
    const startFreq = 150;
    const endFreq = 100;
    // Linear slide down
    const currentFreq = startFreq - (startFreq - endFreq) * (t / 0.6);

    const decay = Math.exp(-5 * t);

    // Mix of sine (body) and square (grit)
    const sine = Math.sin(2 * Math.PI * currentFreq * t);
    const square = sine > 0 ? 1 : -1;

    return (sine * 0.7 + square * 0.3) * decay;
}, 0.7);

// 3. Click (Crisp Tick) - Kept largely same but renamed
createWav('click_v3.wav', 0.05, (t) => {
    const f = 800;
    const decay = Math.exp(-30 * t);
    return Math.sin(2 * Math.PI * f * t) * decay;
}, 0.6);

// 4. Fanfare (Chime - Simple Sine Arpeggio) - Renamed
createWav('fanfare_v3.wav', 2.0, (t) => {
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
