// ui.js - UI rendering and menu management

import { getBugArray, isBugUnlocked } from './bugs.js';
import { getArenaArray, isArenaUnlocked } from './arenas.js';
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
        const debugEl = document.getElementById('debugDisplay');
        if (debugEl) {
            debugEl.textContent = 'showScreen called with: ' + screenId;
        }
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        } else {
            if (debugEl) {
                debugEl.textContent = 'ERROR: Screen not found: ' + screenId;
            }
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
        const createBtn = document.getElementById('createProfileBtn');
        const loadBtn = document.getElementById('loadProfileBtn');
        const exitBtn = document.getElementById('exitBtn');
        
        createBtn.addEventListener('click', () => {
            this.showScreen('profileCreateScreen');
        });
        
        loadBtn.addEventListener('click', () => {
            this.showProfileList();
            this.showScreen('profileLoadScreen');
        });
        
        // Exit button - Navigate back or to portfolio
        // TODO: When converting to mobile app (Cordova/Capacitor/React Native),
        // replace this with proper app exit functionality:
        // - Cordova: navigator.app.exitApp()
        // - Capacitor: App.exitApp()
        // - React Native: BackHandler.exitApp()
        exitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit Bug Ball Blitz?')) {
                // Try to go back in browser history
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // If no history, go to GitHub repository
                    window.location.href = 'https://github.com/AaronC1992/Bug-Ball-Blitz';
                }
            }
        });
        
        // Developer button - Clear all cached data
        document.getElementById('devClearDataBtn').addEventListener('click', () => {
            if (confirm('⚠️ DEVELOPER MODE ⚠️\n\nThis will erase ALL cached data including:\n• All profiles\n• All achievements\n• All unlocked content\n• All settings\n\nThis action cannot be undone!\n\nContinue?')) {
                // Clear localStorage
                localStorage.clear();
                
                // Clear sessionStorage
                sessionStorage.clear();
                
                // Clear cookies
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Show confirmation
                alert('✅ All cached data has been cleared!\n\nThe page will now reload to show fresh content.');
                
                // Force reload from server (bypass cache)
                window.location.reload(true);
            }
        });
        
        // Developer button - Create tester profile
        const devTestBtn = document.getElementById('devTestProfileBtn');
        if (devTestBtn) {
            devTestBtn.addEventListener('click', () => {
                console.log('Dev test button clicked');
                if (confirm('👨‍💻 DEVELOPER MODE 👨‍💻\n\nCreate a test profile with:\n• All bugs unlocked\n• All arenas unlocked\n• All celebrations unlocked\n• All achievements completed\n• Max stats and tower progress\n\nProfile name: "DEV-TESTER"\n\nContinue?')) {
                    this.createDevTesterProfile();
                }
            });
        } else {
            console.error('Dev test profile button not found!');
        }
        
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
        
        document.getElementById('tutorialBtn').addEventListener('click', () => {
            this.showScreen('tutorialScreen');
        });
        
        document.getElementById('backToMainFromTutorialBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
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
            
            // Update achievement manager with this new profile
            if (this.game && this.game.achievements) {
                this.game.achievements.setProfile(this.currentProfile);
            }
            
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
    
    createDevTesterProfile() {
        const name = 'DEV-TESTER';
        
        // Check if profile already exists
        const profileKey = 'bugBall_save_' + name.toLowerCase().replace(/\s+/g, '_');
        if (localStorage.getItem(profileKey)) {
            if (!confirm('Profile "DEV-TESTER" already exists.\n\nReplace with fresh tester profile?')) {
                return;
            }
            SaveSystem.deleteProfile(name);
        }
        
        // Get all achievement IDs
        const allAchievementIds = [
            'firstGoal', 'goalMachine', 'centurion', 'legendary',
            'firstVictory', 'champion', 'unbeatable',
            'perfectGame', 'shutoutKing',
            'hatTrick', 'quickDraw', 'comeback', 'blowout',
            'marathonMan', 'worldTraveler', 'bugCollector', 'arenaExplorer'
        ];
        
        // Create fully unlocked profile
        const profile = {
            name: name,
            created: Date.now(),
            stats: {
                wins: 1000,
                losses: 100,
                goalsScored: 5000,
                goalsConceded: 1000,
                matchesPlayed: 1100
            },
            tower: {
                currentLevel: 1, // Start at level 1 but with all content unlocked
                highestLevel: 20,
                isComplete: true,
                levelsCompleted: 20
            },
            preferences: {
                selectedBug: 'ladybug',
                selectedArena: 'grassField',
                graphicsQuality: 'high',
                soundEnabled: true,
                musicEnabled: true,
                vibrationEnabled: true
            },
            selectedCelebration: 'classic',
            achievementProgress: {
                stats: {
                    totalGoals: 5000,
                    totalWins: 1000,
                    totalMatches: 1100,
                    perfectGames: 500,
                    quickGoals: 200,
                    comebacks: 100,
                    blowouts: 300,
                    goalsInMatch: 20,
                    visitedArenas: ['grassField', 'desertDunes', 'snowySlopes', 'volcanoValley', 
                                   'oceanSide', 'spaceStation', 'jungleJungle', 'crystalCave',
                                   'hauntedHollow', 'candyLand', 'cityRooftop', 'underwaterArena',
                                   'cloudPalace', 'lavaCourt']
                },
                achievements: {}
            }
        };
        
        // Mark all achievements as unlocked
        allAchievementIds.forEach(id => {
            profile.achievementProgress.achievements[id] = {
                unlocked: true,
                unlockedAt: Date.now()
            };
        });
        
        // Save profile
        localStorage.setItem(profileKey, JSON.stringify(profile));
        
        // Load the profile
        this.currentProfile = profile;
        
        // Update achievement manager
        if (this.game && this.game.achievements) {
            this.game.achievements.setProfile(this.currentProfile);
        }
        
        // Show main menu
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
        
        // Show success message
        alert('✅ DEV-TESTER profile created!\n\n• All bugs unlocked\n• All arenas unlocked\n• All celebrations unlocked\n• All achievements completed\n• Max tower progress');
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
                <div class="profile-content">
                    <div class="profile-name">${profile.name}</div>
                    <div class="profile-stats">
                        Wins: ${profile.stats.wins} | Losses: ${profile.stats.losses} | 
                        Tower Level: ${profile.tower.currentLevel}
                    </div>
                </div>
                <button class="delete-profile-btn" title="Delete Profile">🗑️</button>
            `;
            
            // Click on profile content to load
            const profileContent = profileItem.querySelector('.profile-content');
            profileContent.addEventListener('click', () => {
                this.loadProfile(profile.name);
            });
            
            // Click on delete button to delete
            const deleteBtn = profileItem.querySelector('.delete-profile-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent loading profile when clicking delete
                this.deleteProfile(profile.name);
            });
            
            listContainer.appendChild(profileItem);
        });
    }
    
    deleteProfile(name) {
        // Confirm deletion
        if (confirm(`Are you sure you want to delete the profile "${name}"?\n\nThis action cannot be undone.`)) {
            SaveSystem.deleteProfile(name);
            this.showProfileList(); // Refresh the list
            
            // Show a brief notification
            this.showNotification(`Profile "${name}" deleted`, 'info');
        }
    }
    
    loadProfile(name) {
        const profile = SaveSystem.loadProfile(name);
        if (profile) {
            this.currentProfile = profile;
            
            // Update achievement manager with this profile
            if (this.game && this.game.achievements) {
                this.game.achievements.setProfile(this.currentProfile);
            }
            
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
    
    showBugSelection(callback, customMessage = null) {
        console.log('showBugSelection called with message:', customMessage);
        
        const bugGrid = document.getElementById('bugGrid');
        if (!bugGrid) {
            console.error('Bug grid not found!');
            return;
        }
        bugGrid.innerHTML = '';
        
        // Update header message if provided - show screen first to ensure DOM exists
        this.showScreen('bugSelectScreen');
        
        const bugSelectScreen = document.getElementById('bugSelectScreen');
        const existingHeader = bugSelectScreen?.querySelector('h2');
        if (customMessage && existingHeader) {
            existingHeader.textContent = customMessage;
        } else if (existingHeader) {
            existingHeader.textContent = '🐛 Select Your Bug';
        }
        
        const bugs = getBugArray();
        const achievementManager = this.game ? this.game.achievements : null;
        
        // Create Random Bug card as first option
        const randomCard = document.createElement('div');
        randomCard.className = 'bug-card';
        
        randomCard.innerHTML = `
            <div class="bug-sprite" style="font-size: 80px; display: flex; align-items: center; justify-content: center; height: 80px;">❓</div>
            <div class="bug-name">🎲 Random Bug</div>
            <div class="bug-stats">
                <div class="stat-bar-container">
                    <small>Surprise!</small>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: 100%; background: linear-gradient(90deg, #8b5cf6, #6366f1, #8b5cf6);"></div>
                    </div>
                </div>
            </div>
        `;
        
        randomCard.addEventListener('click', () => {
            const unlockedBugs = bugs.filter(bug => isBugUnlocked(bug.id, achievementManager));
            if (unlockedBugs.length > 0) {
                const randomBug = unlockedBugs[Math.floor(Math.random() * unlockedBugs.length)];
                SaveSystem.updatePreferences(this.currentProfile, { selectedBug: randomBug.id });
                callback(randomBug.id);
            }
        });
        
        bugGrid.appendChild(randomCard);
        
        // Add all regular bugs
        bugs.forEach(bug => {
            const isUnlocked = isBugUnlocked(bug.id, achievementManager);
            const bugCard = document.createElement('div');
            bugCard.className = `bug-card ${isUnlocked ? '' : 'locked'}`;
            
            if (bug.id === this.currentProfile.preferences.selectedBug) {
                bugCard.classList.add('selected');
            }
            
            bugCard.innerHTML = `
                <div class="bug-sprite ${isUnlocked ? '' : 'locked-sprite'}">${bug.svg}</div>
                <div class="bug-name">${bug.name}</div>
                ${!isUnlocked ? `<div class="unlock-requirement">🔒 ${bug.unlockRequirement}</div>` : ''}
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
            
            if (isUnlocked) {
                bugCard.addEventListener('click', () => {
                    SaveSystem.updatePreferences(this.currentProfile, { selectedBug: bug.id });
                    callback(bug.id);
                });
            }
            
            bugGrid.appendChild(bugCard);
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelBugSelectBtn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => {
                this.showScreen('mainMenu');
            });
        }
    }
    
    showArenaSelection(callback) {
        const arenaGrid = document.getElementById('arenaGrid');
        arenaGrid.innerHTML = '';
        
        const arenas = getArenaArray();
        const achievementManager = this.game ? this.game.achievements : null;
        
        // Create Random Arena card as first option
        const randomCard = document.createElement('div');
        randomCard.className = 'arena-card';
        
        const randomCanvas = document.createElement('canvas');
        randomCanvas.className = 'arena-preview';
        randomCanvas.width = 250;
        randomCanvas.height = 100;
        
        const ctx = randomCanvas.getContext('2d');
        // Draw a mystery/random preview
        const gradient = ctx.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6366f1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 250, 100);
        
        // Draw large question mark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 125, 50);
        
        randomCard.appendChild(randomCanvas);
        
        const randomName = document.createElement('div');
        randomName.className = 'arena-name';
        randomName.textContent = '🎲 Random Arena';
        randomCard.appendChild(randomName);
        
        randomCard.addEventListener('click', () => {
            const unlockedArenas = arenas.filter(arena => isArenaUnlocked(arena.id, achievementManager));
            if (unlockedArenas.length > 0) {
                const randomArena = unlockedArenas[Math.floor(Math.random() * unlockedArenas.length)];
                callback(randomArena.id);
            }
        });
        
        arenaGrid.appendChild(randomCard);
        
        // Add all regular arenas
        arenas.forEach(arena => {
            const isUnlocked = isArenaUnlocked(arena.id, achievementManager);
            const arenaCard = document.createElement('div');
            arenaCard.className = `arena-card ${isUnlocked ? '' : 'locked'}`;
            
            const previewCanvas = document.createElement('canvas');
            previewCanvas.className = `arena-preview ${isUnlocked ? '' : 'locked-preview'}`;
            previewCanvas.width = 250;
            previewCanvas.height = 100;
            
            const ctx = previewCanvas.getContext('2d');
            this.drawArenaPreview(ctx, arena, 250, 100);
            
            arenaCard.appendChild(previewCanvas);
            
            const arenaName = document.createElement('div');
            arenaName.className = 'arena-name';
            arenaName.textContent = arena.name;
            arenaCard.appendChild(arenaName);
            
            // Show unlock requirement for locked arenas
            if (!isUnlocked) {
                const unlockReq = document.createElement('div');
                unlockReq.className = 'arena-unlock-requirement';
                unlockReq.textContent = `🔒 ${arena.unlockRequirement}`;
                arenaCard.appendChild(unlockReq);
            }
            
            // Show preview modal on click (both locked and unlocked)
            arenaCard.addEventListener('click', () => {
                this.showArenaPreviewModal(arena, isUnlocked, callback);
            });
            
            arenaGrid.appendChild(arenaCard);
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelArenaSelectBtn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => {
                this.showScreen('mainMenu');
            });
        }
        
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
    
    showArenaPreviewModal(arena, isUnlocked, callback) {
        const modal = document.getElementById('arenaPreviewModal');
        const title = document.getElementById('arenaPreviewTitle');
        const canvas = document.getElementById('arenaPreviewCanvas');
        const description = document.getElementById('arenaPreviewDescription');
        const selectBtn = document.getElementById('selectArenaPreviewBtn');
        const cancelBtn = document.getElementById('cancelArenaPreviewBtn');
        const closeBtn = document.getElementById('closeArenaPreview');
        const matchLengthSection = document.getElementById('arenaMatchLengthSection');
        const scoreToWinSection = document.getElementById('arenaScoreToWinSection');
        
        // Set title and description
        title.textContent = arena.name;
        if (isUnlocked) {
            description.textContent = arena.description;
        } else {
            description.innerHTML = `
                <div style="color: #e74c3c; font-weight: bold;">🔒 Locked</div>
                <div style="margin-top: 10px;">${arena.unlockRequirement}</div>
            `;
        }
        
        // Draw detailed preview
        const ctx = canvas.getContext('2d');
        this.drawDetailedArenaPreview(ctx, arena, canvas.width, canvas.height);
        
        // Track selected options (defaults: 2 minutes, 5 goals)
        let selectedMatchLength = 120;
        let selectedScoreToWin = 5;
        
        // Show/hide sections based on game mode (hide for tower mode)
        const isTowerMode = window.game && window.game.gameMode === 'tower';
        if (matchLengthSection) {
            matchLengthSection.style.display = isTowerMode ? 'none' : 'block';
        }
        if (scoreToWinSection) {
            scoreToWinSection.style.display = isTowerMode ? 'none' : 'block';
        }
        
        // Handle match length slider
        const matchLengthSlider = document.getElementById('matchLengthSlider');
        const matchLengthValue = document.getElementById('matchLengthValue');
        
        if (matchLengthSlider && matchLengthValue) {
            // Set default value
            matchLengthSlider.value = 2;
            
            // Update display
            const updateMatchLengthDisplay = (value) => {
                const minutes = parseInt(value);
                selectedMatchLength = minutes * 60;
                matchLengthValue.textContent = `${minutes} Minute${minutes > 1 ? 's' : ''}`;
            };
            
            updateMatchLengthDisplay(matchLengthSlider.value);
            
            matchLengthSlider.addEventListener('input', (e) => {
                updateMatchLengthDisplay(e.target.value);
            });
        }
        
        // Handle score-to-win slider
        const scoreToWinSlider = document.getElementById('scoreToWinSlider');
        const scoreToWinValue = document.getElementById('scoreToWinValue');
        
        if (scoreToWinSlider && scoreToWinValue) {
            // Set default value
            scoreToWinSlider.value = 5;
            
            // Update display
            const updateScoreToWinDisplay = (value) => {
                const goals = parseInt(value);
                selectedScoreToWin = goals;
                scoreToWinValue.textContent = `${goals} Goal${goals > 1 ? 's' : ''}`;
            };
            
            updateScoreToWinDisplay(scoreToWinSlider.value);
            
            scoreToWinSlider.addEventListener('input', (e) => {
                updateScoreToWinDisplay(e.target.value);
            });
        }
        
        // Handle select button
        const newSelectBtn = selectBtn.cloneNode(true);
        selectBtn.parentNode.replaceChild(newSelectBtn, selectBtn);
        
        if (isUnlocked) {
            newSelectBtn.style.display = 'block';
            newSelectBtn.disabled = false;
            newSelectBtn.style.opacity = '1';
            
            newSelectBtn.addEventListener('click', () => {
                // Set match settings (defaults if not changed)
                if (window.game && !isTowerMode) {
                    window.game.matchTimeLimit = selectedMatchLength;
                    window.game.scoreToWin = selectedScoreToWin;
                }
                SaveSystem.updatePreferences(this.currentProfile, { selectedArena: arena.id });
                modal.style.display = 'none';
                callback(arena.id);
            });
        } else {
            newSelectBtn.style.display = 'none';
        }
        
        // Handle cancel button
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Handle close button
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close on outside click
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // Show modal
        modal.style.display = 'block';
    }
    
    drawDetailedArenaPreview(ctx, arena, width, height) {
        // Sky with gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
        skyGradient.addColorStop(0, arena.skyColors[0]);
        skyGradient.addColorStop(1, arena.skyColors[1]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Ground with gradient
        const groundGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
        const baseColor = arena.groundColor;
        groundGradient.addColorStop(0, baseColor);
        groundGradient.addColorStop(1, this.darkenColor(baseColor, 0.3));
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
        
        // Draw field markings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        
        // Center line
        ctx.beginPath();
        ctx.moveTo(width / 2, height * 0.6);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        
        // Center circle
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.8, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        // Goal areas
        const goalWidth = 80;
        const goalHeight = 60;
        
        // Left goal
        ctx.strokeRect(10, height * 0.7, goalWidth, goalHeight);
        
        // Right goal
        ctx.strokeRect(width - 10 - goalWidth, height * 0.7, goalWidth, goalHeight);
        
        // Add grass blades if applicable
        if (arena.grassBlades) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * width;
                const y = height * 0.6 + Math.random() * height * 0.4;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.random() * 4 - 2, y - 5);
                ctx.stroke();
            }
        }
        
        // Weather effects
        if (arena.weather === 'snowy') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 3 + 1;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (arena.weather === 'dusty') {
            ctx.fillStyle = 'rgba(139, 105, 20, 0.2)';
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 5 + 2;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    darkenColor(color, amount) {
        // Convert hex to RGB
        let r = parseInt(color.substr(1, 2), 16);
        let g = parseInt(color.substr(3, 2), 16);
        let b = parseInt(color.substr(5, 2), 16);
        
        // Darken
        r = Math.floor(r * (1 - amount));
        g = Math.floor(g * (1 - amount));
        b = Math.floor(b * (1 - amount));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
