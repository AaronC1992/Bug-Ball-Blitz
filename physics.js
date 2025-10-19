// physics.js - Game physics engine

export class Physics {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.gravity = 0.6;
        this.groundY = height * 0.7;
        this.friction = 0.95;
        this.bounceDamping = 0.8; // Increased from 0.7 for more bounce
    }
    
    updateBall(ball) {
        // Apply gravity
        ball.vy += this.gravity;
        
        // Apply velocity
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Apply friction
        ball.vx *= this.friction;
        
        // Goal dimensions - declare once at top
        const goalWidth = 100;
        const goalHeight = 120;
        const goalY = this.groundY - goalHeight;
        
        // Ground collision
        if (ball.y + ball.radius > this.groundY) {
            ball.y = this.groundY - ball.radius;
            ball.vy *= -this.bounceDamping;
            ball.vx *= 0.98;
            
            // Stop small bounces
            if (Math.abs(ball.vy) < 1) {
                ball.vy = 0;
            }
        }
        
        // Left wall collision - simple bounce
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx *= -0.8;
        }
        
        // Right wall collision - simple bounce
        if (ball.x + ball.radius > this.width) {
            ball.x = this.width - ball.radius;
            ball.vx *= -0.8;
        }
        
        // Left goal top barrier - simple horizontal wall
        if (ball.x < goalWidth && ball.y + ball.radius > goalY && ball.y - ball.radius < goalY) {
            if (ball.vy > 0) {
                ball.y = goalY - ball.radius;
                ball.vy *= -0.7;
            } else {
                ball.y = goalY + ball.radius;
                ball.vy *= -0.7;
            }
            // Push ball off crossbar towards center (to the right, away from left edge)
            ball.vx += 1.5;
        }
        
        // Right goal top barrier - simple horizontal wall
        if (ball.x > this.width - goalWidth && ball.y + ball.radius > goalY && ball.y - ball.radius < goalY) {
            if (ball.vy > 0) {
                ball.y = goalY - ball.radius;
                ball.vy *= -0.7;
            } else {
                ball.y = goalY + ball.radius;
                ball.vy *= -0.7;
            }
            // Push ball off crossbar towards center (to the left, away from right edge)
            ball.vx -= 1.5;
        }
        
        // Ceiling collision
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= -0.5;
        }
    }
    
    updatePlayer(player, bug) {
        const stats = bug.stats;
        
        // Apply gravity
        player.vy += this.gravity;
        
        // Apply velocity
        player.x += player.vx;
        player.y += player.vy;
        
        // Apply friction
        player.vx *= 0.9;
        
        // Ground collision
        if (player.y + player.height / 2 > this.groundY) {
            player.y = this.groundY - player.height / 2;
            player.vy = 0;
            player.isGrounded = true;
        } else {
            player.isGrounded = false;
        }
        
        // Wall constraints
        if (player.x - player.width / 2 < 0) {
            player.x = player.width / 2;
            player.vx = 0;
        }
        if (player.x + player.width / 2 > this.width) {
            player.x = this.width - player.width / 2;
            player.vx = 0;
        }
        
        // Movement input
        if (player.moveLeft) {
            player.vx = -stats.speed * 5;
            player.facing = -1;
        }
        if (player.moveRight) {
            player.vx = stats.speed * 5;
            player.facing = 1;
        }
        
        // Jump input
        if (player.jump && player.isGrounded) {
            player.vy = -stats.jump * 15;
            player.isGrounded = false;
            player.jump = false;
        }
    }
    
    checkBallPlayerCollision(ball, player, bug) {
        const stats = bug.stats;
        
        // Use rectangular collision detection for more accurate player hitbox
        const playerLeft = player.x - player.width / 2;
        const playerRight = player.x + player.width / 2;
        const playerTop = player.y - player.height;
        const playerBottom = player.y;
        
        // Find closest point on player rectangle to ball center
        const closestX = Math.max(playerLeft, Math.min(ball.x, playerRight));
        const closestY = Math.max(playerTop, Math.min(ball.y, playerBottom));
        
        // Calculate distance from ball center to closest point
        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ball.radius) {
            // Collision detected - ball is overlapping player
            
            // Determine which part of the player hit the ball
            const ballRelativeX = ball.x - player.x; // Negative = left side, Positive = right side
            const ballRelativeY = ball.y - (player.y - player.height / 2); // Negative = above center
            
            // Calculate contact angle from player center to ball
            const contactAngle = Math.atan2(ballRelativeY, ballRelativeX);
            
            // Determine collision normal (direction to push ball)
            let normalX = dx;
            let normalY = dy;
            
            // Detect hit location (top, side, bottom)
            const hitTop = ball.y < playerTop + player.height * 0.3;
            const hitBottom = ball.y > playerBottom - player.height * 0.2;
            const hitLeftSide = ball.x < player.x && !hitTop && !hitBottom;
            const hitRightSide = ball.x > player.x && !hitTop && !hitBottom;
            
            // If ball center is inside rectangle, use position to determine push direction
            if (ball.x >= playerLeft && ball.x <= playerRight && 
                ball.y >= playerTop && ball.y <= playerBottom) {
                // Ball is inside player - push it out based on which edge is closest
                const distLeft = ball.x - playerLeft;
                const distRight = playerRight - ball.x;
                const distTop = ball.y - playerTop;
                const distBottom = playerBottom - ball.y;
                
                const minDist = Math.min(distLeft, distRight, distTop, distBottom);
                
                if (minDist === distLeft) {
                    normalX = -1; normalY = 0;
                } else if (minDist === distRight) {
                    normalX = 1; normalY = 0;
                } else if (minDist === distTop) {
                    normalX = 0; normalY = -1;
                } else {
                    normalX = 0; normalY = 1;
                }
            } else if (distance > 0) {
                // Normalize the collision normal
                normalX /= distance;
                normalY /= distance;
            } else {
                // Default push up and away
                normalX = (ball.x > player.x) ? 1 : -1;
                normalY = -1;
                const len = Math.sqrt(normalX * normalX + normalY * normalY);
                normalX /= len;
                normalY /= len;
            }
            
            // Push ball out of player
            ball.x = closestX + normalX * ball.radius;
            ball.y = closestY + normalY * ball.radius;
            
            // Calculate kick force based on bug stats and player movement
            const kickPower = stats.power * 10;
            const playerVelocity = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
            const totalPower = kickPower + playerVelocity * 0.5;
            
            // IMPROVED DIRECTIONAL CONTROL
            // Factor in player's facing direction and movement
            const playerFacingInfluence = player.facing * 0.3; // -1 for left, +1 for right
            const playerMovingLeft = player.moveLeft ? -1 : 0;
            const playerMovingRight = player.moveRight ? 1 : 0;
            const movementDirection = playerMovingLeft + playerMovingRight;
            
            // Base ball velocity on contact angle and normal
            let ballDirectionX = normalX;
            let ballDirectionY = normalY;
            
            // Apply directional control based on hit location
            if (hitTop) {
                // Top hit - header! Use contact angle more, add facing influence
                ballDirectionX = Math.cos(contactAngle);
                ballDirectionY = Math.sin(contactAngle);
                // Add player facing/movement to steer the header
                ballDirectionX += (movementDirection * 0.5 + playerFacingInfluence);
            } else if (hitLeftSide || hitRightSide) {
                // Side hit - strong directional control
                // Ball goes in direction player is facing/moving
                const sideDirection = hitLeftSide ? -1 : 1;
                ballDirectionX = sideDirection;
                // Add movement influence for steering
                if (movementDirection !== 0) {
                    ballDirectionX = movementDirection; // Override with movement direction
                }
                ballDirectionY = normalY * 0.7; // Reduce vertical component for side hits
            } else if (hitBottom) {
                // Bottom/foot hit - most control
                // Strong horizontal influence from movement/facing
                if (movementDirection !== 0) {
                    ballDirectionX = movementDirection * 1.2; // Strong horizontal component
                } else {
                    ballDirectionX = normalX + playerFacingInfluence;
                }
                ballDirectionY = Math.min(normalY, -0.3); // Slight upward angle
            }
            
            // Normalize direction vector
            const dirLength = Math.sqrt(ballDirectionX * ballDirectionX + ballDirectionY * ballDirectionY);
            if (dirLength > 0) {
                ballDirectionX /= dirLength;
                ballDirectionY /= dirLength;
            }
            
            // Apply velocity with improved direction
            ball.vx = ballDirectionX * totalPower + player.vx * 0.3;
            ball.vy = ballDirectionY * totalPower + player.vy * 0.3;
            
            // Check if player landed on top of ball (collision from above)
            const isLandingOnBall = normalY < -0.5 && player.vy > 0;
            
            // Dynamic kick mechanics based on player movement
            const isPlayerFast = playerVelocity > 3; // Moving fast
            const isPlayerJumping = player.vy < -2; // Moving upward (jumping/in air)
            const isPlayerOnGround = player.isGrounded; // Use the isGrounded flag
            
            if (isLandingOnBall) {
                // Player landed on top of ball - make it bounce DOWN strongly
                ball.vy = Math.abs(ball.vy) + kickPower * 0.8; // Strong downward bounce
            } else if (isPlayerJumping) {
                // Jumping or in air - kick ball upward with aerial bonus
                const aerialBonus = Math.abs(player.vy) * 1.5;
                ball.vy -= aerialBonus; // Add upward force (negative = up)
            } else if (isPlayerFast && isPlayerOnGround) {
                // Moving fast on ground - chip the ball up slightly
                ball.vy -= kickPower * 0.4; // Stronger upward angle
            } else if (isPlayerOnGround) {
                // Moving slow on ground - keep ball low/grounded
                // Reduce vertical component and boost horizontal
                ball.vy = Math.min(ball.vy, -2); // Cap upward velocity
                ball.vx *= 1.2; // Boost horizontal speed for ground passes
            }
            
            return true;
        }
        
        return false;
    }
    
    checkGoal(ball, goalWidth = 100) {
        const goalHeight = 120;
        const goalY = this.groundY - goalHeight;
        const goalDepth = 50; // Ball must be this deep into goal area
        
        // Check if ball is in the goal area vertically (between crossbar and ground)
        const ballInGoalHeight = ball.y + ball.radius > goalY && ball.y - ball.radius < this.groundY;
        
        // Left goal - ball must be deep inside goal mouth (close to left edge, at goal height)
        if (ball.x < goalDepth && ballInGoalHeight) {
            return 'left';
        }
        
        // Right goal - ball must be deep inside goal mouth (close to right edge, at goal height)
        if (ball.x > this.width - goalDepth && ballInGoalHeight) {
            return 'right';
        }
        
        return null;
    }
    
    resetBall(ball) {
        ball.x = this.width / 2;
        ball.y = this.height / 2;
        ball.vx = 0;
        ball.vy = 0;
    }
    
    resetPlayer(player, side) {
        if (side === 'left') {
            player.x = this.width * 0.25;
        } else {
            player.x = this.width * 0.75;
        }
        player.y = this.groundY - player.height / 2;
        player.vx = 0;
        player.vy = 0;
        player.isGrounded = true;
    }
}
