// ==========================================
// Magic Christmas - Main Application
// ==========================================

import { CONFIG, AppState } from './config.js';
import { initTextures } from './textures.js';
import { createParticleSystem, updateParticleGroup } from './particles.js';
import { createTitleMesh, createStarMesh, createLoveMesh } from './decorations.js';
import { loadPhotos, updatePhotos } from './photos.js';
import { initHandTracking } from './hands.js';
import { initAudio, playMusic } from './audio.js';

// Global state
let scene, camera, renderer;
let groupGold, groupRed, groupGift;
let photoMeshes = [];
let photoTextures = [];
let titleMesh, starMesh, loveMesh;
let state = AppState.TREE;
let selectedIndex = 0;
let handX = 0.5;

/**
 * Initialize Three.js scene
 */
async function init3D() {
    const container = document.getElementById('canvas-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 100;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Initialize textures
    const textures = initTextures();

    // Create particle systems
    groupGold = createParticleSystem(scene, 'gold', CONFIG.goldCount, 2.0, textures);
    groupRed = createParticleSystem(scene, 'red', CONFIG.redCount, 3.5, textures);
    groupGift = createParticleSystem(scene, 'gift', CONFIG.giftCount, 3.0, textures);

    // Load photos
    const photoData = await loadPhotos(scene);
    photoMeshes = photoData.meshes;
    photoTextures = photoData.textures;

    // Create decorations
    titleMesh = createTitleMesh(scene);
    starMesh = createStarMesh(scene);
    loveMesh = createLoveMesh(scene);

    // Start animation loop
    animate();
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    const speed = 0.08;
    const handRotY = (handX - 0.5) * 4.0;

    // Update particles
    updateParticleGroup(groupGold, 'gold', state, speed, handRotY, time);
    updateParticleGroup(groupRed, 'red', state, speed, handRotY, time);
    updateParticleGroup(groupGift, 'gift', state, speed, handRotY, time);

    // Update photos
    selectedIndex = updatePhotos(
        photoMeshes,
        photoTextures,
        state,
        selectedIndex,
        camera,
        groupGold.rotation.y,
        time,
        CONFIG.photoOrbitRadius
    );

    // Update decorations based on state
    updateDecorations(time);

    renderer.render(scene, camera);
}

/**
 * Update decorations visibility and animations
 */
function updateDecorations(time) {
    if (state === AppState.TREE) {
        titleMesh.visible = true;
        starMesh.visible = true;
        loveMesh.visible = false;
        titleMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        starMesh.rotation.z -= 0.02;
        starMesh.material.opacity = 0.7 + 0.3 * Math.sin(time * 5);

    } else if (state === AppState.HEART) {
        titleMesh.visible = false;
        starMesh.visible = false;
        loveMesh.visible = true;
        const s = 1 + Math.abs(Math.sin(time * 3)) * 0.1;
        loveMesh.scale.set(s, s, 1);

    } else {
        titleMesh.visible = false;
        starMesh.visible = false;
        loveMesh.visible = false;
    }
}

/**
 * Handle state changes from hand tracking
 */
function handleStateChange(newState, newHandX) {
    state = newState;
    handX = newHandX;
}

/**
 * Start the system
 */
async function startSystem() {
    // Hide start button
    document.getElementById('btnStart').style.display = 'none';

    // Initialize and play audio
    initAudio();
    playMusic();

    // Initialize 3D scene
    await init3D();

    // Initialize hand tracking
    const video = document.getElementsByClassName('input_video')[0];
    const previewCanvas = document.getElementById('camera-preview');
    initHandTracking(video, previewCanvas, handleStateChange);
}

// Window resize handler
window.addEventListener('resize', () => {
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Export start function to global scope
window.startSystem = startSystem;
