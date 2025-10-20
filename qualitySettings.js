// qualitySettings.js - Graphics quality configurations

export const QUALITY_PRESETS = {
    low: {
        particleCount: 10,
        shadowQuality: false,
        grassBlades: false,
        crowdAnimations: false,
        glowEffects: false,
        smoothShadows: false,
        maxParticles: 20
    },
    medium: {
        particleCount: 30,
        shadowQuality: true,
        grassBlades: true,
        crowdAnimations: true,
        glowEffects: false,
        smoothShadows: false,
        maxParticles: 50
    },
    high: {
        particleCount: 50,
        shadowQuality: true,
        grassBlades: true,
        crowdAnimations: true,
        glowEffects: true,
        smoothShadows: true,
        maxParticles: 100
    }
};

export class QualityManager {
    constructor() {
        this.currentQuality = 'medium';
        this.settings = { ...QUALITY_PRESETS.medium };
    }
    
    setQuality(quality) {
        if (QUALITY_PRESETS[quality]) {
            this.currentQuality = quality;
            this.settings = { ...QUALITY_PRESETS[quality] };
            return true;
        }
        return false;
    }
    
    getQuality() {
        return this.currentQuality;
    }
    
    getSettings() {
        return this.settings;
    }
    
    getSetting(key) {
        return this.settings[key];
    }
}
