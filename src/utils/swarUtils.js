/**
 * SwarSadhana - Indian Classical Music Theory Utilities
 * Provides conversion between frequencies and Swar (स्वर) names
 * Based on the 12-semitone system mapped to Indian notation
 */

// Default Sa (षड्ज) frequency - can be adjusted to user's vocal range
const DEFAULT_SA_FREQUENCY = 261.63; // C4

// The 7 Shuddha (शुद्ध) Swar names
export const SWAR_SHUDDHA = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Da', 'Ni'];
export const SWAR_DEVANAGARI = ['सा', 'रे', 'ग', 'म', 'प', 'ध', 'नी'];

// Complete 12-shruti mapping (all semitones)
// Each entry: { swar, variant, hindi, semitone }
export const SHRUTI_MAP = [
    { swar: 'Sa', variant: 'shuddha', hindi: 'सा', fullName: 'Shadja', semitone: 0 },
    { swar: 'Re', variant: 'komal', hindi: 'रे॒', fullName: 'Komal Rishabh', semitone: 1 },
    { swar: 'Re', variant: 'shuddha', hindi: 'रे', fullName: 'Shuddha Rishabh', semitone: 2 },
    { swar: 'Ga', variant: 'komal', hindi: 'ग॒', fullName: 'Komal Gandhar', semitone: 3 },
    { swar: 'Ga', variant: 'shuddha', hindi: 'ग', fullName: 'Shuddha Gandhar', semitone: 4 },
    { swar: 'Ma', variant: 'shuddha', hindi: 'म', fullName: 'Shuddha Madhyam', semitone: 5 },
    { swar: 'Ma', variant: 'tivra', hindi: 'म॑', fullName: 'Tivra Madhyam', semitone: 6 },
    { swar: 'Pa', variant: 'shuddha', hindi: 'प', fullName: 'Pancham', semitone: 7 },
    { swar: 'Da', variant: 'komal', hindi: 'ध॒', fullName: 'Komal Dhaivat', semitone: 8 },
    { swar: 'Da', variant: 'shuddha', hindi: 'ध', fullName: 'Shuddha Dhaivat', semitone: 9 },
    { swar: 'Ni', variant: 'komal', hindi: 'नी॒', fullName: 'Komal Nishad', semitone: 10 },
    { swar: 'Ni', variant: 'shuddha', hindi: 'नी', fullName: 'Shuddha Nishad', semitone: 11 }
];

// Swar ratios from Sa (based on just intonation, approximated to 12-TET)
const SWAR_RATIOS = {
    0: 1,        // Sa
    1: 16 / 15,    // Komal Re
    2: 9 / 8,      // Shuddha Re
    3: 6 / 5,      // Komal Ga
    4: 5 / 4,      // Shuddha Ga
    5: 4 / 3,      // Shuddha Ma
    6: 45 / 32,    // Tivra Ma
    7: 3 / 2,      // Pa
    8: 8 / 5,      // Komal Da
    9: 5 / 3,      // Shuddha Da
    10: 9 / 5,     // Komal Ni
    11: 15 / 8     // Shuddha Ni
};

/**
 * Convert a frequency to MIDI note number (for calculations)
 * @param {number} frequency - Frequency in Hz
 * @returns {number} The fractional MIDI number
 */
function frequencyToMidi(frequency) {
    if (frequency <= 0) return 0;
    return 12 * Math.log2(frequency / 440) + 69;
}

/**
 * Convert MIDI note number to frequency
 * @param {number} midi - MIDI note number
 * @returns {number} Frequency in Hz
 */
function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Get the semitone index relative to Sa
 * @param {number} frequency - Detected frequency
 * @param {number} baseSa - Base Sa frequency
 * @returns {number} Semitone index (0-11)
 */
export function getSemitoneFromSa(frequency, baseSa = DEFAULT_SA_FREQUENCY) {
    if (frequency <= 0 || baseSa <= 0) return 0;

    // Calculate cents from Sa
    const cents = 1200 * Math.log2(frequency / baseSa);

    // Normalize to 0-1200 range (one octave)
    let normalizedCents = cents % 1200;
    if (normalizedCents < 0) normalizedCents += 1200;

    // Convert to nearest semitone
    const semitone = Math.round(normalizedCents / 100) % 12;
    return semitone;
}

/**
 * Get cents deviation from the nearest pure Swar
 * @param {number} frequency - Detected frequency
 * @param {number} baseSa - Base Sa frequency
 * @returns {number} Cents deviation (-50 to +50)
 */
export function getCentsDeviation(frequency, baseSa = DEFAULT_SA_FREQUENCY) {
    if (frequency <= 0 || baseSa <= 0) return 0;

    const cents = 1200 * Math.log2(frequency / baseSa);
    let normalizedCents = cents % 1200;
    if (normalizedCents < 0) normalizedCents += 1200;

    // Find nearest semitone
    const nearestSemitone = Math.round(normalizedCents / 100) * 100;
    let deviation = normalizedCents - nearestSemitone;

    // Normalize to -50 to +50 range
    if (deviation > 50) deviation -= 100;
    if (deviation < -50) deviation += 100;

    return Math.round(deviation);
}

/**
 * Convert frequency to Swar data
 * @param {number} frequency - Detected frequency in Hz
 * @param {number} baseSa - Base Sa frequency
 * @returns {Object} Swar data with name, Hindi, variant, cents
 */
export function frequencyToSwar(frequency, baseSa = DEFAULT_SA_FREQUENCY) {
    if (frequency <= 0) {
        return {
            swar: '--',
            hindi: '--',
            variant: '',
            fullName: '',
            semitone: 0,
            cents: 0,
            octave: 0,
            frequency: 0
        };
    }

    // Get octave relative to base Sa
    const octaveRatio = frequency / baseSa;
    let octave = 0;
    if (octaveRatio >= 2) octave = Math.floor(Math.log2(octaveRatio));
    else if (octaveRatio < 0.5) octave = -Math.ceil(Math.log2(1 / octaveRatio));

    const semitone = getSemitoneFromSa(frequency, baseSa);
    const cents = getCentsDeviation(frequency, baseSa);
    const shrutiData = SHRUTI_MAP[semitone];

    return {
        swar: shrutiData.swar,
        hindi: shrutiData.hindi,
        variant: shrutiData.variant,
        fullName: shrutiData.fullName,
        semitone: semitone,
        cents: cents,
        octave: octave,
        frequency: frequency
    };
}

/**
 * Convert Swar name to frequency
 * @param {string} swarName - Swar name like 'Sa', 'Re', 'Ga' etc.
 * @param {string} variant - 'shuddha', 'komal', or 'tivra'
 * @param {number} octave - Octave offset (0 is middle, 1 is upper, -1 is lower)
 * @param {number} baseSa - Base Sa frequency
 * @returns {number} Frequency in Hz
 */
export function swarToFrequency(swarName, variant = 'shuddha', octave = 0, baseSa = DEFAULT_SA_FREQUENCY) {
    // Find matching shruti
    const shruti = SHRUTI_MAP.find(s =>
        s.swar.toLowerCase() === swarName.toLowerCase() &&
        s.variant === variant
    );

    if (!shruti) {
        // Default to Sa if not found
        return baseSa * Math.pow(2, octave);
    }

    // Calculate frequency using 12-TET
    const semitones = shruti.semitone + (octave * 12);
    return baseSa * Math.pow(2, semitones / 12);
}

/**
 * Get accuracy level based on cents deviation
 * @param {number} cents - Cents deviation
 * @returns {'shuddha'|'acceptable'|'off'} Accuracy level
 */
export function getAccuracyLevel(cents) {
    const absCents = Math.abs(cents);
    if (absCents <= 10) return 'shuddha';    // Perfect/Pure
    if (absCents <= 25) return 'acceptable'; // Close enough
    return 'off';                             // Needs correction
}

/**
 * Get direction hint for pitch correction
 * @param {number} cents - Cents deviation
 * @returns {'higher'|'lower'|'correct'} Direction
 */
export function getDirection(cents) {
    if (Math.abs(cents) <= 10) return 'correct';
    return cents < 0 ? 'higher' : 'lower';
}

/**
 * Generate a scale with given notes
 * @param {Array<number>} semitones - Array of semitone indices
 * @param {number} baseSa - Base Sa frequency
 * @returns {Array<Object>} Array of note objects
 */
export function generateScale(semitones, baseSa = DEFAULT_SA_FREQUENCY) {
    return semitones.map(semitone => {
        const shrutiData = SHRUTI_MAP[semitone % 12];
        const octave = Math.floor(semitone / 12);
        return {
            ...shrutiData,
            octave: octave,
            frequency: baseSa * Math.pow(2, semitone / 12)
        };
    });
}

/**
 * Generate Shuddha Swar scale (Sa Re Ga Ma Pa Da Ni Sa)
 * @param {number} baseSa - Base Sa frequency
 * @returns {Array<Object>} Scale notes
 */
export function generateShuddhaScale(baseSa = DEFAULT_SA_FREQUENCY) {
    const semitones = [0, 2, 4, 5, 7, 9, 11, 12]; // Major scale intervals
    return generateScale(semitones, baseSa);
}

/**
 * Format frequency for display
 * @param {number} frequency - Frequency in Hz
 * @returns {string} Formatted frequency string
 */
export function formatFrequency(frequency) {
    if (frequency <= 0) return '-- Hz';
    return `${frequency.toFixed(1)} Hz`;
}

/**
 * Format cents for display
 * @param {number} cents - Cents deviation
 * @returns {string} Formatted cents string
 */
export function formatCents(cents) {
    if (Math.abs(cents) <= 5) return 'शुद्ध (Perfect)';
    const sign = cents > 0 ? '+' : '';
    return `${sign}${cents} cents`;
}

/**
 * Get Swar display name with variant indicator
 * @param {Object} swarData - Swar data object
 * @returns {string} Display name like "रे॒" or "म॑"
 */
export function getSwarDisplayName(swarData) {
    if (!swarData || swarData.swar === '--') return '--';
    return swarData.hindi;
}

/**
 * Compare detected pitch to target Swar (octave-agnostic)
 * @param {number} detectedFreq - Detected frequency
 * @param {number} targetFreq - Target Swar frequency
 * @returns {Object} Comparison result
 */
export function compareToTarget(detectedFreq, targetFreq) {
    if (detectedFreq <= 0 || targetFreq <= 0) {
        return {
            isMatching: false,
            cents: 0,
            direction: null,
            accuracy: 'off'
        };
    }

    // Calculate raw cents difference
    let cents = 1200 * Math.log2(detectedFreq / targetFreq);

    // Normalize to within one octave (-600 to +600 cents)
    // This makes the comparison octave-agnostic
    while (cents > 600) cents -= 1200;
    while (cents < -600) cents += 1200;

    cents = Math.round(cents);
    const accuracy = getAccuracyLevel(cents);
    const direction = getDirection(cents);

    return {
        isMatching: Math.abs(cents) <= 25,
        cents: cents,
        direction: direction,
        accuracy: accuracy
    };
}

export { DEFAULT_SA_FREQUENCY };
