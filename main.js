// main.js - Main game controller and orchestration

import { UIManager } from './ui.js';
import { SaveSystem } from './saveSystem.js';
import { getBugById, getBugArray, getUnlockedBugs } from './bugs.js';
import { getArenaById, drawArenaBackground, getArenaArray, getUnlockedArenas } from './arenas.js';
import { Physics } from './physics.js';
import { AI, MultiAI } from './ai.js';
import { getCelebrationArray, getCelebrationById, checkCelebrationUnlock, drawCelebration } from './celebrations.js';
import { getBugAnimationArray, getBugAnimationById, checkBugAnimationUnlock, drawBugAnimation } from './bugAnimations.js';
import { getCosmeticArray, getCosmeticById, getCosmeticsByCategory, checkCosmeticUnlock, drawCosmetic, calculateHitboxModifiers, loadCosmeticImages, getCosmeticImage } from './cosmetics.js';
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
        this.weatherParticles = []; // Weather effect particles
        this.currentWeather = 'none'; // Current weather type
        this.weatherDirection = 1; // 1 for right, -1 for left
        this.weatherDirectionTimer = 0; // Timer for direction changes
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
        this.pausedFromState = null; // Track which state we paused from
        this.difficulty = 'medium';
        this.towerLevel = 1;
        
        // Boss gauntlet state
        this.bossGauntletActive = false;
        this.bossGauntletBugs = []; // Array of bugs to face
        this.bossGauntletCurrentIndex = 0; // Current bug index
        this.bossGauntletWins = 0; // Wins against bosses
        
        // Rotation handling
        this.isRotating = false;
        this.wasPlaying = false;
        
        // Match settings
        this.matchTimeLimit = 120; // 2 minutes
        this.scoreToWin = 5; // Goals needed to win
        this.matchTimeElapsed = 0; // Time elapsed in seconds
        this.lastFrameTime = null; // For delta time calculation
        this.countdownValue = 5; // Countdown before match starts
        this.countdownStartTime = 0;
        
        // Match intro animation
        this.introState = 'idle'; // 'idle', 'preview', 'teams', 'countdown', 'go'
        this.introStartTime = 0;
        this.introPreviewDuration = 3000; // 3 seconds for arena preview pan
        this.introTeamsDuration = 2000; // 2 seconds for team names
        this.frameCount = 0; // Frame counter for animations
        this.introCountdownDuration = 3000; // 3 seconds for 3-2-1 countdown
        this.introGoDuration = 800; // 0.8 seconds for GO
        this.arenaPanOffset = 0; // Arena camera pan offset for preview
        
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
        this.bugAnimationType = 'none';
        this.lastDemoCelebration = null; // Track last demo celebration to randomize
        
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
        
        // Controls Editor
        this.controlsEditorActive = false;
        this.editorLayoutMode = 'singleplayer'; // 'singleplayer' or 'multiplayer'
        this.customLayoutSingleplayer = this.loadCustomLayout('singleplayer');
        this.customLayoutMultiplayer = this.loadCustomLayout('multiplayer');
        this.editableElements = [];
        this.draggingElement = null;
        this.resizingElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.editorPreviewBackground = null;
        
        // Animation
        this.animationId = null;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupMobileControls();
        this.initializeSettings();
        this.applyCustomLayout(); // Apply saved custom layout
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
            
            // Keyboard shortcuts
            // ESC - Pause/Resume game
            if (e.key === 'Escape') {
                if (this.gameState === 'playing' || this.gameState === 'intro' || this.gameState === 'countdown') {
                    e.preventDefault();
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    e.preventDefault();
                    this.resumeGame();
                }
            }
            
            // R - Restart match (only when in-game)
            if (e.key.toLowerCase() === 'r') {
                if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'intro' || this.gameState === 'countdown') {
                    e.preventDefault();
                    if (confirm('Restart match? Current progress will be lost.')) {
                        if (this.gameState === 'paused') {
                            this.resumeGame(); // Exit pause menu first
                        }
                        this.restartMatch();
                    }
                }
            }
            
            // M - Toggle mute (anywhere)
            if (e.key.toLowerCase() === 'm') {
                e.preventDefault();
                this.audio.toggleMute();
            }
            
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
            this.showTowerLevelSelect();
        });
        
        // Tower level select buttons
        document.getElementById('continueTowerBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.startTowerCampaign();
        });
        
        document.getElementById('cancelTowerSelectBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.ui.showScreen('mainMenu');
        });
        
        document.getElementById('quickPlayBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.showDifficultySelection();
        });
        
        document.getElementById('localMultiplayerBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.startMultiplayer();
        });
        
        // Arcade mode
        document.getElementById('arcadeModeBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.showArcadeMode();
        });
        
        document.getElementById('arcadeSinglePlayerBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.arcadeIsMultiplayer = false;
            this.showArcadeTeamSetup();
        });
        
        document.getElementById('arcadeMultiplayerBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.arcadeIsMultiplayer = true;
            this.showArcadeTeamSetup();
        });
        
        document.getElementById('backFromArcadeCountBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.ui.showScreen('mainMenu');
        });
        
        document.getElementById('arcadeTeamNextBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            
            // Validate teams have players
            const leftHasHuman = document.getElementById('leftHumanPlayerCheckbox')?.checked ?? true;
            const rightHasHuman = document.getElementById('rightHumanPlayerCheckbox')?.checked ?? false;
            const leftAICount = parseInt(document.getElementById('leftAICountSlider')?.value ?? 0);
            const rightAICount = parseInt(document.getElementById('rightAICountSlider')?.value ?? 0);
            
            console.log('Arcade validation:', { leftHasHuman, rightHasHuman, leftAICount, rightAICount });
            
            // Check if teams have at least 1 player
            const leftTeamSize = (leftHasHuman ? 1 : 0) + leftAICount;
            const rightTeamSize = (rightHasHuman ? 1 : 0) + rightAICount;
            
            if (leftTeamSize === 0) {
                alert('Left team needs at least 1 player! Add a human or AI player.');
                return;
            }
            
            if (rightTeamSize === 0) {
                alert('Right team needs at least 1 player! Add a human or AI player.');
                return;
            }
            
            this.saveArcadeTeamSettings();
            this.showArcadeSettings();
        });
        
        document.getElementById('backFromArcadeTeamBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.ui.showScreen('arcadePlayerCountScreen');
        });
        
        document.getElementById('startArcadeBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.saveArcadeGameSettings();
            this.startArcadeMatch();
        });
        
        document.getElementById('backFromArcadeSettingsBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.ui.showScreen('arcadeTeamSetupScreen');
        });
        
        // Initialize arcade sliders and their value displays
        this.initializeArcadeSliders();
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.audio.playSound('ui_click');
                // Only handle difficulty selection here (match length moved to arena preview)
                if (btn.dataset.difficulty) {
                    this.difficulty = btn.dataset.difficulty;
                    this.startQuickPlay();
                }
            });
        });
        
        document.getElementById('cancelDifficultyBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.ui.showScreen('mainMenu');
        });
        
        // Settings menu (only accessible from pause menu)
        const pauseSettingsBtn = document.getElementById('pauseSettingsBtn');
        let settingsBtnHandled = false;
        
        pauseSettingsBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            settingsBtnHandled = true;
            this.openSettings();
            setTimeout(() => { settingsBtnHandled = false; }, 300);
        }, { passive: false });
        
        pauseSettingsBtn.addEventListener('click', (e) => {
            if (settingsBtnHandled) return;
            this.openSettings();
        });
        
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        let closeSettingsBtnHandled = false;
        
        closeSettingsBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            closeSettingsBtnHandled = true;
            this.closeSettings();
            setTimeout(() => { closeSettingsBtnHandled = false; }, 300);
        }, { passive: false });
        
        closeSettingsBtn.addEventListener('click', (e) => {
            if (closeSettingsBtnHandled) return;
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
        
        document.getElementById('editControlsBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.openControlsEditor();
        });
        
        document.getElementById('qualitySelect').addEventListener('change', (e) => {
            const quality = e.target.value;
            this.quality.setQuality(quality);
            SaveSystem.updatePreferences(this.ui.currentProfile, { graphicsQuality: quality });
            this.audio.playSound('ui_click');
        });
        
        // Pause menu
        const pauseBtn = document.getElementById('pauseBtn');
        let pauseBtnHandled = false;
        
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pauseBtnHandled = true;
            this.pauseGame();
            setTimeout(() => { pauseBtnHandled = false; }, 300);
        }, { passive: false });
        
        pauseBtn.addEventListener('click', () => {
            if (pauseBtnHandled) return;
            this.pauseGame();
        });
        
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        let fullscreenBtnHandled = false;
        
        fullscreenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            fullscreenBtnHandled = true;
            this.toggleFullscreen();
            setTimeout(() => { fullscreenBtnHandled = false; }, 300);
        }, { passive: false });
        
        fullscreenBtn.addEventListener('click', () => {
            if (fullscreenBtnHandled) return;
            this.toggleFullscreen();
        });
        
        const resumeBtn = document.getElementById('resumeBtn');
        let resumeBtnHandled = false;
        
        resumeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            resumeBtnHandled = true;
            this.audio.playSound('ui_click');
            this.resumeGame();
            setTimeout(() => { resumeBtnHandled = false; }, 300);
        }, { passive: false });
        
        resumeBtn.addEventListener('click', () => {
            if (resumeBtnHandled) return;
            this.audio.playSound('ui_click');
            this.resumeGame();
        });
        
        const restartMatchBtn = document.getElementById('restartMatchBtn');
        let restartMatchBtnHandled = false;
        
        restartMatchBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            restartMatchBtnHandled = true;
            this.audio.playSound('ui_click');
            this.restartMatch();
            setTimeout(() => { restartMatchBtnHandled = false; }, 300);
        }, { passive: false });
        
        restartMatchBtn.addEventListener('click', () => {
            if (restartMatchBtnHandled) return;
            this.audio.playSound('ui_click');
            this.restartMatch();
        });
        
        const quitToMenuBtn = document.getElementById('quitToMenuBtn');
        let quitToMenuBtnHandled = false;
        
        quitToMenuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            quitToMenuBtnHandled = true;
            this.audio.playSound('ui_click');
            this.quitToMenu();
            setTimeout(() => { quitToMenuBtnHandled = false; }, 300);
        }, { passive: false });
        
        quitToMenuBtn.addEventListener('click', () => {
            if (quitToMenuBtnHandled) return;
            this.audio.playSound('ui_click');
            this.quitToMenu();
        });
        
        // Match end
        const continueBtn = document.getElementById('continueBtn');
        let continueBtnHandled = false;
        
        continueBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            continueBtnHandled = true;
            this.handleMatchContinue();
            setTimeout(() => { continueBtnHandled = false; }, 300);
        }, { passive: false });
        
        continueBtn.addEventListener('click', () => {
            if (continueBtnHandled) return;
            this.handleMatchContinue();
        });
        
        const rematchBtn = document.getElementById('rematchBtn');
        let rematchBtnHandled = false;
        
        rematchBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rematchBtnHandled = true;
            this.rematch();
            setTimeout(() => { rematchBtnHandled = false; }, 300);
        }, { passive: false });
        
        rematchBtn.addEventListener('click', () => {
            if (rematchBtnHandled) return;
            this.rematch();
        });
        
        const endToMenuBtn = document.getElementById('endToMenuBtn');
        let endToMenuBtnHandled = false;
        
        endToMenuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            endToMenuBtnHandled = true;
            this.quitToMenu();
            setTimeout(() => { endToMenuBtnHandled = false; }, 300);
        }, { passive: false });
        
        endToMenuBtn.addEventListener('click', () => {
            if (endToMenuBtnHandled) return;
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
        
        document.getElementById('backToMainFromStylesTopBtn').addEventListener('click', () => {
            this.ui.showScreen('mainMenu');
        });
        
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            this.showAchievementsMenu();
        });
        
        document.getElementById('backToMainFromAchievementsBtn').addEventListener('click', () => {
            this.ui.showScreen('mainMenu');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.openSettingsFromMainMenu();
        });
        
        document.getElementById('saveProgressBtn').addEventListener('click', () => {
            // Progress is auto-saved, but provide visual feedback
            SaveSystem.saveProfile(this.ui.currentProfile);
            alert('✅ Progress saved successfully!');
        });
    }
    
    setupMobileControls() {
        // Always setup touch controls so users can enable them manually on touchscreen laptops
        
        // Player 1 Controls
        const joystick = document.getElementById('joystick');
        const stick = joystick.querySelector('.joystick-stick');
        const jumpBtn = document.getElementById('jumpBtn');
        
        // Joystick touch - use targetTouches instead of touches
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.mobileControls.joystickActive = true;
            this.updateJoystick(e.targetTouches[0], joystick, stick, this.mobileControls);
        });
        
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.mobileControls.joystickActive && e.targetTouches.length > 0) {
                this.updateJoystick(e.targetTouches[0], joystick, stick, this.mobileControls);
            }
        });
        
        joystick.addEventListener('touchend', (e) => {
            e.stopPropagation();
            this.mobileControls.joystickActive = false;
            this.mobileControls.joystickX = 0;
            this.mobileControls.joystickY = 0;
            stick.style.transform = 'translate(-50%, -50%)';
        });
        
        joystick.addEventListener('touchcancel', (e) => {
            e.stopPropagation();
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
        
        // Joystick touch P2 - use targetTouches instead of touches
        joystickP2.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.mobileControlsP2.joystickActive = true;
            this.updateJoystick(e.targetTouches[0], joystickP2, stickP2, this.mobileControlsP2);
        });
        
        joystickP2.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.mobileControlsP2.joystickActive && e.targetTouches.length > 0) {
                this.updateJoystick(e.targetTouches[0], joystickP2, stickP2, this.mobileControlsP2);
            }
        });
        
        joystickP2.addEventListener('touchend', (e) => {
            e.stopPropagation();
            this.mobileControlsP2.joystickActive = false;
            this.mobileControlsP2.joystickX = 0;
            this.mobileControlsP2.joystickY = 0;
            stickP2.style.transform = 'translate(-50%, -50%)';
        });
        
        joystickP2.addEventListener('touchcancel', (e) => {
            e.stopPropagation();
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
    
    showTowerLevelSelect() {
        this.ui.showScreen('towerLevelSelectScreen');
        this.populateTowerLevelGrid();
    }
    
    populateTowerLevelGrid() {
        const grid = document.getElementById('towerLevelGrid');
        grid.innerHTML = '';
        
        const maxLevel = this.ui.currentProfile.tower.highestLevel || 1;
        const currentLevel = this.ui.currentProfile.tower.currentLevel;
        
        // Create 20 level cards
        for (let level = 1; level <= 20; level++) {
            const config = this.getTowerLevelConfig(level);
            const isUnlocked = level <= maxLevel;
            const isCurrent = level === currentLevel;
            
            const card = document.createElement('div');
            card.className = `tower-level-card ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`;
            
            // Level number
            const levelNum = document.createElement('div');
            levelNum.className = 'level-number';
            levelNum.textContent = level;
            
            // Level name
            const levelName = document.createElement('div');
            levelName.className = 'level-name-small';
            levelName.textContent = config.name;
            
            // Type badge (1v1 or 1v2)
            const typeBadge = document.createElement('div');
            typeBadge.className = 'level-type-badge';
            typeBadge.textContent = config.aiCount === 1 ? '⚔️' : '⚔️⚔️';
            typeBadge.title = config.aiCount === 1 ? '1v1 Match' : '1v2 Match';
            
            // Difficulty badge
            const diffBadge = document.createElement('div');
            diffBadge.className = `level-difficulty-badge difficulty-${config.difficulty}`;
            diffBadge.textContent = config.difficulty.toUpperCase();
            
            card.appendChild(levelNum);
            card.appendChild(levelName);
            card.appendChild(typeBadge);
            card.appendChild(diffBadge);
            
            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.audio.playSound('ui_click');
                    this.towerLevel = level;
                    this.startTowerCampaign();
                });
            } else {
                const lockIcon = document.createElement('div');
                lockIcon.textContent = '🔒';
                lockIcon.style.fontSize = '24px';
                lockIcon.style.marginTop = '10px';
                card.appendChild(lockIcon);
            }
            
            grid.appendChild(card);
        }
    }
    
    startTowerCampaign() {
        this.gameMode = 'tower';
        // towerLevel is now set by either continuing or selecting a specific level
        if (!this.towerLevel) {
            this.towerLevel = this.ui.currentProfile.tower.currentLevel;
        }
        
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
        
        // If this is a boss battle, set up gauntlet mode
        if (levelConfig.isBoss) {
            this.bossGauntletActive = true;
            this.bossGauntletBugs = getBugArray(); // Get all bugs
            this.bossGauntletCurrentIndex = 0;
            this.bossGauntletWins = 0;
            
            // Set up first boss
            const baseBug = this.bossGauntletBugs[0];
            this.selectedBug2 = {
                id: baseBug.id,
                name: baseBug.name,
                color: baseBug.color,
                svg: baseBug.svg,
                stats: {
                    speed: Math.min(baseBug.stats.speed * 1.3, 1.0),
                    jump: Math.min(baseBug.stats.jump * 1.3, 1.0),
                    size: baseBug.stats.size,
                    power: Math.min(baseBug.stats.power * 1.3, 1.0)
                }
            };
            this.selectedBug3 = null;
        } else if (levelConfig.aiCount === 1) {
            this.bossGauntletActive = false;
            const baseBug = this.getRandomBug();
            this.selectedBug2 = baseBug;
            this.selectedBug3 = null;
        } else {
            this.bossGauntletActive = false;
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
        
        // Show weather info if in arcade mode or tower mode with weather
        const weatherEl = document.getElementById('loadingWeather');
        const weather = this.gameMode === 'arcade' ? this.arcadeSettings?.weather : levelConfig.weather;
        
        if (weather && weather !== 'none') {
            const weatherIcons = {
                'rain': '🌧️ Rain',
                'snow': '❄️ Snow',
                'wind': '💨 Wind'
            };
            weatherEl.textContent = `Weather: ${weatherIcons[weather] || weather}`;
            weatherEl.style.display = 'block';
        } else {
            weatherEl.style.display = 'none';
        }
        
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
        // Helper function to get random weather (70% chance of 'none', 10% each for rain/snow/wind)
        const getRandomWeather = () => {
            const rand = Math.random();
            if (rand < 0.7) return 'none';      // 70% chance
            if (rand < 0.8) return 'rain';      // 10% chance
            if (rand < 0.9) return 'snow';      // 10% chance
            return 'wind';                       // 10% chance
        };
        
        // Levels 1-4: Single AI - Learn the basics
        if (level === 1) return { difficulty: 'easy', aiCount: 1, name: 'Tutorial Match', weather: getRandomWeather() };
        if (level === 2) return { difficulty: 'medium', aiCount: 1, name: 'Rookie Challenge', weather: getRandomWeather() };
        if (level === 3) return { difficulty: 'hard', aiCount: 1, name: 'Advanced Opponent', weather: getRandomWeather() };
        if (level === 4) return { difficulty: 'pro', aiCount: 1, name: 'Expert Showdown', weather: getRandomWeather() };
        
        // Levels 5-8: Two AIs - Team coordination needed
        if (level === 5) return { difficulty: 'easy', aiCount: 2, name: 'Double Trouble Easy', weather: getRandomWeather() };
        if (level === 6) return { difficulty: 'medium', aiCount: 2, name: 'Double Trouble Medium', weather: getRandomWeather() };
        if (level === 7) return { difficulty: 'hard', aiCount: 2, name: 'Double Trouble Hard', weather: getRandomWeather() };
        if (level === 8) return { difficulty: 'pro', aiCount: 2, name: 'Double Trouble Pro', weather: getRandomWeather() };
        
        // Levels 9-12: Back to 1v1 but harder
        if (level === 9) return { difficulty: 'easy', aiCount: 1, name: 'Speed Trial Easy', weather: getRandomWeather() };
        if (level === 10) return { difficulty: 'medium', aiCount: 1, name: 'Speed Trial Medium', weather: getRandomWeather() };
        if (level === 11) return { difficulty: 'hard', aiCount: 1, name: 'Speed Trial Hard', weather: getRandomWeather() };
        if (level === 12) return { difficulty: 'pro', aiCount: 1, name: 'Speed Trial Pro', weather: getRandomWeather() };
        
        // Levels 13-16: 2v1 again with more challenge
        if (level === 13) return { difficulty: 'easy', aiCount: 2, name: 'Team Assault Easy', weather: getRandomWeather() };
        if (level === 14) return { difficulty: 'medium', aiCount: 2, name: 'Team Assault Medium', weather: getRandomWeather() };
        if (level === 15) return { difficulty: 'hard', aiCount: 2, name: 'Team Assault Hard', weather: getRandomWeather() };
        if (level === 16) return { difficulty: 'pro', aiCount: 2, name: 'Team Assault Pro', weather: getRandomWeather() };
        
        // Levels 17-20: Elite challenges
        if (level === 17) return { difficulty: 'hard', aiCount: 1, name: 'Elite Solo Hard', weather: getRandomWeather() };
        if (level === 18) return { difficulty: 'pro', aiCount: 1, name: 'Elite Solo Pro', weather: getRandomWeather() };
        if (level === 19) return { difficulty: 'hard', aiCount: 2, name: 'Elite Team Hard', weather: getRandomWeather() };
        if (level === 20) return { difficulty: 'pro', aiCount: 1, name: '👑 BOSS GAUNTLET', weather: getRandomWeather(), isBoss: true, bossSize: 1.75 };
        
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
    
    showArcadeMode() {
        this.ui.showScreen('arcadePlayerCountScreen');
    }
    
    showArcadeTeamSetup() {
        // Reset arcade settings
        this.arcadeSettings = {
            leftAICount: 0,
            leftAIDifficulty: 'medium',
            leftAIPersonality: 'balanced',
            rightHasHuman: false,  // New: track if right team has human player
            rightAICount: 1,
            rightAIDifficulty: 'medium',
            rightAIPersonality: 'balanced',
            // Game modifiers (will be set in next screen)
            playerGravity: 1.0,
            ballGravity: 1.0,
            playerSize: 1.0,
            ballSize: 1.0,
            matchTime: 3,
            scoreToWin: 5,
            ballSpeed: 1.0,
            jumpPower: 1.0
        };
        
        this.ui.showScreen('arcadeTeamSetupScreen');
        
        // Reset slider values and checkboxes
        const leftAICountSlider = document.getElementById('leftAICountSlider');
        const rightAICountSlider = document.getElementById('rightAICountSlider');
        const leftHumanCheckbox = document.getElementById('leftHumanPlayerCheckbox');
        const rightHumanCheckbox = document.getElementById('rightHumanPlayerCheckbox');
        
        if (leftAICountSlider) leftAICountSlider.value = 0;
        if (rightAICountSlider) rightAICountSlider.value = 1;
        if (leftHumanCheckbox) leftHumanCheckbox.checked = true; // Left team starts with human player
        if (rightHumanCheckbox) rightHumanCheckbox.checked = false;
        
        this.updateArcadeTeamUI();
    }
    
    updateArcadeTeamUI() {
        // Update UI based on multiplayer mode
        const leftAICountSlider = document.getElementById('leftAICountSlider');
        const rightAICountSlider = document.getElementById('rightAICountSlider');
        const leftHumanCheckbox = document.getElementById('leftHumanPlayerCheckbox');
        const rightHumanCheckbox = document.getElementById('rightHumanPlayerCheckbox');
        
        if (!leftAICountSlider || !rightAICountSlider) {
            console.warn('Arcade sliders not found');
            return;
        }
        
        // Set constraints based on checkbox states
        const leftHasHuman = leftHumanCheckbox ? leftHumanCheckbox.checked : true;
        const rightHasHuman = rightHumanCheckbox ? rightHumanCheckbox.checked : false;
        
        // Left team AI slider constraints
        if (leftHasHuman) {
            // With human: can have 0-1 AI teammate
            leftAICountSlider.min = 0;
            leftAICountSlider.max = 1;
        } else {
            // Without human (spectator mode): must have 1-2 AI
            leftAICountSlider.min = 1;
            leftAICountSlider.max = 2;
            leftAICountSlider.value = Math.max(1, parseInt(leftAICountSlider.value));
        }
        
        // Right team AI slider constraints
        if (rightHasHuman) {
            // With human: can have 0-1 AI teammate
            rightAICountSlider.min = 0;
            rightAICountSlider.max = 1;
        } else {
            // Without human: must have 1-2 AI
            rightAICountSlider.min = 1;
            rightAICountSlider.max = 2;
            rightAICountSlider.value = Math.max(1, parseInt(rightAICountSlider.value));
        }
        
        // Trigger updates to show/hide AI settings and update displays
        if (leftAICountSlider) leftAICountSlider.dispatchEvent(new Event('input'));
        if (rightAICountSlider) rightAICountSlider.dispatchEvent(new Event('input'));
    }
    
    initializeArcadeSliders() {
        // Team setup sliders - simplified (no team count slider)
        const sliders = {
            leftAICount: { slider: 'leftAICountSlider', value: 'leftAICountValue', format: v => v },
            rightAICount: { slider: 'rightAICountSlider', value: 'rightAICountValue', format: v => v },
            // Game settings sliders
            playerGravity: { slider: 'playerGravitySlider', value: 'playerGravityValue', format: v => v + 'x' },
            ballGravity: { slider: 'ballGravitySlider', value: 'ballGravityValue', format: v => v + 'x' },
            playerSize: { slider: 'playerSizeSlider', value: 'playerSizeValue', format: v => v + 'x' },
            ballSize: { slider: 'ballSizeSlider', value: 'ballSizeValue', format: v => v + 'x' },
            arcadeTime: { slider: 'arcadeTimeSlider', value: 'arcadeTimeValue', format: v => v + ' min' },
            arcadeScore: { slider: 'arcadeScoreSlider', value: 'arcadeScoreValue', format: v => v + ' goals' },
            ballSpeed: { slider: 'ballSpeedSlider', value: 'ballSpeedValue', format: v => v + 'x' },
            jumpPower: { slider: 'jumpPowerSlider', value: 'jumpPowerValue', format: v => v + 'x' },
            ballCount: { slider: 'ballCountSlider', value: 'ballCountValue', format: v => v }
        };
        
        for (const [key, config] of Object.entries(sliders)) {
            const sliderEl = document.getElementById(config.slider);
            const valueEl = document.getElementById(config.value);
            
            if (sliderEl && valueEl) {
                sliderEl.addEventListener('input', () => {
                    const val = parseFloat(sliderEl.value);
                    valueEl.textContent = config.format(val);
                    
                    // Update team composition display when AI count changes
                    if (key === 'leftAICount') {
                        const container1 = document.getElementById('leftAIDifficultyContainer');
                        const container2 = document.getElementById('leftAIPersonalityContainer');
                        if (container1 && container2) {
                            const display = val > 0 ? 'block' : 'none';
                            container1.style.display = display;
                            container2.style.display = display;
                        }
                        this.updateTeamComposition('left');
                    } else if (key === 'rightAICount') {
                        const container1 = document.getElementById('rightAIDifficultyContainer');
                        const container2 = document.getElementById('rightAIPersonalityContainer');
                        if (container1 && container2) {
                            const display = val > 0 ? 'block' : 'none';
                            container1.style.display = display;
                            container2.style.display = display;
                        }
                        this.updateTeamComposition('right');
                    }
                });
                
                // Trigger initial update
                sliderEl.dispatchEvent(new Event('input'));
            }
        }
        
        // Add checkbox event listeners
        const leftHumanCheckbox = document.getElementById('leftHumanPlayerCheckbox');
        const rightHumanCheckbox = document.getElementById('rightHumanPlayerCheckbox');
        
        if (leftHumanCheckbox) {
            leftHumanCheckbox.addEventListener('change', () => {
                this.updateArcadeTeamUI();
                this.updateTeamComposition('left');
            });
        }
        
        if (rightHumanCheckbox) {
            rightHumanCheckbox.addEventListener('change', () => {
                this.updateArcadeTeamUI();
                this.updateTeamComposition('right');
            });
        }
    }
    
    updateTeamComposition(team) {
        const aiCountSlider = document.getElementById(`${team}AICountSlider`);
        const compositionEl = document.getElementById(`${team}TeamComposition`);
        const humanCheckbox = document.getElementById(`${team}HumanPlayerCheckbox`);
        
        if (aiCountSlider && compositionEl) {
            const aiCount = parseInt(aiCountSlider.value);
            const hasHuman = humanCheckbox ? humanCheckbox.checked : true;
            
            let teamSize, humanCount;
            
            // Calculate team composition based on checkbox
            if (hasHuman) {
                // Team has human player + AI teammates
                humanCount = 1;
                teamSize = 1 + aiCount;
            } else {
                // All AI team (spectator mode)
                humanCount = 0;
                teamSize = aiCount;
            }
            
            // Build composition text
            const parts = [];
            if (humanCount > 0) {
                parts.push(`${humanCount} Human${humanCount > 1 ? 's' : ''}`);
            }
            if (aiCount > 0) {
                parts.push(`${aiCount} AI`);
            }
            
            compositionEl.textContent = parts.join(', ') || 'No players';
            compositionEl.style.color = '#95a5a6';
        }
    }
    
    saveArcadeTeamSettings() {
        // Get AI counts and checkbox states
        const leftAICount = parseInt(document.getElementById('leftAICountSlider').value);
        const rightAICount = parseInt(document.getElementById('rightAICountSlider').value);
        const leftHasHuman = document.getElementById('leftHumanPlayerCheckbox').checked;
        const rightHasHuman = document.getElementById('rightHumanPlayerCheckbox').checked;
        
        // Calculate team counts based on checkbox states
        // Left team
        if (leftHasHuman) {
            this.arcadeSettings.leftTeamCount = 1 + leftAICount; // 1 human + AI
            this.arcadeSettings.leftHasHuman = true;
        } else {
            this.arcadeSettings.leftTeamCount = leftAICount; // All AI (spectator)
            this.arcadeSettings.leftHasHuman = false;
        }
        this.arcadeSettings.leftAICount = leftAICount;
        this.arcadeSettings.leftAIDifficulty = document.getElementById('leftAIDifficulty').value;
        this.arcadeSettings.leftAIPersonality = document.getElementById('leftAIPersonality').value;
        
        // Right team
        if (rightHasHuman) {
            this.arcadeSettings.rightTeamCount = 1 + rightAICount; // 1 human + AI
            this.arcadeSettings.rightHasHuman = true;
        } else {
            this.arcadeSettings.rightTeamCount = rightAICount; // All AI
            this.arcadeSettings.rightHasHuman = false;
        }
        this.arcadeSettings.rightAICount = rightAICount;
        this.arcadeSettings.rightAIDifficulty = document.getElementById('rightAIDifficulty').value;
        this.arcadeSettings.rightAIPersonality = document.getElementById('rightAIPersonality').value;
    }
    
    showArcadeSettings() {
        this.ui.showScreen('arcadeSettingsScreen');
    }
    
    saveArcadeGameSettings() {
        this.arcadeSettings.playerGravity = parseFloat(document.getElementById('playerGravitySlider').value);
        this.arcadeSettings.ballGravity = parseFloat(document.getElementById('ballGravitySlider').value);
        this.arcadeSettings.playerSize = parseFloat(document.getElementById('playerSizeSlider').value);
        this.arcadeSettings.ballSize = parseFloat(document.getElementById('ballSizeSlider').value);
        this.arcadeSettings.matchTime = parseInt(document.getElementById('arcadeTimeSlider').value);
        this.arcadeSettings.scoreToWin = parseInt(document.getElementById('arcadeScoreSlider').value);
        this.arcadeSettings.ballSpeed = parseFloat(document.getElementById('ballSpeedSlider').value);
        this.arcadeSettings.jumpPower = parseFloat(document.getElementById('jumpPowerSlider').value);
        this.arcadeSettings.ballCount = parseInt(document.getElementById('ballCountSlider').value);
        this.arcadeSettings.weather = document.getElementById('weatherSelect').value;
    }
    
    startArcadeMatch() {
        this.gameMode = 'arcade';
        
        // Stop main menu background
        if (this.mainMenuBackground) {
            this.mainMenuBackground.stop();
        }
        
        console.log('Starting arcade match:', this.arcadeSettings);
        
        // Always show bug selection for left team (even if AI-only)
        const leftTeamLabel = this.arcadeSettings.leftHasHuman ? 
            '🐛 Left Team - Player 1' : 
            '🐛 Left Team - AI 1';
        
        this.ui.showBugSelection((bugId) => {
            this.selectedBug1 = getBugById(bugId);
            
            // If left team has 2 players, select second bug
            if (this.arcadeSettings.leftTeamCount === 2) {
                const leftTeam2Label = this.arcadeSettings.leftHasHuman ? 
                    '🐛 Left Team - Player 2' : 
                    '🐛 Left Team - AI 2';
                    
                this.ui.showBugSelection((bugId2) => {
                    this.selectedBugLeftTeam2 = getBugById(bugId2);
                    this.selectRightTeamBugs();
                }, leftTeam2Label);
            } else {
                this.selectedBugLeftTeam2 = null;
                this.selectRightTeamBugs();
            }
        }, leftTeamLabel);
    }
    
    selectRightTeamBugs() {
        // Right team bug selection
        const rightHumanCount = this.arcadeSettings.rightTeamCount - this.arcadeSettings.rightAICount;
        
        console.log('Right team selection:', { 
            rightTeamCount: this.arcadeSettings.rightTeamCount, 
            rightAICount: this.arcadeSettings.rightAICount,
            rightHumanCount,
            rightHasHuman: this.arcadeSettings.rightHasHuman
        });
        
        // Always show bug selection for right team (even if AI-only)
        const rightTeam1Label = this.arcadeSettings.rightHasHuman ? 
            '🐛 Right Team - Player 1' : 
            '🐛 Right Team - AI 1';
        
        this.ui.showBugSelection((bugId) => {
            this.selectedBug2 = getBugById(bugId);
            
            if (this.arcadeSettings.rightTeamCount === 2) {
                // Determine label for second player
                let rightTeam2Label;
                if (rightHumanCount === 2) {
                    rightTeam2Label = '🐛 Right Team - Player 2';
                } else if (rightHumanCount === 1) {
                    rightTeam2Label = '🐛 Right Team - AI 1';
                } else {
                    rightTeam2Label = '🐛 Right Team - AI 2';
                }
                
                this.ui.showBugSelection((bugId2) => {
                    this.selectedBug3 = getBugById(bugId2);
                    this.selectArenaForArcade();
                }, rightTeam2Label);
            } else {
                this.selectedBug3 = null;
                this.selectArenaForArcade();
            }
        }, rightTeam1Label);
    }
    
    selectArenaForArcade() {
        this.ui.showArenaSelection((arenaId) => {
            this.selectedArena = getArenaById(arenaId);
            this.startMatch();
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
        
        // Apply arcade gravity modifiers if in arcade mode
        if (this.gameMode === 'arcade' && this.arcadeSettings) {
            this.physics.gravityPlayer = this.physics.gravity * this.arcadeSettings.playerGravity;
            this.physics.gravityBall = this.physics.gravity * this.arcadeSettings.ballGravity;
        } else {
            this.physics.gravityPlayer = this.physics.gravity;
            this.physics.gravityBall = this.physics.gravity;
        }
        
        // Get size multiplier for arcade mode
        const sizeMultiplier = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.playerSize : 1.0;
        const ballSizeMultiplier = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.ballSize : 1.0;
        const ballCount = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.ballCount || 1 : 1;
        
        // Initialize balls (multiple in arcade mode)
        this.balls = [];
        for (let i = 0; i < ballCount; i++) {
            // Spread balls out horizontally if multiple
            const spacing = this.canvas.width / (ballCount + 1);
            this.balls.push({
                x: spacing * (i + 1),
                y: this.canvas.height / 2,
                vx: 0,
                vy: 0,
                radius: 15 * ballSizeMultiplier,
                rotation: 0 // Track rotation angle for rolling effect
            });
        }
        // Keep this.ball reference for backwards compatibility (points to first ball)
        this.ball = this.balls[0];
        
        // Initialize player 1
        const p1Size = 40 * this.selectedBug1.stats.size * sizeMultiplier;
        
        // Apply cosmetic hitbox modifiers for player 1
        const profile = this.ui.currentProfile;
        const cosmeticModifiers = (profile && profile.equippedCosmetics) ? 
            calculateHitboxModifiers(profile.equippedCosmetics) : { width: 0, height: 0 };
        
        this.player1 = {
            x: this.canvas.width * 0.25,
            y: this.physics.groundY - p1Size / 2, // Ground position based on base size only
            vx: 0,
            vy: 0,
            width: p1Size + cosmeticModifiers.width,
            height: p1Size + cosmeticModifiers.height,
            baseWidth: p1Size,  // Store base size for animations
            baseHeight: p1Size,
            isGrounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            facing: 1
        };
        
        // Initialize player 2
        // Check if this is a boss battle
        const bossLevelConfig = this.gameMode === 'tower' ? this.getTowerLevelConfig(this.towerLevel) : null;
        const bossMultiplier = (bossLevelConfig && bossLevelConfig.isBoss) ? (bossLevelConfig.bossSize || 1.0) : 1.0;
        
        // Safety check for bug stats
        if (!this.selectedBug2 || !this.selectedBug2.stats) {
            console.error('selectedBug2 or stats is undefined', this.selectedBug2);
            this.selectedBug2 = this.getRandomBug();
        }
        
        const p2Size = 40 * this.selectedBug2.stats.size * sizeMultiplier * bossMultiplier;
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
            facing: -1,
            isBoss: bossLevelConfig && bossLevelConfig.isBoss // Mark as boss
        };
        
        // Initialize AI or third player
        if (this.gameMode === 'arcade') {
            // Arcade mode - custom team setup
            // Handle left team AI
            if (!this.arcadeSettings.leftHasHuman && this.arcadeSettings.leftTeamCount >= 1) {
                // Spectator mode - player1 is AI controlled
                this.player1AI = new AI(this.arcadeSettings.leftAIDifficulty, this.player1, this.ball, this.physics, 'left', this.arcadeSettings.leftAIPersonality);
            } else if (this.arcadeSettings.leftAICount > 0) {
                // Left team has human + AI teammate (currently not fully implemented for 2v2)
                this.player1AI = new AI(this.arcadeSettings.leftAIDifficulty, this.player1, this.ball, this.physics, 'left', this.arcadeSettings.leftAIPersonality);
            } else {
                this.player1AI = null;
            }
            
            // Handle right team
            const p3Size = this.selectedBug3 ? 40 * this.selectedBug3.stats.size * sizeMultiplier : 0;
            
            if (this.arcadeSettings.rightTeamCount === 2) {
                // Right team has 2 players
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
                
                if (this.arcadeSettings.rightAICount === 2) {
                    // Both are AI
                    this.player2AI_2 = new MultiAI(
                        this.arcadeSettings.rightAIDifficulty,
                        [this.player2, this.player3],
                        this.ball,
                        this.physics,
                        'defender',
                        'right',
                        [this.arcadeSettings.rightAIPersonality, this.arcadeSettings.rightAIPersonality]
                    );
                    this.player2AI = null;
                } else if (this.arcadeSettings.rightAICount === 1) {
                    // One AI - figure out which player
                    const rightHumanCount = this.arcadeSettings.rightTeamCount - this.arcadeSettings.rightAICount;
                    if (rightHumanCount === 1) {
                        // Assume player2 is human, player3 is AI
                        this.player3AI = new AI(this.arcadeSettings.rightAIDifficulty, this.player3, this.ball, this.physics, 'right', this.arcadeSettings.rightAIPersonality);
                        this.player2AI = null;
                        this.player2AI_2 = null;
                    }
                } else {
                    // No AI on right team (both human)
                    this.player2AI = null;
                    this.player2AI_2 = null;
                    this.player3AI = null;
                }
            } else {
                // Right team has 1 player
                this.player3 = null;
                
                if (this.arcadeSettings.rightAICount === 1) {
                    this.player2AI = new AI(this.arcadeSettings.rightAIDifficulty, this.player2, this.ball, this.physics, 'right', this.arcadeSettings.rightAIPersonality);
                    this.player2AI_2 = null;
                    this.player3AI = null;
                } else {
                    this.player2AI = null;
                    this.player2AI_2 = null;
                    this.player3AI = null;
                }
            }
        } else if (this.gameMode !== 'multiplayer') {
            // Check if 2v1 mode (tower levels with 2 AI)
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
                
                // Multi-AI for 2v1 mode - one aggressive, one defensive personality
                this.player2AI_2 = new MultiAI(this.difficulty, [this.player2, this.player3], this.ball, this.physics, 'defender', 'right', ['aggressive', 'defensive']);
                this.player2AI = null; // Don't create single AI in 1v2 mode
            } else {
                // 1v1 mode - Player 2 AI is on the right side, defends right goal
                // Use aggressive personality for boss battles
                const aiPersonality = this.bossGauntletActive ? 'aggressive' : 'balanced';
                this.player2AI = new AI(this.difficulty, this.player2, this.ball, this.physics, 'right', aiPersonality, this.bossGauntletActive);
                this.player2AI_2 = null; // No multi-AI in 1v1 mode
                this.player3 = null; // No third player in 1v1 mode
            }
        } else {
            // Multiplayer mode - clear AI
            this.player2AI = null;
            this.player2AI_2 = null;
            this.player3 = null;
        }
        
        // Apply arcade match settings if in arcade mode
        if (this.gameMode === 'arcade' && this.arcadeSettings) {
            this.matchTimeLimit = this.arcadeSettings.matchTime * 60; // Convert minutes to seconds
            this.scoreToWin = this.arcadeSettings.scoreToWin;
        }
        // Otherwise use the settings from arena preview or defaults
        
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
        
        // Initialize weather effects
        const levelConfig = this.gameMode === 'tower' ? this.getTowerLevelConfig(this.towerLevel) : null;
        this.currentWeather = this.gameMode === 'arcade' ? (this.arcadeSettings?.weather || 'none') : (levelConfig?.weather || 'none');
        this.initWeatherParticles();
        
        // Start with intro animation - arena preview
        this.gameState = 'intro';
        this.introState = 'preview';
        this.introStartTime = Date.now();
        this.arenaPanOffset = 0;
        this.countdownValue = 3;
        this.initialCountdownValue = 3;
        
        // Show touch controls based on user preference or auto-detection (after state is set)
        this.updateTouchControlsVisibility();
        
        this.gameLoop();
    }
    
    gameLoop() {
        // Increment frame counter for animations
        this.frameCount++;
        
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
        
        if (this.introState === 'preview') {
            // Update arena pan offset - smooth pan from left to right
            const progress = Math.min(elapsed / this.introPreviewDuration, 1);
            // Ease in-out
            const eased = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            this.arenaPanOffset = (eased - 0.5) * this.canvas.width * 0.3; // Pan 30% of width
            
            if (elapsed >= this.introPreviewDuration) {
                // Move to teams phase
                this.introState = 'teams';
                this.introStartTime = Date.now();
                this.arenaPanOffset = 0; // Reset pan
            }
        } else if (this.introState === 'teams') {
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
        
        // Apply arena pan offset for preview phase
        if (this.introState === 'preview') {
            this.ctx.save();
            this.ctx.translate(-this.arenaPanOffset, 0);
        }
        
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
        
        // Restore canvas if we applied pan offset
        if (this.introState === 'preview') {
            this.ctx.restore();
            
            // Show arena name during preview
            const fadeInDuration = 500;
            const fadeOutStart = this.introPreviewDuration - 500;
            let opacity = 1;
            
            if (elapsed < fadeInDuration) {
                opacity = elapsed / fadeInDuration;
            } else if (elapsed > fadeOutStart) {
                opacity = 1 - ((elapsed - fadeOutStart) / 500);
            }
            
            this.ctx.save();
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
            this.ctx.lineWidth = 6;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const arenaName = this.selectedArena.name.toUpperCase();
            this.ctx.strokeText(arenaName, this.canvas.width / 2, this.canvas.height - 100);
            this.ctx.fillText(arenaName, this.canvas.width / 2, this.canvas.height - 100);
            this.ctx.restore();
        }
        
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
            // Draw field celebration
            drawCelebration(this.ctx, this.celebrationType, this.celebrationSide, 
                this.canvas.width, this.canvas.height, this.celebrationFrame);
            
            // Draw bug animation on player 1
            if (this.bugAnimationType && this.bugAnimationType !== 'none') {
                // Save player1 original position and size
                const originalX = this.player1.x;
                const originalY = this.player1.y;
                const originalWidth = this.player1.width;
                const originalHeight = this.player1.height;
                
                // Apply bug animation (modifies player position temporarily)
                drawBugAnimation(this.ctx, this.bugAnimationType, this.player1, this.celebrationFrame);
                
                // Redraw the player with the modified position/size for animation effect
                this.drawPlayer(this.player1, this.selectedBug1);
                
                // Restore player1 original position after drawing
                this.player1.x = originalX;
                this.player1.y = originalY;
                this.player1.width = originalWidth;
                this.player1.height = originalHeight;
            }
            
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
            
            // Display weather status if active
            if (this.currentWeather && this.currentWeather !== 'none') {
                this.ctx.font = 'bold 28px Arial';
                this.ctx.lineWidth = 3;
                const weatherIcons = { 'rain': '🌧️ Rain', 'snow': '❄️ Snow', 'wind': '💨 Wind' };
                const weatherText = weatherIcons[this.currentWeather] || this.currentWeather;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.strokeText(weatherText, this.canvas.width / 2, this.canvas.height / 2 + 120);
                this.ctx.fillText(weatherText, this.canvas.width / 2, this.canvas.height / 2 + 120);
            }
            
            this.ctx.restore();
        }
        
        // Draw achievement notifications (on top of everything)
        this.achievements.drawNotification(this.ctx, this.canvas);
    }
    
    update() {
        // Update particles
        this.particles.update();
        
        // Update weather particles
        this.updateWeatherParticles();
        
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
        } else if (this.gameMode === 'arcade') {
            // Arcade AI control
            if (this.player1AI) {
                this.player1AI.update();
            }
            if (this.player2AI) {
                this.player2AI.update();
            }
            if (this.player2AI_2) {
                this.player2AI_2.update(0);
                this.player2AI_2.update(1);
            }
            if (this.player3AI) {
                this.player3AI.update();
            }
        } else {
            // Tower/Quick Play AI control
            if (this.selectedBug3 && this.player2AI_2) {
                // 1v2 mode: Use MultiAI for both AI players
                this.player2AI_2.update(0); // Update player2
                this.player2AI_2.update(1); // Update player3
            } else if (this.player2AI) {
                // 1v1 mode: Use single AI
                this.player2AI.update();
            }
        }
        
        // Update physics
        // Get arcade modifiers
        const jumpPowerMultiplier = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.jumpPower : 1.0;
        const ballSpeedMultiplier = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.ballSpeed : 1.0;
        
        this.physics.updatePlayer(this.player1, this.selectedBug1, jumpPowerMultiplier);
        this.physics.updatePlayer(this.player2, this.selectedBug2, jumpPowerMultiplier);
        
        if (this.player3) {
            this.physics.updatePlayer(this.player3, this.selectedBug3, jumpPowerMultiplier);
        }
        
        // Update all balls
        for (let ball of this.balls) {
            this.physics.updateBall(ball, ballSpeedMultiplier);
            
            // Update ball rotation based on velocity (rolling effect)
            const rotationSpeed = ball.vx / (2 * Math.PI * ball.radius);
            ball.rotation += rotationSpeed;
        }
        
        // Apply weather effects to all balls
        this.applyWeatherEffects();
        
        // Check collisions for all balls
        for (let ball of this.balls) {
            const ballVelocity = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            
            if (this.physics.checkBallPlayerCollision(ball, this.player1, this.selectedBug1)) {
                const hapticStrength = Math.min(Math.floor(ballVelocity * 3), 50);
                this.audio.playSoundWithHaptic('kick', hapticStrength, ballVelocity);
                const maxParticles = this.quality.getSetting('particleCount');
                this.particles.createKickDust(ball.x, ball.y, ball.vx, maxParticles);
                if (ballVelocity > 15) {
                    this.particles.createImpactSparks(ball.x, ball.y, ballVelocity / 20, maxParticles);
                }
            }
            if (this.physics.checkBallPlayerCollision(ball, this.player2, this.selectedBug2)) {
                this.audio.playSound('kick', ballVelocity);
                const maxParticles = this.quality.getSetting('particleCount');
                this.particles.createKickDust(ball.x, ball.y, ball.vx, maxParticles);
                if (ballVelocity > 15) {
                    this.particles.createImpactSparks(ball.x, ball.y, ballVelocity / 20, maxParticles);
                }
            }
            
            if (this.player3) {
                if (this.physics.checkBallPlayerCollision(ball, this.player3, this.selectedBug3)) {
                    this.audio.playSound('kick', ballVelocity);
                    const maxParticles = this.quality.getSetting('particleCount');
                    this.particles.createKickDust(ball.x, ball.y, ball.vx, maxParticles);
                    if (ballVelocity > 15) {
                        this.particles.createImpactSparks(ball.x, ball.y, ballVelocity / 20, maxParticles);
                    }
                }
            }
            
            // CRITICAL FIX: After all collisions, ensure ball is never stuck underground
            const minBallY = this.physics.groundY - ball.radius;
            if (ball.y > minBallY) {
                ball.y = minBallY;
                if (ball.vy > -2) {
                    ball.vy = -8; // Strong upward push to free the ball
                }
            }
        }
        
        // Create ball trail for first ball (visual effect)
        if (this.ball) {
            this.particles.createBallTrail(this.ball.x, this.ball.y, this.ball.vx, this.ball.vy);
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
        
        // Check goals for all balls
        for (let i = 0; i < this.balls.length; i++) {
            const goal = this.physics.checkGoal(this.balls[i]);
            if (goal) {
                this.handleGoal(goal, i);
            }
        }
    }
    
    updatePlayer1Input() {
        // Check if touch controls are enabled (either auto-detected or manually enabled)
        const useTouchControls = this.touchControlsEnabled !== null 
            ? this.touchControlsEnabled 
            : (this.ui.isMobile || this.ui.isTablet);
            
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
            : ((this.ui.isMobile || this.ui.isTablet) && this.gameMode === 'multiplayer');
            
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
        
        // Draw weather effects
        this.drawWeatherParticles();
        
        // Draw all balls
        for (let ball of this.balls) {
            this.drawBall(ball);
        }
        
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
    
    drawBall(ball = this.ball) {
        if (!ball) return;
        
        this.ctx.save();
        
        // Translate to ball position
        this.ctx.translate(ball.x, ball.y);
        
        // Rotate based on ball rotation
        this.ctx.rotate(ball.rotation);
        
        // Draw soccer ball at origin (since we translated)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Black pentagons
        this.ctx.fillStyle = 'black';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5);
            const x = Math.cos(angle) * ball.radius * 0.6;
            const y = Math.sin(angle) * ball.radius * 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, ball.radius * 0.25, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Dynamic shadow that scales with ball height
        const groundY = this.physics.groundY;
        const ballHeight = groundY - ball.y;
        const maxHeight = 200; // Maximum expected ball height
        
        // Scale shadow based on height (smaller and lighter when higher)
        const heightRatio = Math.min(ballHeight / maxHeight, 1);
        const shadowScale = 1 - (heightRatio * 0.6); // Shadow shrinks up to 60% when at max height
        const shadowOpacity = 0.4 * (1 - heightRatio * 0.7); // Shadow fades when ball is high
        
        this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        this.ctx.beginPath();
        this.ctx.ellipse(
            ball.x, 
            groundY + 5, 
            ball.radius * 0.8 * shadowScale, 
            ball.radius * 0.3 * shadowScale, 
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawPlayer(player, bug) {
        // Safety check
        if (!player || !bug || !bug.color) {
            console.error('Invalid player or bug data', player, bug);
            return;
        }
        
        // Determine if this player is AI-controlled
        const isAI = (player === this.player2 && (this.player2AI || this.player2AI_2)) ||
                     (player === this.player3 && (this.player3AI || this.player2AI_2)) ||
                     (player === this.player1 && this.player1AI);
        
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
        
        // Draw background cosmetics (accessories like wings) BEFORE player body, in transformed space
        if (player === this.player1 && this.ui.currentProfile && this.ui.currentProfile.equippedCosmetics) {
            const equippedCosmetics = this.ui.currentProfile.equippedCosmetics;
            const gameContext = { ball: this.ball, players: [this.player1, this.player2] };
            for (const cosmeticId of equippedCosmetics) {
                const cosmetic = getCosmeticById(cosmeticId);
                if (cosmetic && cosmetic.category === 'accessory') {
                    drawCosmetic(this.ctx, cosmeticId, player, bug, this.frameCount, true, gameContext); // true = use relative coords
                }
            }
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
        
        // Draw foreground cosmetics (hats, glasses, special) in transformed space
        if (player === this.player1 && this.ui.currentProfile && this.ui.currentProfile.equippedCosmetics) {
            const equippedCosmetics = this.ui.currentProfile.equippedCosmetics;
            const gameContext = { ball: this.ball, players: [this.player1, this.player2] };
            for (const cosmeticId of equippedCosmetics) {
                const cosmetic = getCosmeticById(cosmeticId);
                if (cosmetic && cosmetic.category !== 'accessory') {
                    drawCosmetic(this.ctx, cosmeticId, player, bug, this.frameCount, true, gameContext); // true = use relative coords
                }
            }
        }
        
        // Draw crown on bosses (also in transformed space so it mirrors)
        if (player.isBoss) {
            drawCosmetic(this.ctx, 'crown', player, bug, this.frameCount, true);
        }
        
        this.ctx.restore();
        
        // Draw "BOSS" or "AI" label above AI-controlled players
        if (player.isBoss) {
            // Boss label - larger and golden
            this.ctx.save();
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillStyle = 'rgba(255, 215, 0, 1)'; // Gold color
            this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.9)'; // Dark brown outline
            this.ctx.lineWidth = 4;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            
            const labelY = player.y - player.height / 2 - 15;
            this.ctx.strokeText('BOSS', player.x, labelY);
            this.ctx.fillText('BOSS', player.x, labelY);
            this.ctx.restore();
        } else if (isAI) {
            // Regular AI label
            this.ctx.save();
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            
            const labelY = player.y - player.height / 2 - 10;
            this.ctx.strokeText('AI', player.x, labelY);
            this.ctx.fillText('AI', player.x, labelY);
            this.ctx.restore();
        }
    }
    
    handleGoal(goal, ballIndex = 0) {
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
            
            // If no profile (demo mode), randomize celebration each goal
            if (!profile) {
                const allCelebrations = getCelebrationArray();
                let randomCelebration;
                do {
                    randomCelebration = allCelebrations[Math.floor(Math.random() * allCelebrations.length)];
                } while (randomCelebration.id === this.lastDemoCelebration && allCelebrations.length > 1);
                
                this.celebrationType = randomCelebration.id;
                this.lastDemoCelebration = randomCelebration.id;
                
                // Also randomize bug animation in demo
                const allBugAnimations = getBugAnimationArray();
                const randomBugAnimation = allBugAnimations[Math.floor(Math.random() * allBugAnimations.length)];
                this.bugAnimationType = randomBugAnimation.id;
            } else {
                // Use profile selections for actual gameplay
                this.celebrationType = profile.selectedCelebration || 'classic';
                this.bugAnimationType = profile.selectedBugAnimation || 'none';
            }
            
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
            // Reinitialize balls to match the correct count
            const ballSizeMultiplier = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.ballSize : 1.0;
            const ballCount = (this.gameMode === 'arcade' && this.arcadeSettings) ? this.arcadeSettings.ballCount || 1 : 1;
            
            this.balls = [];
            for (let i = 0; i < ballCount; i++) {
                const spacing = this.canvas.width / (ballCount + 1);
                this.balls.push({
                    x: spacing * (i + 1),
                    y: this.canvas.height / 2,
                    vx: 0,
                    vy: 0,
                    radius: 15 * ballSizeMultiplier,
                    rotation: 0
                });
            }
            this.ball = this.balls[0]; // Update reference
            
            // Update AI ball references after reset
            if (this.player2AI) {
                this.player2AI.ball = this.ball;
            }
            if (this.player2AI_2) {
                this.player2AI_2.ball = this.ball;
            }
            if (this.player1AI) {
                this.player1AI.ball = this.ball;
            }
            if (this.player3AI) {
                this.player3AI.ball = this.ball;
            }
            
            this.physics.resetPlayer(this.player1, 'left');
            this.physics.resetPlayer(this.player2, 'right');
            
            if (this.player3) {
                this.physics.resetPlayer(this.player3, 'right');
            }
        }, 1000);
        
        // Check if match should end
        if (this.score1 >= this.scoreToWin || this.score2 >= this.scoreToWin) {
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
    
    
    initWeatherParticles() {
        this.weatherParticles = [];
        
        if (this.currentWeather === 'none') return;
        
        // Reset weather direction timer
        this.weatherDirection = 1;
        this.weatherDirectionTimer = 0;
        
        const particleCount = 150; // Increased from 80 for better visibility
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0,
                baseVx: 0, // Store base velocity for direction changes
                size: 0,
                opacity: 0.5 + Math.random() * 0.5 // More visible
            };
            
            if (this.currentWeather === 'rain') {
                particle.baseVx = 2 + Math.random() * 3; // More diagonal
                particle.vx = particle.baseVx;
                particle.vy = 12 + Math.random() * 8; // Faster falling
                particle.size = 2.5 + Math.random() * 1.5; // Thicker
                particle.length = 15 + Math.random() * 20; // Longer streaks
            } else if (this.currentWeather === 'snow') {
                particle.vx = -2 + Math.random() * 4; // More drift
                particle.vy = 2 + Math.random() * 3; // Moderate falling
                particle.size = 4 + Math.random() * 4; // Larger snowflakes
                particle.drift = Math.random() * Math.PI * 2; // For wavy motion
            } else if (this.currentWeather === 'wind') {
                particle.baseVx = 10 + Math.random() * 8; // Much faster horizontal
                particle.vx = particle.baseVx;
                particle.vy = -2 + Math.random() * 4; // Vertical variance
                particle.size = 2 + Math.random() * 2;
                particle.length = 25 + Math.random() * 35; // Longer streaks
            }
            
            this.weatherParticles.push(particle);
        }
    }
    
    updateWeatherParticles() {
        if (this.currentWeather === 'none') return;
        
        // Update direction timer for rain and wind (change every 5 seconds)
        if (this.currentWeather === 'rain' || this.currentWeather === 'wind') {
            this.weatherDirectionTimer += 1/60; // Assuming 60 FPS
            
            if (this.weatherDirectionTimer >= 5) {
                this.weatherDirectionTimer = 0;
                this.weatherDirection *= -1; // Flip direction
                
                // Update all particle directions
                for (let particle of this.weatherParticles) {
                    if (particle.baseVx !== undefined) {
                        particle.vx = particle.baseVx * this.weatherDirection;
                    }
                }
            }
        }
        
        for (let particle of this.weatherParticles) {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Snow drift effect
            if (this.currentWeather === 'snow') {
                particle.drift += 0.05;
                particle.x += Math.sin(particle.drift) * 0.5;
            }
            
            // Wrap particles around screen
            if (particle.x > this.canvas.width) {
                particle.x = 0;
            } else if (particle.x < 0) {
                particle.x = this.canvas.width;
            }
            
            if (particle.y > this.canvas.height) {
                particle.y = 0;
            } else if (particle.y < 0) {
                particle.y = this.canvas.height;
            }
        }
    }
    
    drawWeatherParticles() {
        if (this.currentWeather === 'none') return;
        
        this.ctx.save();
        
        for (let particle of this.weatherParticles) {
            this.ctx.globalAlpha = particle.opacity;
            
            if (this.currentWeather === 'rain') {
                // Draw rain as bright blue lines
                this.ctx.strokeStyle = '#66B3FF';
                this.ctx.lineWidth = particle.size;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy);
                this.ctx.stroke();
            } else if (this.currentWeather === 'snow') {
                // Draw snow as white circles with slight glow
                this.ctx.fillStyle = 'white';
                this.ctx.shadowBlur = 3;
                this.ctx.shadowColor = 'white';
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } else if (this.currentWeather === 'wind') {
                // Draw wind as visible gray/white streaks
                this.ctx.strokeStyle = 'rgba(220, 220, 220, 0.6)';
                this.ctx.lineWidth = particle.size;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x - particle.length, particle.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    applyWeatherEffects() {
        if (this.currentWeather === 'none') return;
        
        // Apply effects to all balls
        for (let ball of this.balls) {
            if (!ball) continue;
            
            if (this.currentWeather === 'rain') {
                // Rain adds horizontal drift (changes direction every 5 seconds)
                ball.vx += 0.2 * this.weatherDirection;
                ball.vy += 0.08; // Slight downward push
            } else if (this.currentWeather === 'snow') {
                // Snow reduces friction, making ball and players slide more
                ball.vx *= 1.008; // Less friction slowdown for ball
                ball.vy *= 1.003;
            } else if (this.currentWeather === 'wind') {
                // Wind pushes ball horizontally (changes direction every 5 seconds)
                ball.vx += 0.2 * this.weatherDirection; // Reduced from 0.4
            }
        }
        
        // Set player friction for snow
        if (this.currentWeather === 'snow') {
            this.physics.weatherFriction = 0.96; // Much less friction (normal is 0.9)
        } else {
            this.physics.weatherFriction = 0.9;
        }
    }
    
    endMatch() {
        this.gameState = 'ended';
        cancelAnimationFrame(this.animationId);
        
        const playerWon = this.score1 > this.score2;
        const isDraw = this.score1 === this.score2;
        
        // Check if this is boss gauntlet mode
        if (this.bossGauntletActive && playerWon) {
            this.bossGauntletWins++;
            this.bossGauntletCurrentIndex++;
            
            // Check if there are more bugs to face
            if (this.bossGauntletCurrentIndex < this.bossGauntletBugs.length) {
                // Continue to next bug in gauntlet
                this.advanceGauntlet();
                return;
            } else {
                // Gauntlet complete!
                this.bossGauntletActive = false;
            }
        } else if (this.bossGauntletActive && !playerWon) {
            // Player lost during gauntlet - end the match
            this.bossGauntletActive = false;
        }
        
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
            
            // Check if tower is complete (level 20 boss gauntlet completed)
            if (this.towerLevel === 20 && this.bossGauntletWins === this.bossGauntletBugs.length) {
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
                // Check if this was the final boss gauntlet victory
                if (this.towerLevel === 20 && this.bossGauntletWins === this.bossGauntletBugs.length) {
                    titleEl.textContent = `👑 BOSS GAUNTLET COMPLETE! 👑`;
                    titleEl.style.fontSize = '28px';
                } else {
                    titleEl.textContent = `🏆 Level ${this.towerLevel} Complete! 🏆`;
                    titleEl.style.fontSize = '32px';
                }
            } else {
                titleEl.textContent = 'Victory!';
            }
            titleEl.style.color = '#7ed321';
        } else {
            titleEl.textContent = 'Defeat';
            titleEl.style.color = '#ff4444';
        }
        
        // Show gauntlet stats if applicable
        let statsHTML = `
            <div class="stat-row">
                <span>Final Score:</span>
                <span style="color: #7ed321; font-size: 24px;">${this.score1} - ${this.score2}</span>
            </div>
        `;
        
        // Add gauntlet progress if in boss gauntlet
        if (this.towerLevel === 20 && this.bossGauntletWins > 0) {
            statsHTML += `
                <div class="stat-row">
                    <span>Bosses Defeated:</span>
                    <span style="color: #FFD700; font-size: 20px;">${this.bossGauntletWins}/${this.bossGauntletBugs.length}</span>
                </div>
            `;
        }
        
        statsEl.innerHTML = statsHTML;
        
        // Show continue button if tower mode, won, and not at final level
        // For level 20 (boss gauntlet), only show if still have bosses to fight
        const continueBtn = document.getElementById('continueBtn');
        const canContinue = this.gameMode === 'tower' && playerWon && (
            this.towerLevel < 20 || 
            (this.towerLevel === 20 && this.bossGauntletWins < this.bossGauntletBugs.length)
        );
        
        if (canContinue) {
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
    
    advanceGauntlet() {
        // Get the next bug in the gauntlet
        const baseBug = this.bossGauntletBugs[this.bossGauntletCurrentIndex];
        
        // Create enhanced boss version
        this.selectedBug2 = {
            id: baseBug.id,
            name: baseBug.name,
            color: baseBug.color,
            svg: baseBug.svg,
            stats: {
                speed: Math.min(baseBug.stats.speed * 1.3, 1.0),
                jump: Math.min(baseBug.stats.jump * 1.3, 1.0),
                size: baseBug.stats.size,
                power: Math.min(baseBug.stats.power * 1.3, 1.0)
            }
        };
        
        // Reset scores for next round
        this.score1 = 0;
        this.score2 = 0;
        
        // Show brief transition message
        const gauntletProgress = `Boss ${this.bossGauntletCurrentIndex + 1}/${this.bossGauntletBugs.length}`;
        document.getElementById('loadingLevelName').textContent = `👑 ${gauntletProgress}: ${baseBug.name}`;
        document.getElementById('loadingLevelDifficulty').textContent = `🔴 BOSS GAUNTLET`;
        
        // Show loading screen briefly before next match
        document.getElementById('loadingScreen').style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            this.startMatch();
        }, 2000);
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
        this.settingsOpenedFrom = 'pause'; // Track where settings was opened from
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
        
        // Load quality setting from profile preferences
        const quality = this.ui.currentProfile?.preferences?.graphicsQuality || 'medium';
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
    
    openSettingsFromMainMenu() {
        this.settingsOpenedFrom = 'mainMenu'; // Track where settings was opened from
        
        // Load and display current audio settings
        const soundVolume = Math.round(this.audio.soundVolume * 100);
        const musicVolume = Math.round(this.audio.musicVolume * 100);
        
        document.getElementById('soundVolumeSlider').value = soundVolume;
        document.getElementById('soundVolumeValue').textContent = soundVolume + '%';
        
        document.getElementById('musicVolumeSlider').value = musicVolume;
        document.getElementById('musicVolumeValue').textContent = musicVolume + '%';
        
        document.getElementById('hapticToggle').checked = this.audio.hapticEnabled;
        
        // Load quality setting from profile preferences
        const quality = this.ui.currentProfile?.preferences?.graphicsQuality || 'medium';
        this.quality.setQuality(quality);
        document.getElementById('qualitySelect').value = quality;
        
        // Update toggle to reflect current preference
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
        
        // Return to where settings was opened from
        if (this.settingsOpenedFrom === 'mainMenu') {
            // Just hide overlay, main menu is still visible
            this.settingsOpenedFrom = null;
        } else {
            // Return to pause menu (game stays paused)
            this.ui.showOverlay('pauseMenu');
            this.settingsOpenedFrom = null;
        }
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
            // Show Player 2 controls in multiplayer mode
            if (this.gameMode === 'multiplayer') {
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
        // Allow pause during: playing, intro, or countdown state
        if (this.gameState === 'playing' || this.gameState === 'intro' || this.gameState === 'countdown') {
            const previousState = this.gameState;
            this.gameState = 'paused';
            this.pausedFromState = previousState; // Remember what state we paused from
            
            // Store countdown state if paused during countdown
            this.pausedCountdownValue = this.countdownValue;
            this.pausedCountdownStartTime = this.countdownStartTime;
            
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
            // Resume to the previous state (either 'playing', 'intro', or 'countdown')
            this.gameState = this.pausedFromState || 'playing';
            
            // Restore countdown state if we had one
            if (this.pausedCountdownValue !== undefined && this.gameState === 'countdown') {
                this.countdownValue = this.pausedCountdownValue;
                // Reset countdown start time to current time minus elapsed countdown time
                const elapsedCountdown = this.initialCountdownValue - this.countdownValue;
                this.countdownStartTime = Date.now() - (elapsedCountdown * 1000);
                this.pausedCountdownValue = undefined;
                this.pausedCountdownStartTime = undefined;
            }
            
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
        
        // Setup tab switching (remove and re-add to avoid duplicates)
        const celebrationsTab = document.getElementById('celebrationsTab');
        const bugAnimationsTab = document.getElementById('bugAnimationsTab');
        const celebrationsContent = document.getElementById('celebrationsTabContent');
        const bugAnimationsContent = document.getElementById('bugAnimationsTabContent');
        
        // Clone and replace to remove old event listeners
        const celebrationsTabNew = celebrationsTab.cloneNode(true);
        const bugAnimationsTabNew = bugAnimationsTab.cloneNode(true);
        celebrationsTab.parentNode.replaceChild(celebrationsTabNew, celebrationsTab);
        bugAnimationsTab.parentNode.replaceChild(bugAnimationsTabNew, bugAnimationsTab);
        
        // Tab click handlers on new elements
        celebrationsTabNew.addEventListener('click', () => {
            celebrationsTabNew.classList.add('active');
            bugAnimationsTabNew.classList.remove('active');
            celebrationsContent.classList.add('active');
            bugAnimationsContent.classList.remove('active');
        });
        
        bugAnimationsTabNew.addEventListener('click', () => {
            bugAnimationsTabNew.classList.add('active');
            celebrationsTabNew.classList.remove('active');
            bugAnimationsContent.classList.add('active');
            celebrationsContent.classList.remove('active');
        });
        
        // Populate celebrations grid
        const celebrationGrid = document.getElementById('celebrationGrid');
        celebrationGrid.innerHTML = '';
        
        const celebrations = getCelebrationArray();
        console.log('Loading celebrations:', celebrations.length, celebrations.map(c => c.name));
        
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
                    celebrationGrid.querySelectorAll('.celebration-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                });
            }
            
            celebrationGrid.appendChild(card);
        });
        
        // Populate bug animations grid
        const bugAnimationGrid = document.getElementById('bugAnimationGrid');
        bugAnimationGrid.innerHTML = '';
        
        const bugAnimations = getBugAnimationArray();
        console.log('Loading bug animations:', bugAnimations.length, bugAnimations.map(a => a.name));
        
        bugAnimations.forEach(animation => {
            const isUnlocked = checkBugAnimationUnlock(animation, profile);
            const isSelected = profile.selectedBugAnimation === animation.id;
            
            const card = document.createElement('div');
            card.className = `celebration-card ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''}`;
            
            card.innerHTML = `
                <div class="celebration-icon">${animation.icon}</div>
                <h3>${animation.name}</h3>
                <p class="celebration-description">${animation.description}</p>
                <p class="unlock-condition">${isUnlocked ? '✓ Unlocked' : '🔒 ' + animation.unlockCondition}</p>
            `;
            
            if (isUnlocked) {
                card.addEventListener('click', () => {
                    // Update selected bug animation
                    profile.selectedBugAnimation = animation.id;
                    SaveSystem.saveProfile(profile);
                    this.ui.currentProfile = profile; // Update the UI's reference
                    
                    // Update UI
                    bugAnimationGrid.querySelectorAll('.celebration-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                });
            }
            
            bugAnimationGrid.appendChild(card);
        });
        
        // Setup cosmetics tab
        const cosmeticsTab = document.getElementById('cosmeticsTab');
        const cosmeticsContent = document.getElementById('cosmeticsTabContent');
        
        const cosmeticsTabNew = cosmeticsTab.cloneNode(true);
        cosmeticsTab.parentNode.replaceChild(cosmeticsTabNew, cosmeticsTab);
        
        cosmeticsTabNew.addEventListener('click', () => {
            cosmeticsTabNew.classList.add('active');
            celebrationsTabNew.classList.remove('active');
            bugAnimationsTabNew.classList.remove('active');
            cosmeticsContent.classList.add('active');
            celebrationsContent.classList.remove('active');
            bugAnimationsContent.classList.remove('active');
        });
        
        // Update celebrations and animations tab handlers to deactivate cosmetics
        const originalCelebClick = celebrationsTabNew.onclick;
        celebrationsTabNew.addEventListener('click', () => {
            celebrationsTabNew.classList.add('active');
            bugAnimationsTabNew.classList.remove('active');
            cosmeticsTabNew.classList.remove('active');
            celebrationsContent.classList.add('active');
            bugAnimationsContent.classList.remove('active');
            cosmeticsContent.classList.remove('active');
        });
        
        const originalBugClick = bugAnimationsTabNew.onclick;
        bugAnimationsTabNew.addEventListener('click', () => {
            bugAnimationsTabNew.classList.add('active');
            celebrationsTabNew.classList.remove('active');
            cosmeticsTabNew.classList.remove('active');
            bugAnimationsContent.classList.add('active');
            celebrationsContent.classList.remove('active');
            cosmeticsContent.classList.remove('active');
        });
        
        // Populate cosmetics
        this.populateCosmetics(profile);
        
        this.ui.showScreen('stylesScreen');
    }
    
    populateCosmetics(profile) {
        const MAX_EQUIPPED = 3;
        
        // Update equipped display
        const updateEquippedDisplay = () => {
            const equippedDisplay = document.getElementById('equippedCosmeticsDisplay');
            equippedDisplay.innerHTML = '';
            
            if (!profile.equippedCosmetics || profile.equippedCosmetics.length === 0) {
                equippedDisplay.innerHTML = '<div class="equipped-empty">No cosmetics equipped</div>';
            } else {
                profile.equippedCosmetics.forEach(id => {
                    const cosmetic = getCosmeticById(id);
                    if (cosmetic) {
                        const item = document.createElement('div');
                        item.className = 'equipped-item';
                        
                        // Check if cosmetic has a PNG image
                        const cosmeticImage = getCosmeticImage(cosmetic.id);
                        let iconHTML;
                        if (cosmeticImage) {
                            // Use PNG image
                            iconHTML = `<div class="equipped-item-icon"><img src="${cosmetic.imagePath}" alt="${cosmetic.name}" style="width: 40px; height: 40px; object-fit: contain;"></div>`;
                        } else {
                            // Use emoji
                            iconHTML = `<div class="equipped-item-icon">${cosmetic.icon}</div>`;
                        }
                        
                        item.innerHTML = `
                            ${iconHTML}
                            <div class="equipped-item-name">${cosmetic.name}</div>
                        `;
                        item.addEventListener('click', () => {
                            // Unequip
                            profile.equippedCosmetics = profile.equippedCosmetics.filter(cid => cid !== id);
                            SaveSystem.saveProfile(profile);
                            this.ui.currentProfile = profile;
                            updateEquippedDisplay();
                            populateGrid('all');
                        });
                        equippedDisplay.appendChild(item);
                    }
                });
            }
        };
        
        // Populate cosmetics grid
        const populateGrid = (category) => {
            const cosmeticsGrid = document.getElementById('cosmeticsGrid');
            cosmeticsGrid.innerHTML = '';
            
            const cosmetics = category === 'all' ? getCosmeticArray() : getCosmeticsByCategory(category);
            
            cosmetics.forEach(cosmetic => {
                if (cosmetic.id === 'none') return; // Skip "none" option
                
                const isUnlocked = checkCosmeticUnlock(cosmetic, profile);
                const isEquipped = profile.equippedCosmetics && profile.equippedCosmetics.includes(cosmetic.id);
                
                const card = document.createElement('div');
                card.className = `celebration-card ${isUnlocked ? '' : 'locked'} ${isEquipped ? 'equipped-badge' : ''}`;
                
                const hitboxInfo = cosmetic.hitboxModifier ? 
                    `<small>+${cosmetic.hitboxModifier.width}w +${cosmetic.hitboxModifier.height}h</small>` : '';
                
                // Check if cosmetic has a PNG image
                const cosmeticImage = getCosmeticImage(cosmetic.id);
                let iconHTML;
                if (cosmeticImage) {
                    // Create image element for PNG cosmetics
                    iconHTML = `<div class="celebration-icon"><img src="${cosmetic.imagePath}" alt="${cosmetic.name}" style="width: 60px; height: 60px; object-fit: contain;"></div>`;
                } else {
                    // Use emoji for non-PNG cosmetics
                    iconHTML = `<div class="celebration-icon">${cosmetic.icon}</div>`;
                }
                
                card.innerHTML = `
                    ${iconHTML}
                    <h3>${cosmetic.name}</h3>
                    <p class="celebration-description">${cosmetic.description}</p>
                    ${hitboxInfo}
                    <p class="unlock-condition">${isUnlocked ? '✓ Unlocked' : '🔒 ' + cosmetic.unlockCondition}</p>
                `;
                
                if (isUnlocked) {
                    card.addEventListener('click', () => {
                        if (isEquipped) {
                            // Unequip
                            profile.equippedCosmetics = profile.equippedCosmetics.filter(id => id !== cosmetic.id);
                        } else {
                            // Equip
                            if (!profile.equippedCosmetics) profile.equippedCosmetics = [];
                            
                            // Check if trying to equip a hat
                            if (cosmetic.category === 'hat') {
                                // Remove any existing hat before equipping new one
                                const existingHat = profile.equippedCosmetics.find(id => {
                                    const equipped = getCosmeticById(id);
                                    return equipped && equipped.category === 'hat';
                                });
                                
                                if (existingHat) {
                                    profile.equippedCosmetics = profile.equippedCosmetics.filter(id => id !== existingHat);
                                }
                                
                                profile.equippedCosmetics.push(cosmetic.id);
                            } else {
                                // For non-hat items, check max limit
                                if (profile.equippedCosmetics.length < MAX_EQUIPPED) {
                                    profile.equippedCosmetics.push(cosmetic.id);
                                } else {
                                    alert(`You can only equip ${MAX_EQUIPPED} cosmetics at once! Unequip one first.`);
                                    return;
                                }
                            }
                        }
                        SaveSystem.saveProfile(profile);
                        this.ui.currentProfile = profile;
                        updateEquippedDisplay();
                        populateGrid(category);
                    });
                }
                
                cosmeticsGrid.appendChild(card);
            });
        };
        
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                populateGrid(category);
            });
        });
        
        updateEquippedDisplay();
        populateGrid('all');
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
    
    // Controls Editor Methods
    loadCustomLayout(mode) {
        const key = `customControlsLayout_${mode}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(`Failed to load custom layout for ${mode}:`, e);
            }
        }
        return {};
    }
    
    saveCustomLayout(mode) {
        const key = `customControlsLayout_${mode}`;
        const layout = mode === 'singleplayer' ? this.customLayoutSingleplayer : this.customLayoutMultiplayer;
        localStorage.setItem(key, JSON.stringify(layout));
    }
    
    getCurrentLayout() {
        // Return the appropriate layout based on current game mode
        if (this.gameMode === 'multiplayer') {
            return this.customLayoutMultiplayer;
        }
        return this.customLayoutSingleplayer;
    }
    
    openControlsEditor() {
        this.controlsEditorActive = true;
        // Start in singleplayer mode
        this.editorLayoutMode = 'singleplayer';
        
        const editor = document.getElementById('controlsEditor');
        editor.classList.add('active');
        
        // Track where we opened from
        this.editorOpenedFrom = this.settingsOpenedFrom || 'mainMenu';
        
        // Hide settings menu
        this.ui.hideOverlay('settingsMenu');
        
        // If in a match, keep it paused and show game UI
        const wasInMatch = (this.gameState === 'playing' || this.gameState === 'paused');
        if (wasInMatch) {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
            // Hide pause menu so we can see the game UI elements
            this.ui.hideOverlay('pauseMenu');
        } else {
            // If in menu, show preview background with game canvas
            this.startEditorPreview();
        }
        
        // Apply the current mode's layout
        this.applyEditorLayout();
        
        // Update visibility based on mode
        this.updateEditorControlsVisibility();
        
        // Make on-screen elements editable
        this.setupEditableElements();
        
        // Setup editor controls
        this.setupEditorControls();
    }
    
    updateEditorControlsVisibility() {
        const mobileControls = document.getElementById('mobileControls');
        const mobileControlsP2 = document.getElementById('mobileControlsP2');
        const toggleBtn = document.getElementById('toggleLayoutModeBtn');
        
        if (this.editorLayoutMode === 'singleplayer') {
            if (mobileControls) mobileControls.classList.add('active');
            if (mobileControlsP2) mobileControlsP2.classList.remove('active');
            if (toggleBtn) toggleBtn.textContent = '🎮 Switch to Multiplayer';
        } else {
            if (mobileControls) mobileControls.classList.add('active');
            if (mobileControlsP2) mobileControlsP2.classList.add('active');
            if (toggleBtn) toggleBtn.textContent = '👤 Switch to Singleplayer';
        }
    }
    
    applyEditorLayout() {
        const layout = this.editorLayoutMode === 'singleplayer' 
            ? this.customLayoutSingleplayer 
            : this.customLayoutMultiplayer;
        
        Object.keys(layout).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const layoutData = layout[id];
                if (layoutData.left !== undefined) element.style.left = layoutData.left + 'px';
                if (layoutData.top !== undefined) element.style.top = layoutData.top + 'px';
                if (layoutData.width !== undefined) element.style.width = layoutData.width + 'px';
                if (layoutData.height !== undefined) element.style.height = layoutData.height + 'px';
                
                // Clear right/bottom if we set left/top
                if (layoutData.left !== undefined) element.style.right = 'auto';
                if (layoutData.top !== undefined) element.style.bottom = 'auto';
            }
        });
    }
    
    closeControlsEditor() {
        this.controlsEditorActive = false;
        const editor = document.getElementById('controlsEditor');
        editor.classList.remove('active');
        
        // Clean up editable elements
        this.editableElements.forEach(el => {
            el.element.classList.remove('editable-element');
            // Remove resize handles
            const handles = el.element.querySelectorAll('.resize-handle');
            handles.forEach(handle => handle.remove());
        });
        this.editableElements = [];
        
        // Check if we were editing from menu or from paused game
        const wasInMatch = (this.gameState === 'playing' || this.gameState === 'paused');
        
        if (!wasInMatch) {
            // We were in menu - hide the game screen
            this.ui.hideScreen('gameScreen');
            
            // Clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // If we were in a match, show pause menu again
            this.ui.showOverlay('pauseMenu');
        }
        
        // Apply custom layout
        this.applyCustomLayout();
        
        // Show settings menu again
        this.ui.showOverlay('settingsMenu');
    }
    
    startEditorPreview() {
        // Show the game screen to display arena and UI elements
        this.ui.showScreen('gameScreen');
        
        // Draw a sample arena background on the game canvas
        if (this.selectedArena) {
            drawArenaBackground(this.ctx, this.selectedArena, this.canvas.width, this.canvas.height, this.quality, 'quickplay', 1);
        } else {
            // Use a default arena if none selected
            const defaultArena = getArenaById('grass_field');
            if (defaultArena) {
                drawArenaBackground(this.ctx, defaultArena, this.canvas.width, this.canvas.height, this.quality, 'quickplay', 1);
            }
        }
        
        // Show BOTH P1 and P2 mobile controls for editing (even in single player)
        const mobileControls = document.getElementById('mobileControls');
        const mobileControlsP2 = document.getElementById('mobileControlsP2');
        if (mobileControls) mobileControls.classList.add('active');
        if (mobileControlsP2) mobileControlsP2.classList.add('active');
        
        // Make sure HUD is visible
        const gameHUD = document.getElementById('gameHUD');
        if (gameHUD) gameHUD.style.display = 'flex';
    }
    
    setupEditableElements() {
        this.editableElements = [];
        
        // Define editable elements based on current mode
        const elements = [];
        
        // Always include P1 controls and UI
        elements.push(
            { id: 'joystick', parentSelector: '.mobile-controls .joystick-container', name: 'P1 Joystick', allowResize: true },
            { id: 'jumpBtn', parentSelector: '.mobile-controls .action-buttons', name: 'P1 Jump Button', allowResize: true },
            { id: 'gameHUD', name: 'Score/Timer', allowResize: true },
            { id: 'pauseBtn', name: 'Pause Button', allowResize: true }
        );
        
        // Include P2 controls only in multiplayer mode
        if (this.editorLayoutMode === 'multiplayer') {
            elements.push(
                { id: 'joystickP2', parentSelector: '.mobile-controls-p2 .joystick-container', name: 'P2 Joystick', allowResize: true },
                { id: 'jumpBtnP2', parentSelector: '.mobile-controls-p2 .action-buttons', name: 'P2 Jump Button', allowResize: true }
            );
        }
        
        elements.forEach(config => {
            let element = document.getElementById(config.id);
            
            // For nested elements, we need to make the parent draggable
            if (config.parentSelector && element) {
                const parent = element.closest(config.parentSelector);
                if (parent) {
                    element = parent;
                }
            }
            
            if (element) {
                element.classList.add('editable-element');
                element.dataset.editableName = config.name;
                
                // Add resize handles if allowed
                if (config.allowResize) {
                    this.addResizeHandles(element);
                }
                
                this.editableElements.push({
                    element: element,
                    config: config
                });
            }
        });
    }
    
    addResizeHandles(element) {
        const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            handle.dataset.position = pos;
            element.appendChild(handle);
        });
    }
    
    setupEditorControls() {
        const saveBtn = document.getElementById('saveLayoutBtn');
        const resetBtn = document.getElementById('resetLayoutBtn');
        const toggleBtn = document.getElementById('toggleLayoutModeBtn');
        
        // Remove old listeners
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        resetBtn.replaceWith(resetBtn.cloneNode(true));
        toggleBtn.replaceWith(toggleBtn.cloneNode(true));
        
        // Get fresh references
        const newSaveBtn = document.getElementById('saveLayoutBtn');
        const newResetBtn = document.getElementById('resetLayoutBtn');
        const newToggleBtn = document.getElementById('toggleLayoutModeBtn');
        
        newSaveBtn.addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.saveLayoutAndExit();
        });
        
        newResetBtn.addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.resetLayoutToDefault();
        });
        
        newToggleBtn.addEventListener('click', () => {
            this.audio.playSound('ui_click');
            this.toggleLayoutMode();
        });
        
        // Setup drag and resize for all editable elements
        this.editableElements.forEach(({ element }) => {
            this.setupDragAndResize(element);
        });
    }
    
    toggleLayoutMode() {
        // Save current mode's positions before switching
        this.saveCurrentPositions();
        
        // Toggle mode
        this.editorLayoutMode = this.editorLayoutMode === 'singleplayer' ? 'multiplayer' : 'singleplayer';
        
        // Update control visibility
        this.updateEditorControlsVisibility();
        
        // Apply the new mode's layout
        this.applyEditorLayout();
        
        // Refresh editable elements
        this.refreshEditableElements();
    }
    
    refreshEditableElements() {
        // Clean up existing editable elements
        this.editableElements.forEach(el => {
            el.element.classList.remove('editable-element');
            const handles = el.element.querySelectorAll('.resize-handle');
            handles.forEach(handle => handle.remove());
        });
        this.editableElements = [];
        
        // Setup new editable elements for current mode
        this.setupEditableElements();
        
        // Setup drag/resize for new elements
        this.editableElements.forEach(({ element }) => {
            this.setupDragAndResize(element);
        });
    }
    
    setupDragAndResize(element) {
        // Remove any existing listeners by cloning and replacing
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // Update the reference in editableElements
        const editableIndex = this.editableElements.findIndex(e => e.element === element);
        if (editableIndex !== -1) {
            this.editableElements[editableIndex].element = newElement;
        }
        
        // Drag on element itself (but not on resize handles)
        newElement.addEventListener('mousedown', (e) => this.startDrag(e, newElement));
        newElement.addEventListener('touchstart', (e) => this.startDrag(e, newElement), { passive: false });
        
        // Resize on handles
        const handles = newElement.querySelectorAll('.resize-handle');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => this.startResize(e, newElement, handle));
            handle.addEventListener('touchstart', (e) => this.startResize(e, newElement, handle), { passive: false });
        });
    }
    
    startDrag(e, element) {
        // Don't drag if clicking on a resize handle
        if (e.target.classList.contains('resize-handle')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const touch = e.touches ? e.touches[0] : e;
        const rect = element.getBoundingClientRect();
        
        this.draggingElement = element;
        this.dragOffset = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        
        element.classList.add('dragging');
        
        // Remove any existing listeners first
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('touchmove', this.handleDragMove);
        document.removeEventListener('mouseup', this.endDrag);
        document.removeEventListener('touchend', this.endDrag);
        
        // Add global move and end listeners
        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('touchmove', this.handleDragMove, { passive: false });
        document.addEventListener('mouseup', this.endDrag);
        document.addEventListener('touchend', this.endDrag);
    }
    
    handleDragMove = (e) => {
        if (!this.draggingElement) return;
        
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        
        const newX = touch.clientX - this.dragOffset.x;
        const newY = touch.clientY - this.dragOffset.y;
        
        this.draggingElement.style.left = newX + 'px';
        this.draggingElement.style.top = newY + 'px';
        this.draggingElement.style.right = 'auto';
        this.draggingElement.style.bottom = 'auto';
    }
    
    endDrag = () => {
        if (this.draggingElement) {
            this.draggingElement.classList.remove('dragging');
            
            // Save position to the current mode's layout
            const layout = this.editorLayoutMode === 'singleplayer' 
                ? this.customLayoutSingleplayer 
                : this.customLayoutMultiplayer;
            
            const id = this.draggingElement.id;
            const rect = this.draggingElement.getBoundingClientRect();
            
            if (!layout[id]) layout[id] = {};
            layout[id].left = rect.left;
            layout[id].top = rect.top;
            
            this.draggingElement = null;
        }
        
        // Remove global listeners
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('touchmove', this.handleDragMove);
        document.removeEventListener('mouseup', this.endDrag);
        document.removeEventListener('touchend', this.endDrag);
    }
    
    startResize(e, element, handle) {
        e.preventDefault();
        e.stopPropagation();
        
        this.resizingElement = {
            element: element,
            handle: handle,
            startRect: element.getBoundingClientRect(),
            startTouch: e.touches ? e.touches[0] : e
        };
        
        element.classList.add('dragging');
        
        // Remove any existing listeners first
        document.removeEventListener('mousemove', this.handleResizeMove);
        document.removeEventListener('touchmove', this.handleResizeMove);
        document.removeEventListener('mouseup', this.endResize);
        document.removeEventListener('touchend', this.endResize);
        
        // Add global move and end listeners
        document.addEventListener('mousemove', this.handleResizeMove);
        document.addEventListener('touchmove', this.handleResizeMove, { passive: false });
        document.addEventListener('mouseup', this.endResize);
        document.addEventListener('touchend', this.endResize);
    }
    
    handleResizeMove = (e) => {
        if (!this.resizingElement) return;
        
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const { element, handle, startRect, startTouch } = this.resizingElement;
        
        const deltaX = touch.clientX - startTouch.clientX;
        const deltaY = touch.clientY - startTouch.clientY;
        
        const position = handle.dataset.position;
        
        // Calculate new size based on handle position
        let newWidth = startRect.width;
        let newHeight = startRect.height;
        let newLeft = startRect.left;
        let newTop = startRect.top;
        
        if (position.includes('right')) {
            newWidth = startRect.width + deltaX;
        } else if (position.includes('left')) {
            newWidth = startRect.width - deltaX;
            newLeft = startRect.left + deltaX;
        }
        
        if (position.includes('bottom')) {
            newHeight = startRect.height + deltaY;
        } else if (position.includes('top')) {
            newHeight = startRect.height - deltaY;
            newTop = startRect.top + deltaY;
        }
        
        // Apply minimum size
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);
        
        // Apply new dimensions
        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }
    
    endResize = () => {
        if (this.resizingElement) {
            const { element } = this.resizingElement;
            element.classList.remove('dragging');
            
            // Save dimensions to the current mode's layout
            const layout = this.editorLayoutMode === 'singleplayer' 
                ? this.customLayoutSingleplayer 
                : this.customLayoutMultiplayer;
            
            const id = element.id;
            const rect = element.getBoundingClientRect();
            
            if (!layout[id]) layout[id] = {};
            layout[id].width = rect.width;
            layout[id].height = rect.height;
            layout[id].left = rect.left;
            layout[id].top = rect.top;
            
            this.resizingElement = null;
        }
        
        // Remove global listeners
        document.removeEventListener('mousemove', this.handleResizeMove);
        document.removeEventListener('touchmove', this.handleResizeMove);
        document.removeEventListener('mouseup', this.endResize);
        document.removeEventListener('touchend', this.endResize);
    }
    
    saveLayoutAndExit() {
        this.saveCurrentPositions();
        this.closeControlsEditor();
    }
    
    saveCurrentPositions() {
        const layout = this.editorLayoutMode === 'singleplayer' 
            ? this.customLayoutSingleplayer 
            : this.customLayoutMultiplayer;
        
        this.editableElements.forEach(({ element }) => {
            const id = element.id;
            const rect = element.getBoundingClientRect();
            
            if (!layout[id]) layout[id] = {};
            layout[id].width = rect.width;
            layout[id].height = rect.height;
            layout[id].left = rect.left;
            layout[id].top = rect.top;
        });
        
        this.saveCustomLayout(this.editorLayoutMode);
    }
    
    resetLayoutToDefault() {
        if (confirm(`Reset ${this.editorLayoutMode} layout to default positions and sizes?`)) {
            // Clear the current mode's layout
            if (this.editorLayoutMode === 'singleplayer') {
                this.customLayoutSingleplayer = {};
                this.saveCustomLayout('singleplayer');
            } else {
                this.customLayoutMultiplayer = {};
                this.saveCustomLayout('multiplayer');
            }
            
            // Remove inline styles
            this.editableElements.forEach(({ element }) => {
                element.style.left = '';
                element.style.top = '';
                element.style.right = '';
                element.style.bottom = '';
                element.style.width = '';
                element.style.height = '';
            });
        }
    }
    
    applyCustomLayout() {
        const layout = this.getCurrentLayout();
        Object.keys(layout).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const layoutData = layout[id];
                if (layoutData.left !== undefined) element.style.left = layoutData.left + 'px';
                if (layoutData.top !== undefined) element.style.top = layoutData.top + 'px';
                if (layoutData.width !== undefined) element.style.width = layoutData.width + 'px';
                if (layoutData.height !== undefined) element.style.height = layoutData.height + 'px';
                
                // Clear right/bottom if we set left/top
                if (layout.left !== undefined) element.style.right = 'auto';
                if (layout.top !== undefined) element.style.bottom = 'auto';
            }
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Clean up old global achievement data (migration from older version)
    if (localStorage.getItem('achievementProgress')) {
        localStorage.removeItem('achievementProgress');
    }
    
    // Load cosmetic images (PNG assets)
    console.log('Loading cosmetic images...');
    await loadCosmeticImages();
    
    const game = new Game();
    // Make game accessible globally for mode change detection
    window.game = game;
    
    // Auto-enter fullscreen on mobile devices only
    // This helps with mobile display issues
    setTimeout(() => {
        if (window.innerWidth <= 768) { // Mobile/tablet only
            game.toggleFullscreen();
        }
    }, 500);
});
