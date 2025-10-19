// main.js - Main game controller and orchestration

import { UIManager } from './ui.js';
import { SaveSystem } from './saveSystem.js';
import { getBugById } from './bugs.js';
import { getArenaById, drawArenaBackground } from './arenas.js';
import { Physics } from './physics.js';
import { AI, MultiAI } from './ai.js';
import { getCelebrationArray, getCelebrationById, checkCelebrationUnlock, drawCelebration } from './celebrations.js';
import { MenuBackground } from './menuBackground.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager(this);
        
        // Menu background
        this.menuBackgroundCanvas = document.getElementById('menuBackgroundCanvas');
        this.menuBackgroundCtx = this.menuBackgroundCanvas.getContext('2d');
        this.menuBackground = null;
        
        // Game state
        this.gameMode = null; // 'tower', 'quickplay', 'multiplayer'
        this.gameState = 'menu'; // 'menu', 'countdown', 'playing', 'paused', 'ended'
        this.difficulty = 'medium';
        this.towerLevel = 1;
        
        // Match settings
        this.matchTimeLimit = 120; // 2 minutes
        this.matchTimeElapsed = 0; // Time elapsed in seconds
        this.lastFrameTime = null; // For delta time calculation
        this.countdownValue = 5; // Countdown before match starts
        this.countdownStartTime = 0;
        
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
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize menu background
        try {
            this.resizeMenuBackgroundCanvas();
            if (this.menuBackgroundCanvas && this.menuBackgroundCtx) {
                this.menuBackground = new MenuBackground(this.menuBackgroundCanvas, this.menuBackgroundCtx);
                this.menuBackground.start();
                console.log('Menu background initialized successfully');
            } else {
                console.error('Menu background canvas or context not found');
            }
        } catch (error) {
            console.error('Error initializing menu background:', error);
        }
    }
    
    resizeMenuBackgroundCanvas() {
        const titleScreen = document.getElementById('titleScreen');
        if (titleScreen) {
            this.menuBackgroundCanvas.width = titleScreen.clientWidth;
            this.menuBackgroundCanvas.height = titleScreen.clientHeight;
            console.log('Menu background canvas resized:', this.menuBackgroundCanvas.width, 'x', this.menuBackgroundCanvas.height);
        } else {
            console.error('Title screen element not found');
        }
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameScreen');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        if (this.physics) {
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
            this.startTowerCampaign();
        });
        
        document.getElementById('quickPlayBtn').addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        document.getElementById('localMultiplayerBtn').addEventListener('click', () => {
            this.startMultiplayer();
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.difficulty;
                this.startQuickPlay();
            });
        });
        
        document.getElementById('cancelDifficultyBtn').addEventListener('click', () => {
            this.ui.showScreen('mainMenu');
        });
        
        // Settings menu (only accessible from pause menu)
        document.getElementById('pauseSettingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
        
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.closeSettings();
        });
        
        document.getElementById('touchControlsToggle').addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.setTouchControlsPreference(e.target.checked);
        });
        
        // Pause menu
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('quitToMenuBtn').addEventListener('click', () => {
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
        
        this.startMatch();
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
            radius: 15
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
        
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        
        // Show level info if in tower mode
        const levelInfoEl = document.getElementById('levelInfo');
        if (this.gameMode === 'tower') {
            const config = this.getTowerLevelConfig(this.towerLevel);
            levelInfoEl.textContent = `Level ${this.towerLevel}: ${config.name}`;
            levelInfoEl.style.display = 'block';
        } else {
            levelInfoEl.style.display = 'none';
        }
        
        // Start with countdown
        this.gameState = 'countdown';
        this.countdownValue = 5;
        this.initialCountdownValue = 5;
        this.countdownStartTime = Date.now();
        
        // Show touch controls based on user preference or auto-detection (after state is set)
        this.updateTouchControlsVisibility();
        
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState === 'countdown') {
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
        drawArenaBackground(this.ctx, this.selectedArena, this.canvas.width, this.canvas.height);
        
        // Draw goals
        this.drawGoals();
        
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
    }
    
    update() {
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
        
        // Check collisions
        this.physics.checkBallPlayerCollision(this.ball, this.player1, this.selectedBug1);
        this.physics.checkBallPlayerCollision(this.ball, this.player2, this.selectedBug2);
        
        if (this.player3) {
            this.physics.checkBallPlayerCollision(this.ball, this.player3, this.selectedBug3);
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
        drawArenaBackground(this.ctx, this.selectedArena, this.canvas.width, this.canvas.height);
        
        // Draw goals
        this.drawGoals();
        
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
        // Soccer ball
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Black pentagons
        this.ctx.fillStyle = 'black';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5);
            const x = this.ball.x + Math.cos(angle) * this.ball.radius * 0.6;
            const y = this.ball.y + Math.sin(angle) * this.ball.radius * 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.ball.radius * 0.25, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.ball.x, this.physics.groundY + 5, this.ball.radius * 0.8, this.ball.radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlayer(player, bug) {
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
        
        // Shadow
        this.ctx.restore();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(player.x, this.physics.groundY + 5, player.width * 0.5, player.height * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    handleGoal(goal) {
        // Prevent multiple goal detections
        if (this.gameState !== 'playing') {
            return;
        }
        
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
        }
        
        // Only show celebration if the human player scored (player 1)
        if (scoringPlayer === 'player1') {
            this.celebrationActive = true;
            this.celebrationFrame = 0;
            this.celebrationSide = goal;
            this.celebrationType = (profile && profile.selectedCelebration) ? profile.selectedCelebration : 'classic';
        } else {
            this.celebrationActive = false;
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
        console.log('[Settings] Touch controls toggled:', enabled);
        console.log('[Settings] Current game state:', this.gameState);
        this.touchControlsEnabled = enabled;
        localStorage.setItem('touchControlsEnabled', enabled.toString());
        this.updateTouchControlsVisibility();
    }
    
    updateTouchControlsVisibility() {
        console.log('[Touch Controls] Update called, game state:', this.gameState);
        
        // Allow updating during gameplay (playing, countdown, or paused)
        if (this.gameState !== 'playing' && this.gameState !== 'countdown' && this.gameState !== 'paused') {
            console.log('[Touch Controls] Not in active game state, skipping');
            return;
        }
        
        const mobileControls = document.getElementById('mobileControls');
        const mobileControlsP2 = document.getElementById('mobileControlsP2');
        
        // If user has explicitly enabled/disabled, use that preference
        // Otherwise, use auto-detection (isMobile/isTablet)
        const shouldShow = this.touchControlsEnabled !== null 
            ? this.touchControlsEnabled 
            : (this.ui.isMobile || this.ui.isTablet);
        
        console.log('[Touch Controls] Should show:', shouldShow);
        console.log('[Touch Controls] touchControlsEnabled:', this.touchControlsEnabled);
        console.log('[Touch Controls] isMobile:', this.ui.isMobile, 'isTablet:', this.ui.isTablet);
        
        if (shouldShow) {
            mobileControls.classList.add('active');
            console.log('[Touch Controls] Added active class to player 1 controls');
            if (this.gameMode === 'multiplayer' && (this.ui.isTablet || this.touchControlsEnabled)) {
                mobileControlsP2.classList.add('active');
                console.log('[Touch Controls] Added active class to player 2 controls');
            }
        } else {
            mobileControls.classList.remove('active');
            mobileControlsP2.classList.remove('active');
            console.log('[Touch Controls] Removed active class from controls');
        }
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.lastFrameTime = null; // Pause timer
            cancelAnimationFrame(this.animationId);
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
        
        // Stop menu background when leaving title screen
        if (this.menuBackground) {
            this.menuBackground.stop();
        }
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
    const game = new Game();
    // Make game accessible globally for mode change detection
    window.game = game;
});
