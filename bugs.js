// bugs.js - Bug definitions with SVG art and stats

export const BUGS = {
    ladybug: {
        id: 'ladybug',
        name: 'Ladybug',
        stats: {
            speed: 0.75,
            jump: 0.75,
            power: 0.75,
            size: 0.8
        },
        color: '#ff4444',
        unlocked: true, // Always unlocked (starter bug)
        unlockRequirement: 'Starter Bug',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="60" rx="22" ry="28" fill="#cc0000" opacity="0.3"/>
            <ellipse cx="50" cy="50" rx="18" ry="25" fill="#ff4444"/>
            <ellipse cx="50" cy="35" rx="12" ry="12" fill="#2d2d2d"/>
            <ellipse cx="46" cy="32" rx="2" ry="2" fill="white"/>
            <ellipse cx="54" cy="32" rx="2" ry="2" fill="white"/>
            <path d="M 50 35 L 50 65" stroke="#2d2d2d" stroke-width="3"/>
            <circle cx="42" cy="45" r="4" fill="#2d2d2d"/>
            <circle cx="58" cy="45" r="4" fill="#2d2d2d"/>
            <circle cx="40" cy="58" r="3" fill="#2d2d2d"/>
            <circle cx="60" cy="58" r="3" fill="#2d2d2d"/>
            <path d="M 32 50 L 25 48" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 68 50 L 75 48" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 32 55 L 24 58" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 68 55 L 76 58" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
        </svg>`
    },
    
    grasshopper: {
        id: 'grasshopper',
        name: 'Grasshopper',
        stats: {
            speed: 0.9,
            jump: 1.0,
            power: 0.7,
            size: 0.9
        },
        color: '#7ed321',
        unlocked: false,
        unlockRequirement: 'firstVictory', // Win your first match
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="65" rx="20" ry="25" fill="#5fb304" opacity="0.3"/>
            <ellipse cx="50" cy="55" rx="15" ry="25" fill="#7ed321"/>
            <ellipse cx="50" cy="35" rx="10" ry="12" fill="#6fc415"/>
            <ellipse cx="46" cy="32" rx="2" ry="2" fill="black"/>
            <ellipse cx="54" cy="32" rx="2" ry="2" fill="black"/>
            <path d="M 45 28 L 42 22" stroke="#5fb304" stroke-width="2" stroke-linecap="round"/>
            <path d="M 55 28 L 58 22" stroke="#5fb304" stroke-width="2" stroke-linecap="round"/>
            <path d="M 35 50 Q 25 55, 20 70 Q 18 80, 15 85" stroke="#5fb304" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 65 50 Q 75 55, 80 70 Q 82 80, 85 85" stroke="#5fb304" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 40 60 L 30 65" stroke="#5fb304" stroke-width="3" stroke-linecap="round"/>
            <path d="M 60 60 L 70 65" stroke="#5fb304" stroke-width="3" stroke-linecap="round"/>
            <ellipse cx="50" cy="40" rx="12" ry="8" fill="#8fe632" opacity="0.6"/>
        </svg>`
    },
    
    stagBeetle: {
        id: 'stagBeetle',
        name: 'Beetle',
        stats: {
            speed: 0.6,
            jump: 0.7,
            power: 1.0,
            size: 1.2
        },
        color: '#8B4513',
        unlocked: false,
        unlockRequirement: 'champion', // Win 10 matches
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="60" rx="25" ry="35" fill="#5d2e0f" opacity="0.3"/>
            <ellipse cx="50" cy="50" rx="20" ry="30" fill="#8B4513"/>
            <ellipse cx="50" cy="35" rx="15" ry="15" fill="#6b3410"/>
            <ellipse cx="45" cy="32" rx="3" ry="3" fill="white"/>
            <ellipse cx="55" cy="32" rx="3" ry="3" fill="white"/>
            <ellipse cx="45" cy="32" rx="1.5" ry="1.5" fill="black"/>
            <ellipse cx="55" cy="32" rx="1.5" ry="1.5" fill="black"/>
            <path d="M 35 25 Q 30 15, 28 10 Q 26 8, 24 10" stroke="#4a2710" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 65 25 Q 70 15, 72 10 Q 74 8, 76 10" stroke="#4a2710" stroke-width="4" fill="none" stroke-linecap="round"/>
            <ellipse cx="40" cy="65" rx="8" ry="4" fill="#4a2710"/>
            <ellipse cx="60" cy="65" rx="8" ry="4" fill="#4a2710"/>
            <path d="M 30 50 L 20 45" stroke="#4a2710" stroke-width="3" stroke-linecap="round"/>
            <path d="M 70 50 L 80 45" stroke="#4a2710" stroke-width="3" stroke-linecap="round"/>
            <path d="M 30 55 L 18 58" stroke="#4a2710" stroke-width="3" stroke-linecap="round"/>
            <path d="M 70 55 L 82 58" stroke="#4a2710" stroke-width="3" stroke-linecap="round"/>
        </svg>`
    },
    
    ant: {
        id: 'ant',
        name: 'Ant',
        stats: {
            speed: 1.0,
            jump: 0.65,
            power: 0.5,
            size: 0.6
        },
        color: '#2d2d2d',
        unlocked: false,
        unlockRequirement: 'Score 50 goals',
        unlockAchievement: 'goalMachine', // Links to achievement ID
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="65" rx="15" ry="18" fill="#1a1a1a" opacity="0.3"/>
            <circle cx="50" cy="55" r="12" fill="#2d2d2d"/>
            <circle cx="50" cy="40" r="9" fill="#3a3a3a"/>
            <circle cx="50" cy="27" r="7" fill="#2d2d2d"/>
            <ellipse cx="47" cy="25" rx="1.5" ry="1.5" fill="white"/>
            <ellipse cx="53" cy="25" rx="1.5" ry="1.5" fill="white"/>
            <path d="M 45 22 L 42 15" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 55 22 L 58 15" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 38 50 L 28 45" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 62 50 L 72 45" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 38 55 L 26 52" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 62 55 L 74 52" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 42 65 L 32 72" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
            <path d="M 58 65 L 68 72" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/>
        </svg>`
    },
    
    spider: {
        id: 'spider',
        name: 'Spider',
        stats: {
            speed: 0.85,
            jump: 0.8,
            power: 0.8,
            size: 1.0
        },
        color: '#4a235a',
        unlocked: false,
        unlockRequirement: 'Win 10 matches',
        unlockAchievement: 'champion', // Links to achievement ID
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="62" rx="20" ry="22" fill="#2e1a3a" opacity="0.3"/>
            <ellipse cx="50" cy="52" rx="16" ry="20" fill="#4a235a"/>
            <circle cx="50" cy="35" r="12" fill="#5b2d6f"/>
            <ellipse cx="46" cy="32" rx="2" ry="2" fill="red"/>
            <ellipse cx="54" cy="32" rx="2" ry="2" fill="red"/>
            <ellipse cx="43" cy="36" rx="1.5" ry="1.5" fill="red"/>
            <ellipse cx="57" cy="36" rx="1.5" ry="1.5" fill="red"/>
            <path d="M 34 45 Q 20 40, 10 35" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 66 45 Q 80 40, 90 35" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 34 52 Q 18 50, 8 48" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 66 52 Q 82 50, 92 48" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 36 58 Q 20 62, 10 68" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 64 58 Q 80 62, 90 68" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 38 65 Q 24 72, 14 78" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 62 65 Q 76 72, 86 78" stroke="#2e1a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>`
    }
};

export function getBugArray() {
    return Object.values(BUGS);
}

export function getBugById(id) {
    return BUGS[id];
}

export function isBugUnlocked(bugId, achievementManager) {
    const bug = BUGS[bugId];
    if (!bug) return false;
    
    // Always unlocked bugs (starters)
    if (bug.unlocked === true) return true;
    
    // Check if linked achievement is unlocked
    if (bug.unlockAchievement && achievementManager) {
        const achievement = achievementManager.achievements[bug.unlockAchievement];
        return achievement ? achievement.unlocked : false;
    }
    
    return false;
}

export function getUnlockedBugs(achievementManager) {
    return getBugArray().filter(bug => isBugUnlocked(bug.id, achievementManager));
}

export function getLockedBugs(achievementManager) {
    return getBugArray().filter(bug => !isBugUnlocked(bug.id, achievementManager));
}
