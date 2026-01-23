import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistence for native platforms
let authInstance: Auth;

if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error: any) {
    // If already initialized, just get the existing instance
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
