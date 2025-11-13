# 🍎 iOS Build Guide for Bug Ball Blitz

This guide will walk you through building the iOS version of Bug Ball Blitz on macOS.

## Prerequisites

Before you begin, ensure you have:

- ✅ A Mac computer running macOS
- ✅ Xcode installed (free from Mac App Store)
- ✅ An Apple ID (free to create)
- ✅ Git installed
- ✅ Node.js and npm installed

## Step 1: Install CocoaPods

CocoaPods is required for managing iOS dependencies.

Open Terminal and run:

```bash
sudo gem install cocoapods
```

Enter your Mac password when prompted.

## Step 2: Clone the Repository

Clone the Bug Ball Blitz repository to your Mac:

```bash
git clone https://github.com/AaronC1992/Bug-Ball-Blitz.git
cd Bug-Ball-Blitz
```

## Step 3: Install Project Dependencies

Install all Node.js dependencies:

```bash
npm install
```

## Step 4: Install iOS Pod Dependencies

Navigate to the iOS app directory and install CocoaPods dependencies:

```bash
cd ios/App
pod install
cd ../..
```

This will install the AdMob SDK and other iOS-specific dependencies.

## Step 5: Build Web Assets

Build the web assets that will be bundled into the iOS app:

```bash
npm run build
```

## Step 6: Sync to iOS Platform

Sync the web assets and configuration to the iOS project:

```bash
npx cap sync ios
```

## Step 7: Open in Xcode

Open the iOS project in Xcode:

```bash
npx cap open ios
```

Xcode will launch with the Bug Ball Blitz project.

## Step 8: Configure Code Signing

In Xcode:

1. Click on the **App** project in the left sidebar
2. Select the **App** target under "Targets"
3. Go to the **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** from the dropdown (sign in with your Apple ID if needed)
   - Go to **Xcode → Settings → Accounts** to add your Apple ID
6. If needed, change the **Bundle Identifier** to make it unique (e.g., `com.yourname.bugballblitz`)

## Step 9: Configure AdMob App ID (iOS)

The AdMob App ID should already be configured, but verify it:

1. In Xcode, navigate to `App/App/Info.plist`
2. Find the key `GADApplicationIdentifier`
3. Verify the value is: `ca-app-pub-6064374775404365~2828970201`

## Step 10: Build the App

### Option A: Test on iOS Simulator

1. In Xcode, select a simulator from the device dropdown (e.g., "iPhone 15 Pro")
2. Click the **Play** button (▶) or press `Cmd+R`
3. The app will build and launch in the simulator

### Option B: Test on Physical Device (Free)

1. Connect your iPhone/iPad via USB
2. Unlock the device and trust the computer
3. Select your device from the device dropdown in Xcode
4. Click the **Play** button (▶) or press `Cmd+R`
5. On your iOS device, go to **Settings → General → VPN & Device Management**
6. Tap your Apple ID and tap **Trust**
7. The app will launch on your device

**Note:** Free Apple Developer accounts can only install apps on devices for 7 days before re-signing is required.

### Option C: Create IPA for Distribution

For creating an IPA file to share or upload:

1. In Xcode, select **Any iOS Device (arm64)** from the device dropdown
2. Go to **Product → Archive**
3. Wait for the archive to complete (this may take a few minutes)
4. The Organizer window will open showing your archive
5. Click **Distribute App**
6. Choose one of the following:

   **For Testing (No Apple Developer Account Required):**
   - Select **Custom**
   - Select **Development** or **Ad Hoc**
   - Choose **Export**
   - Save the `.ipa` file to your desired location

   **For App Store (Requires $99/year Apple Developer Program):**
   - Select **App Store Connect**
   - Follow the prompts to upload to TestFlight and App Store

## Step 11: Upload IPA to GitHub Releases

Once you have the `.ipa` file:

1. Go to: https://github.com/AaronC1992/Bug-Ball-Blitz/releases
2. Click **"Edit"** on the latest release (v1.21.5)
3. Drag and drop the `.ipa` file into the **Assets** section
4. Rename it to `bug-ball-blitz.ipa`
5. Click **"Update release"**

## Installing IPA on iOS Devices

### Method 1: Using Xcode (Easiest)

1. Connect your iOS device via USB
2. Open Xcode
3. Go to **Window → Devices and Simulators**
4. Select your device
5. Click the **"+"** button under "Installed Apps"
6. Select the `.ipa` file
7. The app will install on your device

### Method 2: Using AltStore (No Computer After Initial Setup)

1. Install AltStore on your computer: https://altstore.io/
2. Follow AltStore's guide to install apps via WiFi

### Method 3: TestFlight (Requires $99/year Apple Developer Program)

1. Upload the app to App Store Connect
2. Add it to TestFlight
3. Share the TestFlight link with testers
4. Testers install via the TestFlight app

## Troubleshooting

### "No signing certificate found"
- Make sure you're signed in with your Apple ID in Xcode (Xcode → Settings → Accounts)
- Enable "Automatically manage signing" in the Signing & Capabilities tab

### "Pod install failed"
```bash
cd ios/App
pod deintegrate
pod install
```

### "Developer Mode not enabled" (iOS 16+)
- On your iOS device: Settings → Privacy & Security → Developer Mode → Enable

### "Untrusted Developer"
- On your iOS device: Settings → General → VPN & Device Management → Trust your developer certificate

### Build errors after changes
```bash
npm run build
npx cap sync ios
```

Then clean build in Xcode: **Product → Clean Build Folder** (Shift+Cmd+K)

## AdMob Testing

- During development, AdMob will show test ads automatically
- **Never click on live ads during testing** (against AdMob policy)
- Use test device IDs for consistent test ad behavior

## App Store Submission (Optional)

To publish to the App Store, you need:

1. **Apple Developer Program** ($99/year): https://developer.apple.com/programs/
2. **App Store Connect account**: https://appstoreconnect.apple.com/
3. **App privacy details, screenshots, and metadata**
4. **App Review submission** (typically takes 1-2 days)

Follow Apple's official guide: https://developer.apple.com/app-store/submitting/

## Questions or Issues?

If you encounter any problems:

1. Check the Xcode build logs for specific error messages
2. Google the error message (usually has solutions on Stack Overflow)
3. Contact the repository owner for help
4. Check Capacitor docs: https://capacitorjs.com/docs/ios

---

**Good luck building Bug Ball Blitz for iOS! 🐛⚽🍎**
