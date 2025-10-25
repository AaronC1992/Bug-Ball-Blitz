// main.js - Main game controller and orchestration

import { UIManager } from './ui.js';
import { SaveSystem } from './saveSystem.js';
import { getBugById, getBugArray, getUnlockedBugs } from './bugs.js';
import { getArenaById, drawArenaBackground, getArenaArray, getUnlockedArenas } from './arenas.js';
import { Physics } from './physics.js';
import { AI, MultiAI } from './ai.js';
import { getCelebrationArray, getCelebrationById, checkCelebrationUnlock, drawCelebration } from './celebrations.js';
import { MenuBackground } from './menuBackground.js';
import { AudioManager } from './audioManager.js';
import { ParticleSystem } from './particles.js';
import { AchievementManager } from './achievementManager.js';
import { QualityManager } from './qualitySettings.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager(this);
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.achievements = new AchievementManager();
        this.quality = new QualityManager();
        
        // Menu backgrounds
        this.menuBackgroundCanvas = document.getElementById('menuBackgroundCanvas');
        this.menuBackgroundCtx = this.menuBackgroundCanvas.getContext('2d');
        this.menuBackground = null;
        
        this.mainMenuBackgroundCanvas = document.getElementById('mainMenuBackgroundCanvas');
        this.mainMenuBackgroundCtx = this.mainMenuBackgroundCanvas ? this.mainMenuBackgroundCanvas.getContext('2d') : null;
        this.mainMenuBackground = null;
        
        // Game state
        this.gameMode = null; // 'tower', 'quickplay', 'multiplayer'
        this.gameState = 'menu'; // 'menu', 'countdown', 'playing', 'paused', 'ended'
        this.difficulty = 'medium';
        this.towerLevel = 1;
        
        // Rotation handling
        this.isRotating = false;
        this.wasPlaying = false;
        
        // Match settings
        this.matchTimeLimit = 120; // 2 minutes
        this.matchTimeElapsed = 0; // Time elapsed in seconds
        this.lastFrameTime = null; // For delta time calculation
        this.countdownValue = 5; // Countdown before match starts
        this.countdownStartTime = 0;
        
        // Match intro animation
        this.introState = 'idle'; // 'idle', 'teams', 'countdown', 'go'
        this.introStartTime = 0;
        this.introTeamsDuration = 2000; // 2 seconds for team names
        this.introCountdownDuration = 3000; // 3 seconds for 3-2-1 countdown
        this.introGoDuration = 800; // 0.8 seconds for GO
        
        // Players
        this.player1 = null;
        this.player2 = null;
        this.player2AI = null;
        this.player2AI_2 = null; // For 2v1 mode
        this.player3 = null; // Second AI in 2v1
        
        // Game objects
        this.ball = null;
        this.physics = null;
        this.selectedBug1 = null;
        this.selectedBug2 = null;
        this.selectedBug3 = null;
        this.selectedArena = null;
        
        // Scores
        this.score1 = 0;
        this.score2 = 0;
        
        // Goal celebration
        this.celebrationActive = false;
        this.celebrationFrame = 0;
        this.celebrationDuration = 60; // 1 second at 60fps
        this.celebrationSide = null;
        this.celebrationType = 'classic';
        
        // Input
        this.keys = {};
        this.mobileControls = {
            joystickActive: false,
            joystickX: 0,
            joystickY: 0,
            jumpPressed: false
        };
        this.mobileControlsP2 = {
            joystickActive: false,
            joystickX: 0,
            joystickY: 0,
            jumpPressed: false
        };
        
        // Settings
        this.touchControlsEnabled = this.loadTouchControlsPreference();
        
        // Animation
        this.animationId = null;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupMobileControls();
        this.initializeSettings();
    }
    
    initializeSettings() {
        // Set initial toggle state
        const toggle = document.getElementById('touchControlsToggle');
        if (this.touchControlsEnabled !== null) {
            toggle.checked = this.touchControlsEnabled;
        } else {
            // Auto mode - show as checked if on mobile/tablet
            toggle.checked = this.ui.isMobile || this.ui.isTablet;
        }
    }
    
    initializeCanvas() {
        this.resizeCanvas();
        
        // Handle both resize and orientation change events
        const handleResize = () => {
            // Auto-pause game during rotation if playing
            if (this.gameState === 'playing' && !this.isRotating) {
                this.wasPlaying = true;
                this.isRotating = true;
                // Don't change gameState, just flag rotation
            }
            
            // Delay resize to allow browser to complete rotation
            setTimeout(() => {
                this.resizeCanvas();
                if (this.menuBackground && this.ui.currentScreen === 'titleScreen') {
                    this.resizeMenuBackgroundCanvas();
                    this.menuBackground.setupMatch();
                }
                if (this.mainMenuBackground && this.ui.currentScreen === 'mainMenu') {
                    this.resizeMainMenuBackgroundCanvas();
                    this.mainMenuBackground.setupMatch();
                }
                // Update touch controls visibility after rotation
                if (this.gameState === 'playing' || this.gameState === 'intro' || this.gameState === 'countdown' || this.gameState === 'paused') {
                    this.updateTouchControlsVisibility();
                }
                
                // Resume game after rotation completes
                setTimeout(() => {
                    if (this.isRotating && this.wasPlaying) {
                        this.isRotating = false;
                        this.wasPlaying = false;
                        // Game will auto-resume on next frame
                    }
                }, 300);
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        
        // Fullscreen change listeners - handle touch controls on mobile
        const handleFullscreenChange = () => {
            this.updateFullscreenButton();
            // Ensure touch controls remain visible after fullscreen transition
            if (this.gameState === 'playing' || this.gameState === 'intro' || this.gameState === 'countdown' || this.gameState === 'paused') {
                setTimeout(() => {
                    this.updateTouchControlsVisibility();
                    // Force canvas resize to fix mobile fullscreen issues
                    this.resizeCanvas();
                }, 100);
            }
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        
        // Detect when app loses/gains focus (rotation can trigger this)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState === 'playing') {
                // Don't auto-pause, let rotation handler manage it
            }
        });
        
        // Initialize menu background after a short delay to ensure DOM is rendered
        setTimeout(() => {
            this.initializeMenuBackground();
        }, 100);
    }
    
    initializeMenuBackground() {
        try {
            this.resizeMenuBackgroundCanvas();
            if (this.menuBackgroundCanvas && this.menuBackgroundCtx) {
                if (this.menuBackgroundCanvas.width > 0 && this.menuBackgroundCanvas.height > 0) {
                    if (!this.menuBackground) {
                        this.menuBackground = new MenuBackground(this.menuBackgroundCanvas, this.menuBackgroundCtx);
                    } else {
                        this.menuBackground.setupMatch();
                    }
                    this.menuBackground.start();
                } else {
                    console.error('Menu background canvas has zero dimensions:', this.menuBackgroundCanvas.width, 'x', this.menuBackgroundCanvas.height);
                }
            } else {
                console.error('Menu background canvas or context not found');
            }
        } catch (error) {
            console.error('Error initializing menu background:', error);
        }
    }
    
    initializeMainMenuBackground() {
        try {
            this.resizeMainMenuBackgroundCanvas();
            if (this.mainMenuBackgroundCanvas && this.mainMenuBackgroundCtx) {
                if (this.mainMenuBackgroundCanvas.width > 0 && this.mainMenuBackgroundCanvas.height > 0) {
                    if (!this.mainMenuBackground) {
                        this.mainMenuBackground = new MenuBackground(this.mainMenuBackgroundCanvas, this.mainMenuBackgroundCtx);
                    } else {
                        this.mainMenuBackground.setupMatch();
                    }
                    this.mainMenuBackground.start();
                } else {
                    console.error('Main menu background canvas has zero dimensions:', this.mainMenuBackgroundCanvas.width, 'x', this.mainMenuBackgroundCanvas.height);
                }
            } else {
                console.error('Main menu background canvas or context not found');
            }
        } catch (error) {
            console.error('Error initializing main menu background:', error);
        }
    }
    
    resizeMenuBackgroundCanvas() {
        const titleScreen = document.getElementById('titleScreen');
        if (titleScreen) {
            this.menuBackgroundCanvas.width = titleScreen.clientWidth;
            this.menuBackgroundCanvas.height = titleScreen.clientHeight;
        } else {
            console.error('Title screen element not found');
        }
    }
    
    resizeMainMenuBackgroundCanvas() {
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu && this.mainMenuBackgroundCanvas) {
            this.mainMenuBackgroundCanvas.width = mainMenu.clientWidth;
            this.mainMenuBackgroundCanvas.height = mainMenu.clientHeight;
        } else {
            console.error('Main menu element not found');
        }
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameScreen');
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // If game is active and canvas size changed significantly, scale positions
        if (this.physics && (oldWidth !== this.canvas.width || oldHeight !== this.canvas.height)) {
            const scaleX = this.canvas.width / oldWidth;
            const scaleY = this.canvas.height / oldHeight;
            
            // Update physics dimensions
            this.physics.width = this.canvas.width;
            this.physics.height = this.canvas.height;
            this.physics.groundY = this.canvas.height * 0.7;
            
            // Scale player and ball positions if game is active
            if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'intro' || this.gameState === 'countdown') {
                // Scale ball position
                if (this.ball && oldWidth > 0 && oldHeight > 0) {
                    this.ball.x *= scaleX;
                    this.ball.y *= scaleY;
                }
                
                // Scale player positions
                if (this.player1 && oldWidth > 0) {
                    this.player1.x *= scaleX;
                    this.player1.y = this.physics.groundY - this.player1.height / 2;
                }
                if (this.player2 && oldWidth > 0) {
                    this.player2.x *= scaleX;
                    this.player2.y = this.physics.groundY - this.player2.height / 2;
                }
                if (this.player3 && oldWidth > 0) {
                    this.player3.x *= scaleX;
                    this.player3.y = this.physics.groundY - this.player3.height / 2;
                }
            }
        } else if (this.physics) {
            // First time initialization
            this.physics.width = this.canvas.width;
            this.physics.height = this.canvas.height;
            this.physics.groundY = this.canvas.height * 0.7;
        }
    }
    
    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent arrow key scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Menu buttons
        document.getElementById('towerCampaignBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.startTowerCampaign();
        });
        
        document.getElementById('quickPlayBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.showDifficultySelection();
        });
        
        document.getElementById('localMultiplayerBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.startMultiplayer();
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.audio.playSound('ui_click');
                this.difficulty = btn.dataset.difficulty;
                this.startQuickPlay();
            });
        });
        
        document.getElementById('cancelDifficultyBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.ui.showScreen('mainMenu');
        });
        
        // Settings menu (only accessible from pause menu)
        document.getElementById('pauseSettingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
        
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Audio settings
        document.getElementById('soundVolumeSlider').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.audio.setSoundVolume(volume);
            document.getElementById('soundVolumeValue').textContent = e.target.value + '%';
        });
        
        document.getElementById('musicVolumeSlider').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.audio.setMusicVolume(volume);
            document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
        });
        
        document.getElementById('hapticToggle').addEventListener('change', (e) => {
            this.audio.setHapticEnabled(e.target.checked);
        });
        
        document.getElementById('touchControlsToggle').addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.setTouchControlsPreference(e.target.checked);
        });
        
        document.getElementById('qualitySelect').addEventListener('change', (e) => {
            const quality = e.target.value;
            this.quality.setQuality(quality);
            SaveSystem.updatePreferences(this.ui.currentProfile, { graphicsQuality: quality });
            this.audio.playSound('ui_click');
        });
        
        // Pause menu
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.resumeGame();
        });
        
        document.getElementById('restartMatchBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.restartMatch();
        });
        
        document.getElementById('quitToMenuBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.quitToMenu();
        });
        
        // Match end
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.handleMatchContinue();
        });
        
        document.getElementById('rematchBtn').addEventListener('click', () => {
            this.rematch();
        });
        
        document.getElementById('endToMenuBtn').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        // Tower victory
        document.getElementById('towerDoneBtn').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        // Styles menu
        document.getElementById('stylesBtn').addEventListener('click', () => {
            this.showStylesMenu();
        });
        
        document.getElementById('backToMainFromStylesBtn').addEventListener('click', () => {
            this.ui.showScreen('mainMenu');
        });
        
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            this.showAchievementsMenu();
        });
        
        document.getElementById('backToMainFromAchievementsBtn').addEventListener('click', () => {
            this.ui.showScreen('mainMenu');
        });
    }
    
    setupMobileControls() {
        // Always setup touch controls so users can enable them manually on touchscreen laptops
        
        // Player 1 Controls
        const joystick = document.getElementById('joystick');
        const stick = joystick.querySelector('.joystick-stick');
        const jumpBtn = document.getElementById('jumpBtn');
        
        // Joystick touch
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.joystickActive = true;
            this.updateJoystick(e.touches[0], joystick, stick, this.mobileControls);
        });
        
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.mobileControls.joystickActive) {
                this.updateJoystick(e.touches[0], joystick, stick, this.mobileControls);
            }
        });
        
        joystick.addEventListener('touchend', () => {
            this.mobileControls.joystickActive = false;
            this.mobileControls.joystickX = 0;
            this.mobileControls.joystickY = 0;
            stick.style.transform = 'translate(-50%, -50%)';
        });
        
        // Jump button
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.jumpPressed = true;
        });
        
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls.jumpPressed = false;
        });
        
        // Player 2 Controls (always setup for multiplayer on any touchscreen)
        const joystickP2 = document.getElementById('joystickP2');
        const stickP2 = joystickP2.querySelector('.joystick-stick');
        const jumpBtnP2 = document.getElementById('jumpBtnP2');
        
        // Joystick touch P2
        joystickP2.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControlsP2.joystickActive = true;
            this.updateJoystick(e.touches[0], joystickP2, stickP2, this.mobileControlsP2);
        });
        
        joystickP2.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.mobileControlsP2.joystickActive) {
                this.updateJoystick(e.touches[0], joystickP2, stickP2, this.mobileControlsP2);
            }
        });
        
        joystickP2.addEventListener('touchend', () => {
            this.mobileControlsP2.joystickActive = false;
            this.mobileControlsP2.joystickX = 0;
            this.mobileControlsP2.joystickY = 0;
            stickP2.style.transform = 'translate(-50%, -50%)';
        });
        
        // Jump button P2
        jumpBtnP2.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControlsP2.jumpPressed = true;
        });
        
        jumpBtnP2.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControlsP2.jumpPressed = false;
        });
    }
    
    updateJoystick(touch, joystick, stick, controlsObject) {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = rect.width / 2 - 25;
        
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxDistance;
            deltaY = Math.sin(angle) * maxDistance;
        }
        
        controlsObject.joystickX = deltaX / maxDistance;
        controlsObject.joystickY = deltaY / maxDistance;
        
        stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    }
    
    startTowerCampaign() {
        this.gameMode = 'tower';
        this.towerLevel = this.ui.currentProfile.tower.currentLevel;
        
        // Stop main menu background when entering game
        if (this.mainMenuBackground) {
            this.mainMenuBackground.stop();
        }
        
        this.ui.showBugSelection((bugId) => {
            this.selectedBug1 = getBugById(bugId);
            this.ui.showArenaSelection((arenaId) => {
                this.selectedArena = getArenaById(arenaId);
                this.initializeTowerMatch();
            });
        });
    }
    
    initializeTowerMatch() {
        // Determine AI difficulty and count based on tower level
        const levelConfig = this.getTowerLevelConfig(this.towerLevel);
        this.difficulty = levelConfig.difficulty;
        
        if (levelConfig.aiCount === 1) {
            this.selectedBug2 = this.getRandomBug();
            this.selectedBug3 = null;
        } else {
            this.selectedBug2 = this.getRandomBug();
            this.selectedBug3 = this.getRandomBug();
        }
        
        // Show loading screen for tower mode
        this.showLoadingScreen();
    }
    
    showLoadingScreen() {
        const levelConfig = this.getTowerLevelConfig(this.towerLevel);
        
        // Update level info
        document.getElementById('loadingLevelName').textContent = levelConfig.name;
        
        // Format difficulty with color indicators
        const difficultyColors = {
            'easy': '🟢 Easy',
            'medium': '🟡 Medium',
            'hard': '🟠 Hard',
            'pro': '🔴 Pro'
        };
        document.getElementById('loadingLevelDifficulty').textContent = 
            difficultyColors[levelConfig.difficulty] || levelConfig.difficulty.toUpperCase();
        
        // Generate tower visual
        this.generateTowerVisual();
        
        // Show loading screen
        this.ui.showScreen('loadingScreen');
        
        // Start match after 2.5 seconds
        setTimeout(() => {
            this.startMatch();
        }, 2500);
    }
    
    generateTowerVisual() {
        const towerContainer = document.getElementById('towerVisual');
        if (!towerContainer) {
            return;
        }
        
        towerContainer.innerHTML = '';
        
        const highestLevel = this.ui.currentProfile.tower.highestLevel || 0;
        const totalLevels = 20; // Show first 20 levels
        
        // Create levels from 1 to 20
        for (let i = 1; i <= totalLevels; i++) {
            const config = this.getTowerLevelConfig(i);
            const levelDiv = document.createElement('div');
            levelDiv.className = 'tower-level';
            
            // Determine level state
            if (i < this.towerLevel) {
                levelDiv.classList.add('completed');
            } else if (i === this.towerLevel) {
                levelDiv.classList.add('current');
            } else {
                levelDiv.classList.add('locked');
            }
            
            // Create level content
            const leftDiv = document.createElement('div');
            leftDiv.className = 'tower-level-left';
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'tower-level-number';
            numberSpan.textContent = `Level ${i}`;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'tower-level-name';
            nameSpan.textContent = config.name;
            
            leftDiv.appendChild(numberSpan);
            leftDiv.appendChild(nameSpan);
            
            const badgeSpan = document.createElement('span');
            badgeSpan.className = 'tower-level-badge';
            if (i < this.towerLevel) {
                badgeSpan.textContent = '✓';
            } else if (i === this.towerLevel) {
                badgeSpan.textContent = '►';
            } else {
                badgeSpan.textContent = '🔒';
            }
            
            levelDiv.appendChild(leftDiv);
            levelDiv.appendChild(badgeSpan);
            towerContainer.appendChild(levelDiv);
        }
        
        // Scroll to current level after a brief delay
        setTimeout(() => {
            const currentLevelEl = towerContainer.querySelector('.tower-level.current');
            if (currentLevelEl) {
                currentLevelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
    
    getTowerLevelConfig(level) {
        // Levels 1-4: Single AI - Learn the basics
        if (level === 1) return { difficulty: 'easy', aiCount: 1, name: 'Tutorial Match' };
        if (level === 2) return { difficulty: 'medium', aiCount: 1, name: 'Rookie Challenge' };
        if (level === 3) return { difficulty: 'hard', aiCount: 1, name: 'Advanced Opponent' };
        if (level === 4) return { difficulty: 'pro', aiCount: 1, name: 'Expert Showdown' };
        
        // Levels 5-8: Two AIs - Team coordination needed
        if (level === 5) return { difficulty: 'easy', aiCount: 2, name: 'Double Trouble Easy' };
        if (level === 6) return { difficulty: 'medium', aiCount: 2, name: 'Double Trouble Medium' };
        if (level === 7) return { difficulty: 'hard', aiCount: 2, name: 'Double Trouble Hard' };
        if (level === 8) return { difficulty: 'pro', aiCount: 2, name: 'Double Trouble Pro' };
        
        // Levels 9-12: Back to 1v1 but harder
        if (level === 9) return { difficulty: 'easy', aiCount: 1, name: 'Speed Trial Easy' };
        if (level === 10) return { difficulty: 'medium', aiCount: 1, name: 'Speed Trial Medium' };
        if (level === 11) return { difficulty: 'hard', aiCount: 1, name: 'Speed Trial Hard' };
        if (level === 12) return { difficulty: 'pro', aiCount: 1, name: 'Speed Trial Pro' };
        
        // Levels 13-16: 2v1 again with more challenge
        if (level === 13) return { difficulty: 'easy', aiCount: 2, name: 'Team Assault Easy' };
        if (level === 14) return { difficulty: 'medium', aiCount: 2, name: 'Team Assault Medium' };
        if (level === 15) return { difficulty: 'hard', aiCount: 2, name: 'Team Assault Hard' };
        if (level === 16) return { difficulty: 'pro', aiCount: 2, name: 'Team Assault Pro' };
        
        // Levels 17-20: Elite challenges
        if (level === 17) return { difficulty: 'hard', aiCount: 1, name: 'Elite Solo Hard' };
        if (level === 18) return { difficulty: 'pro', aiCount: 1, name: 'Elite Solo Pro' };
        if (level === 19) return { difficulty: 'hard', aiCount: 2, name: 'Elite Team Hard' };
        if (level === 20) return { difficulty: 'pro', aiCount: 2, name: 'Final Boss' };
        
        // Beyond level 20 - Ultimate challenges repeat
        const cycleLevel = ((level - 21) % 4) + 17;
        return this.getTowerLevelConfig(cycleLevel);
    }
    
    showDifficultySelection() {
        this.ui.showScreen('difficultyScreen');
    }
    
    startQuickPlay() {
        this.gameMode = 'quickplay';
        
        // Stop main menu background when entering game
        if (this.mainMenuBackground) {
            this.mainMenuBackground.stop();
        }
        
        this.ui.showBugSelection((bugId) => {
            this.selectedBug1 = getBugById(bugId);
            this.selectedBug2 = this.getRandomBug();
            this.ui.showArenaSelection((arenaId) => {
                this.selectedArena = getArenaById(arenaId);
                this.startMatch();
            });
        });
    }
    
    startMultiplayer() {
        this.gameMode = 'multiplayer';
        
        // Stop main menu background when entering game
        if (this.mainMenuBackground) {
            this.mainMenuBackground.stop();
        }
        
        this.ui.showBugSelection((bugId) => {
            this.selectedBug1 = getBugById(bugId);
            
            // Second bug selection
            this.ui.showBugSelection((bugId2) => {
                this.selectedBug2 = getBugById(bugId2);
                this.ui.showArenaSelection((arenaId) => {
                    this.selectedArena = getArenaById(arenaId);
                    this.startMatch();
                });
            });
        });
    }
    
    getRandomBug() {
        const bugs = ['stagBeetle', 'grasshopper', 'ladybug', 'ant', 'spider'];
        const randomId = bugs[Math.floor(Math.random() * bugs.length)];
        return getBugById(randomId);
    }
    
    startMatch() {
        this.ui.showScreen('gameScreen');
        
        this.resizeCanvas();
        this.physics = new Physics(this.canvas.width, this.canvas.height);
        
        // Initialize ball
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: 0,
            vy: 0,
            radius: 15,
            rotation: 0 // Track rotation angle for rolling effect
        };
        
        // Initialize player 1
        const p1Size = 40 * this.selectedBug1.stats.size;
        this.player1 = {
            x: this.canvas.width * 0.25,
            y: this.physics.groundY - p1Size / 2,
            vx: 0,
            vy: 0,
            width: p1Size,
            height: p1Size,
            isGrounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            facing: 1
        };
        
        // Initialize player 2
        const p2Size = 40 * this.selectedBug2.stats.size;
        this.player2 = {
            x: this.canvas.width * 0.75,
            y: this.physics.groundY - p2Size / 2,
            vx: 0,
            vy: 0,
            width: p2Size,
            height: p2Size,
            isGrounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            facing: -1
        };
        
        // Initialize AI or third player
        if (this.gameMode !== 'multiplayer') {
            // Player 2 AI is on the right side, defends right goal
            this.player2AI = new AI(this.difficulty, this.player2, this.ball, this.physics, 'right');
            
            // Check if 2v1 mode (tower levels 5-8)
            if (this.selectedBug3) {
                const p3Size = 40 * this.selectedBug3.stats.size;
                this.player3 = {
                    x: this.canvas.width * 0.65,
                    y: this.physics.groundY - p3Size / 2,
                    vx: 0,
                    vy: 0,
                    width: p3Size,
                    height: p3Size,
                    isGrounded: true,
                    moveLeft: false,
                    moveRight: false,
                    jump: false,
                    facing: -1
                };
                
                // Multi-AI for 2v1 mode - they're on the right side
                this.player2AI_2 = new MultiAI(this.difficulty, [this.player2, this.player3], this.ball, this.physics, 'defender', 'right');
            }
        }
        
        // Reset scores and timer for new match
        this.score1 = 0;
        this.score2 = 0;
        this.matchTimeElapsed = 0;
        this.lastFrameTime = null;
        this.maxGoalDeficit = 0; // Track for comeback achievement
        
        // Reset match-specific achievement stats for new match
        this.achievements.resetMatchStats();
        
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        
        // Start with intro animation
        this.gameState = 'intro';
        this.introState = 'teams';
        this.introStartTime = Date.now();
        this.countdownValue = 3;
        this.initialCountdownValue = 3;
        
        // Show touch controls based on user preference or auto-detection (after state is set)
        this.updateTouchControlsVisibility();
        
        this.gameLoop();
    }
    
    gameLoop() {
        // Skip updates during rotation but keep rendering
        if (this.isRotating) {
            if (this.gameState === 'playing') {
                this.render();
            }
            this.animationId = requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        if (this.gameState === 'intro') {
            this.updateIntro();
            this.renderIntro();
        } else if (this.gameState === 'countdown') {
            this.updateCountdown();
            this.renderCountdown();
        } else if (this.gameState === 'playing') {
            this.update();
            this.render();
        } else if (this.gameState === 'goal_scored') {
            // Just render the celebration, don't update game logic
            this.renderCountdown(); // Reuse countdown render which includes celebration
        } else {
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    updateIntro() {
        const elapsed = Date.now() - this.introStartTime;
        
        if (this.introState === 'teams') {
            if (elapsed >= this.introTeamsDuration) {
                // Move to countdown phase
                this.introState = 'countdown';
                this.introStartTime = Date.now();
                this.countdownStartTime = Date.now();
                this.audio.playSound('whistle');
            }
        } else if (this.introState === 'countdown') {
            // Update countdown (3, 2, 1)
            const countdownElapsed = (Date.now() - this.countdownStartTime) / 1000;
            this.countdownValue = Math.max(0, this.initialCountdownValue - countdownElapsed);
            
            if (this.countdownValue <= 0) {
                // Move to GO phase
                this.introState = 'go';
                this.introStartTime = Date.now();
                this.audio.playSound('whistle');
            }
        } else if (this.introState === 'go') {
            if (elapsed >= this.introGoDuration) {
                // Start the match
                this.gameState = 'playing';
                this.lastFrameTime = performance.now();
            }
        }
    }
    
    renderIntro() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw arena background
        drawArenaBackground(this.ctx, this.selectedArena, this.canvas.width, this.canvas.height, this.quality, this.gameMode, this.towerLevel);
        
        // Draw goals
        this.drawGoals();
        
        // Draw particles
        this.particles.render(this.ctx);
        
        // Draw ball
        this.drawBall();
        
        // Draw players
        this.drawPlayer(this.player1, this.selectedBug1);
        this.drawPlayer(this.player2, this.selectedBug2);
        
        if (this.player3) {
            this.drawPlayer(this.player3, this.selectedBug3);
        }
        
        const elapsed = Date.now() - this.introStartTime;
        
        if (this.introState === 'teams') {
            // Show team names with fade in/out
            const fadeInDuration = 400;
            const fadeOutStart = this.introTeamsDuration - 400;
            let opacity = 1;
            
            if (elapsed < fadeInDuration) {
                opacity = elapsed / fadeInDuration;
            } else if (elapsed > fadeOutStart) {
                opacity = 1 - ((elapsed - fadeOutStart) / 400);
            }
            
            this.ctx.save();
            
            // VS text in center
            this.ctx.font = 'bold 60px Arial';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
            this.ctx.lineWidth = 6;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const centerY = this.canvas.height / 2;
            this.ctx.strokeText('VS', this.canvas.width / 2, centerY);
            this.ctx.fillText('VS', this.canvas.width / 2, centerY);
            
            // Team 1 (left side)
            this.ctx.font = 'bold 36px Arial';
            this.ctx.fillStyle = `rgba(126, 211, 33, ${opacity})`;
            this.ctx.lineWidth = 4;
            this.ctx.textAlign = 'center';
            
            const team1Name = this.selectedBug1.name.toUpperCase();
            this.ctx.strokeText(team1Name, this.canvas.width / 4, centerY - 100);
            this.ctx.fillText(team1Name, this.canvas.width / 4, centerY - 100);
            
            // Team 2 (right side)
            this.ctx.fillStyle = `rgba(255, 69, 58, ${opacity})`;
            const team2Name = this.selectedBug2.name.toUpperCase();
            this.ctx.strokeText(team2Name, (this.canvas.width / 4) * 3, centerY - 100);
            this.ctx.fillText(team2Name, (this.canvas.width / 4) * 3, centerY - 100);
            
            this.ctx.restore();
        } else if (this.introState === 'countdown') {
            // Show countdown numbers (3, 2, 1)
            const countdownNum = Math.ceil(this.countdownValue);
            if (countdownNum > 0) {
                // Scale effect based on time
                const timeInSecond = (Date.now() - this.countdownStartTime) % 1000;
                const scale = 1 + (timeInSecond / 1000) * 0.3; // Grow slightly
                const opacity = 1 - (timeInSecond / 1000) * 0.3; // Fade slightly
                
                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.scale(scale, scale);
                
                this.ctx.font = 'bold 140px Arial';
                this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
                this.ctx.lineWidth = 10;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const text = countdownNum.toString();
                this.ctx.strokeText(text, 0, 0);
                this.ctx.fillText(text, 0, 0);
                
                this.ctx.restore();
            }
        } else if (this.introState === 'go') {
            // Show GO with emphasis
            const progress = elapsed / this.introGoDuration;
            const scale = 1 + (1 - progress) * 0.5; // Start big, shrink
            const opacity = 1 - progress; // Fade out
            
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.scale(scale, scale);
            
            this.ctx.font = 'bold 160px Arial';
            this.ctx.fillStyle = `rgba(126, 211, 33, ${opacity})`;
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
            this.ctx.lineWidth = 12;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            this.ctx.strokeText('GO!', 0, 0);
            this.ctx.fillText('GO!', 0, 0);
            
            this.ctx.restore();
        }
    }
    
    updateCountdown() {
        const elapsed = (Date.now() - this.countdownStartTime) / 1000;
        // Use stored initial value instead of checking current countdownValue
        const initialCountdown = this.initialCountdownValue || 5;
        this.countdownValue = Math.max(0, initialCountdown - elapsed);
        
        // Start/resume match when countdown finishes
        if (this.countdownValue <= 0) {
            this.gameState = 'playing';
            this.lastFrameTime = performance.now(); // Start timer
        }
    }
    
    renderCountdown() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw arena background
        drawArenaBackground(this.ctx, this.selectedArena, this.canvas.width, this.canvas.height, this.quality, this.gameMode, this.towerLevel);
        
        // Draw goals
        this.drawGoals();
        
        // Draw particles
        this.particles.render(this.ctx);
        
        // Draw ball
        this.drawBall();
        
        // Draw players
        this.drawPlayer(this.player1, this.selectedBug1);
        this.drawPlayer(this.player2, this.selectedBug2);
        
        if (this.player3) {
            this.drawPlayer(this.player3, this.selectedBug3);
        }
        
        // Draw celebration if active
        if (this.celebrationActive) {
            drawCelebration(this.ctx, this.celebrationType, this.celebrationSide, 
                this.canvas.width, this.canvas.height, this.celebrationFrame);
            this.celebrationFrame++;
            
            if (this.celebrationFrame >= this.celebrationDuration) {
                this.celebrationActive = false;
                this.celebrationFrame = 0;
            }
        }
        
        // Draw countdown number
        const countdownNum = Math.ceil(this.countdownValue);
        if (countdownNum > 0) {
            this.ctx.save();
            this.ctx.font = 'bold 120px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.lineWidth = 8;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const text = countdownNum.toString();
            this.ctx.strokeText(text, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
            
            // Top text - different based on context
            this.ctx.font = 'bold 40px Arial';
            this.ctx.lineWidth = 4;
            
            // Check if this is after a goal (3 sec countdown) or match start (5 sec)
            const isAfterGoal = this.score1 > 0 || this.score2 > 0;
            let topText = isAfterGoal ? 'GOAL!' : 'GET READY!';
            let topColor = isAfterGoal ? 'rgba(255, 215, 0, 0.9)' : 'rgba(126, 211, 33, 0.9)';
            
            this.ctx.fillStyle = topColor;
            this.ctx.strokeText(topText, this.canvas.width / 2, this.canvas.height / 2 - 100);
            this.ctx.fillText(topText, this.canvas.width / 2, this.canvas.height / 2 - 100);
            this.ctx.restore();
        }
        
        // Draw achievement notifications (on top of everything)
        this.achievements.drawNotification(this.ctx, this.canvas);
    }
    
    update() {
        // Update particles
        this.particles.update();
        
        // Update achievement notifications
        this.achievements.updateNotifications();
        
        // Create ball trail for fast-moving ball
        if (this.ball) {
            this.particles.createBallTrail(this.ball.x, this.ball.y, this.ball.vx, this.ball.vy);
        }
        
        // Update timer
        if (this.lastFrameTime !== null) {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
            this.lastFrameTime = currentTime;
            
            this.matchTimeElapsed += deltaTime;
            this.updateTimerDisplay();
            
            // Check if time is up
            if (this.matchTimeElapsed >= this.matchTimeLimit) {
                this.endMatch();
                return;
            }
        }
        
        // Update player 1 input
        this.updatePlayer1Input();
        
        // Update player 2 input
        if (this.gameMode === 'multiplayer') {
            this.updatePlayer2Input();
        } else {
            // AI control
            this.player2AI.update();
            
            if (this.selectedBug3 && this.player2AI_2) {
                this.player2AI_2.update(0); // Update player2
                this.player2AI_2.update(1); // Update player3
            }
        }
        
        // Update physics
        this.physics.updatePlayer(this.player1, this.selectedBug1);
        this.physics.updatePlayer(this.player2, this.selectedBug2);
        
        if (this.player3) {
            this.physics.updatePlayer(this.player3, this.selectedBug3);
        }
        
        this.physics.updateBall(this.ball);
        
        // Update ball rotation based on velocity (rolling effect)
        if (this.ball) {
            // Rotate based on horizontal velocity (positive = clockwise, negative = counter-clockwise)
            // Using vx because horizontal movement is most visible
            const rotationSpeed = this.ball.vx / (2 * Math.PI * this.ball.radius);
            this.ball.rotation += rotationSpeed;
        }
        
        // Check collisions and play kick sounds with haptic feedback
        const ballVelocity = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        
        if (this.physics.checkBallPlayerCollision(this.ball, this.player1, this.selectedBug1)) {
            const hapticStrength = Math.min(Math.floor(ballVelocity * 3), 50);
            this.audio.playSoundWithHaptic('kick', hapticStrength, ballVelocity);
            // Create kick dust particles
            const maxParticles = this.quality.getSetting('particleCount');
            this.particles.createKickDust(this.ball.x, this.ball.y, this.ball.vx, maxParticles);
            if (ballVelocity > 15) {
                this.particles.createImpactSparks(this.ball.x, this.ball.y, ballVelocity / 20, maxParticles);
            }
        }
        if (this.physics.checkBallPlayerCollision(this.ball, this.player2, this.selectedBug2)) {
            this.audio.playSound('kick', ballVelocity);
            // Create kick dust particles
            const maxParticles = this.quality.getSetting('particleCount');
            this.particles.createKickDust(this.ball.x, this.ball.y, this.ball.vx, maxParticles);
            if (ballVelocity > 15) {
                this.particles.createImpactSparks(this.ball.x, this.ball.y, ballVelocity / 20, maxParticles);
            }
        }
        
        if (this.player3) {
            if (this.physics.checkBallPlayerCollision(this.ball, this.player3, this.selectedBug3)) {
                this.audio.playSound('kick', ballVelocity);
                // Create kick dust particles
                const maxParticles = this.quality.getSetting('particleCount');
                this.particles.createKickDust(this.ball.x, this.ball.y, this.ball.vx, maxParticles);
                if (ballVelocity > 15) {
                    this.particles.createImpactSparks(this.ball.x, this.ball.y, ballVelocity / 20, maxParticles);
                }
            }
        }
        
        // CRITICAL FIX: After all collisions, ensure ball is never stuck underground
        // This handles the case where ball is caught between two overlapping players
        const minBallY = this.physics.groundY - this.ball.radius;
        if (this.ball.y > minBallY) {
            this.ball.y = minBallY;
            // Push ball upward forcefully when stuck
            if (this.ball.vy > -2) {
                this.ball.vy = -8; // Strong upward push to free the ball
            }
        }
        
        // Check for near misses (ball close to goal but not in)
        const now = Date.now();
        if (now - this.lastNearMissTime > 2000) { // Only every 2 seconds
            const goalWidth = this.canvas.width * 0.15;
            const goalTop = this.canvas.height * 0.3;
            const goalBottom = this.canvas.height * 0.7;
            const nearMissDistance = 80; // pixels
            
            // Check left goal area
            if (this.ball.x < goalWidth + nearMissDistance && 
                this.ball.x > goalWidth &&
                this.ball.y > goalTop - nearMissDistance && 
                this.ball.y < goalBottom + nearMissDistance &&
                Math.abs(this.ball.vx) > 5) {
                this.lastNearMissTime = now;
            }
            // Check right goal area
            else if (this.ball.x > this.canvas.width - goalWidth - nearMissDistance && 
                     this.ball.x < this.canvas.width - goalWidth &&
                     this.ball.y > goalTop - nearMissDistance && 
                     this.ball.y < goalBottom + nearMissDistance &&
                     Math.abs(this.ball.vx) > 5) {
                this.lastNearMissTime = now;
            }
        }
        
        // Check goals
        const goal = this.physics.checkGoal(this.ball);
        if (goal) {
            this.handleGoal(goal);
        }
    }
    
    updatePlayer1Input() {
        // Check if touch controls are enabled (either auto-detected or manually enabled)
        const useTouchControls = this.touchControlsEnabled !== null 
            ? this.touchControlsEnabled 
            : this.ui.isMobile;
            
        if (useTouchControls) {
            // Mobile/Touch controls
            this.player1.moveLeft = this.mobileControls.joystickX < -0.3;
            this.player1.moveRight = this.mobileControls.joystickX > 0.3;
            this.player1.jump = this.mobileControls.jumpPressed;
        } else {
            // Keyboard controls (WASD)
            this.player1.moveLeft = this.keys['a'];
            this.player1.moveRight = this.keys['d'];
            this.player1.jump = this.keys['w'] || this.keys[' '];
        }
    }
    
    updatePlayer2Input() {
        // Check if touch controls are enabled for player 2
        const useTouchControls = this.touchControlsEnabled !== null 
            ? (this.touchControlsEnabled && this.gameMode === 'multiplayer')
            : (this.ui.isTablet && this.gameMode === 'multiplayer');
            
        if (useTouchControls) {
            // Touch controls for player 2
            this.player2.moveLeft = this.mobileControlsP2.joystickX < -0.3;
            this.player2.moveRight = this.mobileControlsP2.joystickX > 0.3;
            this.player2.jump = this.mobileControlsP2.jumpPressed;
        } else {
            // Arrow keys for player 2
            this.player2.moveLeft = this.keys['arrowleft'];
            this.player2.moveRight = this.keys['arrowright'];
            this.player2.jump = this.keys['arrowup'];
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw arena background
        drawArenaBackground(this.ctx, this.selectedArena, this.canvas.width, this.canvas.height, this.quality, this.gameMode, this.towerLevel);
        
        // Draw goals
        this.drawGoals();
        
        // Draw particles (behind players and ball)
        this.particles.render(this.ctx);
        
        // Draw ball
        this.drawBall();
        
        // Draw players
        this.drawPlayer(this.player1, this.selectedBug1);
        this.drawPlayer(this.player2, this.selectedBug2);
        
        if (this.player3) {
            this.drawPlayer(this.player3, this.selectedBug3);
        }
    }
    
    drawGoals() {
        const goalWidth = 100;
        const goalHeight = 120;
        const groundY = this.physics.groundY;
        
        // Left goal
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(0, groundY - goalHeight);
        this.ctx.lineTo(goalWidth, groundY - goalHeight);
        this.ctx.stroke();
        
        // Right goal
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width, groundY);
        this.ctx.lineTo(this.canvas.width, groundY - goalHeight);
        this.ctx.lineTo(this.canvas.width - goalWidth, groundY - goalHeight);
        this.ctx.stroke();
        
        // Goal nets
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < goalHeight; i += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, groundY - i);
            this.ctx.lineTo(goalWidth, groundY - i);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width, groundY - i);
            this.ctx.lineTo(this.canvas.width - goalWidth, groundY - i);
            this.ctx.stroke();
        }
    }
    
    drawBall() {
        this.ctx.save();
        
        // Translate to ball position
        this.ctx.translate(this.ball.x, this.ball.y);
        
        // Rotate based on ball rotation
        this.ctx.rotate(this.ball.rotation);
        
        // Draw soccer ball at origin (since we translated)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Black pentagons
        this.ctx.fillStyle = 'black';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5);
            const x = Math.cos(angle) * this.ball.radius * 0.6;
            const y = Math.sin(angle) * this.ball.radius * 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.ball.radius * 0.25, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Dynamic shadow that scales with ball height
        const groundY = this.physics.groundY;
        const ballHeight = groundY - this.ball.y;
        const maxHeight = 200; // Maximum expected ball height
        
        // Scale shadow based on height (smaller and lighter when higher)
        const heightRatio = Math.min(ballHeight / maxHeight, 1);
        const shadowScale = 1 - (heightRatio * 0.6); // Shadow shrinks up to 60% when at max height
        const shadowOpacity = 0.4 * (1 - heightRatio * 0.7); // Shadow fades when ball is high
        
        this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.ball.x, 
            groundY + 5, 
            this.ball.radius * 0.8 * shadowScale, 
            this.ball.radius * 0.3 * shadowScale, 
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawPlayer(player, bug) {
        // Draw dynamic shadow first (before the player)
        const groundY = this.physics.groundY;
        const playerGroundY = groundY - player.height / 2;
        const playerHeight = playerGroundY - player.y;
        const maxJumpHeight = 150;
        
        // Calculate shadow scale based on jump height
        const jumpRatio = Math.min(playerHeight / maxJumpHeight, 1);
        const shadowScale = 1 - (jumpRatio * 0.5); // Shadow shrinks up to 50% at max jump
        const shadowOpacity = 0.3 * (1 - jumpRatio * 0.6); // Shadow fades when jumping
        
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        this.ctx.beginPath();
        this.ctx.ellipse(
            player.x, 
            groundY + 5, 
            player.width * 0.5 * shadowScale, 
            player.height * 0.2 * shadowScale, 
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.restore();
        
        // Draw player
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        
        // Flip if facing left
        if (player.facing === -1) {
            this.ctx.scale(-1, 1);
        }
        
        // Draw bug SVG (simplified rendering - in reality we'd parse SVG)
        // For now, draw a colored circle with the bug color
        this.ctx.fillStyle = bug.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(-player.width * 0.15, -player.height * 0.1, player.width * 0.15, 0, Math.PI * 2);
        this.ctx.arc(player.width * 0.15, -player.height * 0.1, player.width * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(-player.width * 0.15, -player.height * 0.1, player.width * 0.08, 0, Math.PI * 2);
        this.ctx.arc(player.width * 0.15, -player.height * 0.1, player.width * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    handleGoal(goal) {
        // Prevent multiple goal detections
        if (this.gameState !== 'playing') {
            return;
        }
        
        // Play goal sound with strong haptic feedback
        this.audio.playSoundWithHaptic('goal', [100, 50, 100]);
        
        // Immediately change state to prevent multiple detections
        this.gameState = 'goal_scored';
        
        // Determine who scored and trigger their celebration
        const profile = this.ui.currentProfile;
        let scoringPlayer;
        
        if (goal === 'left') {
            // Ball went in left goal, so player 2 (right side) scored
            this.score2++;
            scoringPlayer = 'player2';
        } else {
            // Ball went in right goal, so player 1 (left side) scored
            this.score1++;
            scoringPlayer = 'player1';
            
            // Track goal achievement (only for player 1)
            this.achievements.updateStat('totalGoals', 1);
            this.achievements.updateStat('goalsInMatch', 1);
            
            // Check for quick goal (within first 10 seconds)
            if (this.matchTimeElapsed <= 10) {
                this.achievements.updateStat('quickGoals', 1);
            }
        }
        
        // Crowd reaction based on who scored
        if (scoringPlayer === 'player1') {
            // Player 1 scored
            this.celebrationActive = true;
            this.celebrationFrame = 0;
            this.celebrationSide = goal;
            this.celebrationType = (profile && profile.selectedCelebration) ? profile.selectedCelebration : 'classic';
            // Play celebration sound
            this.audio.playSound('celebration');
        } else {
            // Player 2/AI scored
            this.celebrationActive = false;
        }
        
        // Track goal deficit for comeback achievement
        const deficit = this.score2 - this.score1;
        if (deficit > this.maxGoalDeficit) {
            this.maxGoalDeficit = deficit;
        }
        
        this.updateScoreDisplay();
        
        // Reset positions after a short delay
        setTimeout(() => {
            this.physics.resetBall(this.ball);
            this.physics.resetPlayer(this.player1, 'left');
            this.physics.resetPlayer(this.player2, 'right');
            
            if (this.player3) {
                this.physics.resetPlayer(this.player3, 'right');
            }
        }, 1000);
        
        // Check if match should end
        if (this.score1 >= 5 || this.score2 >= 5) {
            setTimeout(() => {
                this.endMatch();
            }, 1000);
        } else {
            // Pause timer and start countdown after goal
            setTimeout(() => {
                this.lastFrameTime = null; // Pause timer
                this.gameState = 'countdown';
                this.countdownValue = 3;
                this.initialCountdownValue = 3;
                this.countdownStartTime = Date.now();
            }, 1000);
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('player1Score').textContent = this.score1;
        document.getElementById('player2Score').textContent = this.score2;
    }
    
    updateTimerDisplay() {
        const timeRemaining = Math.max(0, this.matchTimeLimit - this.matchTimeElapsed);
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);
        document.getElementById('timerDisplay').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    endMatch() {
        this.gameState = 'ended';
        cancelAnimationFrame(this.animationId);
        
        const playerWon = this.score1 > this.score2;
        const isDraw = this.score1 === this.score2;
        
        // Track match achievements
        this.achievements.updateStat('totalMatches', 1);
        
        if (playerWon) {
            // Track wins
            this.achievements.updateStat('totalWins', 1);
            
            // Track perfect game (win without conceding)
            if (this.score2 === 0) {
                this.achievements.updateStat('perfectGames', 1);
            }
            
            // Track comeback (win after being 2+ goals down)
            if (this.maxGoalDeficit >= 2) {
                this.achievements.updateStat('comebacks', 1);
            }
            
            // Track blowout (win by 5+ goals)
            const goalDifference = this.score1 - this.score2;
            if (goalDifference >= 5) {
                this.achievements.updateStat('blowouts', 1);
            }
        }
        
        // Track arena visited
        if (this.selectedArena) {
            this.achievements.updateStat('visitedArenas', this.selectedArena.id);
        }
        
        // Reset match-specific stats
        this.achievements.resetMatchStats();
        
        // Check bug collection achievement
        this.achievements.checkBugCollection({
            getUnlockedBugs,
            getBugArray
        });
        
        // Check arena collection achievement
        this.achievements.checkArenaCollection({
            getUnlockedArenas,
            getArenaArray
        });
        
        // Update profile stats
        const matchResult = {
            playerGoals: this.score1,
            opponentGoals: this.score2
        };
        SaveSystem.updateStats(this.ui.currentProfile, matchResult);
        
        // Update tower progress
        if (this.gameMode === 'tower' && playerWon) {
            SaveSystem.updateTowerProgress(this.ui.currentProfile, this.towerLevel);
            
            // Check if tower is complete
            if (this.towerLevel >= 8) {
                SaveSystem.completeTower(this.ui.currentProfile);
                this.showTowerVictory();
                return;
            }
        }
        
        // Show match end screen
        this.showMatchEnd(playerWon, isDraw);
    }
    
    showMatchEnd(playerWon, isDraw) {
        const titleEl = document.getElementById('matchResultTitle');
        const statsEl = document.getElementById('matchStats');
        
        if (isDraw) {
            titleEl.textContent = 'Draw!';
            titleEl.style.color = '#ffa500';
        } else if (playerWon) {
            // Show level completion if in tower mode
            if (this.gameMode === 'tower') {
                const config = this.getTowerLevelConfig(this.towerLevel);
                titleEl.textContent = `🏆 Level ${this.towerLevel} Complete! 🏆`;
                titleEl.style.fontSize = '32px';
            } else {
                titleEl.textContent = 'Victory!';
            }
            titleEl.style.color = '#7ed321';
        } else {
            titleEl.textContent = 'Defeat';
            titleEl.style.color = '#ff4444';
        }
        
        statsEl.innerHTML = `
            <div class="stat-row">
                <span>Final Score:</span>
                <span style="color: #7ed321; font-size: 24px;">${this.score1} - ${this.score2}</span>
            </div>
        `;
        
        // Show continue button if tower mode, won, and not at final level (20)
        const continueBtn = document.getElementById('continueBtn');
        if (this.gameMode === 'tower' && playerWon && this.towerLevel < 20) {
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }
        
        this.ui.showOverlay('matchEndScreen');
    }
    
    showTowerVictory() {
        const statsEl = document.getElementById('towerVictoryStats');
        statsEl.innerHTML = `
            <p style="font-size: 20px; margin-bottom: 20px; color: #FFD700;">
                🎉 Congratulations! You've completed all 20 Tower Levels! 🎉
            </p>
            <div class="stat-row">
                <span>Total Wins:</span>
                <span style="color: #7ed321;">${this.ui.currentProfile.stats.wins}</span>
            </div>
            <div class="stat-row">
                <span>Total Goals:</span>
                <span style="color: #7ed321;">${this.ui.currentProfile.stats.goalsScored}</span>
            </div>
            <div class="stat-row">
                <span>Tower Mastery:</span>
                <span style="color: #FFD700;">CHAMPION 👑</span>
            </div>
        `;
        
        this.ui.showOverlay('towerVictoryScreen');
    }
    
    handleMatchContinue() {
        // Update tower progress
        const profile = SaveSystem.loadProfile(this.ui.currentProfile.name);
        profile.tower.currentLevel = this.towerLevel + 1;
        profile.tower.highestLevel = Math.max(profile.tower.highestLevel || 0, this.towerLevel);
        SaveSystem.saveProfile(profile);
        this.ui.currentProfile = profile;
        
        this.ui.hideOverlay('matchEndScreen');
        this.towerLevel++;
        this.initializeTowerMatch();
    }
    
    rematch() {
        // Stop any running animation frames
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.ui.hideOverlay('matchEndScreen');
        this.startMatch();
    }
    
    openSettings() {
        // Hide pause menu while showing settings
        this.ui.hideOverlay('pauseMenu');
        
        // Load and display current audio settings
        const soundVolume = Math.round(this.audio.soundVolume * 100);
        const musicVolume = Math.round(this.audio.musicVolume * 100);
        
        document.getElementById('soundVolumeSlider').value = soundVolume;
        document.getElementById('soundVolumeValue').textContent = soundVolume + '%';
        
        document.getElementById('musicVolumeSlider').value = musicVolume;
        document.getElementById('musicVolumeValue').textContent = musicVolume + '%';
        
        document.getElementById('hapticToggle').checked = this.audio.hapticEnabled;
        
        // Load quality setting
        const prefs = SaveSystem.getPreferences(this.ui.currentProfile);
        const quality = prefs.graphicsQuality || 'medium';
        this.quality.setQuality(quality);
        document.getElementById('qualitySelect').value = quality;
        
        // Update toggle to reflect current preference
        // If null (auto mode), check if auto-detected device would show controls
        const shouldBeChecked = this.touchControlsEnabled !== null 
            ? this.touchControlsEnabled 
            : (this.ui.isMobile || this.ui.isTablet);
        document.getElementById('touchControlsToggle').checked = shouldBeChecked;
        
        this.ui.showOverlay('settingsMenu');
    }
    
    closeSettings() {
        // Blur any focused element (like the toggle switch) to prevent accidental re-clicks
        if (document.activeElement) {
            document.activeElement.blur();
        }
        
        this.ui.hideOverlay('settingsMenu');
        
        // Update controls visibility based on preference
        this.updateTouchControlsVisibility();
        
        // Return to pause menu (game stays paused)
        this.ui.showOverlay('pauseMenu');
    }
    
    loadTouchControlsPreference() {
        const saved = localStorage.getItem('touchControlsEnabled');
        // Default to auto-detect (null = auto)
        if (saved === null) {
            return null; // Auto mode
        }
        return saved === 'true';
    }
    
    setTouchControlsPreference(enabled) {
        this.touchControlsEnabled = enabled;
        localStorage.setItem('touchControlsEnabled', enabled.toString());
        this.updateTouchControlsVisibility();
    }
    
    updateTouchControlsVisibility() {
        // Allow updating during gameplay states (playing, intro, countdown, or paused)
        if (this.gameState !== 'playing' && this.gameState !== 'intro' && 
            this.gameState !== 'countdown' && this.gameState !== 'paused') {
            return;
        }
        
        const mobileControls = document.getElementById('mobileControls');
        const mobileControlsP2 = document.getElementById('mobileControlsP2');
        
        if (!mobileControls || !mobileControlsP2) {
            return; // Elements not found, exit gracefully
        }
        
        // If user has explicitly enabled/disabled, use that preference
        // Otherwise, use auto-detection (isMobile/isTablet)
        const shouldShow = this.touchControlsEnabled !== null 
            ? this.touchControlsEnabled 
            : (this.ui.isMobile || this.ui.isTablet);
        
        if (shouldShow) {
            mobileControls.classList.add('active');
            if (this.gameMode === 'multiplayer' && (this.ui.isTablet || this.touchControlsEnabled)) {
                mobileControlsP2.classList.add('active');
            } else {
                mobileControlsP2.classList.remove('active');
            }
        } else {
            mobileControls.classList.remove('active');
            mobileControlsP2.classList.remove('active');
        }
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.lastFrameTime = null; // Pause timer
            cancelAnimationFrame(this.animationId);
            
            // Update pause menu with current score and time
            document.getElementById('pauseScore1').textContent = this.score1;
            document.getElementById('pauseScore2').textContent = this.score2;
            
            const minutes = Math.floor(this.matchTimeElapsed / 60);
            const seconds = Math.floor(this.matchTimeElapsed % 60);
            document.getElementById('pauseTimeDisplay').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            this.ui.showOverlay('pauseMenu');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastFrameTime = performance.now(); // Resume timer
            this.ui.hideOverlay('pauseMenu');
            this.gameLoop();
        }
    }
    
    restartMatch() {
        // Reset match state
        this.score1 = 0;
        this.score2 = 0;
        this.matchTimeElapsed = 0;
        this.lastFrameTime = null;
        
        // Hide pause menu
        this.ui.hideOverlay('pauseMenu');
        
        // Restart the match with intro
        this.startMatch();
    }
    
    quitToMenu() {
        this.gameState = 'menu';
        cancelAnimationFrame(this.animationId);
        
        this.ui.hideOverlay('pauseMenu');
        this.ui.hideOverlay('matchEndScreen');
        this.ui.hideOverlay('towerVictoryScreen');
        
        if (this.ui.isMobile) {
            document.getElementById('mobileControls').classList.remove('active');
            document.getElementById('mobileControlsP2').classList.remove('active');
        }
        
        this.ui.showMainMenu();
        
        // Restart main menu background when returning
        if (this.mainMenuBackgroundCanvas) {
            this.resizeMainMenuBackgroundCanvas();
            if (!this.mainMenuBackground) {
                this.initializeMainMenuBackground();
            }
            this.mainMenuBackground.setupMatch();
            this.mainMenuBackground.start();
        }
    }
    
    toggleFullscreen() {
        const elem = document.documentElement;
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        try {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && 
                !document.mozFullScreenElement && !document.msFullscreenElement) {
                // Enter fullscreen
                let fullscreenPromise;
                
                if (elem.requestFullscreen) {
                    fullscreenPromise = elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) { // Safari & Mobile Safari
                    fullscreenPromise = elem.webkitRequestFullscreen();
                } else if (elem.mozRequestFullScreen) { // Firefox
                    fullscreenPromise = elem.mozRequestFullScreen();
                } else if (elem.msRequestFullscreen) { // IE/Edge
                    fullscreenPromise = elem.msRequestFullscreen();
                }
                
                // Handle promise if returned (modern browsers)
                if (fullscreenPromise && fullscreenPromise.then) {
                    fullscreenPromise.catch(err => {
                        console.warn('Fullscreen request failed:', err);
                        // Restore button state on error
                        fullscreenBtn.textContent = '⛶';
                        fullscreenBtn.title = 'Enter Fullscreen';
                    });
                }
                
                fullscreenBtn.textContent = '⛶'; // Exit fullscreen icon
                fullscreenBtn.title = 'Exit Fullscreen';
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                fullscreenBtn.textContent = '⛶'; // Fullscreen icon
                fullscreenBtn.title = 'Enter Fullscreen';
            }
            
            // Play sound
            this.audio.playSound('ui_click');
        } catch (err) {
            console.error('Fullscreen error:', err);
            // Ensure button is in correct state
            this.updateFullscreenButton();
        }
    }
    
    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (!fullscreenBtn) return;
        
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || 
                           document.mozFullScreenElement || document.msFullscreenElement;
        
        // Update button icon based on state
        fullscreenBtn.textContent = isFullscreen ? '⛶' : '⛶';
        fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }
    
    showStylesMenu() {
        const profile = this.ui.currentProfile;
        if (!profile) {
            console.error('No profile loaded');
            return;
        }
        
        const grid = document.getElementById('celebrationGrid');
        grid.innerHTML = '';
        
        const celebrations = getCelebrationArray();
        
        celebrations.forEach(celebration => {
            const isUnlocked = checkCelebrationUnlock(celebration, profile);
            const isSelected = profile.selectedCelebration === celebration.id;
            
            const card = document.createElement('div');
            card.className = `celebration-card ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''}`;
            
            card.innerHTML = `
                <div class="celebration-icon">${celebration.icon}</div>
                <h3>${celebration.name}</h3>
                <p class="celebration-description">${celebration.description}</p>
                <p class="unlock-condition">${isUnlocked ? '✓ Unlocked' : '🔒 ' + celebration.unlockCondition}</p>
            `;
            
            if (isUnlocked) {
                card.addEventListener('click', () => {
                    // Update selected celebration
                    profile.selectedCelebration = celebration.id;
                    SaveSystem.saveProfile(profile);
                    this.ui.currentProfile = profile; // Update the UI's reference
                    
                    // Update UI
                    document.querySelectorAll('.celebration-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                });
            }
            
            grid.appendChild(card);
        });
        
        this.ui.showScreen('stylesScreen');
    }
    
    showAchievementsMenu() {
        const grid = document.getElementById('achievementGrid');
        const countEl = document.getElementById('achievementCount');
        const percentageEl = document.getElementById('achievementPercentage');
        const progressBarEl = document.getElementById('achievementProgressBar');
        
        grid.innerHTML = '';
        
        // Update progress display
        const percentage = this.achievements.getUnlockPercentage();
        const total = Object.keys(this.achievements.achievements).length;
        const unlocked = Object.values(this.achievements.achievements).filter(a => a.unlocked).length;
        
        countEl.textContent = `${unlocked}/${total}`;
        percentageEl.textContent = `${percentage}%`;
        progressBarEl.style.width = `${percentage}%`;
        
        // Display all achievements
        let currentFilter = 'all';
        const displayAchievements = (filter) => {
            grid.innerHTML = '';
            const achievements = filter === 'all' 
                ? Object.values(this.achievements.achievements)
                : this.achievements.getAchievementsByCategory(filter);
            
            achievements.forEach(achievement => {
                const card = document.createElement('div');
                card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
                
                // Calculate progress
                const progress = this.achievements.getProgress(achievement.id);
                const current = this.achievements.stats[achievement.stat] || 0;
                const required = achievement.requirement;
                
                card.innerHTML = `
                    <div class="achievement-header">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-description">${achievement.description}</div>
                        </div>
                    </div>
                    ${!achievement.unlocked ? `<div class="achievement-progress-text">${current} / ${required}</div>` : ''}
                `;
                
                grid.appendChild(card);
            });
        };
        
        // Setup filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                displayAchievements(category);
            });
        });
        
        // Display all achievements initially
        displayAchievements('all');
        
        this.ui.showScreen('achievementsScreen');
    }
    
    handleDeviceModeChange(isMobile, isTablet) {
        // If not in a match, nothing to do
        if (this.gameState !== 'playing') return;
        
        // Update controls visibility based on new device mode
        // Only update if user hasn't set a manual preference
        if (this.touchControlsEnabled === null) {
            this.updateTouchControlsVisibility();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Clean up old global achievement data (migration from older version)
    if (localStorage.getItem('achievementProgress')) {
        localStorage.removeItem('achievementProgress');
    }
    
    const game = new Game();
    // Make game accessible globally for mode change detection
    window.game = game;
    
    // Auto-enter fullscreen on mobile devices after a short delay
    // This helps with mobile display issues
    setTimeout(() => {
        if (window.innerWidth <= 768) { // Mobile/tablet check
            game.toggleFullscreen();
        }
    }, 500);
});
