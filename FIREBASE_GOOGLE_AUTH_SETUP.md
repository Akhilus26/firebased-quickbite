# Firebase Google Authentication Setup Guide

## ✅ What's Already Done

1. ✅ Firebase configuration is set up in `config/firebase.ts`
2. ✅ Google Sign-In UI is implemented in `app/(auth)/login.tsx`
3. ✅ Auth store with Google Sign-In logic is in `stores/authStore.ts`
4. ✅ OAuth Client ID is configured: `91948169284-t3i0a3fv9e42e9h1hstgjt1dn04f2554.apps.googleusercontent.com`

## 📋 What You Need to Verify in Firebase Console

### Step 1: Verify Google Sign-In is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **quickbite-4a8d8**
3. Navigate to **Authentication** > **Sign-in method**
4. Ensure **Google** is enabled (should show as "Enabled")

### Step 2: Configure OAuth 2.0 Client IDs

1. Go to **Project Settings** (gear icon) > **Your apps**
2. Click on your **Web app** (or create one if it doesn't exist)
3. Scroll down to **OAuth 2.0 Client IDs**
4. Verify the **Web client ID** matches: `91948169284-t3i0a3fv9e42e9h1hstgjt1dn04f2554.apps.googleusercontent.com`

### Step 3: Configure Authorized Redirect URIs (Important!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **quickbite-4a8d8**
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your **OAuth 2.0 Client ID** (the Web client one)
5. Under **Authorized redirect URIs**, add these URIs:

   For Expo development:
   ```
   https://auth.expo.io/@your-expo-username/quickbite
   ```
   (Replace `your-expo-username` with your actual Expo username)

   For the app scheme:
   ```
   quickbite://
   ```

   For local development:
   ```
   exp://localhost:8081
   ```

### Step 4: Verify App Configuration

Your `app.json` already has the correct scheme:
```json
{
  "expo": {
    "scheme": "quickbite"
  }
}
```

## 🧪 Testing the Implementation

1. Start your Expo app:
   ```bash
   npm start
   ```

2. Navigate to the login screen
3. Click "Continue with Google"
4. You should see the Google sign-in flow

## 🔧 Troubleshooting

### Issue: "Sign-in was cancelled" or redirect errors

**Solution**: Make sure the redirect URIs in Google Cloud Console match exactly:
- Check your Expo username in the redirect URI
- Ensure `quickbite://` is added as an authorized redirect URI

### Issue: "Invalid client ID"

**Solution**: 
- Verify the `GOOGLE_CLIENT_ID` in `stores/authStore.ts` matches your Firebase Web Client ID
- Make sure you're using the **Web** client ID, not iOS/Android client IDs

### Issue: "Network error" or "Connection failed"

**Solution**:
- Check your internet connection
- Ensure Firebase project is active
- Verify Google Sign-In is enabled in Firebase Console

## 📱 Platform-Specific Notes

### For iOS
- If building for iOS, you may need to add the iOS Client ID separately
- Configure the iOS bundle identifier in Firebase Console

### For Android
- If building for Android, you may need to add the Android Client ID separately
- Configure the Android package name in Firebase Console

## 🎯 Current Implementation Details

- **Auth Method**: Uses `expo-auth-session` with OAuth 2.0 flow
- **Firebase Auth**: Uses Firebase Auth to sign in with Google credentials
- **State Management**: Zustand store (`authStore.ts`)
- **Secure Storage**: Uses `expo-secure-store` to persist auth state

## 📝 Next Steps

1. ✅ Verify Google Sign-In is enabled in Firebase Console
2. ✅ Add redirect URIs in Google Cloud Console
3. ✅ Test the sign-in flow
4. ✅ Handle user profile creation in Firestore (if needed)

---

**Need Help?** Check the Firebase documentation:
- [Firebase Auth with Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Expo AuthSession](https://docs.expo.dev/guides/authentication/#google)
