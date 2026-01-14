import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { signOut as firebaseSignOut, User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session (required for Expo)
WebBrowser.maybeCompleteAuthSession();

type Role = 'guest' | 'user' | 'owner' | 'admin' | 'staff';

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
  initializeAuth: () => void;
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
    } catch {}
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
    try { 
      await SecureStore.deleteItemAsync(KEY); 
    } catch {}
  },
  isGuest() { 
    return get().role === 'guest'; 
  },
  setUser(user: User | null) {
    if (user) {
      set({
        user,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        role: 'user',
        isLoading: false,
      });
    } else {
      set({ 
        user: null, 
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
    SecureStore.getItemAsync(KEY)
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