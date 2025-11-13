# GitHub Releases Setup for Android APK Distribution

This guide explains how to distribute your Android APK through GitHub Releases so users can download it directly from your repository.

## What are GitHub Releases?

GitHub Releases allow you to:
- Distribute compiled binaries (APK files) alongside your source code
- Version your releases (v1.0.0, v1.1.0, etc.)
- Provide release notes for each version
- Make downloads accessible via a permanent link

## Building the APK

Before creating a release, you need to build your APK:

### Debug APK (For Testing)

```bash
npm run android:build
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Note:** Debug APKs are larger and not optimized for distribution. Use for testing only.

### Release APK (For Distribution)

First, create a signing key (one-time setup):

```bash
cd android
keytool -genkey -v -keystore bug-ball-blitz.keystore -alias bugball -keyalg RSA -keysize 2048 -validity 10000
```

Then configure signing (see `ANDROID_BUILD_GUIDE.md` for details).

Build the release APK:

```bash
npm run android:release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Creating a GitHub Release

### Method 1: GitHub Web Interface (Easiest)

1. **Navigate to your repository** on GitHub: https://github.com/AaronC1992/Bug-Ball-Blitz

2. **Click "Releases"** in the right sidebar (or go to `/releases`)

3. **Click "Create a new release"** or "Draft a new release"

4. **Fill in the release details:**

   - **Tag version**: `v1.21.5` (create new tag from: main)
   - **Release title**: `Bug Ball Blitz v1.21.5 - Android Release`
   - **Description**: Add release notes, e.g.:
     ```markdown
     ## 🎮 Bug Ball Blitz v1.21.5 - Android Release
     
     ### What's New
     - Native Android app with AdMob integration
     - Optimized touch controls for mobile
     - Improved performance on mobile devices
     - Full save system support
     
     ### Download
     Download `bug-ball-blitz.apk` below and install on your Android device.
     
     ### Installation
     1. Download the APK file
     2. Enable "Install from Unknown Sources" in Android settings
     3. Open the APK to install
     4. Play!
     
     ### Requirements
     - Android 6.0 (API 23) or higher
     - ~50MB storage space
     ```

5. **Upload your APK:**
   - Drag and drop `app-release.apk` from `android/app/build/outputs/apk/release/`
   - Rename it to `bug-ball-blitz.apk` for clarity

6. **Set as latest release:** Check "Set as the latest release"

7. **Publish release:** Click "Publish release"

### Method 2: GitHub CLI (Advanced)

If you have GitHub CLI installed:

```bash
# Create release and upload APK
gh release create v1.21.5 \
  android/app/build/outputs/apk/release/app-release.apk#bug-ball-blitz.apk \
  --title "Bug Ball Blitz v1.21.5 - Android Release" \
  --notes "Native Android app with AdMob integration and touch controls"
```

## Accessing the Release

After publishing, your APK will be available at:

```
https://github.com/AaronC1992/Bug-Ball-Blitz/releases
```

Direct download link (for latest release):

```
https://github.com/AaronC1992/Bug-Ball-Blitz/releases/latest/download/bug-ball-blitz.apk
```

## Updating Your README

The README has already been updated with:

```markdown
### Android App (Mobile)
**[📱 Download for Android](https://github.com/AaronC1992/Bug-Ball-Blitz/releases)**
```

Users can now:
1. Click the link in the README
2. Download the APK from releases
3. Install on their Android device

## Version Management

### Updating Version Numbers

Before each release, update version in **three places**:

1. **package.json**
   ```json
   "version": "1.21.5"
   ```

2. **android/app/build.gradle**
   ```gradle
   versionCode 1
   versionName "1.21.5"
   ```

3. **capacitor.config.json** (optional, for tracking)
   ```json
   "version": "1.21.5"
   ```

### Version Naming Convention

- **Major.Minor.Patch** (Semantic Versioning)
  - **Major (1.x.x)**: Breaking changes, major features
  - **Minor (x.21.x)**: New features, non-breaking changes
  - **Patch (x.x.5)**: Bug fixes, minor tweaks

Examples:
- `v1.21.5` → `v1.21.6` (bug fix)
- `v1.21.6` → `v1.22.0` (new feature)
- `v1.22.0` → `v2.0.0` (major overhaul)

## Release Checklist

Before creating a release:

- [ ] Update version numbers in all files
- [ ] Test the app thoroughly
- [ ] Build release APK with signing
- [ ] Test the APK on a real device
- [ ] Write clear release notes
- [ ] Create release on GitHub
- [ ] Upload APK file
- [ ] Verify download link works
- [ ] Update README if needed

## APK File Size

Expected APK size:
- **Debug**: ~15-25 MB
- **Release (unsigned)**: ~8-15 MB
- **Release (signed)**: ~8-15 MB

If your APK is larger than 50 MB:
- Check for unnecessary assets
- Enable ProGuard/R8 code shrinking
- Compress images/audio
- Remove unused resources

## Security Considerations

### Signing Key Safety

**CRITICAL:** Your signing keystore (`bug-ball-blitz.keystore`) must:
- ✅ Be backed up securely (multiple locations)
- ✅ Never be committed to Git
- ✅ Have strong passwords
- ❌ Never be shared publicly

If you lose your keystore, you **cannot update your app** on Play Store.

### APK Verification

Users can verify your APK authenticity by:
1. Checking it's from your official GitHub releases
2. Comparing file size with release notes
3. Checking APK signature (advanced users)

## Alternatives to GitHub Releases

If GitHub Releases doesn't fit your needs:

### Google Play Store (Recommended)
- Official Android app distribution
- Automatic updates
- User reviews and ratings
- **Requires**: Developer account ($25 one-time fee)

### Alternative Platforms
- **Itch.io**: Game distribution platform
- **Firebase App Distribution**: Beta testing
- **Amazon Appstore**: Alternative app store
- **Direct hosting**: Host APK on your own website

## Troubleshooting

### "This APK cannot be installed"
- User needs to enable "Install from Unknown Sources"
- APK may be corrupted during download
- Device may not meet minimum Android version

### Release not showing up
- Refresh the releases page
- Check if release was saved as "Draft"
- Verify you're on the correct repository

### APK download is slow
- GitHub has bandwidth limits for large files
- Consider using Git LFS for large binaries
- Alternative: Host on a CDN

## Next Steps

1. **Build your release APK**: Follow signing steps in `ANDROID_BUILD_GUIDE.md`
2. **Create your first release**: Use the GitHub web interface
3. **Share the link**: Users can download from the Releases page
4. **Consider Play Store**: For wider distribution and automatic updates

---

Your Android app is now ready for distribution via GitHub! 🚀
