// ==========================================
// Magic Christmas - Particle System
// ==========================================

import { CONFIG } from './config.js';

/**
 * Create a particle system for tree, explode, and heart effects
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} type - 'gold' | 'red' | 'gift'
 * @param {number} count - number of particles
 * @param {number} size - particle size
 * @param {Object} textures - texture object
 * @returns {THREE.Points}
 */
export function createParticleSystem(scene, type, count, size, textures) {
    const pPositions = [];
    const pExplodeTargets = [];
    const pTreeTargets = [];
    const pHeartTargets = [];
    const sizes = [];
    const phases = [];

    for (let i = 0; i < count; i++) {
        // --- TREE Position ---
        const h = Math.random() * CONFIG.treeHeight;
        const y = h - CONFIG.treeHeight / 2;
        let radiusRatio = (type === 'gold') ? Math.sqrt(Math.random()) : 0.9 + Math.random() * 0.1;
        const maxR = (1 - (h / CONFIG.treeHeight)) * CONFIG.treeBaseRadius;
        const r = maxR * radiusRatio;
        const theta = Math.random() * Math.PI * 2;
        pTreeTargets.push(r * Math.cos(theta), y, r * Math.sin(theta));

        // --- EXPLODE Position ---
        const u = Math.random();
        const v = Math.random();
        const phi = Math.acos(2 * v - 1);
        const lam = 2 * Math.PI * u;
        let radMult = (type === 'gift') ? 1.2 : 1.0;
        const rad = CONFIG.explodeRadius * Math.cbrt(Math.random()) * radMult;
        pExplodeTargets.push(
            rad * Math.sin(phi) * Math.cos(lam),
            rad * Math.sin(phi) * Math.sin(lam),
            rad * Math.cos(phi)
        );

        // --- SOFT HEART Position ---
        const tHeart = Math.random() * Math.PI * 2;
        let hx = 16 * Math.pow(Math.sin(tHeart), 3);
        let hy = 13 * Math.cos(tHeart) - 5 * Math.cos(2 * tHeart) - 2 * Math.cos(3 * tHeart) - Math.cos(4 * tHeart);

        const rFill = Math.pow(Math.random(), 0.3);
        hx *= rFill;
        hy *= rFill;
        let hz = (Math.random() - 0.5) * 8 * rFill;

        const noise = 1.0;
        hx += (Math.random() - 0.5) * noise;
        hy += (Math.random() - 0.5) * noise;
        hz += (Math.random() - 0.5) * noise;

        const scaleH = 2.2;
        pHeartTargets.push(hx * scaleH, hy * scaleH + 5, hz);

        // --- INIT Position ---
        pPositions.push(pTreeTargets[i * 3], pTreeTargets[i * 3 + 1], pTreeTargets[i * 3 + 2]);
        sizes.push(size);
        phases.push(Math.random() * Math.PI * 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Init colors
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color();
    if (type === 'gold') baseColor.setHex(0xFFD700);
    else if (type === 'red') baseColor.setHex(0xFF0000);
    else baseColor.setHex(0xFFFFFF);

    for (let i = 0; i < count; i++) {
        colors[i * 3] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    geo.userData = {
        tree: pTreeTargets,
        explode: pExplodeTargets,
        heart: pHeartTargets,
        phases: phases,
        baseColor: baseColor,
        baseSize: size
    };

    const mat = new THREE.PointsMaterial({
        size: size,
        map: textures[type],
        transparent: true,
        opacity: 1.0,
        vertexColors: true,
        blending: (type === 'gift') ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return points;
}

/**
 * Update particle group animation
 * @param {THREE.Points} group - particle group
 * @param {string} type - particle type
 * @param {string} targetState - current state
 * @param {number} speed - animation speed
 * @param {number} handRotY - hand rotation Y
 * @param {number} time - current time
 */
export function updateParticleGroup(group, type, targetState, speed, handRotY, time) {
    const positions = group.geometry.attributes.position.array;
    const sizes = group.geometry.attributes.size.array;
    const colors = group.geometry.attributes.color.array;
    const phases = group.geometry.userData.phases;
    const baseColor = group.geometry.userData.baseColor;
    const baseSize = group.geometry.userData.baseSize;

    const targetKey = (targetState === 'TREE') ? 'tree' : (targetState === 'HEART' ? 'heart' : 'explode');
    const targets = group.geometry.userData[(targetState === 'PHOTO') ? 'explode' : targetKey];

    // Position interpolation
    for (let i = 0; i < positions.length; i++) {
        positions[i] += (targets[i] - positions[i]) * speed;
    }
    group.geometry.attributes.position.needsUpdate = true;

    // COLOR & SIZE update
    const count = positions.length / 3;

    if (targetState === 'TREE') {
        group.rotation.y += 0.003;

        for (let i = 0; i < count; i++) {
            sizes[i] = baseSize;
            let brightness = 1.0;
            if (type === 'red') {
                brightness = 0.5 + 0.5 * Math.sin(time * 3 + phases[i]);
            } else if (type === 'gold') {
                brightness = 0.8 + 0.4 * Math.sin(time * 10 + phases[i]);
            }
            colors[i * 3] = baseColor.r * brightness;
            colors[i * 3 + 1] = baseColor.g * brightness;
            colors[i * 3 + 2] = baseColor.b * brightness;
        }
        group.geometry.attributes.color.needsUpdate = true;
        group.geometry.attributes.size.needsUpdate = true;

    } else if (targetState === 'HEART') {
        group.rotation.y = 0;
        const beatScale = 1 + Math.abs(Math.sin(time * 3)) * 0.15;
        group.scale.set(beatScale, beatScale, beatScale);

        for (let i = 0; i < count; i++) {
            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
            if (i % 3 === 0) sizes[i] = baseSize;
            else sizes[i] = 0;
        }
        group.geometry.attributes.color.needsUpdate = true;
        group.geometry.attributes.size.needsUpdate = true;

    } else {
        // EXPLODE / PHOTO
        group.scale.set(1, 1, 1);
        group.rotation.y += (handRotY - group.rotation.y) * 0.1;

        for (let i = 0; i < count; i++) {
            sizes[i] = baseSize;
            let brightness = 1.0;
            if (type === 'gold' || type === 'red') {
                brightness = 0.8 + 0.5 * Math.sin(time * 12 + phases[i]);
            }
            colors[i * 3] = baseColor.r * brightness;
            colors[i * 3 + 1] = baseColor.g * brightness;
            colors[i * 3 + 2] = baseColor.b * brightness;
        }
        group.geometry.attributes.size.needsUpdate = true;
        group.geometry.attributes.color.needsUpdate = true;
    }
}
