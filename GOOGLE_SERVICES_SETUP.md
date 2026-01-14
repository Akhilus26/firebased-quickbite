# Google Services Gradle Plugin Setup for Expo

## 📋 Overview

To use `google-services.json` with Firebase in your Expo app, you need to configure the Google services Gradle plugin. This guide covers both managed and bare workflow approaches.

## 🔧 Option 1: Using Expo Config Plugin (Recommended for Managed Workflow)

### Step 1: Download google-services.json

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **quickbite-4a8d8**
3. Go to **Project Settings** (gear icon) → **Your apps**
4. Click on your **Android app** (or add it if not added)
5. Download the `google-services.json` file
6. Place it in your project root directory (same level as `app.json`)

### Step 2: Install Required Packages

```bash
npx expo install expo-build-properties
```

### Step 3: Run Prebuild (if not already done)

```bash
npx expo prebuild
```

This generates the `android` and `ios` native folders.

### Step 4: Configure Gradle Files

After prebuild, you'll need to manually configure the Gradle files:

#### Root-level build.gradle (`android/build.gradle`):

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.8.0"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        // Add the Google services Gradle plugin
        classpath("com.google.gms:google-services:4.4.4")
    }
}
```

#### App-level build.gradle (`android/app/build.gradle`):

At the **bottom** of the file, add:

```gradle
apply plugin: 'com.google.gms.google-services'
```

**Important**: This line must be at the **very bottom** of the file, after all other plugins and dependencies.

### Step 5: Verify google-services.json Location

Make sure `google-services.json` is in:
- Project root (for Expo to copy it)
- Or in `android/app/` directory (after prebuild)

## 🔧 Option 2: Using Expo Config Plugin (Automatic)

If you want Expo to handle this automatically, you can create a custom config plugin or use `@react-native-firebase/app` config plugin.

### Install Firebase Native SDK (Optional):

```bash
npm install @react-native-firebase/app
```

This package includes a config plugin that automatically sets up Google services.

## 📝 Manual Configuration (After Prebuild)

If you've already run `expo prebuild`, here's what to do:

### 1. Root build.gradle (`android/build.gradle`):

Add to `buildscript.dependencies`:
```gradle
classpath("com.google.gms:google-services:4.4.4")
```

### 2. App build.gradle (`android/app/build.gradle`):

Add at the **very bottom**:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. Place google-services.json:

Copy `google-services.json` to `android/app/google-services.json`

## ✅ Verification

After configuration:

1. **Sync Gradle**: In Android Studio, click "Sync Now" or run:
   ```bash
   cd android && ./gradlew clean
   ```

2. **Check for errors**: Make sure there are no Gradle sync errors

3. **Test the app**: Run your app and verify Firebase works

## 🚨 Important Notes

1. **google-services.json location**:
   - For Expo managed: Place in project root
   - After prebuild: Should be in `android/app/`

2. **Plugin order**: The `apply plugin: 'com.google.gms.google-services'` line must be at the **very bottom** of `android/app/build.gradle`

3. **Version compatibility**: Make sure the Google services plugin version (4.4.4) is compatible with your Gradle and Android Gradle Plugin versions

4. **Firebase JS SDK**: If you're only using Firebase JS SDK (not native), the google-services.json is optional but recommended for better integration

## 🔍 Troubleshooting

### Error: "google-services.json not found"
- Make sure the file is in the correct location
- Check that the package name in google-services.json matches `com.quickbite.app`

### Error: "Plugin with id 'com.google.gms.google-services' not found"
- Make sure you added the classpath in root build.gradle
- Sync Gradle files

### Error: "Duplicate class" or build errors
- Clean the project: `cd android && ./gradlew clean`
- Delete `.gradle` folder in android directory
- Rebuild

## 📱 Current Setup

- **Package name**: `com.quickbite.app`
- **Firebase project**: `quickbite-4a8d8`
- **Google services plugin version**: `4.4.4`

---

**Next Steps**:
1. Download `google-services.json` from Firebase Console
2. Place it in project root
3. Run `npx expo prebuild` (if not done)
4. Configure Gradle files as shown above
5. Test your app
