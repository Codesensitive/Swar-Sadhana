/**
 * LocalStorage utilities for SwarSadhana progress persistence
 */

const STORAGE_KEY = 'swarsadhana_data';

/**
 * Get all stored data
 * @returns {Object} Stored data object
 */
export function getStoredData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : getDefaultData();
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return getDefaultData();
    }
}

/**
 * Save data to storage
 * @param {Object} data - Data to save
 */
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * Get default data structure
 * @returns {Object} Default data
 */
function getDefaultData() {
    return {
        settings: {
            baseSaFrequency: 261.63,  // C4 as default Sa
            accuracyThreshold: 25,
            showDevanagari: true,
            showRomanized: true,
            tanpuraEnabled: true,
            tanpuraVolume: -12  // dB
        },
        progress: {
            totalSessions: 0,
            totalExercises: 0,
            totalCorrect: 0,
            bestStreak: 0,
            lastSessionDate: null,
            favoriteRaga: null
        },
        sessions: [],
        achievements: []
    };
}

/**
 * Get user settings
 * @returns {Object} Settings object
 */
export function getSettings() {
    return getStoredData().settings;
}

/**
 * Update settings
 * @param {Object} newSettings - Settings to update
 */
export function updateSettings(newSettings) {
    const data = getStoredData();
    data.settings = { ...data.settings, ...newSettings };
    saveData(data);
}

/**
 * Get user progress
 * @returns {Object} Progress object
 */
export function getProgress() {
    return getStoredData().progress;
}

/**
 * Record a practice session
 * @param {Object} session - Session data
 */
export function recordSession(session) {
    const data = getStoredData();

    // Add session
    data.sessions.push({
        ...session,
        date: new Date().toISOString()
    });

    // Keep only last 100 sessions
    if (data.sessions.length > 100) {
        data.sessions = data.sessions.slice(-100);
    }

    // Update progress
    data.progress.totalSessions++;
    data.progress.totalExercises += session.exerciseCount || 0;
    data.progress.totalCorrect += session.correctCount || 0;
    data.progress.lastSessionDate = new Date().toISOString();

    if (session.streak && session.streak > data.progress.bestStreak) {
        data.progress.bestStreak = session.streak;
    }

    // Track favorite raga
    if (session.ragaId) {
        data.progress.favoriteRaga = session.ragaId;
    }

    saveData(data);
}

/**
 * Get recent sessions
 * @param {number} count - Number of sessions to get
 * @returns {Array} Recent sessions
 */
export function getRecentSessions(count = 10) {
    const data = getStoredData();
    return data.sessions.slice(-count).reverse();
}

/**
 * Calculate overall accuracy percentage
 * @returns {number} Accuracy percentage
 */
export function getOverallAccuracy() {
    const progress = getProgress();
    if (progress.totalExercises === 0) return 0;
    return Math.round((progress.totalCorrect / progress.totalExercises) * 100);
}

/**
 * Get base Sa frequency from settings
 * @returns {number} Sa frequency in Hz
 */
export function getBaseSaFrequency() {
    return getSettings().baseSaFrequency;
}

/**
 * Set base Sa frequency
 * @param {number} frequency - Sa frequency in Hz
 */
export function setBaseSaFrequency(frequency) {
    updateSettings({ baseSaFrequency: frequency });
}

/**
 * Clear all stored data
 */
export function clearData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Error clearing localStorage:', e);
    }
}
