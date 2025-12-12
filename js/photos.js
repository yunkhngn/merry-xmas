// ==========================================
// Magic Christmas - Photo Gallery
// ==========================================

/**
 * Load photos from JSON config and create meshes
 * @param {THREE.Scene} scene
 * @returns {Promise<{meshes: THREE.Mesh[], textures: THREE.Texture[]}>}
 */
export async function loadPhotos(scene) {
    const loader = new THREE.TextureLoader();
    const photoMeshes = [];
    const photoTextures = [];

    // Fetch image config
    const response = await fetch('./images/images.json');
    const data = await response.json();

    const geo = new THREE.PlaneGeometry(8, 8);
    const borderGeo = new THREE.PlaneGeometry(9, 9);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });

    data.photos.forEach((photo, i) => {
        // Load texture
        const texture = loader.load(photo.path);
        photoTextures.push(texture);

        // Create mesh
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Add border
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.z = -0.1;
        mesh.add(border);

        mesh.visible = false;
        mesh.scale.set(0, 0, 0);
        mesh.userData = { id: photo.id, alt: photo.alt };
        
        scene.add(mesh);
        photoMeshes.push(mesh);
    });

    return { meshes: photoMeshes, textures: photoTextures };
}

/**
 * Update photo animations based on state
 * @param {THREE.Mesh[]} photoMeshes 
 * @param {THREE.Texture[]} photoTextures 
 * @param {string} state 
 * @param {number} selectedIndex 
 * @param {THREE.Camera} camera 
 * @param {number} baseAngle 
 * @param {number} time 
 * @param {number} photoOrbitRadius 
 * @returns {number} new selectedIndex
 */
export function updatePhotos(photoMeshes, photoTextures, state, selectedIndex, camera, baseAngle, time, photoOrbitRadius) {
    // Ensure textures are applied
    photoMeshes.forEach((mesh, i) => {
        if (!mesh.material.map && photoTextures[i]) {
            mesh.material.map = photoTextures[i];
            mesh.material.needsUpdate = true;
        }
    });

    if (state === 'TREE' || state === 'HEART') {
        photoMeshes.forEach(m => {
            m.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            m.visible = false;
        });
        return selectedIndex;

    } else if (state === 'EXPLODE') {
        const angleStep = (Math.PI * 2) / photoMeshes.length;
        let bestIdx = 0;
        let maxZ = -999;

        photoMeshes.forEach((mesh, i) => {
            mesh.visible = true;
            const angle = baseAngle + i * angleStep;
            const x = Math.sin(angle) * photoOrbitRadius;
            const z = Math.cos(angle) * photoOrbitRadius;
            const y = Math.sin(time + i) * 3;
            
            mesh.position.lerp(new THREE.Vector3(x, y, z), 0.1);
            mesh.lookAt(camera.position);
            
            if (z > maxZ) {
                maxZ = z;
                bestIdx = i;
            }
            
            if (z > 5) {
                const ds = 1.0 + (z / photoOrbitRadius) * 0.8;
                mesh.scale.lerp(new THREE.Vector3(ds, ds, ds), 0.1);
            } else {
                mesh.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.1);
            }
        });
        
        return bestIdx;

    } else if (state === 'PHOTO') {
        photoMeshes.forEach((mesh, i) => {
            if (i === selectedIndex) {
                mesh.position.lerp(new THREE.Vector3(0, 0, 60), 0.1);
                mesh.scale.lerp(new THREE.Vector3(5, 5, 5), 0.1);
                mesh.lookAt(camera.position);
                mesh.rotation.z = 0;
            } else {
                mesh.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            }
        });
        return selectedIndex;
    }

    return selectedIndex;
}
