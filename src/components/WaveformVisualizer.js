/**
 * WaveformVisualizer Component - Pro Edition
 * Premium real-time audio waveform with saffron/gold gradients and glow effects
 */

export class WaveformVisualizer {
    constructor(container, options = {}) {
        this.container = container;
        this.width = options.width || 800;
        this.height = options.height || 120;
        this.backgroundColor = options.backgroundColor || '#0D0D1A';

        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.audioEngine = null;
        this.smoothedData = null;

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
        this.width = rect.width - 32;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Create gradient for filled waveform - Saffron to Gold
        this.fillGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        this.fillGradient.addColorStop(0, 'rgba(255, 153, 51, 0.4)');
        this.fillGradient.addColorStop(0.5, 'rgba(255, 107, 53, 0.25)');
        this.fillGradient.addColorStop(1, 'rgba(139, 21, 56, 0.15)');

        // Create stroke gradient - Saffron/Gold
        this.strokeGradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        this.strokeGradient.addColorStop(0, '#FF9933');
        this.strokeGradient.addColorStop(0.5, '#FFD700');
        this.strokeGradient.addColorStop(1, '#FF6B35');
    }

    /**
     * Start visualization with an AudioEngine
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
     * Main draw loop with premium effects
     */
    draw() {
        if (!this.audioEngine) return;

        // Get waveform data
        const dataArray = this.audioEngine.getTimeDomainData();
        const volume = this.audioEngine.getVolume();

        // Smooth the data for better visuals
        if (!this.smoothedData) {
            this.smoothedData = new Float32Array(dataArray.length);
        }
        for (let i = 0; i < dataArray.length; i++) {
            this.smoothedData[i] = this.smoothedData[i] * 0.7 + dataArray[i] * 0.3;
        }

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw center line
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255, 153, 51, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();

        // Draw filled waveform (mirrored for symmetry)
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);

        const sliceWidth = this.width / this.smoothedData.length;
        let x = 0;

        // Top half
        for (let i = 0; i < this.smoothedData.length; i++) {
            const v = this.smoothedData[i];
            const y = (1 - (v + 1) / 2) * this.height / 2 + this.height / 4;
            this.ctx.lineTo(x, y);
            x += sliceWidth;
        }

        // Bottom half (mirror)
        for (let i = this.smoothedData.length - 1; i >= 0; i--) {
            x -= sliceWidth;
            const v = this.smoothedData[i];
            const y = ((v + 1) / 2) * this.height / 2 + this.height / 2;
            this.ctx.lineTo(x, y);
        }

        this.ctx.closePath();
        this.ctx.fillStyle = this.fillGradient;
        this.ctx.fill();

        // Draw waveform stroke
        this.ctx.beginPath();
        x = 0;

        for (let i = 0; i < this.smoothedData.length; i++) {
            const v = this.smoothedData[i];
            const y = (v + 1) / 2 * this.height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineWidth = 2.5;
        this.ctx.strokeStyle = this.strokeGradient;

        // Add glow effect when there's audio
        if (volume > 0.01) {
            this.ctx.shadowBlur = 15 + volume * 35;
            this.ctx.shadowColor = '#FF9933';
        } else {
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#FF9933';
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw frequency bars in background (subtle)
        if (volume > 0.01) {
            this.drawFrequencyBars();
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.draw());
    }

    /**
     * Draw subtle frequency bars in background
     */
    drawFrequencyBars() {
        const frequencyData = this.audioEngine.getFrequencyData();
        if (!frequencyData) return;

        const barCount = 32;
        const barWidth = this.width / barCount - 2;
        const step = Math.floor(frequencyData.length / barCount);

        for (let i = 0; i < barCount; i++) {
            const value = frequencyData[i * step];
            const percent = value / 255;
            const barHeight = percent * this.height * 0.4;

            const x = i * (barWidth + 2);
            const y = this.height - barHeight;

            // Create gradient for each bar
            const gradient = this.ctx.createLinearGradient(x, this.height, x, y);
            gradient.addColorStop(0, 'rgba(255, 153, 51, 0.15)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.05)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, barHeight);
        }
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw center line
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255, 153, 51, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    /**
     * Set accent color based on accuracy
     */
    setAccuracyColor(accuracy) {
        switch (accuracy) {
            case 'shuddha':
            case 'accurate':
                this.ctx.shadowColor = '#00D67F';
                break;
            case 'acceptable':
            case 'close':
                this.ctx.shadowColor = '#FFD700';
                break;
            case 'off':
                this.ctx.shadowColor = '#E53E3E';
                break;
            default:
                this.ctx.shadowColor = '#FF9933';
        }
    }
}
