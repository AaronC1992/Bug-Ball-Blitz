// ui.js - UI rendering and menu management

import { getBugArray } from './bugs.js';
import { getArenaArray } from './arenas.js';
import { SaveSystem } from './saveSystem.js';

export class UIManager {
    constructor(game = null) {
        this.game = game;
        this.currentScreen = 'titleScreen';
        this.currentProfile = null;
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        
        this.initializeEventListeners();
        this.updateMobileUI();
        this.setupModeChangeDetection();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    detectTablet() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isTabletUA = /ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(userAgent);
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLargeScreen = window.innerWidth >= 768 && window.innerHeight >= 600;
        
        // Device is a tablet if it has touch support, large screen, and tablet user agent
        return hasTouch && isLargeScreen && (isTabletUA || (window.innerWidth >= 768 && !userAgent.includes('mobile')));
    }
    
    setupModeChangeDetection() {
        // Listen for orientation changes (laptop to tablet mode)
        window.addEventListener('orientationchange', () => {
            this.handleModeChange();
        });
        
        // Listen for resize events (2-in-1 device mode changes)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleModeChange();
            }, 300);
        });
        
        // Listen for touch capability changes
        window.addEventListener('touchstart', () => {
            if (!this.isMobile) {
                this.handleModeChange();
            }
        }, { once: true, passive: true });
    }
    
    handleModeChange() {
        const wasTablet = this.isTablet;
        const wasMobile = this.isMobile;
        
        // Re-detect device type
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        
        // If mode changed, update UI
        if (wasTablet !== this.isTablet || wasMobile !== this.isMobile) {
            this.updateMobileUI();
            
            // Notify game if it exists
            if (window.game) {
                window.game.handleDeviceModeChange(this.isMobile, this.isTablet);
            }
        }
    }
    
    updateMobileUI() {
        const multiplayerBtn = document.getElementById('localMultiplayerBtn');
        // Hide multiplayer only on phones (not tablets)
        if (this.isMobile && !this.isTablet && multiplayerBtn) {
            multiplayerBtn.classList.add('hidden');
        } else if (multiplayerBtn) {
            multiplayerBtn.classList.remove('hidden');
        }
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }
    
    showOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    hideOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    initializeEventListeners() {
        // Title screen
        document.getElementById('createProfileBtn').addEventListener('click', () => {
            this.showScreen('profileCreateScreen');
        });
        
        document.getElementById('loadProfileBtn').addEventListener('click', () => {
            this.showProfileList();
            this.showScreen('profileLoadScreen');
        });
        
        // Exit button (just closes window/does nothing on web)
        document.getElementById('exitBtn').addEventListener('click', () => {
            window.close(); // Only works if window was opened by script
        });
        
        // Profile creation
        document.getElementById('confirmProfileBtn').addEventListener('click', () => {
            this.createProfile();
        });
        
        document.getElementById('cancelProfileBtn').addEventListener('click', () => {
            this.showScreen('titleScreen');
        });
        
        document.getElementById('profileNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createProfile();
            }
        });
        
        // Profile load
        document.getElementById('backToTitleBtn').addEventListener('click', () => {
            this.showScreen('titleScreen');
        });
        
        // Main menu
        document.getElementById('viewStatsBtn').addEventListener('click', () => {
            this.showStats();
        });
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Stats screen
        document.getElementById('backToMainBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
    }
    
    createProfile() {
        const input = document.getElementById('profileNameInput');
        const name = input.value.trim();
        
        const result = SaveSystem.createProfile(name);
        
        if (result.success) {
            this.currentProfile = result.profile;
            input.value = '';
            this.showMainMenu();
            
            // Stop title menu background, start main menu background
            if (this.game && this.game.menuBackground) {
                this.game.menuBackground.stop();
            }
            if (this.game && this.game.mainMenuBackgroundCanvas) {
                this.game.resizeMainMenuBackgroundCanvas();
                if (!this.game.mainMenuBackground) {
                    this.game.initializeMainMenuBackground();
                }
                this.game.mainMenuBackground.setupMatch();
                this.game.mainMenuBackground.start();
            }
        } else {
            alert(result.error);
        }
    }
    
    showProfileList() {
        const profiles = SaveSystem.getAllProfiles();
        const listContainer = document.getElementById('profileList');
        listContainer.innerHTML = '';
        
        if (profiles.length === 0) {
            listContainer.innerHTML = '<p style="color: #aaa; text-align: center;">No profiles found</p>';
            return;
        }
        
        profiles.forEach(profile => {
            const profileItem = document.createElement('div');
            profileItem.className = 'profile-item';
            profileItem.innerHTML = `
                <div class="profile-name">${profile.name}</div>
                <div class="profile-stats">
                    Wins: ${profile.stats.wins} | Losses: ${profile.stats.losses} | 
                    Tower Level: ${profile.tower.currentLevel}
                </div>
            `;
            
            profileItem.addEventListener('click', () => {
                this.loadProfile(profile.name);
            });
            
            listContainer.appendChild(profileItem);
        });
    }
    
    loadProfile(name) {
        const profile = SaveSystem.loadProfile(name);
        if (profile) {
            this.currentProfile = profile;
            this.showMainMenu();
            
            // Stop title menu background, start main menu background
            if (this.game && this.game.menuBackground) {
                this.game.menuBackground.stop();
            }
            if (this.game && this.game.mainMenuBackgroundCanvas) {
                this.game.resizeMainMenuBackgroundCanvas();
                if (!this.game.mainMenuBackground) {
                    this.game.initializeMainMenuBackground();
                }
                this.game.mainMenuBackground.setupMatch();
                this.game.mainMenuBackground.start();
            }
        }
    }
    
    showMainMenu() {
        const profileInfo = document.getElementById('profileInfo');
        profileInfo.innerHTML = `
            <h3>Welcome, ${this.currentProfile.name}!</h3>
            <p>Tower Level: ${this.currentProfile.tower.currentLevel} | 
               Wins: ${this.currentProfile.stats.wins}</p>
        `;
        this.showScreen('mainMenu');
    }
    
    showStats() {
        const stats = this.currentProfile.stats;
        const tower = this.currentProfile.tower;
        
        const statsDisplay = document.getElementById('statsDisplay');
        statsDisplay.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Profile Name:</span>
                <span class="stat-value">${this.currentProfile.name}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Matches Played:</span>
                <span class="stat-value">${stats.matchesPlayed}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Wins:</span>
                <span class="stat-value">${stats.wins}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Losses:</span>
                <span class="stat-value">${stats.losses}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Win Rate:</span>
                <span class="stat-value">${stats.matchesPlayed > 0 ? 
                    ((stats.wins / stats.matchesPlayed) * 100).toFixed(1) : 0}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Goals Scored:</span>
                <span class="stat-value">${stats.goalsScored}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Goals Conceded:</span>
                <span class="stat-value">${stats.goalsConceded}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Tower Level:</span>
                <span class="stat-value">${tower.currentLevel}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Tower Complete:</span>
                <span class="stat-value">${tower.isComplete ? 'Yes ✓' : 'No'}</span>
            </div>
        `;
        
        this.showScreen('statsScreen');
    }
    
    logout() {
        this.currentProfile = null;
        this.showScreen('titleScreen');
        
        // Stop main menu background, restart title screen background
        if (this.game && this.game.mainMenuBackground) {
            this.game.mainMenuBackground.stop();
        }
        if (this.game && this.game.menuBackground) {
            this.game.resizeMenuBackgroundCanvas();
            this.game.menuBackground.setupMatch();
            this.game.menuBackground.start();
        }
    }
    
    showBugSelection(callback) {
        const bugGrid = document.getElementById('bugGrid');
        bugGrid.innerHTML = '';
        
        const bugs = getBugArray();
        bugs.forEach(bug => {
            const bugCard = document.createElement('div');
            bugCard.className = 'bug-card';
            
            if (bug.id === this.currentProfile.preferences.selectedBug) {
                bugCard.classList.add('selected');
            }
            
            bugCard.innerHTML = `
                <div class="bug-sprite">${bug.svg}</div>
                <div class="bug-name">${bug.name}</div>
                <div class="bug-stats">
                    <div class="stat-bar-container">
                        <small>Speed</small>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${bug.stats.speed * 100}%"></div>
                        </div>
                    </div>
                    <div class="stat-bar-container">
                        <small>Jump</small>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${bug.stats.jump * 100}%"></div>
                        </div>
                    </div>
                    <div class="stat-bar-container">
                        <small>Power</small>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${bug.stats.power * 100}%"></div>
                        </div>
                    </div>
                </div>
            `;
            
            bugCard.addEventListener('click', () => {
                SaveSystem.updatePreferences(this.currentProfile, { selectedBug: bug.id });
                callback(bug.id);
            });
            
            bugGrid.appendChild(bugCard);
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelBugSelectBtn');
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        this.showScreen('bugSelectScreen');
    }
    
    showArenaSelection(callback) {
        const arenaGrid = document.getElementById('arenaGrid');
        arenaGrid.innerHTML = '';
        
        const arenas = getArenaArray();
        arenas.forEach(arena => {
            const arenaCard = document.createElement('div');
            arenaCard.className = 'arena-card';
            
            const previewCanvas = document.createElement('canvas');
            previewCanvas.className = 'arena-preview';
            previewCanvas.width = 250;
            previewCanvas.height = 100;
            
            const ctx = previewCanvas.getContext('2d');
            this.drawArenaPreview(ctx, arena, 250, 100);
            
            arenaCard.appendChild(previewCanvas);
            
            const arenaName = document.createElement('div');
            arenaName.className = 'arena-name';
            arenaName.textContent = arena.name;
            arenaCard.appendChild(arenaName);
            
            arenaCard.addEventListener('click', () => {
                SaveSystem.updatePreferences(this.currentProfile, { selectedArena: arena.id });
                callback(arena.id);
            });
            
            arenaGrid.appendChild(arenaCard);
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelArenaSelectBtn');
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        this.showScreen('arenaSelectScreen');
    }
    
    drawArenaPreview(ctx, arena, width, height) {
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
        skyGradient.addColorStop(0, arena.skyColors[0]);
        skyGradient.addColorStop(1, arena.skyColors[1]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Ground
        ctx.fillStyle = arena.groundColor;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
    }
}
