// cosmetics.js - Bug cosmetic items (hats, accessories, etc.)

// Image cache for cosmetic assets
const cosmeticImages = {};
let imagesLoaded = false;

// Load cosmetic images
export function loadCosmeticImages() {
    return new Promise((resolve) => {
        // Cosmetic images removed - Assets folder deleted
        // All cosmetics use emoji/canvas rendering instead
        const imagesToLoad = [];
        
        imagesLoaded = true;
        console.log('Cosmetic images disabled (Assets folder removed)');
        resolve();
    });
}

export const COSMETICS = {
    // === HATS ===
    none: {
        id: 'none',
        name: 'No Hat',
        icon: '⚪',
        description: 'Default appearance',
        category: 'hat',
        unlockCondition: 'Default',
        unlocked: true,
        hitboxModifier: { width: 0, height: 0 }, // No change
        visualOffset: { x: 0, y: 0 }
    },
    
    topHat: {
        id: 'topHat',
        name: 'Top Hat',
        icon: '🎩',
        description: 'Classy and sophisticated',
        category: 'hat',
        unlockCondition: 'Win 5 matches',
        requiredWins: 5,
        unlocked: false,
        hitboxModifier: { width: 0, height: 0 }, // Visual only, no gameplay impact
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/tophat.png'
    },
    
    crown: {
        id: 'crown',
        name: 'Royal Crown',
        icon: '👑',
        description: 'For champions only',
        category: 'hat',
        unlockCondition: 'Complete Tower Level 10',
        requiredTowerLevel: 10,
        unlocked: false,
        hitboxModifier: { width: 5, height: 0 }, // Width for collision, height visual only
        visualOffset: { x: 0, y: -35 }, // Raised higher to sit above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/crown.png'
    },
    
    partyHat: {
        id: 'partyHat',
        name: 'Party Hat',
        icon: '🎉',
        description: 'Always ready to celebrate',
        category: 'hat',
        unlockCondition: 'Score 20 goals',
        requiredGoals: 20,
        unlocked: false,
        hitboxModifier: { width: 0, height: 0 }, // Visual only, no gameplay impact
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/partyhat.png'
    },
    
    wizardHat: {
        id: 'wizardHat',
        name: 'Wizard Hat',
        icon: '🧙',
        description: 'Magical and mysterious',
        category: 'hat',
        unlockCondition: 'Win 15 matches',
        requiredWins: 15,
        unlocked: false,
        hitboxModifier: { width: 0, height: 0 }, // Visual only, no gameplay impact
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/wizardhat.png'
    },
    
    cowboyHat: {
        id: 'cowboyHat',
        name: 'Cowboy Hat',
        icon: '🤠',
        description: 'Yeehaw!',
        category: 'hat',
        unlockCondition: 'Win 10 matches',
        requiredWins: 10,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Width for hat brim, height visual only
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/cowboyhat.png'
    },
    
    cowgirlHat: {
        id: 'cowgirlHat',
        name: 'Cowgirl Hat',
        icon: '🤠',
        description: 'Giddy up!',
        category: 'hat',
        unlockCondition: 'Win 12 matches',
        requiredWins: 12,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Width for hat brim, height visual only
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/cowgirlhat.png'
    },
    
    halo: {
        id: 'halo',
        name: 'Halo',
        icon: '😇',
        description: 'Angelic presence',
        category: 'hat',
        unlockCondition: 'Score 50 goals',
        requiredGoals: 50,
        unlocked: false,
        hitboxModifier: { width: 0, height: 0 }, // Visual only, no gameplay impact
        visualOffset: { x: 0, y: -40 }, // Positioned floating above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/halo.png'
    },
    
    viking: {
        id: 'viking',
        name: 'Viking Helmet',
        icon: '⚔️',
        description: 'Warrior of the field',
        category: 'hat',
        unlockCondition: 'Win 25 matches',
        requiredWins: 25,
        unlocked: false,
        hitboxModifier: { width: 12, height: 0 }, // Width for horns, height visual only
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/vikinghelmet.png'
    },
    
    propellerCap: {
        id: 'propellerCap',
        name: 'Propeller Cap',
        icon: '🚁',
        description: 'Ready for takeoff',
        category: 'hat',
        unlockCondition: 'Score 30 goals',
        requiredGoals: 30,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Width for propeller, height visual only
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        animated: true, // Spins
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/propellercap.png'
    },
    
    chef: {
        id: 'chef',
        name: 'Chef Hat',
        icon: '👨‍🍳',
        description: 'Cooking up victories',
        category: 'hat',
        unlockCondition: 'Win 20 matches',
        requiredWins: 20,
        unlocked: false,
        hitboxModifier: { width: 0, height: 0 }, // Visual only, no gameplay impact
        visualOffset: { x: 0, y: -35 }, // Positioned above the head
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/chefhat.png'
    },
    
    // === GLASSES ===
    sunglasses: {
        id: 'sunglasses',
        name: 'Cool Sunglasses',
        icon: '😎',
        description: 'Too cool for school',
        category: 'glasses',
        unlockCondition: 'Win 8 matches',
        requiredWins: 8,
        unlocked: false,
        hitboxModifier: { width: 6, height: 0 }, // Wider from sides
        visualOffset: { x: 0, y: -4 }, // Moved up to cover full eyes
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/sunglasses.png'
    },
    
    monocle: {
        id: 'monocle',
        name: 'Fancy Monocle',
        icon: '🧐',
        description: 'Distinguished and refined',
        category: 'glasses',
        unlockCondition: 'Score 15 goals',
        requiredGoals: 15,
        unlocked: false,
        hitboxModifier: { width: 3, height: 0 }, // Slight width increase
        visualOffset: { x: 8, y: -4 }, // Positioned over right eye
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/monocle.png'
    },
    
    mask: {
        id: 'mask',
        name: 'Hero Mask',
        icon: '🦸',
        description: 'Secret identity',
        category: 'glasses',
        unlockCondition: 'Win 18 matches',
        requiredWins: 18,
        unlocked: false,
        hitboxModifier: { width: 4, height: 0 },
        visualOffset: { x: 0, y: -4 }, // Positioned over eyes like sunglasses
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/heromask.png'
    },
    
    // === ACCESSORIES ===
    wings: {
        id: 'wings',
        name: 'Fairy Wings',
        icon: '🧚',
        description: 'Adds flight aesthetic',
        category: 'accessory',
        unlockCondition: 'Score 40 goals',
        requiredGoals: 40,
        unlocked: false,
        hitboxModifier: { width: 15, height: 0 }, // Width for wings, height visual only
        visualOffset: { x: 0, y: -5 },
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/fairywings.png'
    },
    
    cape: {
        id: 'cape',
        name: 'Superhero Cape',
        icon: '🦸‍♂️',
        description: 'Heroic flowing cape',
        category: 'accessory',
        unlockCondition: 'Complete Tower Level 15',
        requiredTowerLevel: 15,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Width for cape, height visual only
        visualOffset: { x: -8, y: 0 }
    },
    
    bowtie: {
        id: 'bowtie',
        name: 'Hair Bow',
        icon: '🎀',
        description: 'Formal and fancy',
        category: 'hat', // Changed to 'hat' so it's positioned on the head
        unlockCondition: 'Win 12 matches',
        requiredWins: 12,
        unlocked: false,
        hitboxModifier: { width: 4, height: 0 },
        visualOffset: { x: 15, y: -30 }, // Offset to the side and above
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/bowtie.png'
    },
    
    scarf: {
        id: 'scarf',
        name: 'Cozy Scarf',
        icon: '🧣',
        description: 'Warm and stylish',
        category: 'glasses', // Changed to 'glasses' so it renders in front of player
        unlockCondition: 'Score 25 goals',
        requiredGoals: 25,
        unlocked: false,
        hitboxModifier: { width: 6, height: 0 }, // Width for scarf, height visual only
        visualOffset: { x: 0, y: 15 }, // Moved down to neck area
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/scarf.png'
    },
    
    mustache: {
        id: 'mustache',
        name: 'Fancy Mustache',
        icon: '🥸',
        description: 'Distinguished look',
        category: 'glasses', // Changed to 'glasses' so it renders in front of player
        unlockCondition: 'Win 14 matches',
        requiredWins: 14,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Mustache extends sideways
        visualOffset: { x: 0, y: 0 }, // Centered on face to cover eyes with glasses
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/fancymustache.png'
    },
    
    jetpack: {
        id: 'jetpack',
        name: 'Jetpack',
        icon: '🚀',
        description: 'Rocket-powered style',
        category: 'special', // Changed to 'special' so it renders in front and is visible
        unlockCondition: 'Complete Tower Level 18',
        requiredTowerLevel: 18,
        unlocked: false,
        hitboxModifier: { width: 10, height: 0 }, // Width for jetpack, height visual only
        visualOffset: { x: -20, y: 0 }, // Offset to the left side (appears on back when flipped)
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/jetpack.png'
    },
    
    backpack: {
        id: 'backpack',
        name: 'Adventure Backpack',
        icon: '🎒',
        description: 'Ready for adventure',
        category: 'special', // Changed to 'special' so it renders in front and is visible on the side
        unlockCondition: 'Score 35 goals',
        requiredGoals: 35,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Width for backpack, height visual only
        visualOffset: { x: -30, y: 0 }, // Increased offset to move it further to the side
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/backpack.png'
    },
    
    // === SPECIAL/LEGENDARY ===
    rainbow: {
        id: 'rainbow',
        name: 'Fox Tail',
        icon: '🦊',
        description: 'Fluffy fox tail',
        category: 'special',
        unlockCondition: 'Win 50 matches',
        requiredWins: 50,
        unlocked: false,
        hitboxModifier: { width: 15, height: 0 }, // Tail extends behind
        visualOffset: { x: -40, y: 15 }, // Positioned further to the side/back and lower (on butt)
        animated: false,
        useImage: true, // Use PNG image instead of emoji
        imagePath: 'Assets/Sprites/foxtail.png'
    },
    
    lightning: {
        id: 'lightning',
        name: 'Lightning Aura',
        icon: '⚡',
        description: 'Crackling with energy',
        category: 'special',
        unlockCondition: 'Complete Tower Level 20',
        requiredTowerLevel: 20,
        unlocked: false,
        hitboxModifier: { width: 10, height: 0 }, // Width for energy field, height visual only
        visualOffset: { x: 0, y: 0 },
        animated: true
    },
    
    fire: {
        id: 'fire',
        name: 'Fire Aura',
        icon: '🔥',
        description: 'Blazing with flames',
        category: 'special',
        unlockCondition: 'Score 75 goals',
        requiredGoals: 75,
        unlocked: false,
        hitboxModifier: { width: 8, height: 0 }, // Width for fire aura, height visual only
        visualOffset: { x: 0, y: 0 },
        animated: true
    }
};

export function getCosmeticArray() {
    return Object.values(COSMETICS);
}

export function getCosmeticById(id) {
    return COSMETICS[id];
}

export function getCosmeticsByCategory(category) {
    return Object.values(COSMETICS).filter(c => c.category === category);
}

export function checkCosmeticUnlock(cosmetic, profile) {
    if (cosmetic.unlocked) return true;
    
    const stats = profile.stats;
    
    if (cosmetic.requiredWins && stats.wins >= cosmetic.requiredWins) {
        return true;
    }
    
    if (cosmetic.requiredGoals && stats.goalsScored >= cosmetic.requiredGoals) {
        return true;
    }
    
    if (cosmetic.requiredTowerLevel && profile.tower.highestLevel >= cosmetic.requiredTowerLevel) {
        return true;
    }
    
    return false;
}

// Get loaded cosmetic image for UI display
export function getCosmeticImage(cosmeticId) {
    return cosmeticImages[cosmeticId] || null;
}

// Draw cosmetic on player
export function drawCosmetic(ctx, cosmeticId, player, bug, frame = 0, useRelativeCoords = false, gameContext = null) {
    const cosmetic = COSMETICS[cosmeticId];
    if (!cosmetic || cosmeticId === 'none') return;
    
    // If useRelativeCoords is true, we're already in the player's transformed coordinate space
    // So use (0, 0) as the center. Otherwise use player.x, player.y
    const x = useRelativeCoords ? 0 : player.x;
    const y = useRelativeCoords ? 0 : player.y;
    const width = player.width;
    const height = player.height;
    
    ctx.save();
    
    switch (cosmetic.category) {
        case 'hat':
            drawHat(ctx, cosmetic, x, y, width, height, frame);
            break;
        case 'glasses':
            drawGlasses(ctx, cosmetic, x, y, width, height);
            break;
        case 'accessory':
            drawAccessory(ctx, cosmetic, x, y, width, height, frame);
            break;
        case 'special':
            drawSpecial(ctx, cosmetic, x, y, width, height, frame, player, gameContext);
            break;
    }
    
    ctx.restore();
}

function drawHat(ctx, cosmetic, x, y, width, height, frame) {
    // Scale the offset based on player height so it works for all bug sizes
    const offsetY = y + (cosmetic.visualOffset.y * (height / 50)); // 50 is the base player height
    
    ctx.save();
    
    // Check if this cosmetic uses a PNG image
    if (cosmetic.useImage && cosmeticImages[cosmetic.id]) {
        const img = cosmeticImages[cosmetic.id];
        // Different sizes for different hats
        let imgWidth, imgHeight;
        if (cosmetic.id === 'bowtie') {
            imgWidth = width * 0.5; // Smaller for hair bow
            imgHeight = width * 0.5;
        } else {
            imgWidth = width * 1.0; // Normal size for other hats
            imgHeight = width * 1.0;
        }
        
        // Add offset for x position (scaled)
        const offsetX = x + (cosmetic.visualOffset.x * (width / 50));
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Flip the cowboy hat horizontally
        if (cosmetic.id === 'cowboyHat' || cosmetic.id === 'cowgirlHat') {
            ctx.save();
            ctx.translate(x, offsetY);
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(
                img,
                -imgWidth / 2,
                -imgHeight / 2,
                imgWidth,
                imgHeight
            );
            ctx.restore();
        } else if (cosmetic.id === 'bowtie') {
            // Rotate the bow to sit on the side of the head
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.rotate(-Math.PI / 6); // Rotate -30 degrees (tilted to the side)
            ctx.drawImage(
                img,
                -imgWidth / 2,
                -imgHeight / 2,
                imgWidth,
                imgHeight
            );
            ctx.restore();
        } else {
            // Draw the image centered at the offset position
            ctx.drawImage(
                img,
                offsetX - imgWidth / 2,
                offsetY - imgHeight / 2,
                imgWidth,
                imgHeight
            );
        }
    } else {
        // Fallback to emoji rendering
        // Add shadow for depth and visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = `${width * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Animated propeller spin
        if (cosmetic.id === 'propellerCap') {
            const rotation = (frame / 10) % (Math.PI * 2);
            ctx.save();
            ctx.translate(x, offsetY);
            ctx.rotate(rotation);
            ctx.fillText(cosmetic.icon, 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(cosmetic.icon, x, offsetY);
        }
    }
    
    ctx.restore();
}

function drawGlasses(ctx, cosmetic, x, y, width, height) {
    ctx.save();
    
    // Scale the offset based on player size so it works for all bug sizes
    const offsetX = x + (cosmetic.visualOffset.x * (width / 50)); // 50 is the base player width
    const offsetY = y + (cosmetic.visualOffset.y * (height / 50)); // 50 is the base player height
    
    // Check if this cosmetic uses a PNG image
    if (cosmetic.useImage && cosmeticImages[cosmetic.id]) {
        const img = cosmeticImages[cosmetic.id];
        // Different sizes for different items in glasses category
        let imgWidth, imgHeight;
        if (cosmetic.id === 'bowtie') {
            imgWidth = width * 0.5; // Smaller for bowtie
            imgHeight = width * 0.5;
        } else if (cosmetic.id === 'scarf') {
            imgWidth = width * 1.0; // Adjusted size for scarf
            imgHeight = width * 1.0;
        } else if (cosmetic.id === 'mustache') {
            imgWidth = width * 1.1; // Wide enough for glasses + mustache
            imgHeight = width * 1.1; // Tall enough for glasses, nose, and mustache
        } else {
            imgWidth = width * 0.9; // Narrower to match eye width better
            imgHeight = width * 0.7; // Much taller to cover full eyes
        }
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw the image centered on the face (where eyes would be)
        ctx.drawImage(
            img,
            offsetX - imgWidth / 2,
            offsetY - imgHeight / 2,
            imgWidth,
            imgHeight
        );
    } else {
        // Fallback to emoji rendering
        // Add shadow for visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = `${width * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(cosmetic.icon, offsetX, y - height * 0.15);
    }
    
    ctx.restore();
}

function drawAccessory(ctx, cosmetic, x, y, width, height, frame) {
    // Scale the offset based on player size so it works for all bug sizes
    const offsetX = x + (cosmetic.visualOffset.x * (width / 50)); // 50 is the base player width
    const offsetY = y + (cosmetic.visualOffset.y * (height / 50)); // 50 is the base player height
    
    ctx.save();
    
    // Check if this cosmetic uses a PNG image (like fairy wings)
    if (cosmetic.useImage && cosmeticImages[cosmetic.id]) {
        const img = cosmeticImages[cosmetic.id];
        // Different sizes for different accessories
        let imgWidth, imgHeight;
        if (cosmetic.id === 'bowtie') {
            imgWidth = width * 0.5; // Smaller for bowtie
            imgHeight = width * 0.5;
        } else {
            imgWidth = width * 1.5; // Larger for wings and other accessories
            imgHeight = width * 1.5;
        }
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw the image centered at the offset position
        ctx.drawImage(
            img,
            x - imgWidth / 2,
            offsetY - imgHeight / 2,
            imgWidth,
            imgHeight
        );
    } else if (cosmetic.id === 'cape') {
        // Draw cape behind player
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        const capeWave = Math.sin(frame / 5) * 5;
        ctx.moveTo(x - width * 0.3, y - height * 0.2);
        ctx.quadraticCurveTo(
            x - width * 0.8 + capeWave, 
            y, 
            x - width * 0.5, 
            y + height * 0.4
        );
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (cosmetic.id === 'wings') {
        // Fallback emoji wings on both sides with glow
        const wingFlap = Math.sin(frame / 8) * 5;
        
        // Add glow behind wings
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        
        ctx.font = `${width * 0.7}px Arial`;
        ctx.fillText('🦋', x - width * 0.6, y - wingFlap);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.fillText('🦋', -x - width * 0.6, y - wingFlap);
        ctx.restore();
    } else {
        // Add shadow for other accessories
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = `${width * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cosmetic.icon, offsetX, offsetY);
    }
    
    ctx.restore();
}

function drawSpecial(ctx, cosmetic, x, y, width, height, frame, player, gameContext) {
    ctx.save();
    
    // Check if this cosmetic uses a PNG image (like jetpack)
    if (cosmetic.useImage && cosmeticImages[cosmetic.id]) {
        const img = cosmeticImages[cosmetic.id];
        // Scale the offset based on player size
        const offsetX = x + (cosmetic.visualOffset.x * (width / 50));
        const offsetY = y + (cosmetic.visualOffset.y * (height / 50));
        
        let imgWidth, imgHeight;
        if (cosmetic.id === 'jetpack') {
            imgWidth = width * 0.8; // Size for jetpack
            imgHeight = width * 0.8;
        } else if (cosmetic.id === 'backpack') {
            imgWidth = width * 0.9; // Larger size for backpack
            imgHeight = width * 0.9;
        } else if (cosmetic.id === 'rainbow') {
            imgWidth = width * 1.0; // Size for fox tail
            imgHeight = width * 1.0;
        } else {
            imgWidth = width * 1.0;
            imgHeight = width * 1.0;
        }
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Flip the fox tail horizontally
        if (cosmetic.id === 'rainbow') {
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(
                img,
                -imgWidth / 2,
                -imgHeight / 2,
                imgWidth,
                imgHeight
            );
            ctx.restore();
        } else {
            // Draw the image normally
            ctx.drawImage(
                img,
                offsetX - imgWidth / 2,
                offsetY - imgHeight / 2,
                imgWidth,
                imgHeight
            );
        }
    }
    
    if (cosmetic.id === 'lightning') {
        // Lightning sparking across the bug's body
        ctx.globalAlpha = 0.85;
        
        // Create multiple small lightning arcs across the body
        const numArcs = 8;
        for (let i = 0; i < numArcs; i++) {
            // Random points on the bug's surface
            const angle1 = (Math.random() + frame / 30) * Math.PI * 2;
            const angle2 = (Math.random() + frame / 30) * Math.PI * 2;
            const radius1 = width * 0.5;
            const radius2 = width * 0.5;
            
            const startX = x + Math.cos(angle1) * radius1;
            const startY = y + Math.sin(angle1) * radius1;
            const endX = x + Math.cos(angle2) * radius2;
            const endY = y + Math.sin(angle2) * radius2;
            
            // Draw arc with jagged path
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            // Jagged lightning path between points
            const segments = 4;
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const midX = startX + (endX - startX) * t;
                const midY = startY + (endY - startY) * t;
                const offsetX = (Math.random() - 0.5) * width * 0.2;
                const offsetY = (Math.random() - 0.5) * height * 0.2;
                ctx.lineTo(midX + offsetX, midY + offsetY);
            }
            ctx.stroke();
        }
        
        // Add occasional bright flash sparks
        if (frame % 8 < 2) {
            const sparkAngle = Math.random() * Math.PI * 2;
            const sparkX = x + Math.cos(sparkAngle) * width * 0.5;
            const sparkY = y + Math.sin(sparkAngle) * height * 0.5;
            
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 25;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Static shock to nearby objects (ball and other players)
        if (gameContext) {
            const shockDistance = width * 2.5; // Range for static shock
            
            // Check ball proximity
            if (gameContext.ball) {
                const dx = gameContext.ball.x - player.x;
                const dy = gameContext.ball.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < shockDistance && distance > width) {
                    // Draw lightning arc to ball
                    const angle = Math.atan2(dy, dx);
                    const startX = x + Math.cos(angle) * width * 0.5;
                    const startY = y + Math.sin(angle) * height * 0.5;
                    const ballRelativeX = gameContext.ball.x - player.x;
                    const ballRelativeY = gameContext.ball.y - player.y;
                    
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.shadowColor = '#00BFFF';
                    ctx.shadowBlur = 20;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    
                    // Jagged path to ball
                    const segments = 5;
                    for (let j = 1; j <= segments; j++) {
                        const t = j / segments;
                        const midX = startX + ballRelativeX * t;
                        const midY = startY + ballRelativeY * t;
                        const offsetX = (Math.random() - 0.5) * width * 0.3;
                        const offsetY = (Math.random() - 0.5) * height * 0.3;
                        ctx.lineTo(midX + offsetX, midY + offsetY);
                    }
                    ctx.stroke();
                }
            }
            
            // Check other players proximity
            if (gameContext.players && Array.isArray(gameContext.players)) {
                for (const otherPlayer of gameContext.players) {
                    if (otherPlayer === player) continue; // Skip self
                    
                    const dx = otherPlayer.x - player.x;
                    const dy = otherPlayer.y - player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < shockDistance && distance > width) {
                        // Draw lightning arc to other player
                        const angle = Math.atan2(dy, dx);
                        const startX = x + Math.cos(angle) * width * 0.5;
                        const startY = y + Math.sin(angle) * height * 0.5;
                        const targetRelativeX = otherPlayer.x - player.x;
                        const targetRelativeY = otherPlayer.y - player.y;
                        
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.shadowColor = '#00BFFF';
                        ctx.shadowBlur = 20;
                        
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        
                        // Jagged path to other player
                        const segments = 5;
                        for (let j = 1; j <= segments; j++) {
                            const t = j / segments;
                            const midX = startX + targetRelativeX * t;
                            const midY = startY + targetRelativeY * t;
                            const offsetX = (Math.random() - 0.5) * width * 0.3;
                            const offsetY = (Math.random() - 0.5) * height * 0.3;
                            ctx.lineTo(midX + offsetX, midY + offsetY);
                        }
                        ctx.stroke();
                    }
                }
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
    
    if (cosmetic.id === 'fire') {
        // Make the bug look like it's on fire
        ctx.globalAlpha = 0.85;
        
        // Draw multiple layers of flames covering the bug's body
        const numFlameLayers = 12;
        for (let i = 0; i < numFlameLayers; i++) {
            const angle = (i / numFlameLayers) * Math.PI * 2 + frame / 15;
            const flicker = Math.sin(frame / 4 + i * 0.5) * 0.15;
            const baseRadius = width * 0.4;
            const flameRadius = baseRadius * (1 + flicker);
            
            const flameX = x + Math.cos(angle) * flameRadius;
            const flameY = y + Math.sin(angle) * flameRadius - width * 0.2; // Flames rise upward
            
            // Flame tongue shape
            const flameWidth = width * (0.25 + Math.random() * 0.1);
            const flameHeight = width * (0.6 + Math.random() * 0.3 + flicker);
            
            // Create flame gradient
            const gradient = ctx.createRadialGradient(
                flameX, flameY, 0,
                flameX, flameY - flameHeight * 0.3, flameHeight
            );
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)'); // White hot center
            gradient.addColorStop(0.2, 'rgba(255, 220, 0, 0.8)'); // Bright yellow
            gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.7)'); // Orange
            gradient.addColorStop(0.8, 'rgba(255, 60, 0, 0.4)'); // Red-orange
            gradient.addColorStop(1, 'rgba(100, 0, 0, 0)'); // Dark red fading
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#FF6600';
            ctx.shadowBlur = 25;
            
            // Draw flame as irregular shape
            ctx.beginPath();
            ctx.ellipse(flameX, flameY, flameWidth, flameHeight, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add bright core glow at bug center
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, width * 0.5);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        coreGradient.addColorStop(0.4, 'rgba(255, 200, 0, 0.4)');
        coreGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(x, y, width * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Track fire trails (store in gameContext if available)
        if (gameContext && player) {
            // Initialize fire trails array if not exists
            if (!gameContext.fireTrails) {
                gameContext.fireTrails = [];
            }
            
            // Add new fire trail at player's current position every few frames
            if (frame % 3 === 0) {
                gameContext.fireTrails.push({
                    x: player.x,
                    y: player.y,
                    startTime: Date.now(),
                    width: width * 0.4
                });
            }
            
            // Draw and update fire trails
            const now = Date.now();
            gameContext.fireTrails = gameContext.fireTrails.filter(trail => {
                const age = (now - trail.startTime) / 1000; // Age in seconds
                if (age > 2) return false; // Remove trails older than 2 seconds
                
                // Draw trail with fading intensity
                const intensity = 1 - (age / 2);
                ctx.globalAlpha = intensity * 0.6;
                
                const trailGradient = ctx.createRadialGradient(
                    trail.x - player.x, trail.y - player.y, 0,
                    trail.x - player.x, trail.y - player.y, trail.width
                );
                trailGradient.addColorStop(0, 'rgba(255, 220, 0, 0.8)'); // Yellow center
                trailGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)'); // Orange
                trailGradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Red fading
                
                ctx.fillStyle = trailGradient;
                ctx.shadowColor = '#FF4400';
                ctx.shadowBlur = 15;
                
                ctx.beginPath();
                ctx.arc(trail.x - player.x, trail.y - player.y, trail.width, 0, Math.PI * 2);
                ctx.fill();
                
                return true; // Keep trail
            });
            
            // Add burning effect to ball if close
            if (gameContext.ball) {
                const dx = gameContext.ball.x - player.x;
                const dy = gameContext.ball.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < width * 1.5) {
                    // Initialize ball fire effects
                    if (!gameContext.ballFireEffects) {
                        gameContext.ballFireEffects = [];
                    }
                    
                    // Add fire effect to ball
                    if (frame % 5 === 0) {
                        gameContext.ballFireEffects.push({
                            startTime: Date.now()
                        });
                    }
                }
                
                // Draw fire on ball (if it has fire effects)
                if (gameContext.ballFireEffects && gameContext.ballFireEffects.length > 0) {
                    const ballNow = Date.now();
                    gameContext.ballFireEffects = gameContext.ballFireEffects.filter(effect => {
                        const age = (ballNow - effect.startTime) / 1000;
                        if (age > 2) return false;
                        
                        const intensity = 1 - (age / 2);
                        ctx.globalAlpha = intensity * 0.7;
                        
                        // Make ball look like it's on fire with flame layers
                        const ballFlames = 8;
                        for (let i = 0; i < ballFlames; i++) {
                            const angle = (i / ballFlames) * Math.PI * 2 + ballNow / 100;
                            const flicker = Math.sin(ballNow / 200 + i) * 0.2;
                            const ballFlameX = dx + Math.cos(angle) * (12 * (1 + flicker));
                            const ballFlameY = dy + Math.sin(angle) * (12 * (1 + flicker)) - 10;
                            
                            const ballGradient = ctx.createRadialGradient(
                                ballFlameX, ballFlameY, 0,
                                ballFlameX, ballFlameY - 15, 20
                            );
                            ballGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
                            ballGradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.7)');
                            ballGradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.4)');
                            ballGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                            
                            ctx.fillStyle = ballGradient;
                            ctx.shadowColor = '#FF6600';
                            ctx.shadowBlur = 20;
                            
                            ctx.beginPath();
                            ctx.ellipse(ballFlameX, ballFlameY, 8, 18 * (1 + flicker), angle, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        
                        // Add bright core on ball
                        const ballCoreGradient = ctx.createRadialGradient(dx, dy, 0, dx, dy, 15);
                        ballCoreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.5)');
                        ballCoreGradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.3)');
                        ballCoreGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                        
                        ctx.fillStyle = ballCoreGradient;
                        ctx.shadowBlur = 25;
                        ctx.beginPath();
                        ctx.arc(dx, dy, 15, 0, Math.PI * 2);
                        ctx.fill();
                        
                        return true;
                    });
                }
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
    
    ctx.restore();
}

// Calculate total hitbox modifier from equipped cosmetics
export function calculateHitboxModifiers(cosmeticIds) {
    let totalWidth = 0;
    let totalHeight = 0;
    
    if (Array.isArray(cosmeticIds)) {
        cosmeticIds.forEach(id => {
            const cosmetic = COSMETICS[id];
            if (cosmetic && cosmetic.hitboxModifier) {
                totalWidth += cosmetic.hitboxModifier.width;
                totalHeight += cosmetic.hitboxModifier.height;
            }
        });
    }
    
    return { width: totalWidth, height: totalHeight };
}
