# Fix: OAuth 2.0 Authorization Error

## 🔴 Error You're Seeing
```
Access blocked: Authorization Error
Error 400: invalid
doesn't comply with Google's OAuth 2.0 policy
```

## ✅ Solution: Configure OAuth Consent Screen

This error happens because the OAuth consent screen in Google Cloud Console is not properly configured. Follow these steps:

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **quickbite-4a8d8** (project-91948169284)

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. You'll see a form to configure your app. Fill it out:

   **User Type:**
   - Select **External** (unless you have a Google Workspace account)
   - Click **Create**

   **App Information:**
   - **App name**: `QuickBite` (or your app name)
   - **User support email**: Select your email (gamerrakshasan321@gmail.com)
   - **App logo**: (Optional - you can skip this)
   - **App domain**: (Optional - you can skip for now)
   - **Application home page**: (Optional)
   - **Privacy policy link**: (Optional for testing, required for production)
   - **Terms of service link**: (Optional for testing, required for production)
   - **Authorized domains**: (Optional - you can skip)
   - **Developer contact information**: Your email (gamerrakshasan321@gmail.com)

   Click **Save and Continue**

### Step 3: Configure Scopes

1. On the **Scopes** page:
   - Click **Add or Remove Scopes**
   - You should see these scopes already added:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - If not, add them manually
   - Click **Update** then **Save and Continue**

### Step 4: Add Test Users (IMPORTANT!)

1. On the **Test users** page:
   - Click **Add Users**
   - Add your email: **gamerrakshasan321@gmail.com**
   - Add any other emails that need to test the app
   - Click **Add** then **Save and Continue**

2. **Important**: If your app is in "Testing" mode, ONLY test users can sign in. Make sure your email is added here!

### Step 5: Configure OAuth Client

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (the one ending in `.apps.googleusercontent.com`)
3. Click on it to edit
4. Under **Authorized redirect URIs**, make sure you have:

   ```
   https://auth.expo.io/@your-expo-username/quickbite
   quickbite://
   exp://localhost:8081
   ```

   (Replace `your-expo-username` with your actual Expo username)

5. Click **Save**

### Step 6: Publish Your App (Optional but Recommended)

If you want anyone to be able to sign in (not just test users):

1. Go back to **OAuth consent screen**
2. At the top, you'll see **Publishing status: Testing**
3. Click **PUBLISH APP**
4. Confirm the publishing

**Note**: For production apps, you'll need:
- Privacy Policy URL
- Terms of Service URL
- App verification (if using sensitive scopes)

For development/testing, keeping it in "Testing" mode with your email as a test user is fine.

## 🧪 Test Again

1. Make sure your email (gamerrakshasan321@gmail.com) is added as a test user
2. Try signing in again
3. The error should be resolved!

## 🔍 Alternative: Use Firebase Auth Directly (Simpler Approach)

If you continue having issues with OAuth consent screen, we can switch to using Firebase Auth's built-in Google Sign-In which handles OAuth automatically. Let me know if you want to try this approach instead.

## 📝 Quick Checklist

- [ ] OAuth consent screen configured
- [ ] Your email added as test user
- [ ] Redirect URIs configured correctly
- [ ] Scopes added (email, profile, openid)
- [ ] App saved and published (or in testing mode with test users)

---

**Still having issues?** Share the specific error message you see after following these steps.
