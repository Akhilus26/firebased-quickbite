import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from '@/components/SplashScreen';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/config/firebase';

// Complete the auth session (required for Expo)
WebBrowser.maybeCompleteAuthSession();

const ORANGE = '#f97316';
const GREEN = '#22c55e';

// OAuth 2.0 Client IDs from Firebase Console
const GOOGLE_WEB_CLIENT_ID = '91948169284-t3i0a3fv9e42e9h1hstgjt1dn04f2554.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '91948169284-hdgsvfjrm72volmukooqu6nr772t3r2o.apps.googleusercontent.com';

export default function Login() {
  const [role, setRole] = useState<'user' | 'owner' | 'admin' | 'staff'>('user');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setGoogleUser = useAuthStore((s) => s.setGoogleUser);

  // Google authentication hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // Handle Google sign-in with Firebase
  const handleGoogleSignIn = useCallback(async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      await setGoogleUser(userCredential.user);
      router.replace('/');
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
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      const errorMessage = response.error?.message || 'Google sign-in failed';
      Alert.alert('Sign In Error', errorMessage);
      setIsGoogleSigningIn(false);
    } else if (response?.type === 'cancel') {
      setIsGoogleSigningIn(false);
    }
  }, [response, handleGoogleSignIn]);

  const onLogin = async () => {
    setIsLoggingIn(true);
    // Simulate loading delay to show splash screen
    await new Promise(resolve => setTimeout(resolve, 2000));
    await login({ phone: 'default', role });
    router.replace('/');
    // setIsLoggingIn(false); // No need to set false as we are navigating away
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

  const roleConfig = {
    user: { label: 'Customer', icon: 'person-outline', color: ORANGE },
    owner: { label: 'Owner', icon: 'restaurant-outline', color: '#2563eb' },
    admin: { label: 'Admin', icon: 'shield-outline', color: '#7c3aed' },
    staff: { label: 'Staff', icon: 'people-outline', color: GREEN },
  };

  return (
    <>
      {isLoggingIn && <SplashScreen duration={0} />}
      <ImageBackground
        source={require('../../design/background image.jpeg')}
        style={styles.container}
        blurRadius={8}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo/Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="restaurant" size={64} color={ORANGE} />
              </View>
              <Text style={styles.appTitle}>QuickBite</Text>
              <Text style={styles.appSubtitle}>Delicious food, delivered fast</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.instructionText}>Sign in with Google or continue as guest</Text>

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

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.instructionText}>Select your role to continue as guest</Text>

              {/* Role Selection */}
              <View style={styles.roleContainer}>
                {(['user', 'owner', 'admin', 'staff'] as const).map(r => {
                  const config = roleConfig[r];
                  const isActive = role === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      style={[
                        styles.roleCard,
                        isActive && { backgroundColor: config.color, borderColor: config.color }
                      ]}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={24}
                        color={isActive ? '#fff' : config.color}
                      />
                      <Text style={[
                        styles.roleText,
                        isActive && styles.roleTextActive
                      ]}>
                        {config.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Continue Button */}
              <Pressable
                onPress={onLogin}
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.continueButtonPressed
                ]}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </Pressable>

              <Text style={styles.hint}>
                Guest browsing available. Login required at checkout.
              </Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  welcomeText: {
    fontSize: 28,
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
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  roleTextActive: {
    color: '#fff',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ORANGE,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  continueButtonPressed: {
    opacity: 0.9,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#4285F4',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  googleButtonPressed: {
    opacity: 0.9,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
});
