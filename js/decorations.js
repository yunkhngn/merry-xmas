// ==========================================
// Magic Christmas - Decorations
// ==========================================

import { CONFIG } from './config.js';

/**
 * Create title mesh "MERRY CHRISTMAS"
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh}
 */
export function createTitleMesh(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold italic 90px "Times New Roman"';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 40;
    ctx.fillText("MERRY CHRISTMAS", 512, 130);
    
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), mat);
    mesh.position.set(0, 50, 0);
    scene.add(mesh);
    
    return mesh;
}

/**
 * Create star mesh on top of tree
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh}
 */
export function createStarMesh(scene) {
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 128;
    starCanvas.height = 128;
    const sCtx = starCanvas.getContext('2d');
    sCtx.fillStyle = "#FFFF00";
    sCtx.shadowColor = "#FFF";
    sCtx.shadowBlur = 20;
    sCtx.beginPath();
    
    const cx = 64, cy = 64, outer = 50, inner = 20;
    for (let i = 0; i < 5; i++) {
        sCtx.lineTo(
            cx + Math.cos((18 + i * 72) / 180 * Math.PI) * outer,
            cy - Math.sin((18 + i * 72) / 180 * Math.PI) * outer
        );
        sCtx.lineTo(
            cx + Math.cos((54 + i * 72) / 180 * Math.PI) * inner,
            cy - Math.sin((54 + i * 72) / 180 * Math.PI) * inner
        );
    }
    sCtx.closePath();
    sCtx.fill();
    
    const starTex = new THREE.CanvasTexture(starCanvas);
    const starMat = new THREE.MeshBasicMaterial({
        map: starTex,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), starMat);
    mesh.position.set(0, CONFIG.treeHeight / 2 + 2, 0);
    scene.add(mesh);
    
    return mesh;
}

/**
 * Create love text mesh "I LOVE YOU"
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh}
 */
export function createLoveMesh(scene) {
    const loveCanvas = document.createElement('canvas');
    loveCanvas.width = 1024;
    loveCanvas.height = 256;
    const lCtx = loveCanvas.getContext('2d');
    lCtx.font = 'bold 120px "Segoe UI", sans-serif';
    lCtx.fillStyle = '#FF69B4';
    lCtx.textAlign = 'center';
    lCtx.shadowColor = "#FF1493";
    lCtx.shadowBlur = 40;
    lCtx.fillText("I LOVE YOU ❤️", 512, 130);
    
    const loveTex = new THREE.CanvasTexture(loveCanvas);
    const loveMat = new THREE.MeshBasicMaterial({
        map: loveTex,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(70, 18), loveMat);
    mesh.position.set(0, 0, 20);
    mesh.visible = false;
    scene.add(mesh);
    
    return mesh;
}
