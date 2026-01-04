/**
 * TanpuraSynth - Tanpura Drone Synthesizer
 * Creates an authentic-sounding tanpura drone for practice accompaniment
 * Uses multiple oscillators with rich harmonics for that characteristic buzz
 */

import * as Tone from 'tone';
import { DEFAULT_SA_FREQUENCY } from '../utils/swarUtils.js';

export class TanpuraSynth {
    constructor(options = {}) {
        this.baseSa = options.baseSa || DEFAULT_SA_FREQUENCY;
        this.volume = options.volume || -12; // dB
        this.isPlaying = false;
        this.isInitialized = false;

        // Oscillators for Sa and Pa drone
        this.oscillators = [];
        this.gainNode = null;
        this.masterGain = null;
    }

    /**
     * Initialize the synthesizer
     */
    async init() {
        if (this.isInitialized) return;

        try {
            await Tone.start();

            // Create master gain
            this.masterGain = new Tone.Gain(Tone.dbToGain(this.volume)).toDestination();

            this.isInitialized = true;
            console.log('TanpuraSynth initialized');
        } catch (error) {
            console.error('Failed to initialize TanpuraSynth:', error);
            throw new Error('Tanpura initialization failed');
        }
    }

    /**
     * Start the tanpura drone
     * Plays Sa (base) and Pa (perfect 5th) with harmonics
     */
    async start() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.isPlaying) return;

        // Calculate frequencies
        const saFreq = this.baseSa;
        const paFreq = this.baseSa * 1.5; // Perfect 5th
        const saLowFreq = this.baseSa / 2; // Lower octave Sa

        // Create oscillators with different waveforms for richness
        const oscillatorConfigs = [
            // Main Sa (lower octave) - fundamental
            { freq: saLowFreq, type: 'sine', gain: 0.4 },
            // Sa harmonics
            { freq: saLowFreq * 2, type: 'sine', gain: 0.2 },
            { freq: saLowFreq * 3, type: 'sine', gain: 0.1 },
            // Pa drone
            { freq: paFreq / 2, type: 'sine', gain: 0.25 },
            { freq: paFreq, type: 'sine', gain: 0.15 },
            // Middle Sa
            { freq: saFreq, type: 'sine', gain: 0.3 },
            // Subtle detuned oscillators for "buzz" effect (javari)
            { freq: saLowFreq * 1.002, type: 'sine', gain: 0.08 },
            { freq: saLowFreq * 0.998, type: 'sine', gain: 0.08 },
        ];

        this.oscillators = oscillatorConfigs.map(config => {
            const osc = new Tone.Oscillator({
                frequency: config.freq,
                type: config.type
            });

            const gain = new Tone.Gain(config.gain);
            osc.connect(gain);
            gain.connect(this.masterGain);

            return { oscillator: osc, gain: gain };
        });

        // Start all oscillators with slight stagger for natural attack
        this.oscillators.forEach((item, index) => {
            item.oscillator.start(`+${index * 0.05}`);
        });

        this.isPlaying = true;
        console.log(`Tanpura started - Sa: ${saFreq.toFixed(1)} Hz`);
    }

    /**
     * Stop the tanpura drone
     */
    stop() {
        if (!this.isPlaying) return;

        // Stop and dispose all oscillators
        this.oscillators.forEach(item => {
            item.oscillator.stop();
            item.oscillator.dispose();
            item.gain.dispose();
        });
        this.oscillators = [];

        this.isPlaying = false;
        console.log('Tanpura stopped');
    }

    /**
     * Set the base Sa frequency
     * @param {number} frequency - New Sa frequency in Hz
     */
    setBaseSa(frequency) {
        const wasPlaying = this.isPlaying;

        if (wasPlaying) {
            this.stop();
        }

        this.baseSa = frequency;

        if (wasPlaying) {
            this.start();
        }
    }

    /**
     * Set the volume
     * @param {number} volumeDb - Volume in decibels (-60 to 0)
     */
    setVolume(volumeDb) {
        this.volume = Math.max(-60, Math.min(0, volumeDb));
        if (this.masterGain) {
            this.masterGain.gain.value = Tone.dbToGain(this.volume);
        }
    }

    /**
     * Toggle drone on/off
     */
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Check if tanpura is playing
     * @returns {boolean}
     */
    getIsPlaying() {
        return this.isPlaying;
    }

    /**
     * Cleanup and dispose
     */
    destroy() {
        this.stop();

        if (this.masterGain) {
            this.masterGain.dispose();
            this.masterGain = null;
        }

        this.isInitialized = false;
        console.log('TanpuraSynth destroyed');
    }
}

// Singleton instance
let tanpuraInstance = null;

/**
 * Get the shared TanpuraSynth instance
 * @returns {TanpuraSynth}
 */
export function getTanpura() {
    if (!tanpuraInstance) {
        tanpuraInstance = new TanpuraSynth();
    }
    return tanpuraInstance;
}
