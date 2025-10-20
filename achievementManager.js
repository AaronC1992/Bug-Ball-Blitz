// Achievement Manager
// Tracks player achievements and unlocks

export class AchievementManager {
    constructor() {
        this.achievements = this.defineAchievements();
        this.loadProgress();
        this.notificationQueue = [];
        this.currentNotification = null;
    }

    defineAchievements() {
        return {
            // Goal achievements
            firstGoal: {
                id: 'firstGoal',
                name: 'First Goal',
                description: 'Score your first goal',
                icon: '⚽',
                requirement: 1,
                stat: 'totalGoals',
                unlocked: false,
                category: 'goals'
            },
            goalMachine: {
                id: 'goalMachine',
                name: 'Goal Machine',
                description: 'Score 50 goals',
                icon: '🎯',
                requirement: 50,
                stat: 'totalGoals',
                unlocked: false,
                category: 'goals'
            },
            centurion: {
                id: 'centurion',
                name: 'Centurion',
                description: 'Score 100 goals',
                icon: '💯',
                requirement: 100,
                stat: 'totalGoals',
                unlocked: false,
                category: 'goals'
            },
            legendary: {
                id: 'legendary',
                name: 'Legendary Striker',
                description: 'Score 500 goals',
                icon: '👑',
                requirement: 500,
                stat: 'totalGoals',
                unlocked: false,
                category: 'goals'
            },

            // Win achievements
            firstVictory: {
                id: 'firstVictory',
                name: 'First Victory',
                description: 'Win your first match',
                icon: '🏆',
                requirement: 1,
                stat: 'totalWins',
                unlocked: false,
                category: 'wins'
            },
            champion: {
                id: 'champion',
                name: 'Champion',
                description: 'Win 10 matches',
                icon: '🥇',
                requirement: 10,
                stat: 'totalWins',
                unlocked: false,
                category: 'wins'
            },
            unbeatable: {
                id: 'unbeatable',
                name: 'Unbeatable',
                description: 'Win 50 matches',
                icon: '🌟',
                requirement: 50,
                stat: 'totalWins',
                unlocked: false,
                category: 'wins'
            },

            // Perfect game achievements
            perfectGame: {
                id: 'perfectGame',
                name: 'Clean Sheet',
                description: 'Win without conceding',
                icon: '🛡️',
                requirement: 1,
                stat: 'perfectGames',
                unlocked: false,
                category: 'perfect'
            },
            shutoutKing: {
                id: 'shutoutKing',
                name: 'Shutout King',
                description: 'Win 10 matches without conceding',
                icon: '🔒',
                requirement: 10,
                stat: 'perfectGames',
                unlocked: false,
                category: 'perfect'
            },

            // Special achievements
            hatTrick: {
                id: 'hatTrick',
                name: 'Hat Trick Hero',
                description: 'Score 3 goals in one match',
                icon: '🎩',
                requirement: 3,
                stat: 'goalsInMatch',
                unlocked: false,
                category: 'special',
                perMatch: true
            },
            quickDraw: {
                id: 'quickDraw',
                name: 'Quick Draw',
                description: 'Score in first 10 seconds',
                icon: '⚡',
                requirement: 1,
                stat: 'quickGoals',
                unlocked: false,
                category: 'special'
            },
            comeback: {
                id: 'comeback',
                name: 'Comeback Kid',
                description: 'Win after being 2+ goals down',
                icon: '💪',
                requirement: 1,
                stat: 'comebacks',
                unlocked: false,
                category: 'special'
            },
            blowout: {
                id: 'blowout',
                name: 'Domination',
                description: 'Win by 5+ goals',
                icon: '💥',
                requirement: 1,
                stat: 'blowouts',
                unlocked: false,
                category: 'special'
            },

            // Match achievements
            marathonMan: {
                id: 'marathonMan',
                name: 'Marathon Bug',
                description: 'Play 100 matches',
                icon: '🏃',
                requirement: 100,
                stat: 'totalMatches',
                unlocked: false,
                category: 'matches'
            },

            // Arena achievements
            worldTraveler: {
                id: 'worldTraveler',
                name: 'World Traveler',
                description: 'Play in all arenas',
                icon: '🌍',
                requirement: 1,
                stat: 'allArenas',
                unlocked: false,
                category: 'exploration'
            },

            // Bug collection achievements
            bugCollector: {
                id: 'bugCollector',
                name: 'Bug Collector',
                description: 'Unlock all bugs',
                icon: '🐛',
                requirement: 1,
                stat: 'allBugsUnlocked',
                unlocked: false,
                category: 'collection'
            },

            // Arena collection achievement
            arenaExplorer: {
                id: 'arenaExplorer',
                name: 'Arena Explorer',
                description: 'Unlock all arenas',
                icon: '🗺️',
                requirement: 1,
                stat: 'allArenasUnlocked',
                unlocked: false,
                category: 'collection'
            }
        };
    }

    loadProgress() {
        // Load player stats
        const saved = localStorage.getItem('achievementProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.stats = data.stats;
            // Update unlocked status
            Object.keys(data.achievements).forEach(id => {
                if (this.achievements[id]) {
                    this.achievements[id].unlocked = data.achievements[id].unlocked;
                }
            });
        } else {
            // Initialize stats
            this.stats = {
                totalGoals: 0,
                totalWins: 0,
                totalMatches: 0,
                perfectGames: 0,
                quickGoals: 0,
                comebacks: 0,
                blowouts: 0,
                goalsInMatch: 0,
                visitedArenas: new Set()
            };
        }
    }

    saveProgress() {
        const data = {
            stats: {
                ...this.stats,
                visitedArenas: Array.from(this.stats.visitedArenas)
            },
            achievements: {}
        };
        
        Object.keys(this.achievements).forEach(id => {
            data.achievements[id] = {
                unlocked: this.achievements[id].unlocked
            };
        });

        localStorage.setItem('achievementProgress', JSON.stringify(data));
    }

    // Update stats and check achievements
    updateStat(stat, value, checkImmediate = true) {
        if (stat === 'visitedArenas') {
            if (!this.stats.visitedArenas) {
                this.stats.visitedArenas = new Set();
            }
            this.stats.visitedArenas.add(value);
        } else {
            this.stats[stat] = (this.stats[stat] || 0) + value;
        }

        if (checkImmediate) {
            this.checkAchievements(stat);
        }
        this.saveProgress();
    }

    checkAchievements(changedStat = null) {
        const newlyUnlocked = [];

        Object.values(this.achievements).forEach(achievement => {
            // Skip if already unlocked
            if (achievement.unlocked) return;

            // Skip if this achievement doesn't match the changed stat
            if (changedStat && achievement.stat !== changedStat) return;

            // Check if requirement is met
            let currentValue = 0;
            
            if (achievement.stat === 'allArenas') {
                currentValue = this.stats.visitedArenas ? this.stats.visitedArenas.size : 0;
                // You'll need to set this number based on your total arenas
                if (currentValue >= 8) { // Assuming 8 total arenas
                    achievement.unlocked = true;
                    newlyUnlocked.push(achievement);
                }
            } else {
                currentValue = this.stats[achievement.stat] || 0;
                if (currentValue >= achievement.requirement) {
                    achievement.unlocked = true;
                    newlyUnlocked.push(achievement);
                }
            }
        });

        // Show notifications for newly unlocked achievements
        newlyUnlocked.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });

        if (newlyUnlocked.length > 0) {
            this.saveProgress();
        }

        return newlyUnlocked;
    }

    // Check if all bugs are unlocked (call this from main.js)
    checkBugCollection(bugModule) {
        if (!bugModule || !bugModule.getUnlockedBugs || !bugModule.getBugArray) return;
        
        const unlockedBugs = bugModule.getUnlockedBugs(this);
        const totalBugs = bugModule.getBugArray();
        
        if (unlockedBugs.length >= totalBugs.length) {
            if (!this.stats.allBugsUnlocked) {
                this.stats.allBugsUnlocked = 1;
                this.checkAchievements('allBugsUnlocked');
            }
        }
    }

    // Check if all arenas are unlocked
    checkArenaCollection(arenaModule) {
        if (!arenaModule || !arenaModule.getUnlockedArenas || !arenaModule.getArenaArray) return;
        
        const unlockedArenas = arenaModule.getUnlockedArenas(this);
        const totalArenas = arenaModule.getArenaArray();
        
        if (unlockedArenas.length >= totalArenas.length) {
            if (!this.stats.allArenasUnlocked) {
                this.stats.allArenasUnlocked = 1;
                this.checkAchievements('allArenasUnlocked');
            }
        }
    }

    // Show achievement notification
    showAchievementNotification(achievement) {
        this.notificationQueue.push(achievement);
        if (!this.currentNotification) {
            this.displayNextNotification();
        }
    }

    displayNextNotification() {
        if (this.notificationQueue.length === 0) {
            this.currentNotification = null;
            return;
        }

        this.currentNotification = this.notificationQueue.shift();
        this.currentNotification.displayTime = Date.now();
        this.currentNotification.duration = 4000; // Show for 4 seconds
    }

    updateNotifications(deltaTime) {
        if (this.currentNotification) {
            const elapsed = Date.now() - this.currentNotification.displayTime;
            if (elapsed > this.currentNotification.duration) {
                this.displayNextNotification();
            }
        }
    }

    drawNotification(ctx, canvas) {
        if (!this.currentNotification) return;

        const achievement = this.currentNotification;
        const elapsed = Date.now() - achievement.displayTime;
        const duration = achievement.duration;
        
        // Fade in/out animation
        let alpha = 1;
        const fadeTime = 300;
        if (elapsed < fadeTime) {
            alpha = elapsed / fadeTime;
        } else if (elapsed > duration - fadeTime) {
            alpha = (duration - elapsed) / fadeTime;
        }

        // Slide in from top animation
        let yOffset = 0;
        if (elapsed < fadeTime) {
            yOffset = -50 * (1 - elapsed / fadeTime);
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        const width = 400;
        const height = 100;
        const x = (canvas.width - width) / 2;
        const y = 50 + yOffset;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        this.roundRect(ctx, x, y, width, height, 15);
        ctx.fill();
        ctx.stroke();

        // Achievement unlocked text
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 ACHIEVEMENT UNLOCKED! 🏆', canvas.width / 2, y + 25);

        // Icon
        ctx.font = '40px Arial';
        ctx.fillText(achievement.icon, canvas.width / 2 - 120, y + 70);

        // Achievement name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(achievement.name, x + 80, y + 55);

        // Description
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(achievement.description, x + 80, y + 75);

        ctx.restore();
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Get progress for a specific achievement
    getProgress(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return 0;

        if (achievement.unlocked) return 100;

        const current = this.stats[achievement.stat] || 0;
        return Math.min(100, (current / achievement.requirement) * 100);
    }

    // Get all achievements by category
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    // Get unlock percentage
    getUnlockPercentage() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        return Math.round((unlocked / total) * 100);
    }

    // Reset match-specific stats
    resetMatchStats() {
        this.stats.goalsInMatch = 0;
    }
}
