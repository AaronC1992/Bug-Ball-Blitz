// DEVELOPER CHEAT CODES
// Add these to browser console while playing for testing

// Skip to specific tower level
game.towerLevel = 8; // Set to any level 1-8

// Unlock all tower levels
game.ui.currentProfile.tower.currentLevel = 8;
game.ui.currentProfile.tower.levelsCompleted = 7;
SaveSystem.saveProfile(game.ui.currentProfile);

// Infinite time
game.matchTime = 99999;

// Auto-win current match
game.score1 = 5;
game.score2 = 0;
game.endMatch();

// Make AI super dumb
game.player2AI.params.predictionAccuracy = 0;
game.player2AI.params.reactionTime = 100;

// Make AI super smart
game.player2AI.params.predictionAccuracy = 1.0;
game.player2AI.params.reactionTime = 1;

// Teleport ball to goal
game.ball.x = 50; // Left goal
// or
game.ball.x = game.canvas.width - 50; // Right goal

// Super speed ball
game.ball.vx = 50;

// Make player invincible (super stats)
game.selectedBug1.stats.speed = 2.0;
game.selectedBug1.stats.jump = 2.0;
game.selectedBug1.stats.power = 2.0;

// Slow motion
let originalUpdate = game.update.bind(game);
game.update = function() {
    for (let i = 0; i < 5; i++) {
        originalUpdate();
    }
};

// View all profiles
SaveSystem.getAllProfiles();

// Clear all save data (CAREFUL!)
localStorage.clear();

// Force mobile mode (test touch controls)
game.ui.isMobile = true;
document.getElementById('mobileControls').classList.add('active');

// Disable physics (floating ball)
game.physics.gravity = 0;

// Super bouncy
game.physics.bounceDamping = 1.2;

// Tiny ball
game.ball.radius = 5;

// Giant ball
game.ball.radius = 50;

// Reset match
game.quitToMenu();
