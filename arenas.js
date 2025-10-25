// arenas.js - Arena/background definitions

export const ARENAS = {
    grassField: {
        id: 'grassField',
        name: 'Grass Field',
        groundColor: '#4a7c2c',
        skyColors: ['#87CEEB', '#4A90E2'],
        grassBlades: true,
        description: 'Classic grassy soccer field',
        weather: 'clear',
        unlocked: true,
        unlockRequirement: 'Starter Arena'
    },
    
    dirtPatch: {
        id: 'dirtPatch',
        name: 'Dirt Patch',
        groundColor: '#8B6914',
        skyColors: ['#CD853F', '#8B6914'],
        grassBlades: false,
        description: 'Dusty dirt arena',
        weather: 'dusty',
        unlocked: true,
        unlockRequirement: 'Starter Arena'
    },
    
    leafArena: {
        id: 'leafArena',
        name: 'Leaf Arena',
        groundColor: '#6B8E23',
        skyColors: ['#90EE90', '#228B22'],
        grassBlades: true,
        description: 'Arena on a giant leaf',
        weather: 'clear',
        unlocked: true,
        unlockRequirement: 'Starter Arena'
    },
    
    desertOasis: {
        id: 'desertOasis',
        name: 'Desert Oasis',
        groundColor: '#EDC9AF',
        skyColors: ['#FFE4B5', '#DEB887'],
        grassBlades: false,
        description: 'Hot sandy desert arena',
        weather: 'hot',
        unlocked: false,
        unlockRequirement: 'Win your first match',
        unlockAchievement: 'firstVictory'
    },
    
    snowyPark: {
        id: 'snowyPark',
        name: 'Snowy Park',
        groundColor: '#E6F2FF',
        skyColors: ['#B0C4DE', '#778899'],
        grassBlades: false,
        description: 'Winter wonderland field',
        weather: 'snowy',
        unlocked: false,
        unlockRequirement: 'Score 50 goals',
        unlockAchievement: 'goalMachine'
    },
    
    volcanicRock: {
        id: 'volcanicRock',
        name: 'Volcanic Rock',
        groundColor: '#3d2817',
        skyColors: ['#FF4500', '#8B0000'],
        grassBlades: false,
        description: 'Dangerous volcanic terrain',
        weather: 'hot',
        unlocked: false,
        unlockRequirement: 'Win 10 matches',
        unlockAchievement: 'champion'
    },
    
    mushroomForest: {
        id: 'mushroomForest',
        name: 'Mushroom Forest',
        groundColor: '#8B4513',
        skyColors: ['#DDA0DD', '#BA55D3'],
        grassBlades: true,
        description: 'Magical mushroom grove',
        weather: 'foggy',
        unlocked: false,
        unlockRequirement: 'Win without conceding',
        unlockAchievement: 'perfectGame'
    },
    
    beachSand: {
        id: 'beachSand',
        name: 'Beach Sand',
        groundColor: '#F4A460',
        skyColors: ['#87CEEB', '#00BFFF'],
        grassBlades: false,
        description: 'Tropical beach paradise',
        weather: 'sunny',
        unlocked: false,
        unlockRequirement: 'Score 3 goals in one match',
        unlockAchievement: 'hatTrick'
    },
    
    moonCrater: {
        id: 'moonCrater',
        name: 'Moon Crater',
        groundColor: '#696969',
        skyColors: ['#000000', '#1a1a2e'],
        grassBlades: false,
        description: 'Low gravity lunar surface',
        weather: 'space',
        unlocked: false,
        unlockRequirement: 'Score 100 goals',
        unlockAchievement: 'centurion'
    },
    
    autumnLeaves: {
        id: 'autumnLeaves',
        name: 'Autumn Leaves',
        groundColor: '#8B4513',
        skyColors: ['#FF8C00', '#FF6347'],
        grassBlades: true,
        description: 'Colorful fall foliage',
        weather: 'windy',
        unlocked: false,
        unlockRequirement: 'Win by 5+ goals',
        unlockAchievement: 'blowout'
    },
    
    iceCave: {
        id: 'iceCave',
        name: 'Ice Cave',
        groundColor: '#B0E0E6',
        skyColors: ['#4682B4', '#5F9EA0'],
        grassBlades: false,
        description: 'Slippery frozen cavern',
        weather: 'icy',
        unlocked: false,
        unlockRequirement: 'Win after being 2+ down',
        unlockAchievement: 'comeback'
    },
    
    gardenPond: {
        id: 'gardenPond',
        name: 'Garden Pond',
        groundColor: '#2E8B57',
        skyColors: ['#98FB98', '#3CB371'],
        grassBlades: true,
        description: 'Peaceful garden setting',
        weather: 'clear',
        unlocked: false,
        unlockRequirement: 'Win 50 matches',
        unlockAchievement: 'unbeatable'
    },
    
    neonCity: {
        id: 'neonCity',
        name: 'Neon City',
        groundColor: '#2F4F4F',
        skyColors: ['#FF00FF', '#00FFFF'],
        grassBlades: false,
        description: 'Futuristic cyberpunk arena',
        weather: 'neon',
        unlocked: false,
        unlockRequirement: 'Play 100 matches',
        unlockAchievement: 'marathonMan'
    },
    
    candyLand: {
        id: 'candyLand',
        name: 'Candy Land',
        groundColor: '#FFB6C1',
        skyColors: ['#FFE4E1', '#FFC0CB'],
        grassBlades: false,
        description: 'Sweet sugary wonderland',
        weather: 'sweet',
        unlocked: false,
        unlockRequirement: 'Score in first 10 seconds',
        unlockAchievement: 'quickDraw'
    },
    
    jungleVines: {
        id: 'jungleVines',
        name: 'Jungle Vines',
        groundColor: '#2F4F2F',
        skyColors: ['#9ACD32', '#556B2F'],
        grassBlades: true,
        description: 'Dense tropical jungle',
        weather: 'humid',
        unlocked: false,
        unlockRequirement: 'Win 10 perfect games',
        unlockAchievement: 'shutoutKing'
    },
    
    crystalCavern: {
        id: 'crystalCavern',
        name: 'Crystal Cavern',
        groundColor: '#663399',
        skyColors: ['#9370DB', '#8A2BE2'],
        grassBlades: false,
        description: 'Glittering gem-filled cave',
        weather: 'sparkly',
        unlocked: false,
        unlockRequirement: 'Score 1000 goals',
        unlockAchievement: 'legendary'
    }
};

export function getArenaArray() {
    return Object.values(ARENAS);
}

export function getArenaById(id) {
    return ARENAS[id];
}

export function drawArenaBackground(ctx, arena, width, height, qualitySettings = null, gameMode = null, towerLevel = 1) {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, arena.skyColors[0]);
    skyGradient.addColorStop(1, arena.skyColors[1]);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Tower visualization removed - now only shown in preview screen
    
    // Special weather effects in background (skip on low quality)
    const showWeatherEffects = !qualitySettings || qualitySettings.getSetting('grassBlades') !== false;
    if (showWeatherEffects) {
        if (arena.weather === 'snowy') {
            drawSnowfall(ctx, width, height);
        } else if (arena.weather === 'space') {
            drawStars(ctx, width, height);
        } else if (arena.weather === 'neon') {
            drawNeonGrid(ctx, width, height);
        } else if (arena.weather === 'sparkly') {
            drawSparkles(ctx, width, height);
        }
    }
    
    // Ground
    const groundHeight = height * 0.3;
    const groundGradient = ctx.createLinearGradient(0, height - groundHeight, 0, height);
    groundGradient.addColorStop(0, arena.groundColor);
    groundGradient.addColorStop(1, shadeColor(arena.groundColor, -20));
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height - groundHeight, width, groundHeight);
    
    // Ground line
    ctx.strokeStyle = shadeColor(arena.groundColor, -30);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height - groundHeight);
    ctx.lineTo(width, height - groundHeight);
    ctx.stroke();
    
    // Special ground textures
    if (!arena.grassBlades) {
        if (arena.weather === 'dusty' || arena.weather === 'hot') {
            drawDirtTexture(ctx, width, height, groundHeight);
        } else if (arena.weather === 'icy') {
            drawIceTexture(ctx, width, height, groundHeight);
        } else if (arena.weather === 'sweet') {
            drawCandyTexture(ctx, width, height, groundHeight);
        }
    }
    
    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height - groundHeight);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawDirtTexture(ctx, width, height, groundHeight) {
    ctx.fillStyle = 'rgba(101, 67, 33, 0.3)';
    
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = height - groundHeight + Math.random() * groundHeight;
        const size = 1 + Math.random() * 3;
        
        ctx.fillRect(x, y, size, size);
    }
}

function drawIceTexture(ctx, width, height, groundHeight) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Draw ice cracks
    for (let i = 0; i < 15; i++) {
        const startX = Math.random() * width;
        const startY = height - groundHeight + Math.random() * groundHeight;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 100, startY + (Math.random() - 0.5) * 50);
        ctx.stroke();
    }
}

function drawCandyTexture(ctx, width, height, groundHeight) {
    // Draw subtle pastel stripes instead of dots
    const stripeColors = ['rgba(255, 182, 193, 0.2)', 'rgba(255, 192, 203, 0.2)', 'rgba(255, 228, 225, 0.2)'];
    const stripeWidth = 40;
    
    for (let i = 0; i < width / stripeWidth; i++) {
        ctx.fillStyle = stripeColors[i % stripeColors.length];
        ctx.fillRect(i * stripeWidth, height - groundHeight, stripeWidth, groundHeight);
    }
    
    // Add a subtle candy cane border at the top
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - groundHeight);
    ctx.lineTo(width, height - groundHeight);
    ctx.stroke();
}

function drawSnowfall(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    const time = Date.now() / 1000;
    for (let i = 0; i < 50; i++) {
        const x = (i * 37 + time * 20) % width;
        const y = (i * 53 + time * 30) % height;
        const size = 2 + (i % 3);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStars(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Fixed star positions (pseudo-random but consistent)
    for (let i = 0; i < 100; i++) {
        const x = (i * 73) % width;
        const y = (i * 127) % (height * 0.7);
        const size = 1 + (i % 3);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawNeonGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height * 0.7);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height * 0.7; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawSparkles(ctx, width, height) {
    const time = Date.now() / 500;
    const colors = ['rgba(255, 215, 0, 0.6)', 'rgba(255, 105, 180, 0.6)', 'rgba(138, 43, 226, 0.6)'];
    
    for (let i = 0; i < 30; i++) {
        const x = (i * 67 + Math.sin(time + i) * 20) % width;
        const y = (i * 43 + Math.cos(time + i) * 20) % (height * 0.7);
        const size = 2 + Math.sin(time * 2 + i) * 2;
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, Math.abs(size), 0, Math.PI * 2);
        ctx.fill();
    }
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

export function isArenaUnlocked(arenaId, achievementManager) {
    const arena = ARENAS[arenaId];
    if (!arena) return false;
    
    // Always unlocked arenas (starters)
    if (arena.unlocked === true) return true;
    
    // Check if linked achievement is unlocked
    if (arena.unlockAchievement && achievementManager) {
        const achievement = achievementManager.achievements[arena.unlockAchievement];
        return achievement ? achievement.unlocked : false;
    }
    
    return false;
}

export function getUnlockedArenas(achievementManager) {
    return getArenaArray().filter(arena => isArenaUnlocked(arena.id, achievementManager));
}

export function getLockedArenas(achievementManager) {
    return getArenaArray().filter(arena => !isArenaUnlocked(arena.id, achievementManager));
}
