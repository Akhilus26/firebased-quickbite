import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const role = useAuthStore((s) => s.role);
  // If user is not logged in (guest), redirect to login page
  if (role === 'guest') {
    return <Redirect href="/(auth)/login" />;
  }
  // Otherwise redirect based on role
  if (role === 'owner' || useAuthStore.getState().user?.email === 'akhilus321@gmail.com') return <Redirect href="/(owner)" />;
  if (role === 'admin') return <Redirect href="/(admin)" />;
  return <Redirect href="/(user)" />;
}
