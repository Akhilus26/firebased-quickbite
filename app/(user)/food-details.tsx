import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView, ImageBackground } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCartStore } from '@/stores/cartStore';
import { useCanteenStore } from '@/stores/canteenStore';
import { Alert } from 'react-native';
import type { MenuItem } from '@/components/FoodCard';

export default function FoodDetails() {
  const params = useLocalSearchParams();
  const add = useCartStore((s) => s.addItem);
  
  // Parse the item from params
  const item: MenuItem = JSON.parse(params.item as string);
  
  const [quantity, setQuantity] = useState(1);
  const canteenOpen = useCanteenStore((s) => s.open);

  const handleBack = () => {
    router.back();
  };

  const handleAddToCart = () => {
    if (!canteenOpen) {
      Alert.alert('Canteen Closed', 'Ordering is unavailable while the canteen is closed.');
      return;
    }
    // Add item to cart with the selected quantity
    for (let i = 0; i < quantity; i++) {
      add(item);
    }
    router.back();
  };

  // Mock nutritional data - in real app, this would come from the item data
  const nutritionInfo = {
    calories: item.category === 'Meals' ? 320 : item.category === 'Snacks' ? 200 : 150,
    protein: item.category === 'Meals' ? 15 : item.category === 'Snacks' ? 8 : 3,
    prepTime: '10 mins',
  };

  const ingredients = item.veg 
    ? 'Paneer, Bell Peppers, Spices' 
    : 'Chicken, Bell Peppers, Spices';

  return (
    <ImageBackground 
      source={require('../../design/background image.jpeg')} 
      style={styles.container}
      blurRadius={8}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Food Details</Text>
        <View style={styles.headerRight}>
          <Text style={styles.pinIcon}>📍</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Food Image */}
          {/* <View style={styles.imageContainer}>
            <Image 
              source={typeof item.image === 'number' ? item.image : { uri: item.image || 'https://via.placeholder.com/300' }}
              style={styles.foodImage}
            />
          </View> */}

          {/* Food Info */}
          <View style={styles.infoSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>

            <Text style={styles.description}>{item.description}</Text>

            {/* Veg/Non-Veg Indicator */}
            <View style={styles.vegIndicator}>
              <View style={[styles.vegDot, { backgroundColor: item.veg ? '#22c55e' : '#ef4444' }]} />
              <Text style={styles.vegText}>{item.veg ? 'Vegetarian' : 'Non-Vegetarian'}</Text>
            </View>

            {/* Made With */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>🌿 Made with:</Text>
              <Text style={styles.sectionValue}>{ingredients}</Text>
            </View>

            {/* Nutrition Info with Separators */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionIcon}>🔥</Text>
                <View>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{nutritionInfo.calories} kcal</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionIcon}>💪</Text>
                <View>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{nutritionInfo.protein}g</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionIcon}>⏱️</Text>
                <View>
                  <Text style={styles.nutritionLabel}>Prep Time</Text>
                  <Text style={styles.nutritionValue}>{nutritionInfo.prepTime}</Text>
                </View>
              </View>
            </View>

            {/* Quantity Selector - Horizontal Layout */}
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantityControls}>
                <Pressable 
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityBtn}
                >
                  <Text style={styles.quantityBtnText}>−</Text>
                </Pressable>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <Pressable 
                  onPress={() => setQuantity(quantity + 1)}
                  style={styles.quantityBtnIncrease}
                >
                  <Text style={styles.quantityBtnIncreaseText}>+</Text>
                </Pressable>
                <Pressable 
                  onPress={handleAddToCart}
                  style={styles.quantityBtnAddToCart}
                >
                  <Text style={styles.quantityBtnAddToCartText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{item.price * quantity}</Text>
        </View>
        <Pressable 
          onPress={handleAddToCart}
          disabled={!canteenOpen}
          style={({ pressed }) => [styles.addButton, (!canteenOpen) && { backgroundColor: '#6b7280' }, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const ORANGE = '#f97316';
const GREEN = '#6aa84f';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 100,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  pinIcon: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 8,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: ORANGE,
    marginLeft: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  vegIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vegDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 8,
  },
  vegText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  nutritionIcon: {
    fontSize: 20,
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  nutritionValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '800',
  },
  quantitySection: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quantityBtnText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  quantityBtnIncrease: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quantityBtnIncreaseText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  quantityBtnAddToCart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  quantityBtnAddToCartText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    minWidth: 32,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  addButton: {
    backgroundColor: ORANGE,
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 28,
  },
});
