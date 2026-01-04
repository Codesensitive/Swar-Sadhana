/**
 * AccuracyMeter Component
 * Visual gauge showing pitch accuracy percentage
 */

export class AccuracyMeter {
    constructor(container) {
        this.container = container;
        this.value = 0;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="accuracy-meter">
        <div class="meter-track">
          <div class="meter-fill" style="width: 0%"></div>
        </div>
        <div class="meter-labels">
          <span>0%</span>
          <span>शुद्धता (Accuracy)</span>
          <span>100%</span>
        </div>
      </div>
    `;

        this.fillElement = this.container.querySelector('.meter-fill');
    }

    /**
     * Update the meter value
     * @param {number} accuracy - Accuracy percentage (0-100)
     */
    update(accuracy) {
        this.value = Math.max(0, Math.min(100, accuracy));
        this.fillElement.style.width = `${this.value}%`;

        // Update color based on accuracy
        if (this.value >= 80) {
            this.fillElement.className = 'meter-fill high';
        } else if (this.value >= 50) {
            this.fillElement.className = 'meter-fill medium';
        } else {
            this.fillElement.className = 'meter-fill low';
        }
    }

    /**
     * Update based on cents deviation
     * @param {number} cents - Cents deviation from target
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
    }
}
