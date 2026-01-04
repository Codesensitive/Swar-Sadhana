/**
 * PitchDetector - Real-time pitch detection using YIN algorithm
 * Uses the pitchfinder library for accurate vocal pitch detection
 */

import { YIN } from 'pitchfinder';
import {
    frequencyToSwar,
    getCentsDeviation,
    getAccuracyLevel,
    getDirection,
    formatFrequency,
    DEFAULT_SA_FREQUENCY
} from '../utils/swarUtils.js';

export class PitchDetector {
    constructor(audioEngine, options = {}) {
        this.audioEngine = audioEngine;
        this.sampleRate = options.sampleRate || 44100;
        this.threshold = options.threshold || 0.15;
        this.minVolume = options.minVolume || 0.005;
        this.baseSa = options.baseSa || DEFAULT_SA_FREQUENCY;

        // Initialize YIN detector
        this.detectPitch = YIN({
            sampleRate: this.sampleRate,
            threshold: this.threshold
        });

        // Callbacks
        this.onPitchDetected = null;
        this.onSilence = null;

        // State
        this.isRunning = false;
        this.animationFrame = null;
        this.lastPitch = null;
        this.smoothedFrequency = 0;
        this.smoothingFactor = 0.5;

        // Debug tracking
        this.debugMode = false;
        this.lastDebugTime = 0;
    }

    /**
     * Set the base Sa frequency
     * @param {number} frequency - Sa frequency in Hz
     */
    setBaseSa(frequency) {
        this.baseSa = frequency;
    }

    /**
     * Start continuous pitch detection
     */
    start() {
        if (this.isRunning) return;

        // Update sample rate from audio engine
        this.sampleRate = this.audioEngine.getSampleRate();
        this.detectPitch = YIN({
            sampleRate: this.sampleRate,
            threshold: this.threshold
        });

        this.isRunning = true;
        this.detect();
        console.log('PitchDetector started');
    }

    /**
     * Stop pitch detection
     */
    stop() {
        this.isRunning = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        console.log('PitchDetector stopped');
    }

    /**
     * Main detection loop
     */
    detect() {
        if (!this.isRunning) return;

        // Get audio data
        const audioData = this.audioEngine.getTimeDomainData();
        const volume = this.audioEngine.getVolume();

        // Check if there's enough audio input
        if (volume < this.minVolume) {
            this.lastPitch = null;
            this.smoothedFrequency = 0;

            if (this.onSilence) {
                this.onSilence();
            }
        } else {
            // Detect pitch
            const frequency = this.detectPitch(audioData);

            if (frequency && frequency > 50 && frequency < 2000) {
                // Apply smoothing
                if (this.smoothedFrequency === 0) {
                    this.smoothedFrequency = frequency;
                } else {
                    this.smoothedFrequency =
                        this.smoothingFactor * frequency +
                        (1 - this.smoothingFactor) * this.smoothedFrequency;
                }

                const pitchData = this.getPitchData(this.smoothedFrequency);
                this.lastPitch = pitchData;

                if (this.onPitchDetected) {
                    this.onPitchDetected(pitchData);
                }
            }
        }

        // Continue detection loop
        this.animationFrame = requestAnimationFrame(() => this.detect());
    }

    /**
     * Get comprehensive pitch data from frequency
     * @param {number} frequency - Detected frequency in Hz
     * @returns {Object} Pitch data object with Swar information
     */
    getPitchData(frequency) {
        const swarData = frequencyToSwar(frequency, this.baseSa);
        const accuracy = getAccuracyLevel(swarData.cents);
        const direction = getDirection(swarData.cents);

        return {
            frequency: frequency,
            frequencyFormatted: formatFrequency(frequency),
            swar: swarData.swar,
            hindi: swarData.hindi,
            variant: swarData.variant,
            fullName: swarData.fullName,
            semitone: swarData.semitone,
            octave: swarData.octave,
            cents: swarData.cents,
            accuracy: accuracy,
            direction: direction,
            volume: this.audioEngine.getVolume(),
            timestamp: Date.now()
        };
    }

    /**
     * Get the last detected pitch
     * @returns {Object|null} Last pitch data
     */
    getLastPitch() {
        return this.lastPitch;
    }

    /**
     * Compare detected pitch to a target frequency
     * @param {number} targetFrequency - Target frequency in Hz
     * @returns {Object} Comparison result
     */
    compareToTarget(targetFrequency) {
        if (!this.lastPitch) {
            return {
                isMatching: false,
                cents: 0,
                direction: null,
                accuracy: 'off'
            };
        }

        const detectedFreq = this.lastPitch.frequency;
        const cents = 1200 * Math.log2(detectedFreq / targetFrequency);
        const accuracy = getAccuracyLevel(cents);
        const direction = getDirection(cents);

        return {
            isMatching: Math.abs(cents) <= 25,
            cents: Math.round(cents),
            direction: direction,
            accuracy: accuracy
        };
    }

    /**
     * Set the smoothing factor
     * @param {number} factor - Smoothing factor (0-1)
     */
    setSmoothingFactor(factor) {
        this.smoothingFactor = Math.max(0, Math.min(1, factor));
    }

    /**
     * Set minimum volume threshold
     * @param {number} volume - Minimum volume (0-1)
     */
    setMinVolume(volume) {
        this.minVolume = Math.max(0, Math.min(1, volume));
    }
}

/**
 * Create a PitchDetector instance
 * @param {AudioEngine} audioEngine - AudioEngine instance
 * @param {Object} options - Configuration options
 * @returns {PitchDetector}
 */
export function createPitchDetector(audioEngine, options = {}) {
    return new PitchDetector(audioEngine, options);
}
