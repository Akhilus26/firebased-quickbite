import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  category: 'Snacks' | 'Meals' | 'Hot Beverages' | 'Cold Beverages';
  image?: string | number; // Can be URL string or require() number
  available?: boolean;
  madeWith?: string;
  calories?: number;
  protein?: number;
  prepTime?: number; // minutes
  quantity?: number; // default serving quantity or stock quantity
  counter: 'Snacks & Hot Beverages' | 'Meals' | 'Cold Beverages';
};

export function FoodCard({ item, disabled }: { item: MenuItem; disabled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeIn]);

  const pressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  const handlePress = () => {
    if (item.available === false || disabled) return;
    // Navigate to food details page
    router.push({
      pathname: '/(user)/food-details',
      params: { item: JSON.stringify(item) }
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: fadeIn }}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={item.available === false}
      >
        <View style={styles.card}>
          <View style={styles.imageWrap}>
            <Image
              source={typeof item.image === 'number' ? item.image : { uri: item.image || 'https://via.placeholder.com/300' }}
              style={styles.image}
            />
            {(item.available === false || disabled) && (
              <View style={styles.soldOutOverlay}>
                <Text style={styles.soldOutText}>{item.available === false ? 'Sold Out' : 'Closed'}</Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
            <View style={styles.footer}>
              <View style={styles.priceRow}>
                <View style={[styles.vegDot, { backgroundColor: item.veg ? '#22c55e' : '#ef4444' }]} />
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>VIEW</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 8,
  },
  imageWrap: { position: 'relative', width: '100%', aspectRatio: 1.4 },
  image: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffffdd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: { fontSize: 24, fontWeight: '900', color: '#666', textShadowColor: '#fff', textShadowRadius: 4 },
  info: { padding: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#333' },
  desc: { fontSize: 12, color: '#888', marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vegDot: { width: 12, height: 12, borderRadius: 2, borderWidth: 1, borderColor: '#fff' },
  price: { fontSize: 16, fontWeight: '800', color: '#333' },
  addBtn: { backgroundColor: '#6aa84f', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
