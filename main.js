// main.js - Main game controller and orchestration

import { UIManager } from './ui.js';
import { SaveSystem } from './saveSystem.js';
import { getBugById } from './bugs.js';
import { getArenaById, drawArenaBackground } from './arenas.js';
import { Physics } from './physics.js';
import { AI, MultiAI } from './ai.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        
        // Game state
        this.gameMode = null; // 'tower', 'quickplay', 'multiplayer'
        this.gameState = 'menu'; // 'menu', 'countdown', 'playing', 'paused', 'ended'
        this.difficulty = 'medium';
        this.towerLevel = 1;
        
        // Match settings - Simple Timer
        this.matchDuration = 120; // 2 minutes in seconds
        this.matchTimer = 120; // Current time remaining
        this.timerPaused = true; // Timer starts paused during countdown
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
        
        // Animation
        this.animationId = null;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupMobileControls();
    }
    
    initializeCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
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
    }
    
    setupMobileControls() {
        if (!this.ui.isMobile) return;
        
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
        
        // Player 2 Controls (tablets only)
        if (!this.ui.isTablet) return;
        
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
        // Levels 1-4: Single AI with increasing difficulty
        if (level === 1) return { difficulty: 'easy', aiCount: 1 };
        if (level === 2) return { difficulty: 'medium', aiCount: 1 };
        if (level === 3) return { difficulty: 'hard', aiCount: 1 };
        if (level === 4) return { difficulty: 'pro', aiCount: 1 };
        
        // Levels 5-8: Two AIs with increasing difficulty
        if (level === 5) return { difficulty: 'easy', aiCount: 2 };
        if (level === 6) return { difficulty: 'medium', aiCount: 2 };
        if (level === 7) return { difficulty: 'hard', aiCount: 2 };
        if (level === 8) return { difficulty: 'pro', aiCount: 2 };
        
        // Beyond level 8 (shouldn't happen, but just in case)
        return { difficulty: 'pro', aiCount: 2 };
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
        
        if (this.ui.isMobile) {
            document.getElementById('mobileControls').classList.add('active');
            // Show P2 controls for multiplayer on tablets
            if (this.ui.isTablet && this.gameMode === 'multiplayer') {
                document.getElementById('mobileControlsP2').classList.add('active');
            }
        }
        
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
        
        // Reset scores and time - CRITICAL RESET SECTION
        this.score1 = 0;
        this.score2 = 0;
        
        // Reset scores and timer for new match
        this.score1 = 0;
        this.score2 = 0;
        this.matchTimer = this.matchDuration;
        this.timerPaused = true;
        
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        
        // Start with countdown
        this.gameState = 'countdown';
        this.countdownValue = 5;
        this.initialCountdownValue = 5;
        this.countdownStartTime = Date.now();
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState === 'countdown') {
            this.updateCountdown();
            this.renderCountdown();
        } else if (this.gameState === 'playing') {
            this.update();
            this.render();
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
            this.timerPaused = false; // Start/resume the timer
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
        // Simple timer - counts down 1 second per 60 frames (assuming 60 FPS)
        if (!this.timerPaused) {
            this.matchTimer -= 1/60; // Decrease by 1/60th of a second each frame
            this.updateTimerDisplay();
            
            // Check if time is up
            if (this.matchTimer <= 0) {
                this.matchTimer = 0;
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
        
        // Check goals
        const goal = this.physics.checkGoal(this.ball);
        if (goal) {
            this.handleGoal(goal);
        }
    }
    
    updatePlayer1Input() {
        if (this.ui.isMobile) {
            // Mobile controls
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
        if (this.ui.isTablet && this.gameMode === 'multiplayer') {
            // Touch controls for player 2 on tablets
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
        if (goal === 'left') {
            this.score2++;
        } else {
            this.score1++;
        }
        
        this.updateScoreDisplay();
        
        // Reset positions
        this.physics.resetBall(this.ball);
        this.physics.resetPlayer(this.player1, 'left');
        this.physics.resetPlayer(this.player2, 'right');
        
        if (this.player3) {
            this.physics.resetPlayer(this.player3, 'right');
        }
        
        // Check if match should end
        if (this.score1 >= 5 || this.score2 >= 5) {
            this.endMatch();
        } else {
            // Pause timer and start countdown after goal
            this.timerPaused = true;
            this.gameState = 'countdown';
            this.countdownValue = 3;
            this.initialCountdownValue = 3;
            this.countdownStartTime = Date.now();
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('player1Score').textContent = this.score1;
        document.getElementById('player2Score').textContent = this.score2;
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.matchTimer / 60);
        const seconds = Math.floor(this.matchTimer % 60);
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
            titleEl.textContent = 'Victory!';
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
        
        // Hide continue button if not tower mode or if lost
        const continueBtn = document.getElementById('continueBtn');
        if (this.gameMode === 'tower' && playerWon && this.towerLevel < 8) {
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }
        
        this.ui.showOverlay('matchEndScreen');
    }
    
    showTowerVictory() {
        const statsEl = document.getElementById('towerVictoryStats');
        statsEl.innerHTML = `
            <div class="stat-row">
                <span>Wins:</span>
                <span style="color: #7ed321;">${this.ui.currentProfile.stats.wins}</span>
            </div>
            <div class="stat-row">
                <span>Goals Scored:</span>
                <span style="color: #7ed321;">${this.ui.currentProfile.stats.goalsScored}</span>
            </div>
        `;
        
        this.ui.showOverlay('towerVictoryScreen');
    }
    
    handleMatchContinue() {
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
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.timerPaused = true;
            cancelAnimationFrame(this.animationId);
            this.ui.showOverlay('pauseMenu');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.timerPaused = false;
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
    }
    
    handleDeviceModeChange(isMobile, isTablet) {
        // If not in a match, nothing to do
        if (this.gameState !== 'playing') return;
        
        const mobileControls = document.getElementById('mobileControls');
        const mobileControlsP2 = document.getElementById('mobileControlsP2');
        
        if (isMobile) {
            // Switched to tablet/touch mode - show controls
            mobileControls.classList.add('active');
            
            // Show P2 controls if in multiplayer on tablet
            if (isTablet && this.gameMode === 'multiplayer') {
                mobileControlsP2.classList.add('active');
            }
        } else {
            // Switched to laptop/PC mode - hide controls
            mobileControls.classList.remove('active');
            mobileControlsP2.classList.remove('active');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    // Make game accessible globally for mode change detection
    window.game = game;
});
