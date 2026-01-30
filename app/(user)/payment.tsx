import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ImageBackground, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cartStore';
import { createOrder } from '@/api/orders';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { useCanteenStore } from '@/stores/canteenStore';

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
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
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
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  orderSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  orderSummaryAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  paymentOptions: {
    gap: 12,
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paymentIconCheck: {
    fontSize: 20,
  },
  paymentArrow: {
    fontSize: 18,
    color: '#6b7280',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
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
});

export default function Payment() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clear = useCartStore((s) => s.clear);
  const isGuest = useAuthStore((s) => s.isGuest);
  const phone = useAuthStore((s) => s.phone);
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'upi' | 'cod'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const spend = useWalletStore((s) => s.spend);
  const canteenOpen = useCanteenStore((s) => s.open);

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (isGuest()) {
      router.push('/(auth)/login');
      return;
    }

    if (!canteenOpen) {
      Alert.alert('Canteen Closed', 'Ordering is unavailable while the canteen is closed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = total();
      // For non-COD payments, attempt to use wallet balance
      if (selectedPayment !== 'cod') {
        const ok = spend(amount);
        if (!ok) {
          Alert.alert('Insufficient Balance', 'Your wallet balance is not enough to complete this payment.');
          setIsSubmitting(false);
          return;
        }
      }

      const user = useAuthStore.getState().user;
      const order = await createOrder(items, selectedPayment, user?.uid || 'unknown');
      clear();

      // Auto-navigate to Scratch Cards page after successful "payment"
      router.replace({
        pathname: '/(user)/scratch-cards',
        params: { orderId: order.id.toString() }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../design/background image.jpeg')}
      style={styles.container}
      blurRadius={8}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => !isSubmitting && router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerRight}>
          <Text style={styles.menuIcon}>⋯</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.orderSummary}>
          <Text style={styles.orderSummaryLabel}>Order Summary</Text>
          <Text style={styles.orderSummaryAmount}>₹{total()}</Text>
        </View>

        <View style={styles.paymentOptions}>
          <Pressable
            onPress={() => setSelectedPayment('card')}
            style={styles.paymentOption}
            disabled={isSubmitting}
          >
            <View style={[styles.paymentIcon, { backgroundColor: selectedPayment === 'card' ? GREEN : '#f0f0f0' }]}>
              {selectedPayment === 'card' ? (
                <Text style={[styles.paymentIconCheck, { color: '#fff' }]}>✓</Text>
              ) : (
                <Text style={styles.paymentIconText}>💳</Text>
              )}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Credit / Debit Card</Text>
            </View>
            <Text style={styles.paymentArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedPayment('upi')}
            style={styles.paymentOption}
            disabled={isSubmitting}
          >
            <View style={[styles.paymentIcon, { backgroundColor: selectedPayment === 'upi' ? ORANGE : '#f0f0f0' }]}>
              <Text style={[styles.paymentIconText, { color: selectedPayment === 'upi' ? '#fff' : '#111827' }]}>A</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>UPI</Text>
            </View>
            <Text style={styles.paymentArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedPayment('cod')}
            style={styles.paymentOption}
            disabled={isSubmitting}
          >
            <View style={[styles.paymentIcon, { backgroundColor: selectedPayment === 'cod' ? ORANGE : '#f0f0f0' }]}>
              <Text style={[styles.paymentIconText, { color: selectedPayment === 'cod' ? '#fff' : '#111827' }]}>💰</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            </View>
            <Text style={styles.paymentArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLeft}>Total Items: {items.length}</Text>
          <Text style={styles.summaryRight}>₹{total()}</Text>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <Pressable
          onPress={handleCheckout}
          disabled={!canteenOpen || isSubmitting}
          style={({ pressed }) => [
            styles.checkoutBtn,
            (!canteenOpen || isSubmitting) && { backgroundColor: '#6b7280' },
            pressed && { opacity: 0.9 }
          ]}
        >
          <Text style={styles.checkoutText}>
            {isSubmitting ? 'Processing...' : (canteenOpen ? 'Proceed to Checkout' : 'Canteen Closed')}
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}


