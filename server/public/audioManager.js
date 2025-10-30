// Audio manager using Howler.js for CueAI
// Manages background music and layered SFX

class AudioManager {
  constructor() {
    this.catalog = [];
    this.currentMusic = null;
    this.musicHowl = null;
    this.sfxHowls = []; // Support up to 3 simultaneous SFX
    this.maxSfx = 3;
  }

  // Load catalog from server
  async loadCatalog(catalogData) {
    this.catalog = catalogData;
    console.log('AudioManager: loaded', this.catalog.length, 'sounds');
  }

  // Find sound by ID
  findSound(id) {
    return this.catalog.find(s => s.id === id);
  }

  // Play or continue music
  playMusic(id) {
    const sound = this.findSound(id);
    if (!sound || sound.type !== 'music') {
      console.warn('AudioManager: invalid music ID', id);
      return;
    }

    // If already playing this track, do nothing
    if (this.currentMusic === id && this.musicHowl && this.musicHowl.playing()) {
      console.log('AudioManager: music already playing', id);
      return;
    }

    // Stop current music if different
    if (this.currentMusic !== id && this.musicHowl) {
      this.musicHowl.fade(this.musicHowl.volume(), 0, 500);
      setTimeout(() => {
        if (this.musicHowl) this.musicHowl.stop();
      }, 500);
    }

    // Create new Howl
    this.currentMusic = id;
    this.musicHowl = new Howl({
      src: [sound.src],
      loop: sound.loop !== false,
      volume: 0.7,
      onload: () => console.log('AudioManager: loaded music', id),
      onloaderror: (id, err) => console.error('AudioManager: music load error', id, err),
      onplayerror: (id, err) => console.error('AudioManager: music play error', id, err)
    });

    this.musicHowl.play();
    this.musicHowl.fade(0, 0.7, 1000);
  }

  // Stop current music
  stopMusic() {
    if (this.musicHowl) {
      this.musicHowl.fade(this.musicHowl.volume(), 0, 500);
      setTimeout(() => {
        if (this.musicHowl) {
          this.musicHowl.stop();
          this.musicHowl = null;
        }
      }, 500);
      this.currentMusic = null;
    }
  }

  // Play SFX (layered, up to maxSfx simultaneous)
  playSFX(id, volume = 1.0) {
    const sound = this.findSound(id);
    if (!sound || sound.type !== 'sfx') {
      console.warn('AudioManager: invalid sfx ID', id);
      return;
    }

    // Clean up finished SFX
    this.sfxHowls = this.sfxHowls.filter(h => h.playing());

    // Limit concurrent SFX
    if (this.sfxHowls.length >= this.maxSfx) {
      console.warn('AudioManager: max SFX limit reached');
      // Stop oldest
      const oldest = this.sfxHowls.shift();
      if (oldest) oldest.stop();
    }

    const sfxHowl = new Howl({
      src: [sound.src],
      loop: sound.loop === true,
      volume: Math.max(0, Math.min(1, volume)),
      onload: () => console.log('AudioManager: loaded sfx', id),
      onend: () => {
        // Remove from active list when done
        this.sfxHowls = this.sfxHowls.filter(h => h !== sfxHowl);
      }
    });

    this.sfxHowls.push(sfxHowl);
    sfxHowl.play();
  }

  // Handle analyze result from server
  handleAnalyzeResult(result) {
    if (!result) return;

    console.log('AudioManager: handling analyze result', result);

    // Music
    if (result.music) {
      const { id, action } = result.music;
      if (action === 'play_or_continue') {
        this.playMusic(id);
      } else if (action === 'stop') {
        this.stopMusic();
      } else if (action === 'change') {
        this.stopMusic();
        setTimeout(() => this.playMusic(id), 600);
      }
    }

    // SFX
    if (Array.isArray(result.sfx)) {
      result.sfx.forEach((sfx, index) => {
        const delay = sfx.when === 'immediate' ? 0 : (index * 200); // stagger if not immediate
        setTimeout(() => {
          this.playSFX(sfx.id, sfx.volume || 1.0);
        }, delay);
      });
    }
  }

  // Stop all audio
  stopAll() {
    this.stopMusic();
    this.sfxHowls.forEach(h => h.stop());
    this.sfxHowls = [];
  }
}

export default AudioManager;
