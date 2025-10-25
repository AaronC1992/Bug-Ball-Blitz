// ai.js - AI opponent behavior

export class AI {
    constructor(difficulty, player, ball, physics, side = 'right') {
        this.difficulty = difficulty;
        this.player = player;
        this.ball = ball;
        this.physics = physics;
        this.side = side; // 'left' or 'right' - which goal to defend
        
        // AI parameters based on difficulty
        this.params = this.getDifficultyParams(difficulty);
        
        // AI state
        this.reactionTimer = 0;
        this.targetX = player.x;
        this.shouldJump = false;
        this.lastBallTouch = 0; // Frames since last touched ball
        this.strategyCooldown = 0; // Cooldown for strategy changes
        this.currentStrategy = 'defend'; // 'defend', 'attack', 'intercept'
    }
    
    getDifficultyParams(difficulty) {
        const params = {
            easy: {
                reactionTime: 35,
                predictionAccuracy: 0.25,
                jumpTiming: 0.35,
                aggressiveness: 0.4,
                maxSpeed: 0.55,
                positioning: 0.3,
                shotAccuracy: 0.25,
                defensiveAwareness: 0.3
            },
            medium: {
                reactionTime: 22,
                predictionAccuracy: 0.55,
                jumpTiming: 0.60,
                aggressiveness: 0.65,
                maxSpeed: 0.75,
                positioning: 0.6,
                shotAccuracy: 0.55,
                defensiveAwareness: 0.6
            },
            hard: {
                reactionTime: 12,
                predictionAccuracy: 0.80,
                jumpTiming: 0.80,
                aggressiveness: 0.85,
                maxSpeed: 0.92,
                positioning: 0.85,
                shotAccuracy: 0.80,
                defensiveAwareness: 0.85
            },
            pro: {
                reactionTime: 6,
                predictionAccuracy: 0.95,
                jumpTiming: 0.92,
                aggressiveness: 0.95,
                maxSpeed: 1.0,
                positioning: 0.95,
                shotAccuracy: 0.92,
                defensiveAwareness: 0.95
            }
        };
        
        return params[difficulty] || params.medium;
    }
    
    update() {
        this.reactionTimer++;
        this.lastBallTouch++;
        this.strategyCooldown = Math.max(0, this.strategyCooldown - 1);
        
        if (this.reactionTimer >= this.params.reactionTime) {
            this.reactionTimer = 0;
            this.evaluateStrategy();
            this.calculateAction();
        }
        
        this.executeAction();
    }
    
    evaluateStrategy() {
        // Only change strategy if cooldown expired
        if (this.strategyCooldown > 0) return;
        
        const ballX = this.ball.x;
        const playerX = this.player.x;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        
        const ballDistanceToOwnGoal = Math.abs(ballX - ownGoalX);
        const ballDistanceToOpponentGoal = Math.abs(ballX - opponentGoalX);
        const distanceToBall = Math.abs(ballX - playerX);
        
        // Determine field zones
        const inDefensiveThird = this.side === 'right' ? 
            ballX > this.physics.width * 0.65 : 
            ballX < this.physics.width * 0.35;
        
        const inAttackingThird = this.side === 'right' ? 
            ballX < this.physics.width * 0.35 : 
            ballX > this.physics.width * 0.65;
        
        // PRIORITY 1: Emergency defense
        if (ballDistanceToOwnGoal < 200) {
            this.currentStrategy = 'defend';
            this.strategyCooldown = 20;
            return;
        }
        
        // PRIORITY 2: Attack when ball is near opponent goal
        if (ballDistanceToOpponentGoal < 250 && distanceToBall < 150) {
            this.currentStrategy = 'attack';
            this.strategyCooldown = 30;
            return;
        }
        
        // PRIORITY 3: Intercept if ball is moving
        const ballSpeed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        if (ballSpeed > 3 && distanceToBall < 200) {
            this.currentStrategy = 'intercept';
            this.strategyCooldown = 15;
            return;
        }
        
        // Default: Choose based on position
        if (inDefensiveThird) {
            this.currentStrategy = 'defend';
        } else if (inAttackingThird) {
            this.currentStrategy = 'attack';
        } else {
            // Midfield - be aggressive based on difficulty
            this.currentStrategy = Math.random() < this.params.aggressiveness ? 'attack' : 'defend';
        }
        
        this.strategyCooldown = 40;
    }
    
    calculateAction() {
        switch (this.currentStrategy) {
            case 'defend':
                this.defendStrategy();
                break;
            case 'attack':
                this.attackStrategy();
                break;
            case 'intercept':
                this.interceptStrategy();
                break;
        }
    }
    
    defendStrategy() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const playerX = this.player.x;
        const playerY = this.player.y;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        
        // Check if ball is between AI and own goal - DANGER!
        const ballBetweenPlayerAndGoal = this.side === 'right' ?
            (ballX > playerX && ballX < ownGoalX) :
            (ballX < playerX && ballX > ownGoalX);
        
        const distanceX = Math.abs(ballX - playerX);
        const ballOnGround = ballY > this.physics.groundY - this.ball.radius - 50;
        
        // CRITICAL: If ball is between AI and own goal, jump over it to get on correct side
        if (ballBetweenPlayerAndGoal && distanceX < 70 && ballOnGround && this.player.isGrounded) {
            this.shouldJump = true;
            // Continue moving toward goal side to get behind ball
            this.targetX = this.side === 'right' ? ballX + 60 : ballX - 60;
            return;
        }
        
        // Position between ball and goal
        const defensivePosition = (ballX + ownGoalX) / 2;
        
        // Apply positioning skill - better AI positions more precisely
        const positioningError = (1 - this.params.positioning) * 80;
        this.targetX = defensivePosition + (Math.random() - 0.5) * positioningError;
        
        // Clamp to defensive zone
        if (this.side === 'right') {
            this.targetX = Math.max(this.targetX, this.physics.width * 0.5);
            this.targetX = Math.min(this.targetX, this.physics.width - 100);
        } else {
            this.targetX = Math.min(this.targetX, this.physics.width * 0.5);
            this.targetX = Math.max(this.targetX, 100);
        }
        
        // Jump decision - defensive clears
        const ballInRange = distanceX < 100;
        const ballHigh = ballY < playerY - 40;
        
        this.shouldJump = ballHigh && ballInRange && this.player.isGrounded && 
                         Math.random() < this.params.jumpTiming * 0.8;
    }
    
    attackStrategy() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const playerX = this.player.x;
        const playerY = this.player.y;
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        
        // Check if ball is between AI and own goal - AVOID PUSHING IT IN!
        const ballBetweenPlayerAndGoal = this.side === 'right' ?
            (ballX > playerX && ballX < ownGoalX) :
            (ballX < playerX && ballX > ownGoalX);
        
        const distanceX = Math.abs(ballX - playerX);
        const ballOnGround = ballY > this.physics.groundY - this.ball.radius - 50;
        
        // CRITICAL: If ball is between AI and own goal, jump over it!
        if (ballBetweenPlayerAndGoal && distanceX < 70 && ballOnGround && this.player.isGrounded) {
            this.shouldJump = true;
            // Move to get on the goal side of the ball
            this.targetX = this.side === 'right' ? ballX + 60 : ballX - 60;
            return;
        }
        
        // Position to strike toward goal
        let strikePosition;
        if (this.side === 'right') {
            // AI on right defending right goal, attacking left goal
            strikePosition = ballX + 35; // Get to right of ball to kick left
        } else {
            // AI on left defending left goal, attacking right goal  
            strikePosition = ballX - 35; // Get to left of ball to kick right
        }
        
        // Apply shot accuracy - pro AI positions for better shots
        const shotError = (1 - this.params.shotAccuracy) * 60;
        strikePosition += (Math.random() - 0.5) * shotError;
        
        this.targetX = strikePosition;
        
        // Jump for headers when close to goal
        const distanceToGoal = Math.abs(ballX - opponentGoalX);
        const ballHigh = ballY < playerY - 25;
        const closeToGoal = distanceToGoal < 200;
        
        this.shouldJump = ballHigh && distanceX < 80 && this.player.isGrounded && 
                         Math.random() < this.params.jumpTiming && closeToGoal;
    }
    
    interceptStrategy() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const playerX = this.player.x;
        const playerY = this.player.y;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        
        // Check if ball is between AI and own goal - DON'T PUSH IT IN!
        const ballBetweenPlayerAndGoal = this.side === 'right' ?
            (ballX > playerX && ballX < ownGoalX) :
            (ballX < playerX && ballX > ownGoalX);
        
        const distanceX = Math.abs(ballX - playerX);
        const ballOnGround = ballY > this.physics.groundY - this.ball.radius - 50;
        
        // CRITICAL: Jump over ball if it's between AI and own goal
        if (ballBetweenPlayerAndGoal && distanceX < 70 && ballOnGround && this.player.isGrounded) {
            this.shouldJump = true;
            // Move to get on correct side of ball
            this.targetX = this.side === 'right' ? ballX + 60 : ballX - 60;
            return;
        }
        
        // Predict where ball will land
        const prediction = this.predictBallPosition();
        
        // Apply prediction accuracy
        const predictionError = (1 - this.params.predictionAccuracy) * 120;
        this.targetX = prediction.x + (Math.random() - 0.5) * predictionError;
        
        // Jump to intercept aerial balls
        const ballHigh = ballY < playerY - 30;
        const ballMovingDown = this.ball.vy > 0;
        
        this.shouldJump = ballHigh && !ballMovingDown && distanceX < 70 && 
                         this.player.isGrounded && Math.random() < this.params.jumpTiming;
    }
    
    predictBallPosition() {
        // Predict ball landing position
        const steps = Math.floor(30 * this.params.predictionAccuracy);
        let predX = this.ball.x;
        let predY = this.ball.y;
        let predVx = this.ball.vx;
        let predVy = this.ball.vy;
        
        for (let i = 0; i < steps; i++) {
            predVy += this.physics.gravity;
            predX += predVx;
            predY += predVy;
            predVx *= this.physics.friction;
            
            // Check if ball reaches ground
            if (predY >= this.physics.groundY - this.ball.radius) {
                break;
            }
            
            // Check wall bounces
            if (predX < this.ball.radius || predX > this.physics.width - this.ball.radius) {
                predVx *= -0.8;
                predX = Math.max(this.ball.radius, Math.min(this.physics.width - this.ball.radius, predX));
            }
        }
        
        return { x: predX, y: predY };
    }
    
    executeAction() {
        const playerX = this.player.x;
        const threshold = 18 + (1 - this.params.positioning) * 15; // Better AI has tighter threshold
        
        // Safety: Never enter own goal
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const tooCloseToGoal = Math.abs(playerX - ownGoalX) < 80;
        
        if (tooCloseToGoal && this.currentStrategy !== 'defend') {
            // Move away from goal
            this.targetX = this.side === 'right' ? 
                this.physics.width - 150 : 150;
        }
        
        // Reset movement
        this.player.moveLeft = false;
        this.player.moveRight = false;
        this.player.jump = false;
        
        // Move towards target with speed based on difficulty
        if (this.targetX < playerX - threshold) {
            this.player.moveLeft = true;
        } else if (this.targetX > playerX + threshold) {
            this.player.moveRight = true;
        }
        
        // Apply max speed limit
        const currentSpeed = Math.abs(this.player.vx);
        const maxSpeed = this.params.maxSpeed * 5.5;
        if (currentSpeed > maxSpeed) {
            this.player.vx = Math.sign(this.player.vx) * maxSpeed;
        }
        
        // Execute jump
        if (this.shouldJump) {
            this.player.jump = true;
        }
    }
}


export class MultiAI {
    constructor(difficulty, players, ball, physics, role, side = 'right') {
        this.difficulty = difficulty;
        this.players = players; // Array of AI players
        this.ball = ball;
        this.physics = physics;
        this.role = role; // 'attacker' or 'defender'
        this.side = side; // 'left' or 'right' - which goal to defend
        
        this.params = this.getDifficultyParams(difficulty);
        this.reactionTimers = [0, 0]; // Separate timer for each player
        this.roleSwapCooldown = 0;
        this.currentAttacker = 0; // Index of current attacker
        this.strategies = [null, null]; // Strategy for each player
    }
    
    getDifficultyParams(difficulty) {
        const params = {
            easy: {
                reactionTime: 35,
                predictionAccuracy: 0.25,
                jumpTiming: 0.35,
                aggressiveness: 0.4,
                maxSpeed: 0.55,
                teamwork: 0.3,
                spacing: 100
            },
            medium: {
                reactionTime: 22,
                predictionAccuracy: 0.55,
                jumpTiming: 0.60,
                aggressiveness: 0.65,
                maxSpeed: 0.75,
                teamwork: 0.6,
                spacing: 130
            },
            hard: {
                reactionTime: 12,
                predictionAccuracy: 0.80,
                jumpTiming: 0.80,
                aggressiveness: 0.85,
                maxSpeed: 0.92,
                teamwork: 0.85,
                spacing: 160
            },
            pro: {
                reactionTime: 6,
                predictionAccuracy: 0.95,
                jumpTiming: 0.92,
                aggressiveness: 0.95,
                maxSpeed: 1.0,
                teamwork: 0.95,
                spacing: 180
            }
        };
        
        return params[difficulty] || params.medium;
    }
    
    update(playerIndex) {
        // Safety checks
        if (!this.players || !this.players[playerIndex]) {
            console.error('MultiAI: Invalid player index', playerIndex);
            return;
        }
        
        if (!this.ball || !this.physics) {
            console.error('MultiAI: Missing ball or physics');
            return;
        }
        
        const player = this.players[playerIndex];
        
        this.reactionTimers[playerIndex]++;
        this.roleSwapCooldown = Math.max(0, this.roleSwapCooldown - 1);
        
        // Reassign roles periodically (only check on player 0 to avoid duplicate checks)
        if (playerIndex === 0 && this.roleSwapCooldown === 0) {
            this.assignRoles();
            this.roleSwapCooldown = 60; // Re-evaluate every 60 frames
        }
        
        // Execute strategy based on role
        if (this.reactionTimers[playerIndex] >= this.params.reactionTime) {
            this.reactionTimers[playerIndex] = 0;
            
            if (playerIndex === this.currentAttacker) {
                this.attackBehavior(player);
            } else {
                this.defendBehavior(player);
            }
        }
        
        // Maintain spacing between teammates
        this.maintainSpacing(player, playerIndex);
    }
    
    assignRoles() {
        // Safety check
        if (!this.players || !this.players[0] || !this.players[1] || !this.ball) {
            return;
        }
        
        // Assign roles based on distance to ball and field position
        const dist0 = Math.abs(this.ball.x - this.players[0].x);
        const dist1 = Math.abs(this.ball.x - this.players[1].x);
        
        // Closer player becomes attacker
        this.currentAttacker = dist0 < dist1 ? 0 : 1;
    }
    
    maintainSpacing(player, playerIndex) {
        // Safety check
        if (!this.players || playerIndex < 0 || playerIndex > 1) {
            return;
        }
        
        // Prevent both players from clustering
        const otherIndex = playerIndex === 0 ? 1 : 0;
        const otherPlayer = this.players[otherIndex];
        
        if (!otherPlayer) {
            return;
        }
        
        const distance = Math.abs(player.x - otherPlayer.x);
        
        if (distance < this.params.spacing && playerIndex !== this.currentAttacker) {
            // Defender should back off to create space
            const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
            
            if (this.side === 'right') {
                // Move closer to right goal
                player.moveRight = Math.abs(player.x - ownGoalX) > 100;
                player.moveLeft = false;
            } else {
                // Move closer to left goal
                player.moveLeft = Math.abs(player.x - ownGoalX) > 100;
                player.moveRight = false;
            }
        }
    }
    
    attackBehavior(player) {
        // Aggressive attack toward opponent's goal
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const playerX = player.x;
        const playerY = player.y;
        
        // Check if ball is between AI and own goal - CRITICAL DANGER!
        const ballBetweenPlayerAndGoal = this.side === 'right' ?
            (ballX > playerX && ballX < ownGoalX) :
            (ballX < playerX && ballX > ownGoalX);
        
        const distanceX = Math.abs(ballX - playerX);
        const ballOnGround = ballY > this.physics.groundY - this.ball.radius - 50;
        
        // JUMP OVER BALL to avoid pushing into own goal!
        if (ballBetweenPlayerAndGoal && distanceX < 70 && ballOnGround && player.isGrounded) {
            player.jump = true;
            // Target: get on the correct side of the ball
            const targetX = this.side === 'right' ? ballX + 60 : ballX - 60;
            
            player.moveLeft = targetX < playerX;
            player.moveRight = targetX > playerX;
            return;
        }
        
        // Safety: Don't get too close to own goal
        const distanceToOwnGoal = Math.abs(playerX - ownGoalX);
        
        let targetX;
        
        if (distanceToOwnGoal < 120) {
            // Too close to own goal - move toward center
            targetX = this.physics.width / 2;
        } else {
            // Position to strike ball toward opponent goal
            const ballDistanceToGoal = Math.abs(ballX - opponentGoalX);
            
            // Check if ball is directly overhead (being bounced)
            const ballAbove = ballY < playerY - 50;
            
            if (ballAbove && distanceX < 35) {
                // Ball bouncing on head - move sideways to let it drop
                targetX = this.side === 'right' ? playerX - 70 : playerX + 70;
            } else if (ballDistanceToGoal < 250) {
                // Close to goal - position for direct shot
                if (this.side === 'right') {
                    targetX = ballX + 40; // Get behind ball
                } else {
                    targetX = ballX - 40;
                }
            } else {
                // Far from goal - get closer to ball
                if (this.side === 'right') {
                    targetX = ballX + 35;
                } else {
                    targetX = ballX - 35;
                }
            }
            
            // Apply accuracy variation
            const error = (1 - this.params.predictionAccuracy) * 50;
            targetX += (Math.random() - 0.5) * error;
        }
        
        // Movement execution
        const threshold = 15;
        player.moveLeft = false;
        player.moveRight = false;
        player.jump = false;
        
        // Safety: Never move into own goal
        const wouldMoveTowardOwnGoal = this.side === 'right' ?
            (targetX > playerX && playerX > this.physics.width * 0.8) :
            (targetX < playerX && playerX < this.physics.width * 0.2);
        
        if (!wouldMoveTowardOwnGoal) {
            if (targetX < playerX - threshold) {
                player.moveLeft = true;
            } else if (targetX > playerX + threshold) {
                player.moveRight = true;
            }
        }
        
        // Jump for aerial shots
        const ballHigh = ballY < playerY - 25;
        const closeToGoal = Math.abs(ballX - opponentGoalX) < 200;
        
        if (ballHigh && distanceX < 75 && player.isGrounded && !ballAbove) {
            if (Math.random() < this.params.jumpTiming * (closeToGoal ? 1.1 : 0.9)) {
                player.jump = true;
            }
        }
        
        // Apply speed limit
        const currentSpeed = Math.abs(player.vx);
        const maxSpeed = this.params.maxSpeed * 5.5;
        if (currentSpeed > maxSpeed) {
            player.vx = Math.sign(player.vx) * maxSpeed;
        }
    }
    
    defendBehavior(player) {
        // Defensive positioning between ball and goal
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const playerX = player.x;
        const playerY = player.y;
        
        // Check if ball is between AI and own goal - DANGEROUS!
        const ballBetweenPlayerAndGoal = this.side === 'right' ?
            (ballX > playerX && ballX < ownGoalX) :
            (ballX < playerX && ballX > ownGoalX);
        
        const distanceX = Math.abs(ballX - playerX);
        const ballOnGround = ballY > this.physics.groundY - this.ball.radius - 50;
        
        // JUMP OVER BALL if it's between AI and own goal!
        if (ballBetweenPlayerAndGoal && distanceX < 70 && ballOnGround && player.isGrounded) {
            player.jump = true;
            // Target: get behind the ball (on goal side)
            const targetX = this.side === 'right' ? ballX + 60 : ballX - 60;
            
            player.moveLeft = targetX < playerX;
            player.moveRight = targetX > playerX;
            return;
        }
        
        // Check if ball is dangerous
        const ballDistanceToGoal = Math.abs(ballX - ownGoalX);
        const ballInDanger = ballDistanceToGoal < 250;
        
        let targetX;
        
        if (ballInDanger) {
            // Emergency - clear the ball!
            targetX = ballX;
        } else {
            // Position between ball and goal
            const defensiveZone = this.side === 'right' ?
                this.physics.width * 0.7 : this.physics.width * 0.3;
            
            targetX = (ballX + defensiveZone) / 2;
            
            // Keep in defensive half
            if (this.side === 'right') {
                targetX = Math.max(targetX, this.physics.width * 0.55);
                targetX = Math.min(targetX, this.physics.width - 100);
            } else {
                targetX = Math.min(targetX, this.physics.width * 0.45);
                targetX = Math.max(targetX, 100);
            }
        }
        
        // Movement execution
        const threshold = 20;
        player.moveLeft = false;
        player.moveRight = false;
        player.jump = false;
        
        if (targetX < playerX - threshold) {
            player.moveLeft = true;
        } else if (targetX > playerX + threshold) {
            player.moveRight = true;
        }
        
        // Jump for defensive headers
        const ballHigh = ballY < playerY - 35;
        
        if (ballHigh && distanceX < 90 && player.isGrounded) {
            if (Math.random() < this.params.jumpTiming * 0.75) {
                player.jump = true;
            }
        }
        
        // Apply speed limit
        const currentSpeed = Math.abs(player.vx);
        const maxSpeed = this.params.maxSpeed * 5.0; // Slightly slower when defending
        if (currentSpeed > maxSpeed) {
            player.vx = Math.sign(player.vx) * maxSpeed;
        }
    }
}

