/**
 * SwarSynthesizer - Generate reference tones for Swar practice
 * Uses Tone.js for high-quality audio synthesis
 */

import * as Tone from 'tone';
import { swarToFrequency, SHRUTI_MAP, DEFAULT_SA_FREQUENCY } from '../utils/swarUtils.js';

export class SwarSynthesizer {
    constructor() {
        this.synth = null;
        this.isInitialized = false;
        this.currentSwar = null;
        this.volume = -6; // dB
        this.baseSa = DEFAULT_SA_FREQUENCY;
    }

    /**
     * Initialize the synthesizer
     */
    async init() {
        if (this.isInitialized) return;

        try {
            await Tone.start();

            // Create a smooth synth for reference tones
            this.synth = new Tone.Synth({
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.8,
                    release: 0.5
                }
            }).toDestination();

            this.synth.volume.value = this.volume;
            this.isInitialized = true;

            console.log('SwarSynthesizer initialized');
        } catch (error) {
            console.error('Failed to initialize SwarSynthesizer:', error);
            throw new Error('Audio synthesis initialization failed');
        }
    }

    /**
     * Set the base Sa frequency
     * @param {number} frequency - Sa frequency in Hz
     */
    setBaseSa(frequency) {
        this.baseSa = frequency;
    }

    /**
     * Play a Swar by name
     * @param {string} swarName - Swar name like 'Sa', 'Re', 'Ga'
     * @param {string} variant - 'shuddha', 'komal', or 'tivra'
     * @param {number} octave - Octave offset
     * @param {number} duration - Duration in seconds (optional)
     */
    async playSwar(swarName, variant = 'shuddha', octave = 0, duration = null) {
        if (!this.isInitialized) {
            await this.init();
        }

        this.stop();

        try {
            const frequency = swarToFrequency(swarName, variant, octave, this.baseSa);
            this.currentSwar = { swarName, variant, octave };

            if (duration) {
                this.synth.triggerAttackRelease(frequency, duration);
            } else {
                this.synth.triggerAttack(frequency);
            }

            console.log(`Playing: ${swarName} (${variant}) - ${frequency.toFixed(2)} Hz`);
        } catch (error) {
            console.error('Failed to play swar:', error);
        }
    }

    /**
     * Play a frequency directly
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds (optional)
     */
    async playFrequency(frequency, duration = null) {
        if (!this.isInitialized) {
            await this.init();
        }

        this.stop();

        try {
            if (duration) {
                this.synth.triggerAttackRelease(frequency, duration);
            } else {
                this.synth.triggerAttack(frequency);
            }
        } catch (error) {
            console.error('Failed to play frequency:', error);
        }
    }

    /**
     * Play a semitone relative to Sa
     * @param {number} semitone - Semitone index (0-11)
     * @param {number} duration - Duration in seconds (optional)
     */
    async playSemitone(semitone, duration = 1.5) {
        if (!this.isInitialized) {
            await this.init();
        }

        this.stop();

        try {
            const frequency = this.baseSa * Math.pow(2, semitone / 12);

            if (duration) {
                this.synth.triggerAttackRelease(frequency, duration);
            } else {
                this.synth.triggerAttack(frequency);
            }

            const shrutiData = SHRUTI_MAP[semitone % 12];
            console.log(`Playing: ${shrutiData.hindi} (${shrutiData.swar}) - ${frequency.toFixed(2)} Hz`);
        } catch (error) {
            console.error('Failed to play semitone:', error);
        }
    }

    /**
     * Stop the currently playing note
     */
    stop() {
        if (this.synth && this.isInitialized) {
            try {
                this.synth.triggerRelease();
                this.currentSwar = null;
            } catch (error) {
                // Ignore errors when stopping
            }
        }
    }

    /**
     * Play a sequence of semitones
     * @param {Array<number>} semitones - Array of semitone indices
     * @param {number} noteDuration - Duration of each note in seconds
     * @param {number} gap - Gap between notes in seconds
     * @param {Function} onNoteStart - Callback when each note starts
     */
    async playSequence(semitones, noteDuration = 0.8, gap = 0.2, onNoteStart = null) {
        if (!this.isInitialized) {
            await this.init();
        }

        const totalDuration = noteDuration + gap;

        for (let i = 0; i < semitones.length; i++) {
            const semitone = semitones[i];
            const shrutiData = SHRUTI_MAP[semitone % 12];

            if (onNoteStart) {
                onNoteStart(shrutiData, i, semitone);
            }

            await this.playSemitone(semitone, noteDuration);
            await new Promise(resolve => setTimeout(resolve, totalDuration * 1000));
        }
    }

    /**
     * Set the volume
     * @param {number} volumeDb - Volume in decibels (-60 to 0)
     */
    setVolume(volumeDb) {
        this.volume = Math.max(-60, Math.min(0, volumeDb));
        if (this.synth) {
            this.synth.volume.value = this.volume;
        }
    }

    /**
     * Set oscillator type
     * @param {string} type - 'sine', 'triangle', 'square', 'sawtooth'
     */
    setOscillatorType(type) {
        if (this.synth) {
            this.synth.oscillator.type = type;
        }
    }

    /**
     * Check if a note is currently playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.currentSwar !== null;
    }

    /**
     * Cleanup and dispose
     */
    destroy() {
        this.stop();
        if (this.synth) {
            this.synth.dispose();
            this.synth = null;
        }
        this.isInitialized = false;
        console.log('SwarSynthesizer destroyed');
    }
}

// Singleton instance
let synthesizerInstance = null;

/**
 * Get the shared SwarSynthesizer instance
 * @returns {SwarSynthesizer}
 */
export function getSynthesizer() {
    if (!synthesizerInstance) {
        synthesizerInstance = new SwarSynthesizer();
    }
    return synthesizerInstance;
}
