// ==========================================
// Magic Christmas - Configuration
// ==========================================

export const CONFIG = {
    // Particle counts
    goldCount: 2000,
    redCount: 300,
    giftCount: 150,
    
    // Dimensions
    explodeRadius: 65,
    photoOrbitRadius: 25,
    treeHeight: 70,
    treeBaseRadius: 35,
    
    // Audio
    musicUrl: "./audio.mp3",
    musicVolume: 1.0,
    musicLoop: true
};

// State management
export const AppState = {
    TREE: 'TREE',
    EXPLODE: 'EXPLODE',
    HEART: 'HEART',
    PHOTO: 'PHOTO'
};
