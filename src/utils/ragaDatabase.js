/**
 * Raga Database - Collection of popular Hindustani Classical Ragas
 * Each raga contains its scale, mood, time, and practice patterns
 */

// Raga definitions with aaroh (ascending) and avroh (descending)
export const RAGA_DATABASE = {
    bilawal: {
        id: 'bilawal',
        name: 'Bilawal',
        hindi: 'बिलावल',
        thaat: 'Bilawal',
        time: 'Morning (6-9 AM)',
        mood: 'Peaceful, Devotional',
        description: 'The most fundamental raga, equivalent to the Western major scale. Perfect for beginners.',
        // Semitone indices for each note
        aaroh: [0, 2, 4, 5, 7, 9, 11, 12],     // Sa Re Ga Ma Pa Da Ni Ṡa
        avroh: [12, 11, 9, 7, 5, 4, 2, 0],     // Ṡa Ni Da Pa Ma Ga Re Sa
        vadi: 9,     // Da - Most important note
        samvadi: 4,  // Ga - Second most important
        pakad: [9, 7, 4, 2, 0],  // Characteristic phrase: Da Pa Ga Re Sa
        alankars: [
            { name: 'Basic Aaroh-Avroh', pattern: [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0] },
            { name: 'Meend Practice', pattern: [0, 2, 4, 2, 0, 2, 4, 5, 4, 2] }
        ]
    },

    yaman: {
        id: 'yaman',
        name: 'Yaman',
        hindi: 'यमन',
        thaat: 'Kalyan',
        time: 'Evening (6-9 PM)',
        mood: 'Romantic, Serene, Devotional',
        description: 'One of the most popular evening ragas with Tivra Ma (sharp 4th). Creates a deeply moving atmosphere.',
        // Note: Uses Tivra Ma (semitone 6) instead of Shuddha Ma (5)
        aaroh: [-1, 2, 4, 6, 9, 11, 12],       // Ṅi Re Ga Ma♯ Da Ni Ṡa (starts from lower Ni)
        avroh: [12, 11, 9, 6, 4, 2, 0],        // Ṡa Ni Da Ma♯ Ga Re Sa
        vadi: 4,     // Ga
        samvadi: 11, // Ni
        pakad: [11, 2, 4, 6, 4, 2, 0],  // Ni Re Ga Ma Ga Re Sa
        alankars: [
            { name: 'Yaman Aaroh', pattern: [-1, 2, 4, 6, 9, 11, 12] },
            { name: 'Yaman Avroh', pattern: [12, 11, 9, 6, 4, 2, 0] }
        ]
    },

    bhairav: {
        id: 'bhairav',
        name: 'Bhairav',
        hindi: 'भैरव',
        thaat: 'Bhairav',
        time: 'Early Morning (4-7 AM)',
        mood: 'Serious, Devotional, Meditative',
        description: 'A morning raga with Komal Re and Komal Da, creating a profound devotional mood.',
        // Uses Komal Re (1) and Komal Da (8)
        aaroh: [0, 1, 4, 5, 7, 8, 11, 12],     // Sa Re♭ Ga Ma Pa Da♭ Ni Ṡa
        avroh: [12, 11, 8, 7, 5, 4, 1, 0],     // Ṡa Ni Da♭ Pa Ma Ga Re♭ Sa
        vadi: 8,     // Komal Da
        samvadi: 1,  // Komal Re
        pakad: [4, 1, 0, 8, 7, 5, 4, 1, 0],    // Ga Re Sa Da Pa Ma Ga Re Sa
        alankars: [
            { name: 'Bhairav Aaroh', pattern: [0, 1, 4, 5, 7, 8, 11, 12] },
            { name: 'Bhairav Avroh', pattern: [12, 11, 8, 7, 5, 4, 1, 0] }
        ]
    },

    kafi: {
        id: 'kafi',
        name: 'Kafi',
        hindi: 'काफी',
        thaat: 'Kafi',
        time: 'Late Night (9 PM - 12 AM)',
        mood: 'Romantic, Light, Playful',
        description: 'A versatile raga similar to the Dorian mode, using Komal Ga and Komal Ni.',
        // Uses Komal Ga (3) and Komal Ni (10)
        aaroh: [0, 2, 3, 5, 7, 9, 10, 12],     // Sa Re Ga♭ Ma Pa Da Ni♭ Ṡa
        avroh: [12, 10, 9, 7, 5, 3, 2, 0],     // Ṡa Ni♭ Da Pa Ma Ga♭ Re Sa
        vadi: 7,     // Pa
        samvadi: 0,  // Sa
        pakad: [5, 3, 2, 0, 7, 5, 3, 2, 0],    // Ma Ga Re Sa Pa Ma Ga Re Sa
        alankars: [
            { name: 'Kafi Basic', pattern: [0, 2, 3, 5, 7, 9, 10, 12, 10, 9, 7, 5, 3, 2, 0] }
        ]
    },

    bhairavi: {
        id: 'bhairavi',
        name: 'Bhairavi',
        hindi: 'भैरवी',
        thaat: 'Bhairavi',
        time: 'Morning (Concluding raga)',
        mood: 'Devotional, Peaceful, Melancholic',
        description: 'Queen of ragas, traditionally performed at the end of concerts. Uses all Komal notes except Ma.',
        // Uses Komal Re, Komal Ga, Komal Da, Komal Ni
        aaroh: [0, 1, 3, 5, 7, 8, 10, 12],     // Sa Re♭ Ga♭ Ma Pa Da♭ Ni♭ Ṡa
        avroh: [12, 10, 8, 7, 5, 3, 1, 0],     // Ṡa Ni♭ Da♭ Pa Ma Ga♭ Re♭ Sa
        vadi: 5,     // Ma
        samvadi: 0,  // Sa
        pakad: [3, 1, 0, 5, 3, 1, 0],          // Ga Re Sa Ma Ga Re Sa
        alankars: [
            { name: 'Bhairavi Basic', pattern: [0, 1, 3, 5, 7, 8, 10, 12, 10, 8, 7, 5, 3, 1, 0] }
        ]
    }
};

// Common Alankars (practice patterns) applicable to any raga
export const COMMON_ALANKARS = {
    ascending: {
        name: 'आरोह (Aaroh)',
        hindi: 'आरोह',
        description: 'Ascending scale practice',
        // Pattern is relative semitones, applied to raga's allowed notes
        type: 'ascending'
    },
    descending: {
        name: 'अवरोह (Avroh)',
        hindi: 'अवरोह',
        description: 'Descending scale practice',
        type: 'descending'
    },
    alankar1: {
        name: 'अलंकार १',
        hindi: 'सारेगम-रेगमप',
        description: 'SaReGaMa ReGaMaPa pattern',
        pattern: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5] // Relative note indices in scale
    },
    alankar2: {
        name: 'अलंकार २',
        hindi: 'सारेसा-रेगरे',
        description: 'SaReSa ReGaRe pattern',
        pattern: [0, 1, 0, 1, 2, 1, 2, 3, 2]
    },
    alankar3: {
        name: 'अलंकार ३',
        hindi: 'सारेगरेसा',
        description: 'SaReGaReSa pattern',
        pattern: [0, 1, 2, 1, 0]
    }
};

/**
 * Get a raga by ID
 * @param {string} ragaId - Raga identifier
 * @returns {Object|null} Raga object or null
 */
export function getRaga(ragaId) {
    return RAGA_DATABASE[ragaId] || null;
}

/**
 * Get all available ragas
 * @returns {Array<Object>} Array of raga objects
 */
export function getAllRagas() {
    return Object.values(RAGA_DATABASE);
}

/**
 * Get ragas by time of day
 * @param {string} timeKeyword - 'morning', 'evening', 'night'
 * @returns {Array<Object>} Matching ragas
 */
export function getRagasByTime(timeKeyword) {
    return Object.values(RAGA_DATABASE).filter(raga =>
        raga.time.toLowerCase().includes(timeKeyword.toLowerCase())
    );
}

/**
 * Generate practice scale for a raga
 * @param {string} ragaId - Raga identifier
 * @param {number} baseSa - Base Sa frequency
 * @returns {Object} Scale with aaroh and avroh frequencies
 */
export function generateRagaScale(ragaId, baseSa = 261.63) {
    const raga = RAGA_DATABASE[ragaId];
    if (!raga) return null;

    const calculateFreq = (semitone) => baseSa * Math.pow(2, semitone / 12);

    return {
        raga: raga,
        baseSa: baseSa,
        aaroh: raga.aaroh.map(s => ({
            semitone: s,
            frequency: calculateFreq(s)
        })),
        avroh: raga.avroh.map(s => ({
            semitone: s,
            frequency: calculateFreq(s)
        }))
    };
}

/**
 * Get random note from a raga
 * @param {string} ragaId - Raga identifier
 * @param {number} baseSa - Base Sa frequency
 * @returns {Object} Random note with semitone and frequency
 */
export function getRandomRagaNote(ragaId, baseSa = 261.63) {
    const raga = RAGA_DATABASE[ragaId];
    if (!raga) return null;

    // Combine aaroh notes (unique semitones only)
    const uniqueSemitones = [...new Set(raga.aaroh.filter(s => s >= 0 && s <= 12))];
    const randomSemitone = uniqueSemitones[Math.floor(Math.random() * uniqueSemitones.length)];

    return {
        semitone: randomSemitone,
        frequency: baseSa * Math.pow(2, randomSemitone / 12)
    };
}

// Local SHRUTI_MAP for pakad display (to avoid circular imports with swarUtils)
const SHRUTI_MAP_PAKAD = {
    0: { hindi: 'सा', roman: 'Sa' },
    1: { hindi: 'रे॒', roman: 'Re♭' },
    2: { hindi: 'रे', roman: 'Re' },
    3: { hindi: 'ग॒', roman: 'Ga♭' },
    4: { hindi: 'ग', roman: 'Ga' },
    5: { hindi: 'म', roman: 'Ma' },
    6: { hindi: 'म॑', roman: 'Ma♯' },
    7: { hindi: 'प', roman: 'Pa' },
    8: { hindi: 'ध॒', roman: 'Da♭' },
    9: { hindi: 'ध', roman: 'Da' },
    10: { hindi: 'नी॒', roman: 'Ni♭' },
    11: { hindi: 'नी', roman: 'Ni' }
};

/**
 * Get pakad as displayable swar names
 * @param {string} ragaId - Raga identifier
 * @returns {Object|null} Object with hindi, roman, and semitones arrays
 */
export function getPakadDisplay(ragaId) {
    const raga = RAGA_DATABASE[ragaId];
    if (!raga || !raga.pakad) return null;

    const swarNames = raga.pakad.map(semitone => {
        // Handle negative semitones (lower octave) and normalize to 0-11
        const normalizedSemitone = ((semitone % 12) + 12) % 12;
        return SHRUTI_MAP_PAKAD[normalizedSemitone];
    });

    return {
        semitones: raga.pakad,
        hindi: swarNames.map(s => s.hindi).join(' '),
        roman: swarNames.map(s => s.roman).join(' ')
    };
}
