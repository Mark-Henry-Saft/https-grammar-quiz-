
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
createWav('correct_new.wav', 0.5, (t) => {
    const f = 523.25; // C5 (Softer than 880Hz)
    const decay = Math.exp(-8 * t);
    return Math.sin(2 * Math.PI * f * t) * decay;
}, 0.5);

// 2. Incorrect (Thud - Low Sine/Triangle + Fast Decay)
createWav('incorrect_new.wav', 0.4, (t) => {
    const f = 60; // Low frequency thud
    const decay = Math.exp(-15 * t); // Fast decay
    return (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * (f * 1.5) * t)) * decay;
}, 0.6);

// 3. Click (Short, high-frequency tick)
createWav('click_new.wav', 0.05, (t) => {
    const f = 1200;
    const decay = Math.exp(-50 * t);
    return Math.sin(2 * Math.PI * f * t) * decay;
}, 0.3);

// 4. Fanfare (Trumpet - brassy saw/clipped sine sequence)
createWav('fanfare.wav', 3.0, (t) => {
    // Melody: C4 (261), E4 (329), G4 (392), C5 (523)
    // Times: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-2.0
    let f = 0;
    let localT = 0;

    if (t < 0.15) { f = 261.63; localT = t; }
    else if (t < 0.3) { f = 329.63; localT = t - 0.15; }
    else if (t < 0.45) { f = 392.00; localT = t - 0.3; }
    else if (t < 3.0) { f = 523.25; localT = t - 0.45; }
    else return 0;

    if (f === 0) return 0;

    // Brass Synthesis: Sawtooth-ish (fundamental + odd harmonics)
    const w = 2 * Math.PI * f * localT;
    let v = Math.sin(w) + 0.5 * Math.sin(2 * w) + 0.25 * Math.sin(3 * w); // Simple brass approximation

    // Envelope (ADSR) per note
    let env = 0;
    if (localT < 0.05) env = localT / 0.05; // Attack
    else if (localT < 0.1) env = 1 - (localT - 0.05) * 2; // Decay
    else env = 0.8 * Math.exp(-(localT - 0.1) * (t > 0.6 ? 2 : 10)); // Sustain/Release

    return v * env;
}, 0.5);
