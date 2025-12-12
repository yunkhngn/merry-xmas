// ==========================================
// Magic Christmas - Audio Manager
// ==========================================

import { CONFIG } from './config.js';

let bgMusic = null;

/**
 * Initialize background music
 * @returns {HTMLAudioElement}
 */
export function initAudio() {
    bgMusic = new Audio(CONFIG.musicUrl);
    bgMusic.loop = CONFIG.musicLoop;
    bgMusic.volume = CONFIG.musicVolume;
    return bgMusic;
}

/**
 * Play background music
 */
export function playMusic() {
    if (bgMusic) {
        bgMusic.play().catch(e => console.log('Audio play error:', e));
    }
}

/**
 * Pause background music
 */
export function pauseMusic() {
    if (bgMusic) {
        bgMusic.pause();
    }
}

/**
 * Set music volume
 * @param {number} volume - 0.0 to 1.0
 */
export function setVolume(volume) {
    if (bgMusic) {
        bgMusic.volume = Math.max(0, Math.min(1, volume));
    }
}
