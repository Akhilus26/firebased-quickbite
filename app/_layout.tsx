import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SplashScreen from '@/components/SplashScreen';
import { useAuthStore } from '@/stores/authStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Initialize Firebase Auth state listener
    const unsubscribe = initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // Wait for both splash and auth initialization
  useEffect(() => {
    if (!showSplash && !isLoading) {
      // Both splash and auth are ready
    }
  }, [showSplash, isLoading]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="(admin)" />

      </Stack>
    </QueryClientProvider>
  );
}
