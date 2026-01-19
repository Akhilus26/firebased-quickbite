import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = '#f97316';

function AnimatedTabIcon({ name, color, focused, size = 26 }: { name: string; color: string; focused: boolean; size?: number }) {
  const translateY = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: scaleAnim }] }}>
      <Ionicons name={name as any} size={size} color={color} />
    </Animated.View>
  );
}

export default function UserTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f5f5f0',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 15,
          paddingTop: 10,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          position: 'absolute',
          marginHorizontal: 16,
          marginBottom: 10,
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'list' : 'list-outline'} color={color} focused={focused} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{ 
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'cart' : 'cart-outline'} color={color} focused={focused} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} focused={focused} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="food-details" 
        options={{ 
          href: null, // Hide from tab bar
        }} 
      />
      <Tabs.Screen 
        name="payment" 
        options={{ 
          href: null, // Hide from tab bar
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
