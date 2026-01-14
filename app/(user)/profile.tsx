import React from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 20,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  }
});

export default function Profile() {
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ImageBackground 
      source={require('../../design/background image.jpeg')} 
      style={styles.container}
      blurRadius={8}
    >
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.text}>Logged in as: {role}</Text>
          <Button title="Logout" onPress={handleLogout} color="#f97316" />
        </View>
      </View>
    </ImageBackground>
  );
}
