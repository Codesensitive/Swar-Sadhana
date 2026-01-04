/**
 * SwarKeyboard Component
 * Interactive keyboard for selecting Swar notes
 */

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
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

        // Add click listeners
        const keys = this.container.querySelectorAll('.swar-key');
        keys.forEach(key => {
            key.addEventListener('click', (e) => this.handleKeyClick(e));
        });
    }

    handleKeyClick(e) {
        const key = e.currentTarget;
        const semitone = parseInt(key.dataset.semitone, 10);
        const swarName = key.dataset.swar;
        const variant = key.dataset.variant;
        const shrutiData = SHRUTI_MAP[semitone];

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

    /**
     * Select a Swar by semitone
     * @param {number} semitone - Semitone index (0-11)
     */
    selectSwar(semitone) {
        this.clearSelection();
        this.selectedSwar = { semitone };

        const key = this.container.querySelector(`[data-semitone="${semitone}"]`);
        if (key) {
            key.classList.add('active');
        }
    }

    /**
     * Set a target Swar (for exercises)
     * @param {number} semitone - Semitone index (0-11)
     */
    setTargetSwar(semitone) {
        // Clear previous target
        const prevTarget = this.container.querySelector('.swar-key.target');
        if (prevTarget) {
            prevTarget.classList.remove('target');
        }

        this.targetSwar = { semitone };

        const key = this.container.querySelector(`[data-semitone="${semitone}"]`);
        if (key) {
            key.classList.add('target');
        }
    }

    /**
     * Clear selection
     */
    clearSelection() {
        const activeKey = this.container.querySelector('.swar-key.active');
        if (activeKey) {
            activeKey.classList.remove('active');
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
        }
        this.targetSwar = null;
    }

    /**
     * Set base Sa frequency
     * @param {number} frequency - Sa frequency in Hz
     */
    setBaseSa(frequency) {
        this.baseSa = frequency;
    }

    /**
     * Get selected Swar info
     * @returns {Object|null}
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
     * Highlight a Swar temporarily (for visual feedback)
     * @param {number} semitone - Semitone to highlight
     * @param {string} className - CSS class to add
     * @param {number} duration - Duration in ms
     */
    highlightSwar(semitone, className = 'highlight', duration = 500) {
        const key = this.container.querySelector(`[data-semitone="${semitone}"]`);
        if (key) {
            key.classList.add(className);
            setTimeout(() => {
                key.classList.remove(className);
            }, duration);
        }
    }
}
