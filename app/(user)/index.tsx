import React from 'react';
import { View, FlatList, StyleSheet, Text, ScrollView, Image, Pressable, ImageBackground, TouchableOpacity } from 'react-native';
import { FoodCard } from '@/components/FoodCard';
import { useCanteenStore } from '@/stores/canteenStore';
import { getCanteenStatus } from '@/api/owner';
import { useQuery } from '@tanstack/react-query';
import { getMenu } from '@/api/menu';
import type { MenuItem } from '@/components/FoodCard';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Category = MenuItem['category'] | 'All';

type VegFilter = 'All' | 'Veg' | 'Non-Veg';

function CategoryTile({
  cat,
  isActive,
  onPress,
}: {
  cat: { label: string; value: Category; image: any };
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = React.useRef(new (require('react-native').Animated).Value(1)).current;
  const Animated = require('react-native').Animated;
  
  React.useEffect(() => {
    Animated.timing(scale, { toValue: isActive ? 1 : 0.96, duration: 180, useNativeDriver: true }).start();
  }, [isActive]);

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.05, friction: 3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: isActive ? 0.96 : 1, friction: 3, useNativeDriver: true })
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.categoryCard, isActive && styles.categoryCardActive]}>
      <Animated.View style={{ transform: [{ scale }], width: '100%', height: '100%' }}>
        <ImageBackground source={cat.image} style={styles.categoryImage} imageStyle={{ borderRadius: 16 }}>
          <Text style={styles.categoryLabel}>{cat.label}</Text>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

export default function Home() {
  const { data: menu = [] } = useQuery({ queryKey: ['menu'], queryFn: getMenu });
  const open = useCanteenStore((s) => s.open);
  const setOpen = useCanteenStore((s) => s.setOpen);
  const role = useAuthStore((s) => s.role);
  const isOwner = role === 'owner';
  const { data: statusData } = useQuery({ 
    queryKey: ['canteen:status:public'], 
    queryFn: getCanteenStatus, 
    refetchInterval: 2000 // Poll every 2 seconds for faster updates
  });
  React.useEffect(() => {
    if (statusData) {
      setOpen(!!statusData.open);
    }
  }, [statusData, setOpen]);

  const [category, setCategory] = React.useState<Category>('All');
  const [vegFilter, setVegFilter] = React.useState<VegFilter>('All');

  const filtered = React.useMemo(() => {
    return menu.filter((m) => {
      const byCat = category === 'All' ? true : m.category === category;
      const byVeg = vegFilter === 'All' ? true : vegFilter === 'Veg' ? m.veg : !m.veg;
      return byCat && byVeg;
    });
  }, [menu, category, vegFilter]);

  const categories: { label: string; value: Category; image: any }[] = [
    { label: 'Snacks', value: 'Snacks', image: require('../../design/snacks/sandwich.jpg') },
    { label: 'Meals', value: 'Meals', image: require('../../design/meals/Chicken Biryani.jpg') },
    { label: 'Hot Drinks', value: 'Hot Beverages', image: require('../../design/Hot Beverages/Tea.jpg') },
    { label: 'Cold Drinks', value: 'Cold Beverages', image: require('../../design/Cold Beverages/cold drinks.jpg') },
  ];

  return (
    <>
      <ImageBackground 
        source={require('../../design/background image.jpeg')} 
        style={styles.container}
        blurRadius={8}
      >
       <View style={{ flex: 1, backgroundColor: open ? 'transparent' : 'rgba(0,0,0,0.75)' }}>
         <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brand}>Quick Bite</Text>
                  <Text style={styles.tagline}>Fresh & Fast from Your Canteen</Text>
                  <View style={styles.location}>
                    <Text style={styles.pin}>📍</Text>
                    <Text style={styles.locationText}>Campus Canteen</Text>
                  </View>
                </View>
                {isOwner && (
                  <TouchableOpacity 
                    onPress={() => router.push('/(owner)')} 
                    style={styles.ownerBackBtn}
                  >
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={styles.ownerBackText}>Back to Owner Dashboard</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: open ? ORANGE : '#111827' }]}>
            <Text style={[styles.statusCheck, { color: '#fff' }]}>✓</Text>
            <Text style={[styles.statusText, { color: '#fff' }]}>{open ? 'Canteen is Open • Avg Prep Time: 12 mins' : 'Canteen is Closed'}</Text>
            <Text style={[styles.statusDots, { color: '#fff' }]}>⋯</Text>
          </View>

          {/* Category Carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((cat) => (
              <CategoryTile
                key={cat.value}
                cat={cat}
                isActive={category === cat.value}
                onPress={() => setCategory((prev) => (prev === cat.value ? 'All' : cat.value))}
              />
            ))}
          </ScrollView>

          {/* Veg/Non-Veg Toggle */}
          <View style={styles.vegRow}>
            <Pressable onPress={() => setVegFilter('Veg')} style={[styles.vegPill, vegFilter === 'Veg' && styles.vegActive]}>
              <Text style={styles.vegIcon}>🌿</Text>
              <Text style={[styles.vegText, vegFilter === 'Veg' && styles.vegTextActive]}>Veg</Text>
            </Pressable>
            <Pressable onPress={() => setVegFilter('Non-Veg')} style={[styles.nonVegPill, vegFilter === 'Non-Veg' && styles.nonVegActive]}>
              <Text style={styles.nonVegIcon}>🍗</Text>
              <Text style={[styles.nonVegText, vegFilter === 'Non-Veg' && styles.nonVegTextActive]}>Non-Veg</Text>
            </Pressable>
            <Pressable onPress={() => setVegFilter('All')} style={styles.allPill}>
              <View style={styles.dot} />
              <View style={styles.dot} />
            </Pressable>
          </View>

          {/* Popular Items */}
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <View style={styles.grid}>
            {filtered.map((item) => (
              <View key={item.id} style={{ width: '48%' }}>
                <FoodCard item={item} disabled={!open} />
              </View>
            ))}
          </View>
          </ScrollView>
       </View>
      </ImageBackground>
    </>
  );
}

const ORANGE = '#f97316';
const GREEN = '#6aa84f';
const ACTIVE_BORDER = '#ff7a1a';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    backdropFilter: 'blur(10px)',
  },
  brand: { fontSize: 28, fontWeight: '900', color: ORANGE, fontStyle: 'italic' },
  tagline: { color: '#666', marginTop: 2, fontSize: 14 },
  location: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  pin: { fontSize: 14 },
  locationText: { color: '#333', fontWeight: '600', marginLeft: 4 },
  ownerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  ownerBackText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  statusCheck: { fontSize: 16, color: '#fff', fontWeight: '900', marginRight: 8 },
  statusText: { flex: 1, color: '#fff', fontWeight: '600' },
  statusDots: { fontSize: 20, color: '#fff' },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  categoryCard: {
    width: 160,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryCardActive: {
    borderWidth: 2,
    borderColor: ACTIVE_BORDER,
    shadowColor: ACTIVE_BORDER,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  categoryOverlayActive: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  categoryLabel: { fontSize: 16, fontWeight: '700', color: '#fff', textShadowColor: '#000', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 }, zIndex: 1 },
  vegRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 6,
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  vegPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e8f5e9',
  },
  vegActive: { backgroundColor: GREEN, borderColor: GREEN },
  vegIcon: { fontSize: 16, marginRight: 6 },
  vegText: { color: '#333', fontWeight: '700' },
  vegTextActive: { color: '#fff' },
  nonVegPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe0b2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffe0b2',
  },
  nonVegActive: { backgroundColor: '#d84315', borderColor: '#d84315' },
  nonVegIcon: { fontSize: 16, marginRight: 6 },
  nonVegText: { color: '#333', fontWeight: '700' },
  nonVegTextActive: { color: '#fff' },
  allPill: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#999' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  floatingCart: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    height: 62,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  cartHeader: {
    flexDirection: 'column',
    marginRight: 12,
    minWidth: 80,
  },
  cartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: ORANGE,
  },
  cartItems: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  cartItemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    minWidth: 240,
    maxWidth: 320,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: ORANGE,
    marginTop: 2,
  },
  cartItemLeft: {
    flex: 1,
    marginRight: 12,
    minWidth: 100,
    maxWidth: 160,
  },
  cartQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cartQtyBtn: {
    backgroundColor: 'transparent',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQtyBtnPlus: {
    backgroundColor: ORANGE,
  },
  cartQtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
  },
  cartQtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
});
