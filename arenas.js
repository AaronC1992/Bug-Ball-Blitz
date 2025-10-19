// arenas.js - Arena/background definitions

export const ARENAS = {
    grassField: {
        id: 'grassField',
        name: 'Grass Field',
        groundColor: '#4a7c2c',
        skyColors: ['#87CEEB', '#4A90E2'],
        grassBlades: true,
        description: 'Classic grassy soccer field'
    },
    
    dirtPatch: {
        id: 'dirtPatch',
        name: 'Dirt Patch',
        groundColor: '#8B6914',
        skyColors: ['#CD853F', '#8B6914'],
        grassBlades: false,
        description: 'Dusty dirt arena'
    },
    
    leafArena: {
        id: 'leafArena',
        name: 'Leaf Arena',
        groundColor: '#6B8E23',
        skyColors: ['#90EE90', '#228B22'],
        grassBlades: true,
        description: 'Arena on a giant leaf'
    }
};

export function getArenaArray() {
    return Object.values(ARENAS);
}

export function getArenaById(id) {
    return ARENAS[id];
}

export function drawArenaBackground(ctx, arena, width, height) {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, arena.skyColors[0]);
    skyGradient.addColorStop(1, arena.skyColors[1]);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
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
    
    // Subtle texture only for dirt patches
    if (!arena.grassBlades) {
        drawDirtTexture(ctx, width, height, groundHeight);
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
