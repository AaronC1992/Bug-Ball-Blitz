# App Icons and Splash Screens

## Current Status

The Android app currently uses the default Capacitor icons. To customize:

## 1. App Icon

Create your app icon in the following sizes and replace in `android/app/src/main/res/`:

- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Recommended Design

For Bug Ball Blitz, the icon should feature:
- A bug character (beetle, ant, or ladybug)
- A soccer ball
- Purple/blue gradient background matching the game theme (#1a0033)
- High contrast for visibility on all backgrounds

### Tools to Generate Icons

**Online:**
- https://icon.kitchen/ - Easy drag & drop icon generator
- https://romannurik.github.io/AndroidAssetStudio/ - Classic Android Asset Studio
- https://www.appicon.co/ - Generates all sizes from one image

**Desktop:**
- Adobe Photoshop/Illustrator
- GIMP (free)
- Figma (free)

### Quick Method

1. Create a 512x512 PNG with your design
2. Upload to https://icon.kitchen/
3. Download the generated zip
4. Extract and copy the `mipmap-*` folders to `android/app/src/main/res/`

## 2. Splash Screen

The splash screen is configured in `capacitor.config.json`:

```json
"SplashScreen": {
  "launchShowDuration": 2000,
  "backgroundColor": "#1a0033",
  "showSpinner": false
}
```

To add a custom splash image:

1. Create `android/app/src/main/res/drawable/splash.png` (2732x2732 recommended)
2. The image should be centered with transparent or matching background

### Splash Screen Design Tips

- Use the same purple theme (#1a0033)
- Include the game logo/title
- Keep important content in the center (safe zone: 1024x1024)
- Test on different screen sizes

## 3. Play Store Assets

For Google Play Store submission, you'll also need:

### Screenshots (Required)
- At least 2 screenshots
- Recommended: 4-8 screenshots
- Resolution: 1080x1920 (portrait) or 1920x1080 (landscape)
- Show gameplay, menu, bug selection, arena, etc.

### Feature Graphic (Required)
- Size: 1024x500 pixels
- Will be displayed at the top of your Play Store listing
- Should include game title and key visual

### Promo Video (Optional)
- YouTube video showcasing gameplay
- 30 seconds to 2 minutes
- Shows off key features

### Icon for Play Store (Required)
- Size: 512x512 pixels
- High-quality PNG
- Same design as app icon but higher resolution

## Next Steps

1. **Design app icon**: Create or commission a 512x512 icon featuring bugs and soccer
2. **Generate sizes**: Use icon.kitchen or similar tool
3. **Replace defaults**: Copy generated icons to `android/app/src/main/res/`
4. **Add splash**: Create and add `splash.png` to drawable folder
5. **Take screenshots**: Run app and capture screenshots for Play Store
6. **Create feature graphic**: Design 1024x500 banner for Play Store

## Temporary Setup

The app currently uses default Capacitor icons. This is fine for development and testing, but you'll need custom icons before publishing to the Play Store.

For now, you can proceed with testing using the default icons.
