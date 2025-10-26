// saveSystem.js - Profile management and localStorage operations

const SAVE_PREFIX = 'bugBall_save_';

export class SaveSystem {
    static createProfile(name) {
        if (!name || name.trim() === '') {
            return { success: false, error: 'Name cannot be empty' };
        }
        
        const profileKey = SAVE_PREFIX + name.toLowerCase().replace(/\s+/g, '_');
        
        if (localStorage.getItem(profileKey)) {
            return { success: false, error: 'Profile already exists' };
        }
        
        const profile = {
            name: name.trim(),
            created: Date.now(),
            stats: {
                wins: 0,
                losses: 0,
                goalsScored: 0,
                goalsConceded: 0,
                matchesPlayed: 0
            },
            tower: {
                currentLevel: 1,
                highestLevel: 0,
                isComplete: false,
                levelsCompleted: 0
            },
            preferences: {
                selectedBug: 'ladybug',
                selectedArena: 'grassField'
            },
            selectedCelebration: 'classic',
            selectedBugAnimation: 'none',
            equippedCosmetics: [], // Array of equipped cosmetic IDs
            // Achievement progress (starts fresh for each profile)
            achievementProgress: {
                stats: {
                    totalGoals: 0,
                    totalWins: 0,
                    totalMatches: 0,
                    perfectGames: 0,
                    quickGoals: 0,
                    comebacks: 0,
                    blowouts: 0,
                    goalsInMatch: 0,
                    visitedArenas: []
                },
                achievements: {}
            }
        };
        
        localStorage.setItem(profileKey, JSON.stringify(profile));
        return { success: true, profile };
    }
    
    static loadProfile(name) {
        const profileKey = SAVE_PREFIX + name.toLowerCase().replace(/\s+/g, '_');
        const data = localStorage.getItem(profileKey);
        
        if (!data) {
            return null;
        }
        
        const profile = JSON.parse(data);
        
        // Migrate old profiles to new format
        if (!profile.selectedCelebration) {
            profile.selectedCelebration = 'classic';
        }
        if (!profile.selectedBugAnimation) {
            profile.selectedBugAnimation = 'none';
        }
        if (!profile.equippedCosmetics) {
            profile.equippedCosmetics = [];
        }
        if (!profile.tower.highestLevel) {
            profile.tower.highestLevel = profile.tower.levelsCompleted || 0;
        }
        // Add achievement progress if missing (for old profiles)
        if (!profile.achievementProgress) {
            profile.achievementProgress = {
                stats: {
                    totalGoals: 0,
                    totalWins: 0,
                    totalMatches: 0,
                    perfectGames: 0,
                    quickGoals: 0,
                    comebacks: 0,
                    blowouts: 0,
                    goalsInMatch: 0,
                    visitedArenas: []
                },
                achievements: {}
            };
        }
        
        return profile;
    }
    
    static saveProfile(profile) {
        const profileKey = SAVE_PREFIX + profile.name.toLowerCase().replace(/\s+/g, '_');
        localStorage.setItem(profileKey, JSON.stringify(profile));
    }
    
    static getAllProfiles() {
        const profiles = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(SAVE_PREFIX)) {
                const data = localStorage.getItem(key);
                if (data) {
                    profiles.push(JSON.parse(data));
                }
            }
        }
        
        return profiles.sort((a, b) => b.created - a.created);
    }
    
    static deleteProfile(name) {
        const profileKey = SAVE_PREFIX + name.toLowerCase().replace(/\s+/g, '_');
        localStorage.removeItem(profileKey);
    }
    
    static updateStats(profile, matchResult) {
        profile.stats.matchesPlayed++;
        profile.stats.goalsScored += matchResult.playerGoals;
        profile.stats.goalsConceded += matchResult.opponentGoals;
        
        if (matchResult.playerGoals > matchResult.opponentGoals) {
            profile.stats.wins++;
        } else if (matchResult.playerGoals < matchResult.opponentGoals) {
            profile.stats.losses++;
        }
        
        this.saveProfile(profile);
    }
    
    static updateTowerProgress(profile, levelCompleted) {
        if (levelCompleted > profile.tower.levelsCompleted) {
            profile.tower.levelsCompleted = levelCompleted;
            profile.tower.currentLevel = levelCompleted + 1;
        }
        
        this.saveProfile(profile);
    }
    
    static completeTower(profile) {
        profile.tower.isComplete = true;
        this.saveProfile(profile);
    }
    
    static updatePreferences(profile, preferences) {
        profile.preferences = { ...profile.preferences, ...preferences };
        this.saveProfile(profile);
    }
}
