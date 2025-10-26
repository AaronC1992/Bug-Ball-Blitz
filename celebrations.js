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
    },
    
    explosion: {
        id: 'explosion',
        name: 'Goal Explosion',
        icon: '💥',
        description: 'Massive explosion effect',
        unlockCondition: 'Score 35 goals',
        requiredGoals: 35,
        unlocked: false
    },
    
    treasure: {
        id: 'treasure',
        name: 'Treasure Chest',
        icon: '💎',
        description: 'Treasure chest opens with gems',
        unlockCondition: 'Win 35 matches',
        requiredWins: 35,
        unlocked: false
    },
    
    meteor: {
        id: 'meteor',
        name: 'Meteor Shower',
        icon: '☄️',
        description: 'Meteors rain from the sky',
        unlockCondition: 'Score 75 goals',
        requiredGoals: 75,
        unlocked: false
    },
    
    aurora: {
        id: 'aurora',
        name: 'Aurora Borealis',
        icon: '🌌',
        description: 'Northern lights shimmer',
        unlockCondition: 'Win 40 matches',
        requiredWins: 40,
        unlocked: false
    },
    
    galaxy: {
        id: 'galaxy',
        name: 'Galaxy Swirl',
        icon: '🌀',
        description: 'Swirling galaxy appears',
        unlockCondition: 'Score 100 goals',
        requiredGoals: 100,
        unlocked: false
    },
    
    dragons: {
        id: 'dragons',
        name: 'Dragon Flight',
        icon: '🐉',
        description: 'Dragons fly across the field',
        unlockCondition: 'Win 50 matches',
        requiredWins: 50,
        unlocked: false
    },
    
    tsunami: {
        id: 'tsunami',
        name: 'Tsunami Wave',
        icon: '🌊',
        description: 'Massive wave crashes through',
        unlockCondition: 'Complete Tower Level 15',
        requiredTowerLevel: 15,
        unlocked: false
    },
    
    volcano: {
        id: 'volcano',
        name: 'Volcanic Eruption',
        icon: '🌋',
        description: 'Lava erupts from the ground',
        unlockCondition: 'Score 125 goals',
        requiredGoals: 125,
        unlocked: false
    },
    
    phoenix: {
        id: 'phoenix',
        name: 'Phoenix Rising',
        icon: '🔥',
        description: 'Phoenix rises from flames',
        unlockCondition: 'Win 60 matches',
        requiredWins: 60,
        unlocked: false
    },
    
    blackhole: {
        id: 'blackhole',
        name: 'Black Hole',
        icon: '⚫',
        description: 'Black hole pulls everything in',
        unlockCondition: 'Complete Tower Level 18',
        requiredTowerLevel: 18,
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
        case 'explosion':
            drawExplosion(ctx, width / 2, height / 2, animationFrame);
            break;
        case 'treasure':
            drawTreasureChest(ctx, width / 2, height * 0.6, animationFrame);
            break;
        case 'meteor':
            drawMeteorShower(ctx, width, height, animationFrame);
            break;
        case 'aurora':
            drawAurora(ctx, width, height, animationFrame);
            break;
        case 'galaxy':
            drawGalaxySwirl(ctx, width / 2, height / 2, animationFrame);
            break;
        case 'dragons':
            drawDragonFlight(ctx, width, height, animationFrame);
            break;
        case 'tsunami':
            drawTsunami(ctx, width, height, animationFrame);
            break;
        case 'volcano':
            drawVolcano(ctx, width / 2, height * 0.7, animationFrame);
            break;
        case 'phoenix':
            drawPhoenixRising(ctx, width / 2, height / 2, animationFrame);
            break;
        case 'blackhole':
            drawBlackHole(ctx, width / 2, height / 2, animationFrame);
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

function drawExplosion(ctx, x, y, frame) {
    const progress = frame / 60;
    const radius = progress * 400;
    
    // Outer blast wave
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 100, 0, ${1 - progress})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 0, ${0.8 - progress})`);
    gradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Shockwave rings
    for (let i = 0; i < 3; i++) {
        const ringProgress = (progress + i * 0.15) % 1;
        const ringRadius = ringProgress * 300;
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - ringProgress})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Debris particles
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 3 + (i % 5);
        const distance = progress * speed * 100;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        ctx.fillStyle = i % 2 === 0 ? '#FF4500' : '#FFD700';
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawTreasureChest(ctx, x, y, frame) {
    const progress = frame / 60;
    const chestWidth = 80;
    const chestHeight = 60;
    
    // Chest body
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.fillRect(x - chestWidth / 2, y, chestWidth, chestHeight);
    ctx.strokeRect(x - chestWidth / 2, y, chestWidth, chestHeight);
    
    // Chest lid (opening)
    const lidAngle = Math.min(progress * Math.PI / 2, Math.PI / 2);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-lidAngle);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(-chestWidth / 2, -30, chestWidth, 30);
    ctx.strokeRect(-chestWidth / 2, -30, chestWidth, 30);
    ctx.restore();
    
    // Gems bursting out
    if (progress > 0.3) {
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const burstProgress = (progress - 0.3) / 0.7;
            const distance = burstProgress * 150;
            const gemY = y - 30 - distance + Math.sin(burstProgress * Math.PI) * 100;
            const px = x + Math.cos(angle) * distance * 0.5;
            
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFD700', '#FF00FF'];
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 1 - burstProgress;
            
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(px, gemY - 10);
            ctx.lineTo(px + 8, gemY);
            ctx.lineTo(px, gemY + 10);
            ctx.lineTo(px - 8, gemY);
            ctx.closePath();
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;
}

function drawMeteorShower(ctx, width, height, frame) {
    const numMeteors = 20;
    
    for (let i = 0; i < numMeteors; i++) {
        const startX = (i * 137) % width + width;
        const progress = ((frame + i * 3) % 60) / 60;
        const x = startX - progress * (width + 200);
        const y = progress * height * 1.2;
        
        if (x < -100 || y > height) continue;
        
        // Meteor trail
        const gradient = ctx.createLinearGradient(x, y, x + 50, y - 50);
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0.8)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 50, y - 50);
        ctx.stroke();
        
        // Meteor head
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Sparkles
        for (let j = 0; j < 5; j++) {
            const sparkleX = x + j * 10;
            const sparkleY = y - j * 10;
            ctx.fillStyle = '#FFD700';
            ctx.globalAlpha = 0.7 - j * 0.1;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;
}

function drawAurora(ctx, width, height, frame) {
    const numWaves = 5;
    
    for (let i = 0; i < numWaves; i++) {
        const yOffset = i * 30;
        const colors = ['#00FF00', '#00FFFF', '#0080FF', '#FF00FF', '#FF0080'];
        
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = 0.3;
        
        ctx.beginPath();
        ctx.moveTo(0, yOffset);
        
        for (let x = 0; x <= width; x += 20) {
            const waveHeight = Math.sin((x / 100) + (frame / 20) + i) * 50;
            ctx.lineTo(x, yOffset + waveHeight + 100);
        }
        
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Sparkles
    for (let i = 0; i < 30; i++) {
        const x = (i * 73 + frame * 2) % width;
        const y = ((i * 127) % 200) + Math.sin(frame / 10 + i) * 20;
        const pulse = (Math.sin(frame / 5 + i) + 1) / 2;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = pulse * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawGalaxySwirl(ctx, x, y, frame) {
    const numStars = 100;
    const rotation = frame / 60;
    
    // Galaxy spiral
    for (let i = 0; i < numStars; i++) {
        const angle = (i / numStars) * Math.PI * 8 + rotation;
        const distance = (i / numStars) * 300;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        const colors = ['#FFFFFF', '#FFD700', '#00FFFF', '#FF00FF'];
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 1 - (i / numStars) * 0.5;
        
        const size = 3 - (i / numStars) * 2;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Central glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
}

function drawDragonFlight(ctx, width, height, frame) {
    const numDragons = 3;
    
    for (let i = 0; i < numDragons; i++) {
        const progress = ((frame + i * 20) % 80) / 80;
        const x = -100 + progress * (width + 200);
        const y = 100 + i * 80 + Math.sin(progress * Math.PI * 4) * 30;
        
        // Dragon body (simple)
        ctx.strokeStyle = i % 2 === 0 ? '#FF0000' : '#FFD700';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        // Body curve
        ctx.beginPath();
        ctx.moveTo(x - 40, y);
        ctx.quadraticCurveTo(x, y - 20, x + 40, y);
        ctx.stroke();
        
        // Wings
        const wingFlap = Math.sin(frame / 5 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 30, y - 40 + wingFlap);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 30, y - 40 + wingFlap);
        ctx.stroke();
        
        // Fire breath
        if (progress > 0.3 && progress < 0.7) {
            for (let j = 0; j < 10; j++) {
                const fireX = x + 40 + j * 10;
                const fireY = y + (Math.random() - 0.5) * 20;
                const fireSize = 5 - j * 0.3;
                
                ctx.fillStyle = j % 2 === 0 ? '#FF4500' : '#FFD700';
                ctx.globalAlpha = 1 - j / 10;
                ctx.beginPath();
                ctx.arc(fireX, fireY, fireSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    ctx.globalAlpha = 1;
}

function drawTsunami(ctx, width, height, frame) {
    const progress = frame / 60;
    const waveHeight = height * 0.6;
    const waveX = -width + progress * width * 2;
    
    // Wave body
    const gradient = ctx.createLinearGradient(0, waveHeight, 0, height);
    gradient.addColorStop(0, 'rgba(0, 100, 200, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 50, 150, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(waveX - 200, height);
    
    // Wave curve
    for (let x = waveX - 200; x < waveX + 400; x += 20) {
        const curveHeight = waveHeight + Math.sin((x - waveX) / 50) * 80;
        ctx.lineTo(x, curveHeight);
    }
    
    ctx.lineTo(waveX + 400, height);
    ctx.closePath();
    ctx.fill();
    
    // Wave foam
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(waveX - 200, waveHeight);
    for (let x = waveX - 200; x < waveX + 400; x += 20) {
        const curveHeight = waveHeight + Math.sin((x - waveX) / 50) * 80;
        ctx.lineTo(x, curveHeight);
    }
    ctx.stroke();
    
    // Spray particles
    for (let i = 0; i < 30; i++) {
        const px = waveX + (i - 15) * 20 + Math.random() * 40;
        const py = waveHeight - 50 - Math.random() * 100;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawVolcano(ctx, x, y, frame) {
    const progress = frame / 60;
    
    // Volcano mountain
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 100, y + 100);
    ctx.lineTo(x + 100, y + 100);
    ctx.closePath();
    ctx.fill();
    
    // Lava eruption
    for (let i = 0; i < 20; i++) {
        const angle = Math.PI / 2 + (i - 10) * 0.2;
        const speed = 3 + (i % 5);
        const distance = progress * speed * 100;
        const lavaX = x + Math.cos(angle) * distance * 0.3;
        const lavaY = y - Math.sin(angle) * distance;
        
        // Lava chunk
        ctx.fillStyle = '#FF4500';
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(lavaX, lavaY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        const gradient = ctx.createRadialGradient(lavaX, lavaY, 0, lavaX, lavaY, 20);
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(lavaX, lavaY, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Smoke
    for (let i = 0; i < 10; i++) {
        const smokeProgress = (progress + i * 0.1) % 1;
        const smokeX = x + (Math.random() - 0.5) * 60;
        const smokeY = y - smokeProgress * 200;
        const smokeSize = 20 + smokeProgress * 30;
        
        ctx.fillStyle = `rgba(80, 80, 80, ${0.5 - smokeProgress * 0.5})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawPhoenixRising(ctx, x, y, frame) {
    const progress = frame / 60;
    const phoenixY = y + 100 - progress * 200;
    
    // Phoenix body
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    
    // Body curve
    ctx.beginPath();
    ctx.moveTo(x, phoenixY);
    ctx.quadraticCurveTo(x, phoenixY + 40, x, phoenixY + 60);
    ctx.stroke();
    
    // Wings
    const wingSpan = progress * 150;
    const wingFlap = Math.sin(frame / 8) * 20;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, phoenixY + 20);
    ctx.quadraticCurveTo(x - wingSpan / 2, phoenixY - wingFlap, x - wingSpan, phoenixY + 40);
    ctx.moveTo(x, phoenixY + 20);
    ctx.quadraticCurveTo(x + wingSpan / 2, phoenixY - wingFlap, x + wingSpan, phoenixY + 40);
    ctx.stroke();
    
    // Flame trail
    for (let i = 0; i < 20; i++) {
        const flameY = phoenixY + 60 + i * 10;
        const flameSize = 15 - i * 0.5;
        const flameX = x + Math.sin(frame / 10 + i) * 10;
        
        const colors = ['#FF0000', '#FF4500', '#FFD700'];
        ctx.fillStyle = colors[i % 3];
        ctx.globalAlpha = 1 - i / 20;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Embers
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const distance = progress * 100 + (i % 3) * 20;
        const emberX = x + Math.cos(angle) * distance;
        const emberY = phoenixY + Math.sin(angle) * distance;
        
        ctx.fillStyle = '#FFD700';
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawBlackHole(ctx, x, y, frame) {
    const progress = frame / 60;
    const holeSize = 50 + progress * 50;
    
    // Black hole center
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, holeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Event horizon
    const gradient = ctx.createRadialGradient(x, y, holeSize, x, y, holeSize * 3);
    gradient.addColorStop(0, 'rgba(100, 0, 150, 0.8)');
    gradient.addColorStop(0.5, 'rgba(50, 0, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 50, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, holeSize * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Accretion disk
    const numRings = 10;
    for (let i = 0; i < numRings; i++) {
        const angle = (frame / 20 + i * 0.3) % (Math.PI * 2);
        const radius = holeSize + i * 20;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        const diskGradient = ctx.createLinearGradient(-radius, 0, radius, 0);
        diskGradient.addColorStop(0, 'rgba(200, 100, 255, 0)');
        diskGradient.addColorStop(0.5, `rgba(150, 50, 200, ${0.6 - i * 0.05})`);
        diskGradient.addColorStop(1, 'rgba(200, 100, 255, 0)');
        
        ctx.strokeStyle = diskGradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Particles being pulled in
    for (let i = 0; i < 50; i++) {
        const particleAngle = (i / 50) * Math.PI * 2 + frame / 10;
        const spiralProgress = ((frame + i * 2) % 100) / 100;
        const distance = (1 - spiralProgress) * 300 + holeSize;
        const px = x + Math.cos(particleAngle) * distance;
        const py = y + Math.sin(particleAngle) * distance;
        
        ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#00FFFF';
        ctx.globalAlpha = spiralProgress;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
