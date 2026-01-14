# Why Google Cloud Console? (Firebase = Google Cloud)

## 🔗 The Connection

**Firebase projects ARE Google Cloud Platform projects!** When you create a Firebase project, it automatically creates a Google Cloud project behind the scenes.

## 🎯 Simple Solution: Access from Firebase Console

You don't need to go to Google Cloud Console separately! You can access everything from Firebase Console:

### Method 1: Direct Link from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **quickbite-4a8d8**
3. Click the **⚙️ Settings (gear icon)** → **Project settings**
4. Scroll down to **Your apps** section
5. Click on your **Web app**
6. Look for **OAuth 2.0 Client IDs** section
7. You'll see a link: **"Open in Google Cloud Console"** or **"Configure OAuth consent screen"**
8. Click that link - it takes you directly to the OAuth consent screen!

### Method 2: Quick Access

1. Firebase Console → Your Project
2. Look for **"Google Cloud"** link in the left sidebar or top menu
3. Click it - opens Google Cloud Console for the same project
4. Go to **APIs & Services** → **OAuth consent screen**

## ✅ What You Need to Do (All from Firebase Console)

1. **Firebase Console** → **Authentication** → **Sign-in method** → Make sure **Google** is **Enabled** ✅

2. **Firebase Console** → **Settings** → **Project settings** → **Your apps** → Click your Web app → Find **OAuth consent screen** link → Configure it:
   - App name: `QuickBite`
   - Support email: Your email
   - Add yourself as test user: `gamerrakshasan321@gmail.com`
   - Save

That's it! You're still in Firebase, just accessing the OAuth settings that Firebase uses.

## 🤔 Why This Happens

Firebase Authentication uses Google's OAuth 2.0 system. Google requires the OAuth consent screen to be configured for security and compliance. Since Firebase = Google Cloud project, the settings are in Google Cloud Console, but you can access them easily from Firebase Console.

---

**TL;DR**: Firebase projects are Google Cloud projects. Access OAuth settings from Firebase Console using the links provided, or click "Open in Google Cloud Console" - it's the same project!
