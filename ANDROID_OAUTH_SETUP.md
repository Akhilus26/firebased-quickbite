# Android OAuth Client ID Setup

## ✅ Configuration Complete

Your Android OAuth Client ID has been configured in the app:

**Android Client ID**: `91948169284-hdgsvfjrm72volmukooqu6nr772t3r2o.apps.googleusercontent.com`

## 📱 What Was Changed

### 1. Updated `stores/authStore.ts`
- Added platform detection to use the correct OAuth Client ID
- **Android**: Uses `91948169284-hdgsvfjrm72volmukooqu6nr772t3r2o.apps.googleusercontent.com`
- **iOS/Web**: Uses `91948169284-t3i0a3fv9e42e9h1hstgjt1dn04f2554.apps.googleusercontent.com` (Web Client ID)

### 2. Platform-Specific Configuration
The app now automatically selects the correct Client ID based on the platform:
```typescript
const getGoogleClientId = () => {
  if (Platform.OS === 'android') {
    return GOOGLE_ANDROID_CLIENT_ID;
  }
  return GOOGLE_WEB_CLIENT_ID;
};
```

## 🔧 Firebase Console Setup

Make sure in Firebase Console:

1. **Android App is Added**:
   - Go to Firebase Console → Project Settings → Your apps
   - Ensure Android app is registered with package name: `com.quickbite.app`

2. **SHA Fingerprints Added**:
   - SHA-1: `D6:B8:62:A5:9B:B2:E6:2A:E6:10:BF:74:96:1E:24:4D:F5:F0:FC:DB`
   - SHA-256: `64:EF:29:25:81:AB:54:EE:26:79:1F:0E:DB:28:6C:87:18:5B:62:58:F1:85:89:24:E9:50:88:A0:AB:1D:C6:01`

3. **OAuth Client ID Verified**:
   - The Android OAuth Client ID should match: `91948169284-hdgsvfjrm72volmukooqu6nr772t3r2o.apps.googleusercontent.com`

## 🧪 Testing

1. Run your app on Android device/emulator:
   ```bash
   npx expo run:android
   ```

2. Navigate to the login screen
3. Click "Continue with Google"
4. The Android OAuth Client ID will be used automatically

## 📝 Current Configuration

**File**: `stores/authStore.ts`

```typescript
// Web Client ID (for iOS/Web)
const GOOGLE_WEB_CLIENT_ID = '91948169284-t3i0a3fv9e42e9h1hstgjt1dn04f2554.apps.googleusercontent.com';

// Android Client ID
const GOOGLE_ANDROID_CLIENT_ID = '91948169284-hdgsvfjrm72volmukooqu6nr772t3r2o.apps.googleusercontent.com';
```

## ✅ Next Steps

1. ✅ Android OAuth Client ID configured
2. ✅ Platform detection implemented
3. ⏳ Test Google Sign-In on Android device
4. ⏳ Verify OAuth consent screen is configured (if not done already)

---

**Note**: The app will automatically use the correct Client ID based on the platform. No additional configuration needed!
