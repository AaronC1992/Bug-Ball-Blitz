// menuBackground.js - Animated AI match background for main menu

import { Physics } from './physics.js';
import { AI } from './ai.js';
import { getBugById } from './bugs.js';
import { getArenaById, drawArenaBackground } from './arenas.js';

export class MenuBackground {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.physics = null;
        this.ball = null;
        this.players = [];
        this.ais = [];
        this.arena = null;
        this.animationId = null;
        this.isRunning = false;
        this.frameCount = 0;
        
        // Celebration tracking
        this.celebrationActive = false;
        this.celebrationFrames = 0;
        this.celebrationDuration = 120; // 2 seconds at 60fps
        this.celebrationPlayer = null;
        this.celebrationEmojis = ['🎉', '⚡', '💪', '🔥', '⭐', '🏆', '✨', '🎊', '🌟', '💥'];
        
        // Interactive ball dragging
        this.isDraggingBall = false;
        this.dragStartTime = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        console.log('MenuBackground constructor - canvas dimensions:', canvas.width, 'x', canvas.height);
        
        if (canvas.width > 0 && canvas.height > 0) {
            this.setupMatch();
            this.setupInteraction();
        } else {
            console.warn('Canvas has zero dimensions, skipping setup');
        }
    }
    
    setupMatch() {
        console.log('Setting up match with canvas:', this.canvas.width, 'x', this.canvas.height);
        
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            console.error('Cannot setup match - canvas has zero dimensions');
            return;
        }
        
        try {
            // Randomly select arena - use correct arena IDs
            const arenaIds = ['grassField', 'dirtPatch', 'leafArena', 'desertOasis', 'snowyPark', 
                             'volcanicRock', 'mushroomForest', 'beachSand', 'moonCrater', 
                             'autumnLeaves', 'iceCave', 'gardenPond', 'neonCity', 'candyLand', 
                             'jungleVines', 'crystalCavern'];
            const randomArena = arenaIds[Math.floor(Math.random() * arenaIds.length)];
            this.arena = getArenaById(randomArena);
            console.log('Selected arena:', randomArena);
            
            // Randomly select match type: 1v1, 1v2, or 2v2
            const matchTypes = ['1v1', '1v2', '2v2'];
            const matchType = matchTypes[Math.floor(Math.random() * matchTypes.length)];
            console.log('Selected match type:', matchType);
            
            // Random bug types - use correct bug IDs
            const bugTypes = ['stagBeetle', 'grasshopper', 'ladybug', 'ant', 'spider'];
            
            // Initialize physics
            this.physics = new Physics(this.canvas.width, this.canvas.height);
            
            // Setup ball
            this.ball = {
                x: this.canvas.width / 2,
                y: this.canvas.height * 0.5,
                vx: 0,
                vy: 0,
                radius: 15
            };
            
            // Clear previous players and AIs
            this.players = [];
            this.ais = [];
            
            // Setup players based on match type
            if (matchType === '1v1') {
                this.setupPlayer1('left', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
                this.setupPlayer2('right', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
            } else if (matchType === '1v2') {
                this.setupPlayer1('left', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
                this.setupPlayer2('right', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
                this.setupPlayer3('right', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
            } else { // 2v2
                this.setupPlayer1('left', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
                this.setupPlayer1b('left', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
                this.setupPlayer2('right', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
                this.setupPlayer3('right', bugTypes[Math.floor(Math.random() * bugTypes.length)]);
            }
            
            console.log('Match setup complete - players:', this.players.length, 'AIs:', this.ais.length);
        } catch (error) {
            console.error('Error setting up match:', error);
        }
    }
    
    setupPlayer1(side, bugType) {
        const bug = getBugById(bugType);
        if (!bug) {
            console.error('Bug not found:', bugType);
            return;
        }
        const player = {
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: this.physics.groundY - 30,
            vx: 0,
            vy: 0,
            width: 50,
            height: 40,
            grounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            color: bug.color,
            bugName: bug.name,
            bug: bug  // Store bug reference for physics
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        // AI constructor: (difficulty, player, ball, physics, side)
        this.ais.push(new AI(difficulty, player, this.ball, this.physics, 'left'));
    }
    
    setupPlayer1b(side, bugType) {
        const bug = getBugById(bugType);
        if (!bug) {
            console.error('Bug not found:', bugType);
            return;
        }
        const player = {
            x: side === 'left' ? 200 : this.canvas.width - 200,
            y: this.physics.groundY - 30,
            vx: 0,
            vy: 0,
            width: 50,
            height: 40,
            grounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            color: bug.color,
            bugName: bug.name,
            bug: bug  // Store bug reference for physics
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        // AI constructor: (difficulty, player, ball, physics, side)
        this.ais.push(new AI(difficulty, player, this.ball, this.physics, 'left'));
    }
    
    setupPlayer2(side, bugType) {
        const bug = getBugById(bugType);
        if (!bug) {
            console.error('Bug not found:', bugType);
            return;
        }
        const player = {
            x: side === 'right' ? this.canvas.width - 150 : 150,
            y: this.physics.groundY - 30,
            vx: 0,
            vy: 0,
            width: 50,
            height: 40,
            grounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            color: bug.color,
            bugName: bug.name,
            bug: bug  // Store bug reference for physics
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        // AI constructor: (difficulty, player, ball, physics, side)
        this.ais.push(new AI(difficulty, player, this.ball, this.physics, side));
    }
    
    setupPlayer3(side, bugType) {
        const bug = getBugById(bugType);
        if (!bug) {
            console.error('Bug not found:', bugType);
            return;
        }
        const player = {
            x: side === 'right' ? this.canvas.width - 200 : 200,
            y: this.physics.groundY - 30,
            vx: 0,
            vy: 0,
            width: 50,
            height: 40,
            grounded: true,
            moveLeft: false,
            moveRight: false,
            jump: false,
            color: bug.color,
            bugName: bug.name,
            bug: bug  // Store bug reference for physics
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        // AI constructor: (difficulty, player, ball, physics, side)
        this.ais.push(new AI(difficulty, player, this.ball, this.physics, 'right'));
    }
    
    setupInteraction() {
        // Mouse/touch events for ball dragging
        const getEventPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };
        
        const handleStart = (e) => {
            const pos = getEventPos(e);
            this.mouseX = pos.x;
            this.mouseY = pos.y;
            
            // Check if clicking/touching the ball
            if (this.ball) {
                const distance = Math.hypot(this.mouseX - this.ball.x, this.mouseY - this.ball.y);
                if (distance < 30) { // Ball radius
                    this.isDraggingBall = true;
                    this.dragStartTime = Date.now();
                    this.lastMouseX = this.mouseX;
                    this.lastMouseY = this.mouseY;
                    e.preventDefault();
                }
            }
        };
        
        const handleMove = (e) => {
            const pos = getEventPos(e);
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            this.mouseX = pos.x;
            this.mouseY = pos.y;
            
            if (this.isDraggingBall) {
                e.preventDefault();
            }
        };
        
        const handleEnd = (e) => {
            if (this.isDraggingBall) {
                // Calculate throw velocity based on drag speed
                const dragDuration = (Date.now() - this.dragStartTime) / 1000;
                const velocityX = (this.mouseX - this.lastMouseX) / Math.max(dragDuration, 0.016);
                const velocityY = (this.mouseY - this.lastMouseY) / Math.max(dragDuration, 0.016);
                
                // Apply velocity to ball (with some dampening)
                this.ball.vx = velocityX * 0.5;
                this.ball.vy = velocityY * 0.5;
                
                this.isDraggingBall = false;
                e.preventDefault();
            }
        };
        
        // Mouse events
        this.canvas.addEventListener('mousedown', handleStart);
        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('mouseup', handleEnd);
        this.canvas.addEventListener('mouseleave', handleEnd);
        
        // Touch events
        this.canvas.addEventListener('touchstart', handleStart, { passive: false });
        this.canvas.addEventListener('touchmove', handleMove, { passive: false });
        this.canvas.addEventListener('touchend', handleEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', handleEnd, { passive: false });
    }
    
    start() {
        if (!this.physics || !this.arena) {
            console.error('Cannot start - physics or arena not initialized');
            return;
        }
        console.log('Starting menu background animation');
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        console.log('Stopping menu background animation');
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            console.log('Menu background animating - frame:', this.frameCount);
        }
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    update() {
        // Handle ball dragging
        if (this.isDraggingBall && this.ball) {
            this.ball.x = this.mouseX;
            this.ball.y = this.mouseY;
            this.ball.vx = 0;
            this.ball.vy = 0;
            return; // Skip normal physics when dragging
        }
        
        // Update celebration if active
        if (this.celebrationActive) {
            this.celebrationFrames++;
            if (this.celebrationFrames >= this.celebrationDuration) {
                this.celebrationActive = false;
                this.celebrationFrames = 0;
                this.celebrationPlayer = null;
            }
            return; // Don't update game during celebration
        }
        
        // Update AI decisions
        this.ais.forEach(ai => ai.update());
        
        // Update player physics - pass bug object for stats
        this.players.forEach(player => {
            this.physics.updatePlayer(player, player.bug);
        });
        
        // Update ball physics
        this.physics.updateBall(this.ball);
        
        // Check ball collisions with players - pass bug object for stats
        this.players.forEach(player => {
            this.physics.checkBallPlayerCollision(this.ball, player, player.bug);
        });
        
        // Check for goals and reset
        const goal = this.physics.checkGoal(this.ball);
        if (goal) {
            // Find the player who scored (closest to ball or last to touch)
            let scoringPlayer = this.players[0];
            let minDistance = Infinity;
            this.players.forEach(player => {
                const distance = Math.hypot(player.x - this.ball.x, player.y - this.ball.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    scoringPlayer = player;
                }
            });
            
            // Trigger celebration
            this.celebrationActive = true;
            this.celebrationFrames = 0;
            this.celebrationPlayer = scoringPlayer;
            
            // Reset ball to center after celebration
            setTimeout(() => {
                this.ball.x = this.canvas.width / 2;
                this.ball.y = this.canvas.height * 0.5;
                this.ball.vx = 0;
                this.ball.vy = 0;
                
                // Occasionally randomize the match
                if (Math.random() < 0.3) {
                    this.setupMatch();
                }
            }, (this.celebrationDuration / 60) * 1000);
        }
    }
    
    render() {
        // Clear canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw arena background
        if (this.arena) {
            drawArenaBackground(this.ctx, this.arena, this.canvas.width, this.canvas.height);
        }
        
        // Draw goals with transparency
        this.ctx.globalAlpha = 0.5;
        this.drawGoals();
        this.ctx.globalAlpha = 1;
        
        // Draw ball (full color)
        this.drawBall();
        
        // Draw players (full color)
        this.players.forEach(player => {
            this.drawPlayer(player);
        });
        
        // Draw celebration if active
        if (this.celebrationActive && this.celebrationPlayer) {
            this.drawCelebration();
        }
    }
    
    drawGoals() {
        const goalWidth = 20;
        const goalHeight = 120;
        const groundY = this.physics.groundY;
        
        // Left goal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(0, groundY - goalHeight, goalWidth, goalHeight);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, groundY - goalHeight, goalWidth, goalHeight);
        
        // Right goal
        this.ctx.fillRect(this.canvas.width - goalWidth, groundY - goalHeight, goalWidth, goalHeight);
        this.ctx.strokeRect(this.canvas.width - goalWidth, groundY - goalHeight, goalWidth, goalHeight);
    }
    
    drawBall() {
        this.ctx.save();
        this.ctx.globalAlpha = 1.0; // Force full opacity
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚽', this.ball.x, this.ball.y);
        this.ctx.restore();
    }
    
    drawPlayer(player) {
        this.ctx.save();
        
        // Draw as a colored circle with darker outline
        this.ctx.fillStyle = player.color;
        this.ctx.strokeStyle = this.darkenColor(player.color);
        this.ctx.lineWidth = 3;
        
        // Draw body
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y - player.height / 2, player.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw simple eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(player.x - 8, player.y - player.height / 2 - 5, 4, 0, Math.PI * 2);
        this.ctx.arc(player.x + 8, player.y - player.height / 2 - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(player.x - 8, player.y - player.height / 2 - 5, 2, 0, Math.PI * 2);
        this.ctx.arc(player.x + 8, player.y - player.height / 2 - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawCelebration() {
        if (!this.celebrationPlayer) return;
        
        const player = this.celebrationPlayer;
        const progress = this.celebrationFrames / this.celebrationDuration;
        
        // Pick random emojis for this celebration
        const emojiCount = 8;
        const emojis = [];
        for (let i = 0; i < emojiCount; i++) {
            emojis.push(this.celebrationEmojis[Math.floor(Math.random() * this.celebrationEmojis.length)]);
        }
        
        this.ctx.save();
        this.ctx.globalAlpha = 1.0; // Force full opacity for celebrations
        
        // Draw floating emojis around the player
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        emojis.forEach((emoji, index) => {
            const angle = (index / emojiCount) * Math.PI * 2;
            const radius = 60 + Math.sin(progress * Math.PI * 4) * 20;
            const x = player.x + Math.cos(angle + progress * Math.PI * 2) * radius;
            const y = player.y - player.height / 2 + Math.sin(angle + progress * Math.PI * 2) * radius;
            
            this.ctx.fillText(emoji, x, y);
        });
        
        // Draw "GOAL!" text (full opacity)
        this.ctx.font = 'bold 40px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;
        const textY = player.y - player.height - 80;
        this.ctx.strokeText('GOAL!', player.x, textY);
        this.ctx.fillText('GOAL!', player.x, textY);
        
        this.ctx.restore();
    }
    
    darkenColor(color) {
        // Simple color darkening
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 50);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 50);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 50);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
