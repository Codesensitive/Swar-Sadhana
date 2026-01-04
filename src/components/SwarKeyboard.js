/**
 * SwarKeyboard Component - Pro Edition
 * Premium interactive keyboard with 3D effects and anime.js animations
 */

import anime from 'animejs/lib/anime.es.js';
import { SHRUTI_MAP, swarToFrequency, DEFAULT_SA_FREQUENCY } from '../utils/swarUtils.js';

export class SwarKeyboard {
    constructor(container, options = {}) {
        this.container = container;
        this.baseSa = options.baseSa || DEFAULT_SA_FREQUENCY;
        this.onSwarSelect = options.onSwarSelect || null;
        this.onSwarPlay = options.onSwarPlay || null;
        this.showKomalTivra = options.showKomalTivra !== false;

        this.selectedSwar = null;
        this.targetSwar = null;

        this.render();
    }

    render() {
        // Group shrutis into shuddha and komal/tivra
        const shuddhaSwars = SHRUTI_MAP.filter(s => s.variant === 'shuddha');
        const komalTivraSwars = SHRUTI_MAP.filter(s => s.variant !== 'shuddha');

        this.container.innerHTML = `
      <div class="swar-keyboard" id="swarKeyboard">
        <div class="swar-row shuddha-row">
          ${shuddhaSwars.map(swar => `
            <button class="swar-key shuddha" 
                    data-semitone="${swar.semitone}" 
                    data-swar="${swar.swar}"
                    data-variant="${swar.variant}">
              <span class="swar-hindi">${swar.hindi}</span>
              <span class="swar-roman">${swar.swar}</span>
              <div class="key-ripple"></div>
              <div class="key-glow"></div>
            </button>
          `).join('')}
        </div>
        ${this.showKomalTivra ? `
          <div class="swar-row komal-row">
            ${komalTivraSwars.map(swar => `
              <button class="swar-key komal-tivra" 
                      data-semitone="${swar.semitone}" 
                      data-swar="${swar.swar}"
                      data-variant="${swar.variant}">
                <span class="swar-hindi">${swar.hindi}</span>
                <span class="swar-roman">${swar.swar} ${swar.variant === 'komal' ? '♭' : '♯'}</span>
                <div class="key-ripple"></div>
                <div class="key-glow"></div>
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

        // Add enhanced styles
        const style = document.createElement('style');
        style.textContent = `
            .swar-key {
                position: relative;
                overflow: hidden;
            }
            .key-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 153, 51, 0.4);
                transform: scale(0);
                pointer-events: none;
            }
            .key-glow {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                opacity: 0;
                background: radial-gradient(circle at center, rgba(255, 153, 51, 0.3) 0%, transparent 70%);
                pointer-events: none;
            }
            .swar-key.active .key-glow {
                opacity: 1;
            }
        `;
        if (!document.getElementById('swar-keyboard-styles')) {
            style.id = 'swar-keyboard-styles';
            document.head.appendChild(style);
        }

        // Add click listeners with animations
        const keys = this.container.querySelectorAll('.swar-key');
        keys.forEach(key => {
            key.addEventListener('click', (e) => this.handleKeyClick(e));
            key.addEventListener('mouseenter', () => this.handleKeyHover(key, true));
            key.addEventListener('mouseleave', () => this.handleKeyHover(key, false));
        });
    }

    handleKeyClick(e) {
        const key = e.currentTarget;
        const semitone = parseInt(key.dataset.semitone, 10);
        const swarName = key.dataset.swar;
        const variant = key.dataset.variant;
        const shrutiData = SHRUTI_MAP[semitone];

        // Create ripple effect
        this.createRipple(key, e);

        // Press animation
        anime({
            targets: key,
            translateY: [0, 6, 0],
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });

        // Toggle selection
        if (this.selectedSwar && this.selectedSwar.semitone === semitone) {
            this.clearSelection();
            if (this.onSwarSelect) {
                this.onSwarSelect(null);
            }
        } else {
            this.selectSwar(semitone);

            const swarData = {
                semitone,
                swarName,
                variant,
                hindi: shrutiData.hindi,
                frequency: this.baseSa * Math.pow(2, semitone / 12)
            };

            if (this.onSwarSelect) {
                this.onSwarSelect(swarData);
            }
            if (this.onSwarPlay) {
                this.onSwarPlay(swarData);
            }
        }
    }

    createRipple(key, e) {
        const ripple = key.querySelector('.key-ripple');
        const rect = key.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        anime({
            targets: ripple,
            scale: [0, 1],
            opacity: [0.5, 0],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }

    handleKeyHover(key, entering) {
        if (key.classList.contains('active')) return;

        anime({
            targets: key,
            translateY: entering ? -8 : 0,
            rotateX: entering ? -10 : 0,
            duration: 200,
            easing: entering ? 'easeOutQuad' : 'easeInQuad'
        });

        // Glow effect on hover
        const glow = key.querySelector('.key-glow');
        anime({
            targets: glow,
            opacity: entering ? 0.4 : 0,
            duration: 200
        });
    }

    /**
     * Select a Swar by semitone
     */
    selectSwar(semitone) {
        this.clearSelection();
        this.selectedSwar = { semitone };

        const key = this.container.querySelector(`[data-semitone="${semitone}"]`);
        if (key) {
            key.classList.add('active');

            // Glow animation
            anime({
                targets: key,
                boxShadow: [
                    '0 0 0px rgba(255, 153, 51, 0)',
                    '0 0 35px rgba(255, 153, 51, 0.6), 0 0 70px rgba(255, 153, 51, 0.3)'
                ],
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    }

    /**
     * Set a target Swar (for exercises)
     */
    setTargetSwar(semitone) {
        // Clear previous target
        const prevTarget = this.container.querySelector('.swar-key.target');
        if (prevTarget) {
            prevTarget.classList.remove('target');
            anime.remove(prevTarget);
        }

        this.targetSwar = { semitone };

        const key = this.container.querySelector(`[data-semitone="${semitone}"]`);
        if (key) {
            key.classList.add('target');

            // Pulsing glow animation
            anime({
                targets: key,
                boxShadow: [
                    '0 0 25px rgba(0, 214, 127, 0.4)',
                    '0 0 50px rgba(0, 214, 127, 0.7)',
                    '0 0 25px rgba(0, 214, 127, 0.4)'
                ],
                duration: 1500,
                loop: true,
                easing: 'easeInOutSine'
            });
        }
    }

    /**
     * Clear selection
     */
    clearSelection() {
        const activeKey = this.container.querySelector('.swar-key.active');
        if (activeKey) {
            activeKey.classList.remove('active');
            anime({
                targets: activeKey,
                boxShadow: '0 0 0px rgba(255, 153, 51, 0)',
                duration: 300
            });
        }
        this.selectedSwar = null;
    }

    /**
     * Clear target
     */
    clearTarget() {
        const targetKey = this.container.querySelector('.swar-key.target');
        if (targetKey) {
            targetKey.classList.remove('target');
            anime.remove(targetKey);
            anime({
                targets: targetKey,
                boxShadow: '0 0 0px rgba(0, 214, 127, 0)',
                duration: 300
            });
        }
        this.targetSwar = null;
    }

    /**
     * Set base Sa frequency
     */
    setBaseSa(frequency) {
        this.baseSa = frequency;
    }

    /**
     * Get selected Swar info
     */
    getSelectedSwar() {
        if (!this.selectedSwar) return null;

        const semitone = this.selectedSwar.semitone;
        const shrutiData = SHRUTI_MAP[semitone];

        return {
            semitone,
            swar: shrutiData.swar,
            variant: shrutiData.variant,
            hindi: shrutiData.hindi,
            frequency: this.baseSa * Math.pow(2, semitone / 12)
        };
    }

    /**
     * Highlight a Swar temporarily with animation
     */
    highlightSwar(semitone, className = 'highlight', duration = 500) {
        const key = this.container.querySelector(`[data-semitone="${semitone}"]`);
        if (key) {
            key.classList.add(className);

            anime({
                targets: key,
                scale: [1, 1.1, 1],
                duration: duration,
                easing: 'easeOutElastic(1, .6)',
                complete: () => {
                    key.classList.remove(className);
                }
            });
        }
    }
}
