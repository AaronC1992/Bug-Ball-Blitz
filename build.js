const fs = require('fs');
const path = require('path');

// Create www directory if it doesn't exist
const wwwDir = path.join(__dirname, 'www');
if (!fs.existsSync(wwwDir)) {
    fs.mkdirSync(wwwDir);
}

// Files to copy to www directory
const filesToCopy = [
    'index.html',
    'style.css',
    'main.js',
    'physics.js',
    'bugs.js',
    'arenas.js',
    'ui.js',
    'particles.js',
    'audioManager.js',
    'saveSystem.js',
    'achievementManager.js',
    'cosmetics.js',
    'ai.js',
    'bugAnimations.js',
    'celebrations.js',
    'menuBackground.js',
    'qualitySettings.js',
    'ads.js',
    'CHEATS.js'
];

// Copy each file
console.log('Building web assets for Capacitor...\n');
filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(wwwDir, file);
    
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file}`);
    } else {
        console.warn(`⚠ Warning: ${file} not found`);
    }
});

// Copy Assets directory if it exists
const assetsDir = path.join(__dirname, 'Assets');
const destAssetsDir = path.join(wwwDir, 'Assets');

if (fs.existsSync(assetsDir)) {
    // Create Assets directory in www
    if (!fs.existsSync(destAssetsDir)) {
        fs.mkdirSync(destAssetsDir, { recursive: true });
    }
    
    // Copy all files from Assets (recursive)
    const copyRecursive = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        entries.forEach(entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    };
    
    copyRecursive(assetsDir, destAssetsDir);
    console.log('✓ Copied Assets directory');
}

console.log('\n✓ Build complete! Files ready in www/ directory');
