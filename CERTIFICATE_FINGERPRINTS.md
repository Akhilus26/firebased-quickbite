# Certificate Fingerprints for Firebase/Google Sign-In

## 🔑 Your Current Debug Keystore Fingerprints

These are the fingerprints from your **Android Debug Keystore** (used for development):

### SHA-1 Fingerprint:
```
D6:B8:62:A5:9B:B2:E6:2A:E6:10:BF:74:96:1E:24:4D:F5:F0:FC:DB
```

### SHA-256 Fingerprint:
```
64:EF:29:25:81:AB:54:EE:26:79:1F:0E:DB:28:6C:87:18:5B:62:58:F1:85:89:24:E9:50:88:A0:AB:1D:C6:01
```

## 📱 How to Add These to Firebase

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **quickbite-4a8d8**
3. Go to **Project Settings** (gear icon) → **Your apps**

### Step 2: Add Android App (if not already added)
1. Click **Add app** → Select **Android**
2. Enter:
   - **Android package name**: `com.quickbite.app`
   - **App nickname** (optional): `QuickBite Android`
   - Click **Register app**

### Step 3: Add SHA Fingerprints
1. After registering, you'll see **Add SHA certificate fingerprint**
2. Click **Add fingerprint**
3. Add your **SHA-1**: `D6:B8:62:A5:9B:B2:E6:2A:E6:10:BF:74:96:1E:24:4D:F5:F0:FC:DB`
4. Click **Add fingerprint** again
5. Add your **SHA-256**: `64:EF:29:25:81:AB:54:EE:26:79:1F:0E:DB:28:6C:87:18:5B:62:58:F1:85:89:24:E9:50:88:A0:AB:1D:C6:01`
6. Download the `google-services.json` file (you'll need this later for production builds)

## 🔐 For Production Builds

When you're ready to build a production/release version, you'll need to:

### Step 1: Generate a Production Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore quickbite-release.keystore -alias quickbite-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: 
- Remember the password you set!
- Store the keystore file securely (you'll need it for all future updates)
- Don't commit it to version control

### Step 2: Get Production Fingerprints

```bash
keytool -list -v -keystore quickbite-release.keystore -alias quickbite-key
```

This will show you the SHA-1 and SHA-256 for your production keystore. Add these to Firebase as well.

### Step 3: Configure Expo for Production

Add to your `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.quickbite.app",
      "credentials": {
        "keystore": "./quickbite-release.keystore",
        "keyAlias": "quickbite-key"
      }
    }
  }
}
```

## 📝 Quick Reference Commands

### Get Debug Keystore Fingerprints (Current):
```powershell
keytool -list -v -keystore $env:USERPROFILE\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Get Production Keystore Fingerprints:
```powershell
keytool -list -v -keystore quickbite-release.keystore -alias quickbite-key
```

### Generate New Production Keystore:
```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore quickbite-release.keystore -alias quickbite-key -keyalg RSA -keysize 2048 -validity 10000
```

## ⚠️ Important Notes

1. **Debug vs Production**: 
   - Debug keystore (current) = for development/testing
   - Production keystore = for app store releases

2. **Both are needed**: Add both debug AND production fingerprints to Firebase so Google Sign-In works in both development and production.

3. **Security**: 
   - Never share your production keystore
   - Keep backups in a secure location
   - If you lose the production keystore, you can't update your app on Google Play Store

4. **Expo Managed Workflow**: If using Expo's managed workflow, Expo can generate and manage the keystore for you when you build with `eas build`.

## ✅ Next Steps

1. ✅ Add SHA-1 and SHA-256 to Firebase Console (see Step 3 above)
2. ✅ Download `google-services.json` from Firebase
3. ✅ Place it in your project root (Expo will handle it automatically)
4. ✅ Test Google Sign-In in your app

---

**Your Fingerprints (Copy these to Firebase):**
- **SHA-1**: `D6:B8:62:A5:9B:B2:E6:2A:E6:10:BF:74:96:1E:24:4D:F5:F0:FC:DB`
- **SHA-256**: `64:EF:29:25:81:AB:54:EE:26:79:1F:0E:DB:28:6C:87:18:5B:62:58:F1:85:89:24:E9:50:88:A0:AB:1D:C6:01`
