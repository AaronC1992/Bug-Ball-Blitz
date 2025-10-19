# 🚀 Quick Start Guide - Bug Ball Blitz

## ⚡ Get Playing in 30 Seconds!

### Method 1: VS Code Live Server (Easiest)
1. Right-click `index.html`
2. Click "Open with Live Server"
3. Game opens automatically! ✅

### Method 2: Double-Click
1. Navigate to project folder
2. Double-click `index.html`
3. Plays in your browser! ✅

### Method 3: Python Server
```powershell
cd "Bug Ball Blitz"
python -m http.server 8000
```
Then open: http://localhost:8000

---

## 🎮 First Time Playing?

### Step 1: Create Profile
- Click "🐛 Create Profile"
- Enter your name
- Click "✓ Create"

### Step 2: Choose Mode
- **🏆 Tower Campaign** - Story mode (recommended for first play)
- **⚡ Quick Play** - Quick match vs AI
- **🎮 Local Multiplayer** - Play with a friend

### Step 3: Select Bug
Pick your favorite:
- **Stag Beetle** - Strong but slow
- **Grasshopper** - BEST JUMPER ⭐
- **Ladybug** - Balanced (good for beginners)
- **Ant** - Fast and tiny
- **Spider** - Agile specialist

### Step 4: Pick Arena
- Grass Field (classic)
- Dirt Patch (earthy)
- Leaf Arena (natural)

### Step 5: PLAY! ⚽

**Controls:**
- **A/D** - Move left/right
- **W or Space** - Jump
- **⏸** - Pause

**Goal:** Score 5 goals or have more goals when time runs out!

---

## 🏆 Tower Campaign Guide

### Progression Map
```
Level 1: Easy AI          ⭐
Level 2: Medium AI        ⭐⭐
Level 3: Hard AI          ⭐⭐⭐
Level 4: Pro AI           ⭐⭐⭐⭐
Level 5: 2 Easy AIs       ⭐⭐⭐⭐⭐
Level 6: 2 Medium AIs     🔥🔥🔥🔥🔥
Level 7: 2 Hard AIs       💀💀💀💀💀
Level 8: 2 Pro AIs        👹👹👹👹👹
Victory: Tower Complete!  🏆🏆🏆
```

### Tips for Success
1. **Use Grasshopper** for levels 5-8 (jump advantage)
2. **Stay near center** to react faster
3. **Jump into ball** for powerful shots
4. **Defend your goal** when losing
5. **Practice timing** your jumps

---

## 💡 Pro Tips

### Offensive Strategies
- Jump before kicking for more power
- Aim for corners of goal
- Rush forward after opponent's goal
- Use speed to steal ball

### Defensive Strategies
- Position between ball and goal
- Jump to block high shots
- Don't chase too far forward
- Let ball come to you in 2v1

### Bug Selection Tips
- **New players:** Ladybug (balanced)
- **Aggressive play:** Grasshopper (jump + speed)
- **Power shots:** Stag Beetle (strongest kicks)
- **Speed demons:** Ant (fastest movement)
- **All-around:** Spider (great control)

---

## 🐛 Troubleshooting

### Game won't load?
- Use a modern browser (Chrome, Firefox, Edge)
- Check console (F12) for errors
- Ensure all files are present

### Controls not working?
- Click the game canvas
- Check keyboard is plugged in
- Try refreshing the page

### Progress not saving?
- Don't use incognito mode
- Enable cookies/localStorage
- Check browser settings

### Game too hard?
- Start with Easy AI in Quick Play
- Practice movement and jumping
- Choose Grasshopper for easier jumps

### Game too easy?
- Try Pro difficulty
- Use Ant (hardest to control)
- Challenge yourself in Tower mode

---

## 🎯 Achievement Ideas

Try these challenges:
- [ ] Win without conceding a goal (Clean Sheet)
- [ ] Score 5 goals in under 1 minute (Speed Demon)
- [ ] Beat Pro AI with Ant (Underdog)
- [ ] Complete Tower Campaign (Champion)
- [ ] Win with all 5 bugs (Variety Master)
- [ ] Beat 2 Pro AIs on first try (Unstoppable)

---

## 📱 Mobile Instructions

### Touch Controls
- **Left Joystick:** Drag to move
- **Right Button:** Tap to jump

### Tips
- Joystick is analog (smooth movement)
- Jump works best with quick taps
- Landscape mode recommended
- Works on tablets too!

---

## 🎨 Customization

Want to modify the game?

### Change Match Duration
Edit `main.js` line 17:
```javascript
this.matchTime = 120; // Change to any seconds
```

### Adjust Difficulty
Edit `ai.js` difficulty parameters:
- Lower `reactionTime` = faster AI
- Higher `predictionAccuracy` = smarter AI
- Higher `jumpTiming` = better jumping

### Modify Bug Stats
Edit `bugs.js` stats:
```javascript
stats: {
    speed: 1.0,  // 0.0 to 1.0
    jump: 1.0,   // 0.0 to 1.0
    power: 1.0,  // 0.0 to 1.0
    size: 1.0    // 0.5 to 1.5
}
```

---

## 🎓 Learning Resources

This game demonstrates:
- ✅ HTML5 Canvas rendering
- ✅ ES6 JavaScript modules
- ✅ Game loop architecture
- ✅ Physics simulation
- ✅ AI pathfinding
- ✅ State management
- ✅ LocalStorage persistence
- ✅ Responsive design
- ✅ Touch controls

Great for learning game development!

---

## 📞 Support

Check these files for details:
- `README.md` - Full documentation
- `OVERVIEW.md` - Technical deep dive
- Comments in code - Implementation details

---

**Now go play and have fun! 🐛⚽🎉**

Your game is running at: **http://localhost:8000**
