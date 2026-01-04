/**
 * AccuracyMeter Component - Pro Edition
 * Premium visual gauge with anime.js animations
 */

import anime from 'animejs/lib/anime.es.js';

export class AccuracyMeter {
    constructor(container) {
        this.container = container;
        this.value = 0;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="accuracy-meter">
        <div class="meter-header">
          <span class="meter-title">शुद्धता (Accuracy)</span>
          <span class="meter-value">0%</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width: 0%"></div>
          <div class="meter-glow"></div>
        </div>
        <div class="meter-labels">
          <span>असत्य</span>
          <span class="meter-status"></span>
          <span>शुद्ध</span>
        </div>
      </div>
    `;

        // Add enhanced styles
        const style = document.createElement('style');
        style.textContent = `
            .meter-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-2);
            }
            .meter-title {
                font-size: var(--font-size-sm);
                color: var(--color-text-dim);
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }
            .meter-value {
                font-family: var(--font-primary);
                font-size: var(--font-size-xl);
                font-weight: 700;
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .meter-glow {
                position: absolute;
                top: -4px;
                bottom: -4px;
                left: 0;
                width: 0%;
                border-radius: var(--radius-full);
                opacity: 0.5;
                filter: blur(8px);
                pointer-events: none;
                transition: width 0.3s ease;
            }
            .meter-track {
                position: relative;
            }
            .meter-status {
                font-weight: 600;
                font-family: var(--font-hindi);
                transition: color 0.3s ease;
            }
            .meter-status.excellent {
                color: var(--color-success);
            }
            .meter-status.good {
                color: var(--color-warning);
            }
            .meter-status.needs-work {
                color: var(--color-error);
            }
        `;
        if (!document.getElementById('swar-meter-styles')) {
            style.id = 'swar-meter-styles';
            document.head.appendChild(style);
        }

        // Get elements
        this.fillElement = this.container.querySelector('.meter-fill');
        this.glowElement = this.container.querySelector('.meter-glow');
        this.valueElement = this.container.querySelector('.meter-value');
        this.statusElement = this.container.querySelector('.meter-status');
    }

    /**
     * Update the meter value with animation
     */
    update(accuracy) {
        const newValue = Math.max(0, Math.min(100, accuracy));

        // Animate fill
        anime({
            targets: this.fillElement,
            width: `${newValue}%`,
            duration: 300,
            easing: 'easeOutQuad'
        });

        // Animate glow
        this.glowElement.style.width = `${newValue}%`;

        // Animate value counter
        const obj = { val: this.value };
        anime({
            targets: obj,
            val: newValue,
            duration: 300,
            round: 1,
            easing: 'easeOutQuad',
            update: () => {
                this.valueElement.textContent = `${Math.round(obj.val)}%`;
            }
        });

        this.value = newValue;

        // Update color and status based on accuracy
        if (newValue >= 80) {
            this.fillElement.className = 'meter-fill high';
            this.glowElement.style.background = 'var(--gradient-primary)';
            this.statusElement.textContent = '✨ शुद्ध!';
            this.statusElement.className = 'meter-status excellent';

            // Celebration pulse on high accuracy
            if (newValue >= 95) {
                this.celebratePulse();
            }
        } else if (newValue >= 50) {
            this.fillElement.className = 'meter-fill medium';
            this.glowElement.style.background = 'linear-gradient(90deg, var(--color-warning), var(--color-warning-light))';
            this.statusElement.textContent = 'करीब...';
            this.statusElement.className = 'meter-status good';
        } else {
            this.fillElement.className = 'meter-fill low';
            this.glowElement.style.background = 'var(--gradient-accent)';
            this.statusElement.textContent = 'प्रयास करें!';
            this.statusElement.className = 'meter-status needs-work';
        }
    }

    /**
     * Celebration pulse animation for perfect accuracy
     */
    celebratePulse() {
        anime({
            targets: this.container.querySelector('.accuracy-meter'),
            scale: [1, 1.02, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .6)'
        });

        // Glow burst
        anime({
            targets: this.glowElement,
            opacity: [0.5, 1, 0.5],
            duration: 600,
            easing: 'easeInOutSine'
        });
    }

    /**
     * Update based on cents deviation
     */
    updateFromCents(cents) {
        // Convert cents to accuracy (25 cents = 0%, 0 cents = 100%)
        const accuracy = Math.max(0, 100 - Math.abs(cents) * 4);
        this.update(accuracy);
    }

    /**
     * Reset the meter
     */
    reset() {
        this.update(0);
        this.statusElement.textContent = '';
        this.statusElement.className = 'meter-status';
    }
}
