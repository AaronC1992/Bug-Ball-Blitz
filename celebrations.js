// celebrations.js - Goal celebration animations

export const CELEBRATIONS = {
    classic: {
        id: 'classic',
        name: 'Classic',
        icon: '⚽',
        description: 'Standard goal celebration',
        unlockCondition: 'Default',
        unlocked: true
    },
    
    fireworks: {
        id: 'fireworks',
        name: 'Fireworks',
        icon: '🎆',
        description: 'Fireworks shoot from your goal',
        unlockCondition: 'Win 5 matches',
        requiredWins: 5,
        unlocked: false
    },
    
    streamers: {
        id: 'streamers',
        name: 'Streamers',
        icon: '🎊',
        description: 'Colorful streamers burst out',
        unlockCondition: 'Win 10 matches',
        requiredWins: 10,
        unlocked: false
    },
    
    discoBall: {
        id: 'discoBall',
        name: 'Disco Party',
        icon: '🪩',
        description: 'Disco ball with spinning lights',
        unlockCondition: 'Win 15 matches',
        requiredWins: 15,
        unlocked: false
    },
    
    confetti: {
        id: 'confetti',
        name: 'Confetti Blast',
        icon: '🎉',
        description: 'Massive confetti explosion',
        unlockCondition: 'Score 25 goals',
        requiredGoals: 25,
        unlocked: false
    },
    
    lightning: {
        id: 'lightning',
        name: 'Lightning Strike',
        icon: '⚡',
        description: 'Lightning bolts flash across',
        unlockCondition: 'Win 20 matches',
        requiredWins: 20,
        unlocked: false
    },
    
    rainbow: {
        id: 'rainbow',
        name: 'Rainbow Wave',
        icon: '🌈',
        description: 'Rainbow sweeps across field',
        unlockCondition: 'Score 50 goals',
        requiredGoals: 50,
        unlocked: false
    },
    
    starBurst: {
        id: 'starBurst',
        name: 'Star Burst',
        icon: '⭐',
        description: 'Stars explode from center',
        unlockCondition: 'Win 30 matches',
        requiredWins: 30,
        unlocked: false
    },
    
    heartExplosion: {
        id: 'heartExplosion',
        name: 'Heart Explosion',
        icon: '💖',
        description: 'Hearts float upward romantically',
        unlockCondition: 'Win 25 matches',
        requiredWins: 25,
        unlocked: false
    },
    
    champion: {
        id: 'champion',
        name: 'Champion Crown',
        icon: '👑',
        description: 'Golden crown appears above',
        unlockCondition: 'Complete Tower Level 20',
        requiredTowerLevel: 20,
        unlocked: false
    }
};

export function getCelebrationArray() {
    return Object.values(CELEBRATIONS);
}

export function getCelebrationById(id) {
    return CELEBRATIONS[id];
}

// Check if celebration is unlocked based on profile stats
export function checkCelebrationUnlock(celebration, profile) {
    if (celebration.unlocked) return true;
    
    const stats = profile.stats;
    
    if (celebration.requiredWins && stats.wins >= celebration.requiredWins) {
        return true;
    }
    
    if (celebration.requiredGoals && stats.goalsScored >= celebration.requiredGoals) {
        return true;
    }
    
    if (celebration.requiredTowerLevel && profile.tower.highestLevel >= celebration.requiredTowerLevel) {
        return true;
    }
    
    return false;
}

// Draw celebration animation
export function drawCelebration(ctx, celebrationType, side, width, height, animationFrame) {
    const goalX = side === 'left' ? 50 : width - 50;
    const goalY = height * 0.7 - 60;
    
    switch (celebrationType) {
        case 'fireworks':
            drawFireworks(ctx, goalX, goalY, width, height, animationFrame);
            break;
        case 'streamers':
            drawStreamers(ctx, goalX, goalY, width, height, animationFrame);
            break;
        case 'discoBall':
            drawDiscoBall(ctx, width, height, animationFrame);
            break;
        case 'confetti':
            drawConfetti(ctx, width, height, animationFrame);
            break;
        case 'lightning':
            drawLightning(ctx, width, height, animationFrame);
            break;
        case 'rainbow':
            drawRainbow(ctx, width, height, animationFrame);
            break;
        case 'starBurst':
            drawStarBurst(ctx, width / 2, height / 2, animationFrame);
            break;
        case 'heartExplosion':
            drawHeartExplosion(ctx, width / 2, height / 2, animationFrame);
            break;
        case 'champion':
            drawChampionCrown(ctx, width / 2, 100, animationFrame);
            break;
        default:
            // Classic - no special animation
            break;
    }
}

function drawFireworks(ctx, x, y, width, height, frame) {
    const numFireworks = 5;
    
    for (let i = 0; i < numFireworks; i++) {
        const offsetX = (i - 2) * 100;
        const progress = (frame + i * 10) / 60;
        
        if (progress > 1) continue;
        
        // Rocket going up
        if (progress < 0.5) {
            const rocketY = y + (1 - progress * 2) * 200;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + offsetX, rocketY, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Explosion
            const explosionProgress = (progress - 0.5) * 2;
            const explosionY = y - 100;
            const radius = explosionProgress * 80;
            
            const colors = ['#FF0000', '#FFD700', '#00FF00', '#0000FF', '#FF00FF'];
            
            for (let j = 0; j < 12; j++) {
                const angle = (j / 12) * Math.PI * 2;
                const px = x + offsetX + Math.cos(angle) * radius;
                const py = explosionY + Math.sin(angle) * radius;
                
                ctx.fillStyle = colors[j % colors.length];
                ctx.globalAlpha = 1 - explosionProgress;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }
}

function drawStreamers(ctx, x, y, width, height, frame) {
    const numStreamers = 20;
    const progress = frame / 60;
    
    for (let i = 0; i < numStreamers; i++) {
        const angle = (i / numStreamers) * Math.PI * 2;
        const speed = 5 + (i % 3) * 2;
        const distance = progress * speed * 100;
        
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        const colors = ['#FF69B4', '#FFD700', '#00FFFF', '#FF4500', '#7FFF00'];
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1 - progress;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(px, py);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawDiscoBall(ctx, width, height, frame) {
    const ballX = width / 2;
    const ballY = 80;
    const ballSize = 40;
    
    // Disco ball
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Shine pattern
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = (frame / 20 + i * Math.PI / 2) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + Math.cos(angle) * ballSize, ballY + Math.sin(angle) * ballSize);
        ctx.stroke();
    }
    
    // Light beams
    const numBeams = 8;
    for (let i = 0; i < numBeams; i++) {
        const angle = (frame / 15 + i * Math.PI * 2 / numBeams) % (Math.PI * 2);
        const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'];
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.3;
        
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + Math.cos(angle) * width, ballY + Math.sin(angle + 0.3) * height);
        ctx.lineTo(ballX + Math.cos(angle) * width, ballY + Math.sin(angle - 0.3) * height);
        ctx.closePath();
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawConfetti(ctx, width, height, frame) {
    const numPieces = 100;
    const progress = frame / 60;
    
    for (let i = 0; i < numPieces; i++) {
        const x = (i * 73) % width;
        const startY = -50;
        const y = startY + progress * (height + 100) + Math.sin(frame / 10 + i) * 30;
        
        if (y > height) continue;
        
        const colors = ['#FF69B4', '#FFD700', '#00FFFF', '#FF4500', '#7FFF00', '#FF00FF'];
        ctx.fillStyle = colors[i % colors.length];
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((frame + i) / 10);
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();
    }
}

function drawLightning(ctx, width, height, frame) {
    if (frame % 10 > 5) return; // Flash effect
    
    const numBolts = 3;
    
    for (let i = 0; i < numBolts; i++) {
        const startX = (width / (numBolts + 1)) * (i + 1);
        let x = startX;
        let y = 0;
        
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        while (y < height * 0.7) {
            x += (Math.random() - 0.5) * 40;
            y += 20 + Math.random() * 30;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function drawRainbow(ctx, width, height, frame) {
    const progress = frame / 60;
    const arcWidth = width * progress;
    const centerX = width / 2;
    const centerY = height * 0.7;
    
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    
    for (let i = 0; i < colors.length; i++) {
        const radius = 300 - i * 30;
        
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 30;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * (1 + progress));
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawStarBurst(ctx, x, y, frame) {
    const numStars = 20;
    const progress = frame / 60;
    
    for (let i = 0; i < numStars; i++) {
        const angle = (i / numStars) * Math.PI * 2;
        const distance = progress * 300;
        const size = 20 - progress * 15;
        
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        ctx.fillStyle = '#FFD700';
        ctx.globalAlpha = 1 - progress;
        
        // Draw star shape
        drawStar(ctx, px, py, 5, size, size / 2);
    }
    ctx.globalAlpha = 1;
}

function drawStar(ctx, x, y, points, outer, inner) {
    ctx.beginPath();
    ctx.moveTo(x, y - outer);
    
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    
    ctx.closePath();
    ctx.fill();
}

function drawHeartExplosion(ctx, x, y, frame) {
    const numHearts = 15;
    const progress = frame / 60;
    
    for (let i = 0; i < numHearts; i++) {
        const angle = (i / numHearts) * Math.PI * 2;
        const distance = progress * 200;
        const size = 15 + (i % 3) * 5;
        
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance - progress * 100;
        
        ctx.fillStyle = i % 2 === 0 ? '#FF1493' : '#FF69B4';
        ctx.globalAlpha = 1 - progress;
        
        // Draw heart
        drawHeart(ctx, px, py, size);
    }
    ctx.globalAlpha = 1;
}

function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size / 2, x - size, y - size / 2, x - size, y);
    ctx.bezierCurveTo(x - size, y + size / 2, x, y + size, x, y + size * 1.5);
    ctx.bezierCurveTo(x, y + size, x + size, y + size / 2, x + size, y);
    ctx.bezierCurveTo(x + size, y - size / 2, x, y - size / 2, x, y);
    ctx.fill();
}

function drawChampionCrown(ctx, x, y, frame) {
    const bounce = Math.sin(frame / 10) * 10;
    const crownY = y + bounce;
    
    // Crown
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(x - 40, crownY + 20);
    ctx.lineTo(x - 30, crownY - 10);
    ctx.lineTo(x - 20, crownY + 10);
    ctx.lineTo(x, crownY - 20);
    ctx.lineTo(x + 20, crownY + 10);
    ctx.lineTo(x + 30, crownY - 10);
    ctx.lineTo(x + 40, crownY + 20);
    ctx.lineTo(x - 40, crownY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Jewels
    const jewels = [
        { x: x - 30, y: crownY - 5, color: '#FF0000' },
        { x: x, y: crownY - 15, color: '#0000FF' },
        { x: x + 30, y: crownY - 5, color: '#00FF00' }
    ];
    
    jewels.forEach(jewel => {
        ctx.fillStyle = jewel.color;
        ctx.beginPath();
        ctx.arc(jewel.x, jewel.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Sparkle effect
    const sparkleProgress = (frame % 30) / 30;
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 1 - sparkleProgress;
    ctx.beginPath();
    ctx.arc(x, crownY - 20, sparkleProgress * 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}
