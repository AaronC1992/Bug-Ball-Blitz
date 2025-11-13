# Building Bug Ball Blitz for Android (Google Play Store)

This guide walks you through building Bug Ball Blitz as a native Android app for distribution on Google Play Store, while keeping the web version live on GitHub Pages.

## Prerequisites

Before you begin, make sure you have installed:

1. **Node.js & npm** (v16 or higher)
   - Download from: https://nodejs.org/
   
2. **Android Studio** (latest version)
   - Download from: https://developer.android.com/studio
   - During setup, install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (for testing)
   
3. **Java Development Kit (JDK)** (v11 or higher)
   - Usually bundled with Android Studio
   - Verify: `java -version`

## Setup Steps

### 1. Install Dependencies

```bash
cd "Bug Ball Blitz"
npm install
```

This installs Capacitor, the AdMob plugin, and development tools.

### 2. Initialize Capacitor (First Time Only)

Already configured in `capacitor.config.json`, but if you need to reinitialize:

```bash
npx cap init
```

### 3. Add Android Platform (First Time Only)

```bash
npx cap add android
```

This creates the `android/` folder with your native Android project.

### 4. Configure AdMob in Android

After adding Android, you need to configure your AdMob App ID:

**File:** `android/app/src/main/AndroidManifest.xml`

Add inside the `<application>` tag:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-6064374775404365~2828970201"/>
```

### 5. Sync Web Code to Android

Every time you make changes to your web code (HTML/CSS/JS), run:

```bash
npm run cap:sync
```

Or manually:
```bash
npx cap copy
npx cap sync
```

### 6. Open Android Studio

```bash
npm run cap:open
```

Or manually:
```bash
npx cap open android
```

Android Studio will open with your project.

## Building & Testing

### Test on Emulator/Device

1. In Android Studio, click the **"Run"** button (green play icon)
2. Select an emulator or connected device
3. Wait for the build and app launch

**Important for Testing Ads:**
- Test ads will show automatically in debug builds
- Never click on live ads during development
- Add your device's advertising ID to test devices in `ads.js`

### Build Debug APK

```bash
npm run android:build
```

Or manually:
```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release Bundle (for Play Store)

#### First Time: Create Signing Key

```bash
cd android
keytool -genkey -v -keystore bug-ball-blitz.keystore -alias bugball -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** 
- Store the keystore file securely
- Remember your passwords
- NEVER commit the keystore to Git
- Back it up - you can't update your app without it!

#### Configure Signing

**File:** `android/key.properties` (create this file)

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=bugball
storeFile=bug-ball-blitz.keystore
```

**File:** `android/app/build.gradle`

Add before `android {`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { buildTypes {`:

```gradle
release {
    signingConfig signingConfigs.release
    minifyEnabled false
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}
```

And add in `android {`:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
```

#### Build Signed Bundle

```bash
npm run android:release
```

Or manually:
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

This `.aab` file is what you upload to Google Play Store.

## Preparing for Google Play Store

### 1. App Icons & Splash Screen

Create app icons in these sizes and place in `android/app/src/main/res/`:

- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

Splash screen in `drawable/splash.png` (2732x2732 recommended)

**Tip:** Use online tools like https://romannurik.github.io/AndroidAssetStudio/ to generate all sizes.

### 2. App Version

Update version in **three places** before each release:

1. `package.json` → `"version": "1.21.5"`
2. `android/app/build.gradle`:
   ```gradle
   versionCode 1
   versionName "1.21.5"
   ```
3. Your main game file for display

### 3. Google Play Console Setup

1. Create account at: https://play.google.com/console
2. Pay one-time $25 registration fee
3. Create new app
4. Fill in store listing:
   - Title: "Bug Ball Blitz"
   - Short description (80 chars)
   - Full description
   - Screenshots (at least 2, up to 8)
   - Feature graphic (1024x500)
   - App icon (512x512)
   - Category: Games → Sports
   - Content rating questionnaire
   - Privacy policy URL (required)

### 4. Upload Build

1. In Play Console, go to **Production** → **Create new release**
2. Upload your `app-release.aab`
3. Add release notes
4. Review and rollout

### 5. AdMob Setup

1. Create AdMob account: https://admob.google.com/
2. Link your app (use package ID: `com.bugballblitz.game`)
3. Verify your ad units are active:
   - App ID: `ca-app-pub-6064374775404365~2828970201`
   - Interstitial: `ca-app-pub-6064374775404365/3897960551`

## Maintaining Both Web and Mobile

### Workflow

1. **Make changes** to your web files (HTML/CSS/JS)
2. **Test locally**: `npm run dev` (or Live Server)
3. **Commit to GitHub** (web version updates automatically via GitHub Pages)
4. **Sync to Android**: `npm run cap:sync`
5. **Test native**: `npm run cap:open` → Run in Android Studio
6. **Build release**: `npm run android:release` when ready for Play Store

### Key Points

- The `android/` folder contains native code but should still be committed
- Your `.gitignore` excludes build artifacts and signing keys
- Web and native share the same codebase - changes apply to both
- GitHub Pages serves the web version directly from the repo

## Troubleshooting

### Gradle Build Fails
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### AdMob Not Working
- Check AndroidManifest.xml has correct App ID
- Verify ad units in AdMob console
- Test with test device IDs first
- Check logcat for errors: `adb logcat *:E`

### App Won't Install
- Uninstall old version first
- Check device has enough space
- Enable "Unknown Sources" for debug builds

### Icons Not Showing
- Ensure all icon sizes are present
- Clean and rebuild: Android Studio → Build → Clean Project

## Useful Commands

```bash
# Install dependencies
npm install

# Sync web code to native
npm run cap:sync

# Open in Android Studio
npm run cap:open

# Build debug APK
npm run android:build

# Build release bundle
npm run android:release

# Check Capacitor status
npx cap doctor
```

## Testing Checklist Before Release

- [ ] All game features work on mobile
- [ ] Touch controls responsive
- [ ] Ads display correctly (test mode)
- [ ] No console errors
- [ ] App icon displays
- [ ] Splash screen shows
- [ ] Save/load works
- [ ] Achievements unlock
- [ ] Audio plays correctly
- [ ] Landscape/portrait both work
- [ ] Back button behavior correct
- [ ] App doesn't crash on rotation

## Support & Resources

- Capacitor Docs: https://capacitorjs.com/docs
- AdMob Capacitor Plugin: https://github.com/capacitor-community/admob
- Android Developer Guide: https://developer.android.com/
- Play Store Policies: https://play.google.com/about/developer-content-policy/

---

**Good luck with your Google Play Store launch! 🚀🐛⚽**
