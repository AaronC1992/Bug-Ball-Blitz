// audioManager.js - Sound effects and music manager

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.soundVolume = 0.7;
        this.musicVolume = 0.5;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.hapticEnabled = true;
        this.currentMusic = null;
        
        // Load saved preferences
        this.loadPreferences();
        
        // Initialize Web Audio API for sound generation
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate sound effects (using Web Audio API since we don't have audio files)
        this.generateSounds();
    }
    
    loadPreferences() {
        const savedSoundVolume = localStorage.getItem('soundVolume');
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedSoundEnabled = localStorage.getItem('soundEnabled');
        const savedMusicEnabled = localStorage.getItem('musicEnabled');
        const savedHapticEnabled = localStorage.getItem('hapticEnabled');
        
        if (savedSoundVolume !== null) this.soundVolume = parseFloat(savedSoundVolume);
        if (savedMusicVolume !== null) this.musicVolume = parseFloat(savedMusicVolume);
        if (savedSoundEnabled !== null) this.soundEnabled = savedSoundEnabled === 'true';
        if (savedMusicEnabled !== null) this.musicEnabled = savedMusicEnabled === 'true';
        if (savedHapticEnabled !== null) this.hapticEnabled = savedHapticEnabled === 'true';
    }
    
    savePreferences() {
        localStorage.setItem('soundVolume', this.soundVolume.toString());
        localStorage.setItem('musicVolume', this.musicVolume.toString());
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        localStorage.setItem('musicEnabled', this.musicEnabled.toString());
        localStorage.setItem('hapticEnabled', this.hapticEnabled.toString());
    }
    
    generateSounds() {
        // These are placeholders - will generate simple beep sounds
        // In a real implementation, you'd load actual audio files
        this.sounds = {
            kick_soft: this.createKickSound(0.3),
            kick_hard: this.createKickSound(0.8),
            bounce: this.createBounceSound(),
            goal: this.createGoalSound(),
            whistle: this.createWhistleSound(),
            ui_click: this.createClickSound(),
            celebration: this.createCelebrationSound()
        };
    }
    
    createKickSound(intensity) {
        // Create a simple kick sound using oscillator
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(150 - (intensity * 50), this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(intensity * this.soundVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
    }
    
    createBounceSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.3 * this.soundVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createGoalSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            // Triumphant ascending tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.5 * this.soundVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);
        };
    }
    
    createWhistleSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(2500, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.4 * this.soundVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.25);
        };
    }
    
    createClickSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.2 * this.soundVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.06);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.06);
        };
    }
    
    createCelebrationSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            // Happy ascending arpeggio
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (one octave higher)
            
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                const startTime = this.audioContext.currentTime + (index * 0.1);
                oscillator.frequency.setValueAtTime(freq, startTime);
                
                gainNode.gain.setValueAtTime(0.3 * this.soundVolume, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.15);
            });
        };
    }
    
    // Play sound effects
    playSound(soundName, velocityOrIntensity = null) {
        if (!this.soundEnabled) return;
        
        try {
            // For kick sounds, determine if it should be soft or hard based on velocity
            if (soundName === 'kick' && velocityOrIntensity !== null) {
                const intensity = Math.min(Math.abs(velocityOrIntensity) / 20, 1);
                if (intensity > 0.5) {
                    this.sounds.kick_hard();
                } else {
                    this.sounds.kick_soft();
                }
            } else if (this.sounds[soundName]) {
                this.sounds[soundName]();
            }
        } catch (error) {
            console.error('Error playing sound:', soundName, error);
        }
    }
    
    // Volume controls
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.savePreferences();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
        this.savePreferences();
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.savePreferences();
        return this.soundEnabled;
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.currentMusic) {
            if (this.musicEnabled) {
                this.currentMusic.play().catch(e => console.log('Music play failed:', e));
            } else {
                this.currentMusic.pause();
            }
        }
        this.savePreferences();
        return this.musicEnabled;
    }
    
    toggleHaptic() {
        this.hapticEnabled = !this.hapticEnabled;
        this.savePreferences();
        return this.hapticEnabled;
    }
    
    // Haptic feedback for mobile
    vibrate(pattern = 50) {
        if (!this.hapticEnabled) return;
        
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
    
    // Play sound with optional haptic feedback
    playSoundWithHaptic(soundName, hapticPattern, velocityOrIntensity = null) {
        this.playSound(soundName, velocityOrIntensity);
        if (hapticPattern) {
            this.vibrate(hapticPattern);
        }
    }
    
    // Resume audio context (needed for mobile browsers)
    resumeAudioContext() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
