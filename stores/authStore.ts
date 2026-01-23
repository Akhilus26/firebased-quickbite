import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { signOut as firebaseSignOut, User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import * as WebBrowser from 'expo-web-browser';
import { useCartStore } from './cartStore';

// Storage helper
const tokenStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Complete the auth session (required for Expo)
WebBrowser.maybeCompleteAuthSession();

type Role = 'guest' | 'user' | 'owner' | 'admin';

type State = {
  role: Role;
  phone?: string;
  user: User | null;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isLoading: boolean;
};

type Actions = {
  login: (p: { phone: string; role: Exclude<Role, 'guest'> }) => Promise<void>;
  setGoogleUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  isGuest: () => boolean;
  setUser: (user: User | null) => void;
  initializeAuth: () => () => void;
};

const KEY = 'quickbite_auth_v1';

export const useAuthStore = create<State & Actions>((set, get) => ({
  role: 'guest',
  user: null,
  isLoading: true,
  async login(p) {
    set({ role: p.role, phone: p.phone });
    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify({ role: p.role, phone: p.phone }));
    } catch { }
  },
  async setGoogleUser(user: User) {
    set({
      user,
      email: user.email || undefined,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      role: 'user',
      isLoading: false,
    });

    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify({
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user'
      }));
    } catch (error) {
      console.error('Error saving auth to SecureStore:', error);
    }
  },
  async logout() {
    try {
      if (get().user) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Firebase sign-out error:', error);
    }
    set({
      role: 'guest',
      phone: undefined,
      user: null,
      email: undefined,
      displayName: undefined,
      photoURL: undefined
    });
    // Clear the cart on logout to ensure different users have different carts
    useCartStore.getState().clear();
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch { }
  },
  isGuest() {
    return get().role === 'guest';
  },
  async setUser(user: User | null) {
    if (user) {
      // Fetch user metadata from Firestore to get the correct role
      const { getFirestore, doc, getDoc } = require('firebase/firestore');
      const db = getFirestore();

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();

        set({
          user,
          email: user.email || undefined,
          displayName: data?.displayName || user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          role: (data?.userType as Role) || 'user',
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user metadata:', error);
        set({
          user,
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          role: 'user',
          isLoading: false,
        });
      }
    } else {
      set({
        user: null,
        role: 'guest',
        email: undefined,
        displayName: undefined,
        photoURL: undefined,
        isLoading: false,
      });
    }
  },
  initializeAuth() {
    set({ isLoading: true });

    // Try to restore from SecureStore first
    tokenStorage.getItem(KEY)
      .then((stored) => {
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.userId && get().user?.uid === data.userId) {
              // User data already loaded from Firebase Auth
              return;
            }
          } catch (error) {
            console.error('Error parsing stored auth:', error);
          }
        }
      })
      .catch((error) => {
        console.error('Error reading stored auth:', error);
      });

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      get().setUser(user);
    });

    return unsubscribe;
  },
}));