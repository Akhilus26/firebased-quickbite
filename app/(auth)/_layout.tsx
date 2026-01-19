import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerTitle: 'Quick Bite' }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
}
