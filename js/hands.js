// ==========================================
// Magic Christmas - Hand Gesture Recognition
// ==========================================

import { AppState } from './config.js';

/**
 * Initialize hand tracking
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} previewCanvas
 * @param {Function} onStateChange - callback(state, handX)
 */
export function initHandTracking(video, previewCanvas, onStateChange) {
    const ctx = previewCanvas.getContext('2d');

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(results => {
        ctx.clearRect(0, 0, 100, 75);
        ctx.drawImage(results.image, 0, 0, 100, 75);

        let newState = AppState.TREE;
        let handX = 0.5;

        // Two hands forming heart
        if (results.multiHandLandmarks.length === 2) {
            const h1 = results.multiHandLandmarks[0];
            const h2 = results.multiHandLandmarks[1];
            const distIndex = Math.hypot(h1[8].x - h2[8].x, h1[8].y - h2[8].y);
            const distThumb = Math.hypot(h1[4].x - h2[4].x, h1[4].y - h2[4].y);
            
            if (distIndex < 0.15 && distThumb < 0.15) {
                onStateChange(AppState.HEART, handX);
                return;
            }
        }

        // Single hand gestures
        if (results.multiHandLandmarks.length > 0) {
            const lm = results.multiHandLandmarks[0];
            handX = lm[9].x;

            const tips = [8, 12, 16, 20];
            const wrist = lm[0];
            let openDist = 0;
            tips.forEach(i => openDist += Math.hypot(lm[i].x - wrist.x, lm[i].y - wrist.y));
            const avgDist = openDist / 4;
            const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

            if (avgDist < 0.25) {
                newState = AppState.TREE;
            } else if (pinchDist < 0.05) {
                newState = AppState.PHOTO;
            } else {
                newState = AppState.EXPLODE;
            }
        } else {
            newState = AppState.TREE;
        }

        onStateChange(newState, handX);
    });

    // Start camera
    const cameraUtils = new Camera(video, {
        onFrame: async () => {
            await hands.send({ image: video });
        },
        width: 320,
        height: 240
    });
    cameraUtils.start();
}
