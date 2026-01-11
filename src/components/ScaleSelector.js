/**
 * ScaleSelector Component - Select base Sa frequency
 * Allows users to adjust the base scale to match their vocal range
 */

import { setBaseSaFrequency, getBaseSaFrequency } from '../utils/storageUtils.js';

// Common scales with their Sa frequencies (covers typical vocal ranges)
const SCALE_OPTIONS = [
    { name: 'C3', frequency: 130.81, label: 'C3 (Low - Male)' },
    { name: 'D3', frequency: 146.83, label: 'D3' },
    { name: 'E3', frequency: 164.81, label: 'E3' },
    { name: 'F3', frequency: 174.61, label: 'F3' },
    { name: 'G3', frequency: 196.00, label: 'G3 (Mid-Low)' },
    { name: 'A3', frequency: 220.00, label: 'A3' },
    { name: 'B3', frequency: 246.94, label: 'B3' },
    { name: 'C4', frequency: 261.63, label: 'C4 (Standard)' },
    { name: 'D4', frequency: 293.66, label: 'D4' },
    { name: 'E4', frequency: 329.63, label: 'E4 (High - Female)' },
    { name: 'F4', frequency: 349.23, label: 'F4' },
    { name: 'G4', frequency: 392.00, label: 'G4 (Very High)' }
];

export class ScaleSelector {
    constructor(container, options = {}) {
        this.container = container;
        this.onScaleChange = options.onScaleChange || null;
        this.currentFrequency = getBaseSaFrequency() || 261.63;
        this.render();
    }

    render() {
        const currentScale = this.getScaleFromFrequency(this.currentFrequency);

        this.container.innerHTML = `
            <div class="scale-selector">
                <div class="scale-header">
                    <span class="scale-label">षड्ज (Sa) Scale:</span>
                    <span class="scale-value" id="scaleValueDisplay">${currentScale.name} - ${this.currentFrequency.toFixed(1)} Hz</span>
                </div>
                <div class="scale-slider-container">
                    <input 
                        type="range" 
                        class="scale-slider" 
                        id="scaleSlider"
                        min="0" 
                        max="${SCALE_OPTIONS.length - 1}" 
                        value="${this.getScaleIndex(this.currentFrequency)}"
                        step="1"
                    />
                    <div class="scale-range">
                        <span>Low (Male)</span>
                        <span>High (Female)</span>
                    </div>
                </div>
            </div>
        `;

        this.slider = this.container.querySelector('#scaleSlider');
        this.valueDisplay = this.container.querySelector('#scaleValueDisplay');

        this.slider.addEventListener('input', (e) => this.handleSliderChange(e));
        this.slider.addEventListener('change', (e) => this.handleSliderCommit(e));
    }

    getScaleFromFrequency(frequency) {
        // Find closest scale
        let closest = SCALE_OPTIONS[0];
        let minDiff = Math.abs(frequency - SCALE_OPTIONS[0].frequency);

        for (const scale of SCALE_OPTIONS) {
            const diff = Math.abs(frequency - scale.frequency);
            if (diff < minDiff) {
                minDiff = diff;
                closest = scale;
            }
        }
        return closest;
    }

    getScaleIndex(frequency) {
        const scale = this.getScaleFromFrequency(frequency);
        return SCALE_OPTIONS.findIndex(s => s.name === scale.name);
    }

    handleSliderChange(e) {
        const index = parseInt(e.target.value);
        const scale = SCALE_OPTIONS[index];

        // Update display immediately
        this.valueDisplay.textContent = `${scale.name} - ${scale.frequency.toFixed(1)} Hz`;

        // Trigger preview callback if provided
        if (this.onScaleChange) {
            this.onScaleChange(scale.frequency, false); // false = preview only
        }
    }

    handleSliderCommit(e) {
        const index = parseInt(e.target.value);
        const scale = SCALE_OPTIONS[index];

        this.currentFrequency = scale.frequency;

        // Save to localStorage
        setBaseSaFrequency(scale.frequency);

        // Trigger final change callback
        if (this.onScaleChange) {
            this.onScaleChange(scale.frequency, true); // true = committed
        }
    }

    setScale(frequency) {
        this.currentFrequency = frequency;
        const index = this.getScaleIndex(frequency);
        const scale = SCALE_OPTIONS[index];

        if (this.slider) {
            this.slider.value = index;
        }
        if (this.valueDisplay) {
            this.valueDisplay.textContent = `${scale.name} - ${scale.frequency.toFixed(1)} Hz`;
        }
    }

    getCurrentFrequency() {
        return this.currentFrequency;
    }
}

export { SCALE_OPTIONS };
