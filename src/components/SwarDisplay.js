/**
 * SwarDisplay Component - Pro Edition
 * Premium pitch visualization with Devanagari and anime.js animations
 */

import anime from 'animejs/lib/anime.es.js';

export class SwarDisplay {
    constructor(container) {
        this.container = container;
        this.lastSwar = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="swar-display">
        <div class="swar-main">
          <div class="swar-glow"></div>
          <div class="swar-hindi">--</div>
          <div class="swar-roman">--</div>
        </div>
        <div class="swar-frequency">-- Hz</div>
        <div class="swar-cents">0 cents</div>
        <div class="swar-direction" style="display: none;">
          <span class="direction-arrow">↑</span>
          <span class="direction-text">ऊपर गाइए</span>
        </div>
        <div class="volume-bar-container">
          <div class="volume-bar-label">Volume</div>
          <div class="volume-bar-track">
            <div class="volume-bar-fill"></div>
          </div>
        </div>
      </div>
    `;

        // Add component-specific styles
        const style = document.createElement('style');
        style.textContent = `
            .swar-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 180px;
                height: 180px;
                border-radius: 50%;
                background: radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%);
                opacity: 0;
                pointer-events: none;
                z-index: -1;
            }
            .swar-main {
                position: relative;
            }
            .volume-bar-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-3);
                margin-top: var(--spacing-6);
            }
            .volume-bar-label {
                font-size: var(--font-size-sm);
                color: var(--color-text-dim);
                min-width: 60px;
            }
            .volume-bar-track {
                width: 200px;
                height: 8px;
                background: var(--color-bg-dark);
                border-radius: var(--radius-full);
                overflow: hidden;
            }
            .volume-bar-fill {
                height: 100%;
                width: 0%;
                background: var(--gradient-primary);
                border-radius: var(--radius-full);
                transition: width 0.1s ease;
            }
        `;
        if (!document.getElementById('swar-display-styles')) {
            style.id = 'swar-display-styles';
            document.head.appendChild(style);
        }

        // Cache DOM elements
        this.hindiElement = this.container.querySelector('.swar-hindi');
        this.romanElement = this.container.querySelector('.swar-roman');
        this.frequencyElement = this.container.querySelector('.swar-frequency');
        this.centsElement = this.container.querySelector('.swar-cents');
        this.directionElement = this.container.querySelector('.swar-direction');
        this.directionArrow = this.container.querySelector('.direction-arrow');
        this.directionText = this.container.querySelector('.direction-text');
        this.glowElement = this.container.querySelector('.swar-glow');
        this.volumeFill = this.container.querySelector('.volume-bar-fill');
    }

    /**
     * Animate swar change
     */
    animateSwarChange(newSwar, accuracy) {
        if (newSwar !== this.lastSwar) {
            anime({
                targets: this.hindiElement,
                scale: [0.8, 1.1, 1],
                duration: 300,
                easing: 'easeOutElastic(1, .6)'
            });
            this.lastSwar = newSwar;
        }

        // Update glow based on accuracy
        if (accuracy === 'shuddha' || accuracy === 'accurate') {
            anime({
                targets: this.glowElement,
                opacity: [0.5, 0.9],
                scale: [1, 1.4],
                duration: 500,
                easing: 'easeOutQuad'
            });
        } else {
            anime({
                targets: this.glowElement,
                opacity: 0,
                scale: 1,
                duration: 300
            });
        }
    }

    /**
     * Update display with pitch data
     */
    update(pitchData) {
        if (!pitchData) {
            this.showSilence();
            return;
        }

        // Update Swar display
        this.hindiElement.textContent = pitchData.hindi;
        this.romanElement.textContent = pitchData.swar;
        this.hindiElement.className = `swar-hindi ${pitchData.accuracy}`;
        this.animateSwarChange(pitchData.hindi, pitchData.accuracy);

        // Update frequency
        this.frequencyElement.textContent = pitchData.frequencyFormatted;

        // Update cents
        const centsText = Math.abs(pitchData.cents) <= 5 ? '✨ शुद्ध (Perfect)' :
            `${pitchData.cents > 0 ? '+' : ''}${pitchData.cents} cents`;
        this.centsElement.textContent = centsText;
        this.centsElement.className = `swar-cents ${pitchData.cents > 0 ? 'sharp' : pitchData.cents < 0 ? 'flat' : 'accurate'}`;

        // Update volume bar
        if (pitchData.volume !== undefined) {
            const volumePercent = Math.min(100, pitchData.volume * 500);
            this.volumeFill.style.width = `${volumePercent}%`;
        }

        // Direction indicator
        if (pitchData.accuracy === 'off') {
            this.showDirection(pitchData.direction);
        } else {
            this.directionElement.style.display = 'none';
        }
    }

    /**
     * Update display for target comparison
     */
    updateWithTarget(pitchData, comparison, targetSwar) {
        if (!pitchData) {
            this.showSilence();
            return;
        }

        // Show detected Swar
        this.hindiElement.textContent = pitchData.hindi;
        this.romanElement.textContent = pitchData.swar;
        this.hindiElement.className = `swar-hindi ${comparison.accuracy}`;
        this.animateSwarChange(pitchData.hindi, comparison.accuracy);

        // Show frequency
        this.frequencyElement.textContent = pitchData.frequencyFormatted;

        // Show cents from target
        const targetName = targetSwar.hindi || targetSwar.swar || 'Target';
        const centsText = comparison.cents === 0 ? '✨ शुद्ध (Perfect)' :
            `${comparison.cents > 0 ? '+' : ''}${comparison.cents} cents from ${targetName}`;
        this.centsElement.textContent = centsText;
        this.centsElement.className = `swar-cents ${comparison.cents > 0 ? 'sharp' : comparison.cents < 0 ? 'flat' : 'accurate'}`;

        // Update volume bar
        if (pitchData.volume !== undefined) {
            const volumePercent = Math.min(100, pitchData.volume * 500);
            this.volumeFill.style.width = `${volumePercent}%`;
        }

        // Direction indicator
        if (comparison.accuracy === 'off' || comparison.accuracy === 'acceptable') {
            this.showDirection(comparison.direction);
        } else {
            this.showSuccess();
        }
    }

    showDirection(direction) {
        this.directionElement.style.display = 'inline-flex';
        this.directionElement.className = `swar-direction ${direction}`;
        this.directionArrow.textContent = direction === 'higher' ? '↑' : '↓';
        this.directionText.textContent = direction === 'higher' ? 'ऊपर गाइए (Sing Higher)' : 'नीचे गाइए (Sing Lower)';
    }

    showSuccess() {
        this.directionElement.style.display = 'inline-flex';
        this.directionElement.className = 'swar-direction correct';
        this.directionArrow.textContent = '✓';
        this.directionText.textContent = 'बहुत खूब! (Perfect!)';

        // Celebration animation
        anime({
            targets: this.directionElement,
            scale: [0.8, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .6)'
        });
    }

    /**
     * Show silence state - listening but no input
     */
    showSilence() {
        this.hindiElement.textContent = '♪';
        this.hindiElement.className = 'swar-hindi';
        this.romanElement.textContent = 'गाइए';
        this.frequencyElement.textContent = 'सुन रहे हैं... (Listening...)';
        this.centsElement.textContent = '';
        this.directionElement.style.display = 'none';
        this.volumeFill.style.width = '0%';

        anime({
            targets: this.glowElement,
            opacity: 0,
            duration: 300
        });
    }

    /**
     * Show ready state - mic not active yet
     */
    showReady() {
        this.hindiElement.textContent = '♪';
        this.hindiElement.className = 'swar-hindi';
        this.romanElement.textContent = '';
        this.frequencyElement.textContent = 'नीचे स्वर चुनें (Select a Swar below)';
        this.centsElement.textContent = '';
        this.directionElement.style.display = 'none';
        this.volumeFill.style.width = '0%';

        // Gentle pulse animation
        anime({
            targets: this.hindiElement,
            scale: [1, 1.1, 1],
            duration: 2000,
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    /**
     * Show waiting state - deprecated, use showReady
     */
    showWaiting() {
        this.showReady();
    }
}
