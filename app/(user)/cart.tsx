import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ImageBackground, Image, ScrollView, Alert } from 'react-native';
import { useCartStore } from '@/stores/cartStore';
import { router, useFocusEffect } from 'expo-router';
import { useCanteenStore } from '@/stores/canteenStore';
import { getMenu } from '@/api/menu';

const ORANGE = '#f97316';
const GREEN = '#22c55e';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 100,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  menuIcon: {
    fontSize: 20,
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 200,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 100,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  itemRemove: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
    color: ORANGE,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryRight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  checkoutBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    width: '100%',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
    fontSize: 16,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: 'center',
  },
});

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const remove = useCartStore((s) => s.remove);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const validateCart = useCartStore((s) => s.validateCart);
  const canteenOpen = useCanteenStore((s) => s.open);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const checkCart = async () => {
        try {
          const menu = await getMenu();
          if (isActive) {
            const changed = validateCart(menu);
            if (changed) {
              Alert.alert(
                'Cart Updated',
                'Some items in your cart were removed because they are no longer available or out of stock.'
              );
            }
          }
        } catch (error) {
          console.error('Failed to validate cart:', error);
        }
      };
      
      checkCart();
      return () => { isActive = false; };
    }, [validateCart])
  );

  const handleCheckout = () => {
    if (!canteenOpen) {
      Alert.alert('Canteen Closed', 'Ordering is unavailable while the canteen is closed.');
      return;
    }
    router.push('/(user)/payment');
  };

  return (
    <ImageBackground 
      source={require('../../design/background image.jpeg')} 
      style={styles.container}
      blurRadius={8}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.menuIcon}>⋯</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty</Text>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image 
                  source={typeof item.image === 'number' ? item.image : { uri: item.image || 'https://via.placeholder.com/300' }} 
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Pressable onPress={() => remove(item.id)} style={styles.itemRemove}>
                    <View style={[styles.vegDot, { backgroundColor: item.veg ? GREEN : '#ef4444' }]} />
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: 70 }}>
                  <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                  <View style={styles.qtyContainer}>
                    <Pressable onPress={() => dec(item.id)} style={styles.qtyBtn} hitSlop={8}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <Pressable onPress={() => inc(item.id)} style={styles.qtyBtn} hitSlop={8}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.summary}>
            <Text style={styles.summaryLeft}>Total Items: {items.length}</Text>
            <Text style={styles.summaryRight}>₹{total()}</Text>
          </View>
          <Pressable 
            onPress={handleCheckout} 
            disabled={!canteenOpen}
            style={({pressed}) => [
              styles.checkoutBtn, 
              !canteenOpen && { backgroundColor: '#6b7280' },
              pressed && { opacity: 0.9 }
            ]}
          >
            <Text style={styles.checkoutText}>
              {canteenOpen ? 'Proceed to Checkout' : 'Canteen Closed'}
            </Text>
          </Pressable>
        </View>
      )}
    </ImageBackground>
  );
}
