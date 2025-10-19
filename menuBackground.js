// menuBackground.js - Animated AI match background for main menu

import { Physics } from './physics.js';
import { AI, MultiAI } from './ai.js';
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
        
        console.log('MenuBackground constructor - canvas dimensions:', canvas.width, 'x', canvas.height);
        
        if (canvas.width > 0 && canvas.height > 0) {
            this.setupMatch();
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
            bugName: bug.name
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        this.ais.push(new AI(player, this.ball, 'left', difficulty));
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
            bugName: bug.name
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        this.ais.push(new AI(player, this.ball, 'left', difficulty));
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
            bugName: bug.name
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        if (this.players.length >= 3) {
            // 1v2 or 2v2 - use MultiAI for coordination
            const teammate = this.players[this.players.length - 2];
            this.ais.push(new MultiAI(player, teammate, this.ball, 'right', difficulty));
        } else {
            this.ais.push(new AI(player, this.ball, 'right', difficulty));
        }
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
            bugName: bug.name
        };
        this.players.push(player);
        
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        this.ais.push(new AI(player, this.ball, 'right', difficulty));
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
        // Update AI decisions
        this.ais.forEach(ai => ai.update());
        
        // Update player physics
        this.players.forEach(player => {
            this.physics.updatePlayer(player);
        });
        
        // Update ball physics
        this.physics.updateBall(this.ball);
        
        // Check ball collisions with players
        this.players.forEach(player => {
            this.physics.checkBallPlayerCollision(this.ball, player);
        });
        
        // Check for goals and reset
        const goal = this.physics.checkGoal(this.ball);
        if (goal) {
            // Reset ball to center
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height * 0.5;
            this.ball.vx = 0;
            this.ball.vy = 0;
            
            // Occasionally randomize the match
            if (Math.random() < 0.3) {
                this.setupMatch();
            }
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
        
        // Draw ball
        this.drawBall();
        
        // Draw players with slight transparency
        this.ctx.globalAlpha = 0.7;
        this.players.forEach(player => {
            this.drawPlayer(player);
        });
        this.ctx.globalAlpha = 1;
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
        this.ctx.globalAlpha = 0.7;
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
    
    darkenColor(color) {
        // Simple color darkening
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 50);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 50);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 50);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
