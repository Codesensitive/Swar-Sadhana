/**
 * SwarDisplay Component
 * Shows the detected pitch in Sargam notation with Devanagari script
 */

export class SwarDisplay {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="swar-display">
        <div class="swar-main">
          <div class="swar-hindi">--</div>
          <div class="swar-roman">--</div>
        </div>
        <div class="swar-frequency">-- Hz</div>
        <div class="swar-cents">0 cents</div>
        <div class="swar-direction" style="display: none;">
          <span class="direction-arrow">↑</span>
          <span class="direction-text">ऊपर गाइए</span>
        </div>
        <div class="swar-volume">
          Volume: <span class="volume-level">0.0000</span>
        </div>
      </div>
    `;

        // Cache DOM elements
        this.hindiElement = this.container.querySelector('.swar-hindi');
        this.romanElement = this.container.querySelector('.swar-roman');
        this.frequencyElement = this.container.querySelector('.swar-frequency');
        this.centsElement = this.container.querySelector('.swar-cents');
        this.directionElement = this.container.querySelector('.swar-direction');
        this.directionArrow = this.container.querySelector('.direction-arrow');
        this.directionText = this.container.querySelector('.direction-text');
        this.volumeElement = this.container.querySelector('.volume-level');
    }

    /**
     * Update display with pitch data
     * @param {Object} pitchData - Pitch data from PitchDetector
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

        // Update frequency
        this.frequencyElement.textContent = pitchData.frequencyFormatted;

        // Update cents
        const centsText = Math.abs(pitchData.cents) <= 5 ? 'शुद्ध (Perfect)' :
            `${pitchData.cents > 0 ? '+' : ''}${pitchData.cents} cents`;
        this.centsElement.textContent = centsText;
        this.centsElement.className = `swar-cents ${pitchData.cents > 0 ? 'sharp' : pitchData.cents < 0 ? 'flat' : 'accurate'}`;

        // Update volume
        if (this.volumeElement && pitchData.volume !== undefined) {
            this.volumeElement.textContent = pitchData.volume.toFixed(4);
        }

        // Direction indicator
        if (pitchData.accuracy === 'off') {
            this.directionElement.style.display = 'flex';
            this.directionElement.className = `swar-direction ${pitchData.direction}`;
            this.directionArrow.textContent = pitchData.direction === 'higher' ? '↑' : '↓';
            this.directionText.textContent = pitchData.direction === 'higher' ? 'ऊपर गाइए (Sing Higher)' : 'नीचे गाइए (Sing Lower)';
        } else {
            this.directionElement.style.display = 'none';
        }
    }

    /**
     * Update display for target comparison
     * @param {Object} pitchData - Pitch data from PitchDetector
     * @param {Object} comparison - Comparison result
     * @param {Object} targetSwar - Target Swar data
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

        // Show frequency
        this.frequencyElement.textContent = pitchData.frequencyFormatted;

        // Show cents from target
        const targetName = targetSwar.hindi || targetSwar.swar || 'Target';
        const centsText = comparison.cents === 0 ? 'शुद्ध (Perfect)' :
            `${comparison.cents > 0 ? '+' : ''}${comparison.cents} cents from ${targetName}`;
        this.centsElement.textContent = centsText;
        this.centsElement.className = `swar-cents ${comparison.cents > 0 ? 'sharp' : comparison.cents < 0 ? 'flat' : 'accurate'}`;

        // Direction indicator
        if (comparison.accuracy === 'off' || comparison.accuracy === 'acceptable') {
            this.directionElement.style.display = 'flex';
            this.directionElement.className = `swar-direction ${comparison.direction}`;
            this.directionArrow.textContent = comparison.direction === 'higher' ? '↑' : '↓';
            this.directionText.textContent = comparison.direction === 'higher' ? 'ऊपर गाइए' : 'नीचे गाइए';
        } else {
            this.directionElement.style.display = 'flex';
            this.directionElement.className = 'swar-direction correct';
            this.directionArrow.textContent = '✓';
            this.directionText.textContent = 'बहुत खूब! (Perfect!)';
        }
    }

    /**
     * Show silence state - listening but no input
     */
    showSilence() {
        this.hindiElement.textContent = '...';
        this.hindiElement.className = 'swar-hindi listening';
        this.romanElement.textContent = 'गाइए';
        this.frequencyElement.textContent = 'सुन रहे हैं... (Listening...)';
        this.centsElement.textContent = '';
        this.directionElement.style.display = 'none';
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
    }

    /**
     * Show waiting state - deprecated, use showReady
     */
    showWaiting() {
        this.showReady();
    }
}
