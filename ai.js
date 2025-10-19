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
    }
    
    getDifficultyParams(difficulty) {
        const params = {
            easy: {
                reactionTime: 30,
                predictionAccuracy: 0.3,
                jumpTiming: 0.4,
                aggressiveness: 0.5,
                maxSpeed: 0.6
            },
            medium: {
                reactionTime: 20,
                predictionAccuracy: 0.6,
                jumpTiming: 0.6,
                aggressiveness: 0.7,
                maxSpeed: 0.8
            },
            hard: {
                reactionTime: 10,
                predictionAccuracy: 0.85,
                jumpTiming: 0.8,
                aggressiveness: 0.9,
                maxSpeed: 1.0
            },
            pro: {
                reactionTime: 5,
                predictionAccuracy: 0.95,
                jumpTiming: 0.95,
                aggressiveness: 1.0,
                maxSpeed: 1.0
            }
        };
        
        return params[difficulty] || params.medium;
    }
    
    update() {
        this.reactionTimer++;
        
        if (this.reactionTimer >= this.params.reactionTime) {
            this.reactionTimer = 0;
            this.calculateAction();
        }
        
        this.executeAction();
    }
    
    calculateAction() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // Determine opponent's goal position
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        
        // Check if ball is dangerously close to own goal
        const ballDistanceToOwnGoal = Math.abs(ballX - ownGoalX);
        const inDangerZone = ballDistanceToOwnGoal < 200;
        
        // PRIORITY: If ball is near own goal, GO GET IT!
        if (inDangerZone) {
            // Emergency defense - go straight for the ball to clear it
            this.targetX = ballX;
            this.shouldJump = this.decideJump();
            return;
        }
        
        // Check if ball is directly above AI (being bounced)
        const distanceX = Math.abs(ballX - playerX);
        const ballAbove = ballY < playerY - 50;
        
        // If ball is above AI, move sideways to let it drop, then attack
        if (ballAbove && distanceX < 40) {
            // Move toward opponent's goal to prepare for attack
            if (this.side === 'right') {
                this.targetX = playerX - 60; // Move left toward opponent goal
            } else {
                this.targetX = playerX + 60; // Move right toward opponent goal
            }
            this.shouldJump = false; // Don't keep bouncing it
            return;
        }
        
        // Predict ball position
        const prediction = this.predictBallPosition();
        
        // Decide target position based on ball movement and position
        if (Math.abs(this.ball.vx) > 1 || Math.abs(this.ball.vy) > 1) {
            // Ball is moving, intercept it
            this.targetX = prediction.x;
            
            // If ball is heading toward our own goal, intercept aggressively
            const ballHeadingToOwnGoal = this.side === 'right' ? 
                (this.ball.vx > 0 && ballX > this.physics.width * 0.5) : 
                (this.ball.vx < 0 && ballX < this.physics.width * 0.5);
            
            if (ballHeadingToOwnGoal) {
                // Intercept the ball, don't just position
                this.targetX = ballX;
            }
        } else {
            // Ball is stationary or slow - ATTACK MODE
            // Position to kick ball toward opponent's goal
            const distanceToOpponentGoal = Math.abs(ballX - opponentGoalX);
            
            if (distanceToOpponentGoal < 300) {
                // Close to opponent goal - position for direct shot
                if (this.side === 'right') {
                    this.targetX = ballX + 40; // Get behind ball
                } else {
                    this.targetX = ballX - 40;
                }
            } else {
                // Far from goal - position for powerful kick
                if (this.side === 'right') {
                    this.targetX = ballX + 30;
                } else {
                    this.targetX = ballX - 30;
                }
            }
        }
        
        // Apply prediction accuracy
        const error = (1 - this.params.predictionAccuracy) * 100;
        this.targetX += (Math.random() - 0.5) * error;
        
        // Decide if should jump
        this.shouldJump = this.decideJump();
    }
    
    predictBallPosition() {
        // Simple ball trajectory prediction
        const steps = 30;
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
        }
        
        return { x: predX, y: predY };
    }
    
    decideJump() {
        const ballY = this.ball.y;
        const playerY = this.player.y;
        const distanceX = Math.abs(this.ball.x - this.player.x);
        
        // Jump if ball is above and close
        if (ballY < playerY - 30 && distanceX < 80 && this.player.isGrounded) {
            return Math.random() < this.params.jumpTiming;
        }
        
        // Random jump for unpredictability
        if (Math.random() < 0.01 * this.params.aggressiveness) {
            return this.player.isGrounded;
        }
        
        return false;
    }
    
    executeAction() {
        const playerX = this.player.x;
        const threshold = 20;
        
        // Safety check: NEVER move toward own goal UNLESS ball is there
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        
        const distanceToOwnGoal = Math.abs(playerX - ownGoalX);
        const distanceToBall = Math.abs(this.ball.x - playerX);
        const ballDistanceToOwnGoal = Math.abs(this.ball.x - ownGoalX);
        
        // EXCEPTION: If ball is near own goal, GO GET IT regardless of position
        const ballInDangerZone = ballDistanceToOwnGoal < 200;
        
        if (!ballInDangerZone && distanceToOwnGoal < 150 && distanceToBall > 50) {
            // Ball is NOT near goal, and we're too close - move toward center
            this.targetX = (playerX + opponentGoalX) / 2;
        }
        
        // Reset movement
        this.player.moveLeft = false;
        this.player.moveRight = false;
        this.player.jump = false;
        
        // Prevent moving toward own goal ONLY if ball is not there
        if (!ballInDangerZone) {
            const movingTowardOwnGoal = this.side === 'right' ? 
                (this.targetX > playerX && playerX > this.physics.width * 0.7) :
                (this.targetX < playerX && playerX < this.physics.width * 0.3);
            
            if (movingTowardOwnGoal) {
                // Don't move toward own goal, stay put or move toward opponent
                this.targetX = this.side === 'right' ? 
                    Math.min(this.targetX, this.physics.width * 0.7) :
                    Math.max(this.targetX, this.physics.width * 0.3);
            }
        }
        
        // Move towards target
        if (this.targetX < playerX - threshold) {
            this.player.moveLeft = true;
        } else if (this.targetX > playerX + threshold) {
            this.player.moveRight = true;
        }
        
        // Apply max speed limit
        const currentSpeed = Math.abs(this.player.vx);
        const maxSpeed = this.params.maxSpeed * 5;
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
        this.reactionTimer = 0;
    }
    
    getDifficultyParams(difficulty) {
        const params = {
            easy: {
                reactionTime: 35,
                predictionAccuracy: 0.25,
                jumpTiming: 0.3,
                aggressiveness: 0.4,
                maxSpeed: 0.5,
                teamwork: 0.3
            },
            medium: {
                reactionTime: 25,
                predictionAccuracy: 0.5,
                jumpTiming: 0.5,
                aggressiveness: 0.6,
                maxSpeed: 0.7,
                teamwork: 0.6
            },
            hard: {
                reactionTime: 15,
                predictionAccuracy: 0.75,
                jumpTiming: 0.7,
                aggressiveness: 0.8,
                maxSpeed: 0.9,
                teamwork: 0.8
            },
            pro: {
                reactionTime: 8,
                predictionAccuracy: 0.9,
                jumpTiming: 0.9,
                aggressiveness: 0.95,
                maxSpeed: 1.0,
                teamwork: 0.95
            }
        };
        
        return params[difficulty] || params.medium;
    }
    
    update(playerIndex) {
        const player = this.players[playerIndex];
        
        this.reactionTimer++;
        
        if (this.reactionTimer >= this.params.reactionTime) {
            this.reactionTimer = 0;
        }
        
        // Determine role dynamically
        const distanceToBall = Math.abs(this.ball.x - player.x);
        const otherPlayerIndex = playerIndex === 0 ? 1 : 0;
        const otherDistance = Math.abs(this.ball.x - this.players[otherPlayerIndex].x);
        
        // Closer player attacks, other defends
        const isAttacker = distanceToBall < otherDistance || Math.random() < 0.5;
        
        if (isAttacker) {
            this.attackBehavior(player);
        } else {
            this.defendBehavior(player);
        }
    }
    
    attackBehavior(player) {
        // Attack toward opponent's goal
        const opponentGoalX = this.side === 'right' ? 50 : this.physics.width - 50;
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        
        // Safety check: Don't get too close to own goal
        const distanceToOwnGoal = Math.abs(player.x - ownGoalX);
        const distanceToOpponentGoal = Math.abs(player.x - opponentGoalX);
        
        // Position to kick ball toward opponent's goal
        let targetX;
        
        // If too close to own goal, move toward center first
        if (distanceToOwnGoal < 100) {
            targetX = this.physics.width / 2; // Move to center
        } else {
            // Normal attacking position
            if (this.side === 'right') {
                // AI on right, attack left goal - position to right of ball to kick left
                targetX = Math.max(this.ball.x + 30, this.physics.width * 0.4);
            } else {
                // AI on left, attack right goal - position to left of ball to kick right
                targetX = Math.min(this.ball.x - 30, this.physics.width * 0.6);
            }
        }
        
        const threshold = 15;
        
        player.moveLeft = false;
        player.moveRight = false;
        player.jump = false;
        
        // NEVER move toward own goal
        const wouldMoveTowardOwnGoal = this.side === 'right' ?
            (targetX > player.x && player.x > this.physics.width * 0.75) :
            (targetX < player.x && player.x < this.physics.width * 0.25);
        
        if (wouldMoveTowardOwnGoal) {
            // Stop or move toward center
            targetX = this.physics.width / 2;
        }
        
        if (targetX < player.x - threshold) {
            player.moveLeft = true;
        } else if (targetX > player.x + threshold) {
            player.moveRight = true;
        }
        
        // Jump decision
        const distanceX = Math.abs(this.ball.x - player.x);
        if (this.ball.y < player.y - 20 && distanceX < 60 && player.isGrounded) {
            if (Math.random() < this.params.jumpTiming) {
                player.jump = true;
            }
        }
    }
    
    defendBehavior(player) {
        // Stay closer to own goal and react to ball
        const ownGoalX = this.side === 'right' ? this.physics.width - 50 : 50;
        const defendX = this.side === 'right' ? this.physics.width - 150 : 150;
        const threshold = 30;
        
        player.moveLeft = false;
        player.moveRight = false;
        player.jump = false;
        
        // Check if ball is dangerously close to goal
        const ballDistanceToGoal = Math.abs(this.ball.x - ownGoalX);
        const ballInDanger = ballDistanceToGoal < 250;
        
        let targetX;
        
        if (ballInDanger) {
            // Ball is near goal - GO CLEAR IT!
            targetX = this.ball.x;
        } else {
            // Position between ball and goal
            targetX = (this.ball.x + defendX) / 2;
            
            // Ensure defender stays in proper half of field
            if (this.side === 'right') {
                targetX = Math.max(targetX, this.physics.width * 0.5); // Stay in right half
                targetX = Math.min(targetX, this.physics.width - 100); // Don't go IN goal
            } else {
                targetX = Math.min(targetX, this.physics.width * 0.5); // Stay in left half
                targetX = Math.max(targetX, 100); // Don't go IN goal
            }
        }
        
        if (targetX < player.x - threshold) {
            player.moveLeft = true;
        } else if (targetX > player.x + threshold) {
            player.moveRight = true;
        }
        
        // Jump if ball is close and high
        const distanceX = Math.abs(this.ball.x - player.x);
        if (this.ball.y < player.y - 30 && distanceX < 100 && player.isGrounded) {
            if (Math.random() < this.params.jumpTiming * 0.7) {
                player.jump = true;
            }
        }
    }
}
