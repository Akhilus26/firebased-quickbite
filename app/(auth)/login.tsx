import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from '@/components/SplashScreen';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithCredential, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

// Complete the auth session (required for Expo)
WebBrowser.maybeCompleteAuthSession();

const ORANGE = '#f97316';
const GREEN = '#22c55e';

// OAuth 2.0 Client IDs from Firebase Console
const GOOGLE_WEB_CLIENT_ID = '91948169284-t3i0a3fv9e42e9h1hstgjt1dn04f2554.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '91948169284-hdgsvfjrm72volmukooqu6nr772t3r2o.apps.googleusercontent.com';

export default function Login() {
  const [role, setRole] = useState<'user' | 'owner' | 'admin'>('user');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setGoogleUser = useAuthStore((s) => s.setGoogleUser);

  // Google authentication hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // Handle Google sign-in with Firebase
  const handleGoogleSignIn = useCallback(async (idToken: string | null, accessToken: string | null) => {
    try {
      if (!idToken && !accessToken) {
        throw new Error('No tokens provided');
      }

      let credential;
      if (idToken) {
        credential = GoogleAuthProvider.credential(idToken);
      } else {
        credential = GoogleAuthProvider.credential(null, accessToken);
      }

      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Special check for owner email
      if (user.email === 'akhilus321@gmail.com') {
        const setGoogleUser = useAuthStore.getState().setGoogleUser;
        // The store currently hardcodes 'user' role in setGoogleUser. 
        // I might need to update the store or manually override here.
        // For now, I'll follow the flow.
        await setGoogleUser(user);
        // Manually update role in store for owner
        useAuthStore.setState({ role: 'owner' });
        router.replace('/(owner)');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await setGoogleUser(user);
        router.replace('/');
      } else {
        await setGoogleUser(user);
        router.replace('/(auth)/complete-profile');
      }

    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Sign In Error',
        error.message || 'Failed to sign in with Google. Please try again.'
      );
      setIsGoogleSigningIn(false);
    }
  }, [setGoogleUser]);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      if (id_token || access_token) {
        handleGoogleSignIn(id_token || null, access_token || null);
      } else {
        setIsGoogleSigningIn(false);
      }
    } else if (response?.type === 'error') {
      const errorMessage = response.error?.message || 'Google sign-in failed';
      Alert.alert('Sign In Error', errorMessage);
      setIsGoogleSigningIn(false);
    } else if (response?.type === 'cancel') {
      setIsGoogleSigningIn(false);
    }
  }, [response, handleGoogleSignIn]);

  const getAuthErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const onEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter both email and password.');
      return;
    }

    try {
      setIsEmailLoading(true);
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user.email === 'akhilus321@gmail.com') {
          await setGoogleUser(user);
          useAuthStore.setState({ role: 'owner' });
          router.replace('/(owner)');
          return;
        }

        await setGoogleUser(user);
        router.replace('/(auth)/complete-profile');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user.email === 'akhilus321@gmail.com') {
          await setGoogleUser(user);
          useAuthStore.setState({ role: 'owner' });
          router.replace('/(owner)');
          return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await setGoogleUser(user);
          router.replace('/');
        } else {
          await setGoogleUser(user);
          router.replace('/(auth)/complete-profile');
        }
      }
    } catch (error: any) {
      console.error('Email Auth Error:', error);
      Alert.alert('Authentication Failed', getAuthErrorMessage(error.code));
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      await promptAsync();
    } catch (error: any) {
      Alert.alert(
        'Sign In Error',
        error.message || 'Failed to initiate Google sign-in. Please try again.'
      );
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <>
      <ImageBackground
        source={require('../../design/background image.jpeg')}
        style={styles.container}
        blurRadius={8}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Logo/Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <Ionicons name="restaurant" size={64} color={ORANGE} />
                </View>
                <Text style={styles.appTitle}>QuickBite</Text>
                <Text style={styles.appSubtitle}>Delicious food, delivered fast</Text>
              </View>

              {/* Login/Signup Card */}
              <View style={styles.card}>
                <Text style={styles.welcomeText}>{isSignup ? 'Create Account' : 'Welcome Back!'}</Text>
                <Text style={styles.instructionText}>
                  {isSignup ? 'Sign up to get started' : 'Sign in to your account'}
                </Text>

                {/* Email/Password Inputs */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Auth Button */}
                <Pressable
                  onPress={onEmailAuth}
                  disabled={isEmailLoading}
                  style={({ pressed }) => [
                    styles.authButton,
                    pressed && styles.authButtonPressed,
                    isEmailLoading && styles.authButtonDisabled
                  ]}
                >
                  {isEmailLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.authButtonText}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
                  )}
                </Pressable>

                {/* Toggle Signup/Login */}
                <Pressable onPress={() => setIsSignup(!isSignup)} style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                    <Text style={styles.toggleTextHighlight}>{isSignup ? 'Sign In' : 'Sign Up'}</Text>
                  </Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign In Button */}
                <Pressable
                  onPress={onGoogleSignIn}
                  disabled={isGoogleSigningIn || !request}
                  style={({ pressed }) => [
                    styles.googleButton,
                    pressed && styles.googleButtonPressed,
                    (isGoogleSigningIn || !request) && styles.googleButtonDisabled
                  ]}
                >
                  <Ionicons name="logo-google" size={20} color="#fff" />
                  <Text style={styles.googleButtonText}>
                    {isGoogleSigningIn ? 'Signing in...' : 'Continue with Google'}
                  </Text>
                </Pressable>

                <Text style={styles.hint}>
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#f3f4f6',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  authButton: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  authButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  toggleTextHighlight: {
    color: ORANGE,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#4285F4',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  googleButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});
