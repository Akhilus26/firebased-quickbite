// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1QakBr91TB6SCVBTzprKVd38-fgmXeKY",
  authDomain: "quickbite-4a8d8.firebaseapp.com",
  projectId: "quickbite-4a8d8",
  storageBucket: "quickbite-4a8d8.firebasestorage.app",
  messagingSenderId: "91948169284",
  appId: "1:91948169284:web:bdf1a12b110852924e2411"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
// Note: Using getAuth for now. We'll add AsyncStorage persistence later
// This will show a warning but the app will work. Auth state persists via SecureStore in authStore.ts
export const auth = getAuth(app);
