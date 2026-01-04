/**
 * WaveformVisualizer Component
 * Real-time audio waveform visualization with Indian theme colors
 */

export class WaveformVisualizer {
    constructor(container, options = {}) {
        this.container = container;
        this.width = options.width || 800;
        this.height = options.height || 120;
        this.color = options.color || '#ff9933'; // Saffron color
        this.backgroundColor = options.backgroundColor || '#1a1a2e';

        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.audioEngine = null;

        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="waveform-container">
        <canvas class="waveform-canvas"></canvas>
      </div>
    `;

        this.canvas = this.container.querySelector('.waveform-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.resize();

        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width - 32; // Account for padding
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    /**
     * Start visualization with an AudioEngine
     * @param {AudioEngine} audioEngine - AudioEngine instance
     */
    start(audioEngine) {
        this.audioEngine = audioEngine;
        this.draw();
    }

    /**
     * Stop visualization
     */
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.clear();
    }

    /**
     * Main draw loop
     */
    draw() {
        if (!this.audioEngine) return;

        // Get waveform data
        const dataArray = this.audioEngine.getTimeDomainData();

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw waveform
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.color;

        const sliceWidth = this.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i]; // -1 to 1
            const y = (v + 1) / 2 * this.height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        // Add glow effect when there's audio
        const volume = this.audioEngine.getVolume();
        if (volume > 0.01) {
            this.ctx.shadowBlur = 10 + volume * 20;
            this.ctx.shadowColor = this.color;
        } else {
            this.ctx.shadowBlur = 0;
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.draw());
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw center line
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
    }

    /**
     * Set waveform color
     * @param {string} color - CSS color
     */
    setColor(color) {
        this.color = color;
    }
}
