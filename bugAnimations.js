// bugAnimations.js - Bug celebration animations that play on the player bug

export const BUG_ANIMATIONS = {
    none: {
        id: 'none',
        name: 'None',
        icon: '⚪',
        description: 'No bug animation',
        unlockCondition: 'Default',
        unlocked: true
    },
    
    wiggle: {
        id: 'wiggle',
        name: 'Wiggle Dance',
        icon: '🕺',
        description: 'Bug wiggles left and right',
        unlockCondition: 'Score 5 goals',
        requiredGoals: 5,
        unlocked: false
    },
    
    spin: {
        id: 'spin',
        name: 'Victory Spin',
        icon: '🌀',
        description: 'Bug spins in circles',
        unlockCondition: 'Win 3 matches',
        requiredWins: 3,
        unlocked: false
    },
    
    bounce: {
        id: 'bounce',
        name: 'Happy Bounce',
        icon: '⬆️',
        description: 'Bug bounces up and down',
        unlockCondition: 'Score 10 goals',
        requiredGoals: 10,
        unlocked: false
    },
    
    backflip: {
        id: 'backflip',
        name: 'Backflip',
        icon: '🤸',
        description: 'Bug does a backflip',
        unlockCondition: 'Win 8 matches',
        requiredWins: 8,
        unlocked: false
    },
    
    shimmy: {
        id: 'shimmy',
        name: 'Shimmy Shake',
        icon: '💃',
        description: 'Bug does a shimmy dance',
        unlockCondition: 'Score 15 goals',
        requiredGoals: 15,
        unlocked: false
    },
    
    moonwalk: {
        id: 'moonwalk',
        name: 'Moonwalk',
        icon: '🌙',
        description: 'Bug moonwalks smoothly',
        unlockCondition: 'Win 12 matches',
        requiredWins: 12,
        unlocked: false
    },
    
    breakdance: {
        id: 'breakdance',
        name: 'Breakdance',
        icon: '🎪',
        description: 'Bug breakdances on the field',
        unlockCondition: 'Score 30 goals',
        requiredGoals: 30,
        unlocked: false
    },
    
    float: {
        id: 'float',
        name: 'Levitate',
        icon: '✨',
        description: 'Bug floats in the air',
        unlockCondition: 'Win 18 matches',
        requiredWins: 18,
        unlocked: false
    },
    
    cartwheel: {
        id: 'cartwheel',
        name: 'Cartwheel',
        icon: '🎡',
        description: 'Bug does cartwheels',
        unlockCondition: 'Score 40 goals',
        requiredGoals: 40,
        unlocked: false
    },
    
    glow: {
        id: 'glow',
        name: 'Victory Glow',
        icon: '💫',
        description: 'Bug glows with energy',
        unlockCondition: 'Win 22 matches',
        requiredWins: 22,
        unlocked: false
    },
    
    grow: {
        id: 'grow',
        name: 'Power Up',
        icon: '📈',
        description: 'Bug grows larger temporarily',
        unlockCondition: 'Score 50 goals',
        requiredGoals: 50,
        unlocked: false
    },
    
    tornado: {
        id: 'tornado',
        name: 'Tornado Spin',
        icon: '🌪️',
        description: 'Bug spins like a tornado',
        unlockCondition: 'Win 28 matches',
        requiredWins: 28,
        unlocked: false
    },
    
    teleport: {
        id: 'teleport',
        name: 'Teleport Flash',
        icon: '⚡',
        description: 'Bug teleports around',
        unlockCondition: 'Score 60 goals',
        requiredGoals: 60,
        unlocked: false
    },
    
    ultimate: {
        id: 'ultimate',
        name: 'Ultimate Victory',
        icon: '🏆',
        description: 'Epic multi-move combo',
        unlockCondition: 'Complete Tower Level 20',
        requiredTowerLevel: 20,
        unlocked: false
    }
};

export function getBugAnimationArray() {
    return Object.values(BUG_ANIMATIONS);
}

export function getBugAnimationById(id) {
    return BUG_ANIMATIONS[id];
}

// Check if bug animation is unlocked based on profile stats
export function checkBugAnimationUnlock(animation, profile) {
    if (animation.unlocked) return true;
    
    const stats = profile.stats;
    
    if (animation.requiredWins && stats.wins >= animation.requiredWins) {
        return true;
    }
    
    if (animation.requiredGoals && stats.goalsScored >= animation.requiredGoals) {
        return true;
    }
    
    if (animation.requiredTowerLevel && profile.tower.highestLevel >= animation.requiredTowerLevel) {
        return true;
    }
    
    return false;
}

// Draw bug animation on the player
export function drawBugAnimation(ctx, animationType, player, animationFrame) {
    if (!animationType || animationType === 'none') return;
    
    const x = player.x;
    const y = player.y;
    const radius = player.radius;
    
    switch (animationType) {
        case 'wiggle':
            drawWiggle(ctx, player, animationFrame);
            break;
        case 'spin':
            drawSpin(ctx, player, animationFrame);
            break;
        case 'bounce':
            drawBounce(ctx, player, animationFrame);
            break;
        case 'backflip':
            drawBackflip(ctx, player, animationFrame);
            break;
        case 'shimmy':
            drawShimmy(ctx, player, animationFrame);
            break;
        case 'moonwalk':
            drawMoonwalk(ctx, player, animationFrame);
            break;
        case 'breakdance':
            drawBreakdance(ctx, player, animationFrame);
            break;
        case 'float':
            drawFloat(ctx, player, animationFrame);
            break;
        case 'cartwheel':
            drawCartwheel(ctx, player, animationFrame);
            break;
        case 'glow':
            drawGlow(ctx, player, animationFrame);
            break;
        case 'grow':
            drawGrow(ctx, player, animationFrame);
            break;
        case 'tornado':
            drawTornado(ctx, player, animationFrame);
            break;
        case 'teleport':
            drawTeleport(ctx, player, animationFrame);
            break;
        case 'ultimate':
            drawUltimate(ctx, player, animationFrame);
            break;
    }
}

function drawWiggle(ctx, player, frame) {
    const offset = Math.sin(frame / 3) * 15;
    player.x += offset;
}

function drawSpin(ctx, player, frame) {
    const rotation = (frame / 30) * Math.PI * 2;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(rotation);
    ctx.translate(-player.x, -player.y);
    
    // Draw spinning lines around bug
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + rotation;
        const startX = player.x + Math.cos(angle) * player.radius * 1.5;
        const startY = player.y + Math.sin(angle) * player.radius * 1.5;
        const endX = player.x + Math.cos(angle) * player.radius * 2.5;
        const endY = player.y + Math.sin(angle) * player.radius * 2.5;
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawBounce(ctx, player, frame) {
    const bounceHeight = Math.abs(Math.sin(frame / 10)) * 50;
    player.y -= bounceHeight;
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    const shadowSize = player.radius * (1 - bounceHeight / 100);
    ctx.ellipse(player.x, player.y + bounceHeight + player.radius, shadowSize, shadowSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBackflip(ctx, player, frame) {
    const progress = (frame % 30) / 30;
    const rotation = progress * Math.PI * 2;
    const arcHeight = Math.sin(progress * Math.PI) * 60;
    
    ctx.save();
    ctx.translate(player.x, player.y - arcHeight);
    ctx.rotate(rotation);
    ctx.translate(-player.x, -(player.y - arcHeight));
    
    // Trail effect
    if (progress > 0.2) {
        ctx.fillStyle = player.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(player.x, player.y - arcHeight + 20, player.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
    
    player.y -= arcHeight;
}

function drawShimmy(ctx, player, frame) {
    const shimmy = Math.sin(frame / 2) * 10;
    const sway = Math.cos(frame / 3) * 8;
    
    player.x += shimmy;
    player.y += sway;
    
    // Sparkle particles
    for (let i = 0; i < 3; i++) {
        const angle = (frame / 5 + i * Math.PI * 2 / 3) % (Math.PI * 2);
        const px = player.x + Math.cos(angle) * player.radius * 2;
        const py = player.y + Math.sin(angle) * player.radius * 2;
        
        ctx.fillStyle = '#FFD700';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawMoonwalk(ctx, player, frame) {
    const slide = (frame / 60) * 100;
    const direction = player.x < 500 ? 1 : -1;
    
    player.x += direction * Math.sin(frame / 10) * 5;
    
    // Motion lines
    for (let i = 0; i < 5; i++) {
        const lineX = player.x - direction * (i * 10 + slide % 50);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lineX, player.y - player.radius);
        ctx.lineTo(lineX, player.y + player.radius);
        ctx.stroke();
    }
}

function drawBreakdance(ctx, player, frame) {
    const rotation = (frame / 15) * Math.PI * 2;
    const radius = 30;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(rotation);
    
    // Draw spinning legs effect
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
    
    // Energy circle
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawFloat(ctx, player, frame) {
    const floatHeight = Math.sin(frame / 15) * 40 + 40;
    player.y -= floatHeight;
    
    // Glowing aura
    const gradient = ctx.createRadialGradient(player.x, player.y, player.radius, player.x, player.y, player.radius * 3);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Floating particles
    for (let i = 0; i < 6; i++) {
        const angle = (frame / 20 + i * Math.PI / 3) % (Math.PI * 2);
        const distance = player.radius * 2 + Math.sin(frame / 10 + i) * 10;
        const px = player.x + Math.cos(angle) * distance;
        const py = player.y + Math.sin(angle) * distance;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawCartwheel(ctx, player, frame) {
    const progress = (frame % 40) / 40;
    const rotation = progress * Math.PI * 4;
    const moveDistance = progress * 150;
    const direction = player.x < 500 ? 1 : -1;
    
    player.x += direction * Math.sin(progress * Math.PI) * 5;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(rotation);
    
    // Draw rotating arms/legs
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-player.radius * 1.5, 0);
    ctx.lineTo(player.radius * 1.5, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -player.radius * 1.5);
    ctx.lineTo(0, player.radius * 1.5);
    ctx.stroke();
    
    ctx.restore();
}

function drawGlow(ctx, player, frame) {
    const pulseSize = Math.sin(frame / 10) * 0.3 + 1.3;
    
    // Multiple glow layers
    const colors = ['#FFD700', '#FFA500', '#FF69B4'];
    
    for (let i = 0; i < colors.length; i++) {
        const gradient = ctx.createRadialGradient(
            player.x, player.y, player.radius,
            player.x, player.y, player.radius * pulseSize * (1 + i * 0.3)
        );
        gradient.addColorStop(0, colors[i] + '40');
        gradient.addColorStop(1, colors[i] + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * pulseSize * (1 + i * 0.3), 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Energy particles
    for (let i = 0; i < 12; i++) {
        const angle = (frame / 15 + i * Math.PI * 2 / 12) % (Math.PI * 2);
        const distance = player.radius * pulseSize;
        const px = player.x + Math.cos(angle) * distance;
        const py = player.y + Math.sin(angle) * distance;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGrow(ctx, player, frame) {
    const scale = 1 + Math.sin(frame / 15) * 0.5;
    const originalRadius = player.radius;
    player.radius *= scale;
    
    // Power-up waves
    const waveRadius = player.radius * (1 + (frame % 20) / 20);
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1 - (frame % 20) / 20;
    ctx.beginPath();
    ctx.arc(player.x, player.y, waveRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawTornado(ctx, player, frame) {
    const rotation = (frame / 8) * Math.PI * 2;
    
    // Tornado spiral
    for (let i = 0; i < 30; i++) {
        const progress = i / 30;
        const angle = rotation + progress * Math.PI * 4;
        const radius = progress * player.radius * 3;
        const px = player.x + Math.cos(angle) * radius;
        const py = player.y + Math.sin(angle) * radius - progress * 100;
        
        ctx.fillStyle = `rgba(200, 200, 255, ${1 - progress})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Wind lines
    for (let i = 0; i < 8; i++) {
        const angle = rotation + i * Math.PI / 4;
        const startX = player.x + Math.cos(angle) * player.radius;
        const startY = player.y + Math.sin(angle) * player.radius;
        const endX = player.x + Math.cos(angle) * player.radius * 2.5;
        const endY = player.y + Math.sin(angle) * player.radius * 2.5;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

function drawTeleport(ctx, player, frame) {
    const teleportProgress = (frame % 30) / 30;
    
    if (teleportProgress < 0.3) {
        // Fade out
        ctx.globalAlpha = 1 - (teleportProgress / 0.3);
    } else if (teleportProgress > 0.7) {
        // Fade in
        ctx.globalAlpha = (teleportProgress - 0.7) / 0.3;
    } else {
        // Hidden
        ctx.globalAlpha = 0;
    }
    
    // Electric particles
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * player.radius * 2;
        const px = player.x + Math.cos(angle) * distance;
        const py = player.y + Math.sin(angle) * distance;
        
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset alpha for other drawing
    ctx.globalAlpha = 1;
}

function drawUltimate(ctx, player, frame) {
    // Combination of multiple effects
    const phase = Math.floor(frame / 20) % 4;
    
    switch (phase) {
        case 0:
            drawGlow(ctx, player, frame);
            drawSpin(ctx, player, frame);
            break;
        case 1:
            drawFloat(ctx, player, frame);
            drawGrow(ctx, player, frame);
            break;
        case 2:
            drawTornado(ctx, player, frame);
            break;
        case 3:
            drawTeleport(ctx, player, frame);
            drawBreakdance(ctx, player, frame);
            break;
    }
    
    // Ultimate aura
    const gradient = ctx.createRadialGradient(
        player.x, player.y, player.radius,
        player.x, player.y, player.radius * 4
    );
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 4, 0, Math.PI * 2);
    ctx.fill();
}
