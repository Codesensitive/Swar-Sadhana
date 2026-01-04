/**
 * AudioEngine - Web Audio API wrapper for microphone input
 * Handles audio context, microphone access, and analyser node
 */

export class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.stream = null;
        this.isListening = false;
        this.dataArray = null;
        this.bufferLength = 2048;
    }

    /**
     * Initialize the audio context
     * Must be called after user interaction (browser policy)
     */
    async init() {
        if (this.audioContext) return;

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.bufferLength * 2;
            this.analyser.smoothingTimeConstant = 0.8;

            // Create buffer for time domain data
            this.dataArray = new Float32Array(this.bufferLength);

            console.log('AudioEngine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AudioEngine:', error);
            throw new Error('Audio initialization failed. Please check browser support.');
        }
    }

    /**
     * Request microphone access and start listening
     */
    async startListening() {
        if (!this.audioContext) {
            await this.init();
        }

        // Resume context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Create microphone source
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);

            // Connect microphone to analyser
            this.microphone.connect(this.analyser);

            this.isListening = true;
            console.log('Microphone access granted, listening started');

            return true;
        } catch (error) {
            console.error('Failed to access microphone:', error);

            if (error.name === 'NotAllowedError') {
                throw new Error('Microphone access denied. Please allow microphone access to use this app.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No microphone found. Please connect a microphone and try again.');
            } else {
                throw new Error('Failed to access microphone: ' + error.message);
            }
        }
    }

    /**
     * Stop listening and release microphone
     */
    stopListening() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.isListening = false;
        console.log('Listening stopped');
    }

    /**
     * Get current time domain data (waveform)
     * @returns {Float32Array} Audio samples (new copy each call)
     */
    getTimeDomainData() {
        if (!this.analyser || !this.isListening) {
            return new Float32Array(this.bufferLength);
        }

        // Create a new buffer for each call to avoid stale data issues
        const dataArray = new Float32Array(this.bufferLength);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    }

    /**
     * Get frequency domain data
     * @returns {Uint8Array} Frequency data
     */
    getFrequencyData() {
        if (!this.analyser || !this.isListening) {
            return new Uint8Array(this.analyser?.frequencyBinCount || 1024);
        }

        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(frequencyData);
        return frequencyData;
    }

    /**
     * Get current volume level (0-1)
     * @returns {number} Volume level
     */
    getVolume() {
        if (!this.isListening) return 0;

        const data = this.getTimeDomainData();
        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }

        return Math.sqrt(sum / data.length);
    }

    /**
     * Check if there's significant audio input
     * @param {number} threshold - Volume threshold
     * @returns {boolean} Whether audio is detected
     */
    hasAudio(threshold = 0.01) {
        return this.getVolume() > threshold;
    }

    /**
     * Get the sample rate
     * @returns {number} Sample rate in Hz
     */
    getSampleRate() {
        return this.audioContext?.sampleRate || 44100;
    }

    /**
     * Get the audio context (for Tanpura synth)
     * @returns {AudioContext} The audio context
     */
    getAudioContext() {
        return this.audioContext;
    }

    /**
     * Cleanup and release resources
     */
    destroy() {
        this.stopListening();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.dataArray = null;

        console.log('AudioEngine destroyed');
    }
}

// Singleton instance
let audioEngineInstance = null;

/**
 * Get the shared AudioEngine instance
 * @returns {AudioEngine}
 */
export function getAudioEngine() {
    if (!audioEngineInstance) {
        audioEngineInstance = new AudioEngine();
    }
    return audioEngineInstance;
}
