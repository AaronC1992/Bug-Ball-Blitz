// ads.js - Placeholder Ads Manager for Bug Ball Blitz
// NOTE: Real AdMob integration requires building a native wrapper (Capacitor/Cordova)
// and supplying real Ad Unit IDs. This stub provides a unified API so game code
// can call ads without crashing in plain web builds.

export class AdsManager {
    constructor(options = {}) {
        this.platform = this.detectPlatform();
        this.appId = options.appId || null; // Provided App ID for native builds
        this.bannerId = options.bannerId || 'TEST_BANNER_ID';
        this.interstitialId = options.interstitialId || 'TEST_INTERSTITIAL_ID';
        this.rewardedId = options.rewardedId || 'TEST_REWARDED_ID';
        this.lastInterstitialTime = 0;
        this.interstitialCooldownMs = (options.interstitialCooldownSeconds || 120) * 1000; // 2 min default
        this.initialized = false;
        this.rewardCallback = null;
        this.debug = options.debug !== false; // default true
    }

    log(...args) {
        if (this.debug) console.log('[Ads]', ...args);
    }

    detectPlatform() {
        // Check for Capacitor first (preferred)
        if (typeof window !== 'undefined' && window.Capacitor) {
            return 'capacitor';
        }
        if (typeof window !== 'undefined' && window.cordova) {
            return 'cordova';
        }
        return 'web';
    }

    async init() {
        this.log('Initializing ads manager on platform:', this.platform);
        if (this.platform === 'web') {
            this.log('Web build: using placeholder ads only. Provide native wrapper for real AdMob.');
        } else {
            // Native initialization (Capacitor AdMob plugin)
            if (this.platform === 'capacitor' && window.Capacitor?.Plugins?.AdMob) {
                try {
                    const { AdMob } = window.Capacitor.Plugins;
                    await AdMob.initialize({
                        requestTrackingAuthorization: true,
                        testingDevices: ['YOUR_TEST_DEVICE_ID'], // Replace with your device ID
                        initializeForTesting: this.debug
                    });
                    this.adMobPlugin = AdMob;
                    this.log('AdMob native plugin initialized');
                } catch (e) {
                    console.error('AdMob init failed:', e);
                }
            } else {
                this.log('Native platform but AdMob plugin not found');
            }
        }
        this.initialized = true;
        await this.preloadInterstitial();
        await this.preloadRewarded();
    }

    async preloadInterstitial() {
        if (!this.initialized) return;
        if (this.platform === 'capacitor' && this.adMobPlugin) {
            try {
                await this.adMobPlugin.prepareInterstitial({
                    adId: this.interstitialId,
                    isTesting: this.debug
                });
                this.interstitialReady = true;
                this.log('Native interstitial preloaded');
            } catch (e) {
                console.error('Failed to preload interstitial:', e);
                this.interstitialReady = false;
            }
        } else {
            this.interstitialReady = true; // Placeholder always ready
            this.log('Interstitial preloaded (placeholder).');
        }
    }

    async preloadRewarded() {
        if (!this.initialized) return;
        this.rewardedReady = true; // Placeholder always ready
        this.log('Rewarded ad preloaded (placeholder).');
    }

    canShowInterstitial() {
        const now = Date.now();
        return this.interstitialReady && (now - this.lastInterstitialTime) > this.interstitialCooldownMs;
    }

    async showInterstitial(force = false) {
        if (!this.initialized) {
            this.log('Cannot show interstitial: not initialized');
            return false;
        }
        if (!force && !this.canShowInterstitial()) {
            this.log('Interstitial cooldown active or not ready.');
            return false;
        }
        
        if (this.platform === 'capacitor' && this.adMobPlugin) {
            try {
                await this.adMobPlugin.showInterstitial();
                this.log('Native interstitial shown');
                this.lastInterstitialTime = Date.now();
                this.interstitialReady = false;
                setTimeout(() => this.preloadInterstitial(), 3000);
                return true;
            } catch (e) {
                console.error('Failed to show interstitial:', e);
                return false;
            }
        } else if (this.platform === 'web') {
            this.log('Showing placeholder interstitial (web).');
            alert('Interstitial Ad (Placeholder)');
            this.lastInterstitialTime = Date.now();
            this.interstitialReady = false;
            setTimeout(() => this.preloadInterstitial(), 3000);
            return true;
        } else {
            this.log('Platform not supported for ads');
            return false;
        }
    }

    async showRewarded(rewardCallback) {
        if (!this.initialized) {
            this.log('Cannot show rewarded: not initialized');
            return false;
        }
        if (!this.rewardedReady) {
            this.log('Rewarded not ready yet.');
            return false;
        }
        this.rewardCallback = rewardCallback;
        if (this.platform === 'web') {
            this.log('Showing placeholder rewarded (web).');
            const watched = confirm('Watch Rewarded Ad? (Placeholder)');
            if (watched) {
                this.grantReward();
            }
        } else {
            this.log('Would invoke native rewarded show here.');
            // On completion, native plugin would trigger reward.
            this.grantReward(); // Simulate success
        }
        this.rewardedReady = false;
        setTimeout(() => this.preloadRewarded(), 5000);
        return true;
    }

    grantReward() {
        this.log('Granting rewarded ad benefit.');
        if (typeof this.rewardCallback === 'function') {
            try { this.rewardCallback(); } catch (e) { console.error('Reward callback error:', e); }
        }
    }

    // Banner ads disabled per product decision
    async showBanner() {
        this.log('Banner ads disabled. Skipping showBanner().');
    }

    hideBanner() {
        /* no-op */
    }
}
