import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, markItemDelivered } from '@/api/staff';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Order, OrderItemDelivery } from '@/api/orders';

const COLORS = {
  bgOverlay: 'rgba(255,255,255,0.82)',
  glass: 'rgba(255,255,255,0.92)',
  text: '#111827',
  sub: '#6b7280',
  border: '#e5e7eb',
  primary: '#111827',
  accent: '#f97316',
  blue: '#2563eb',
  green: '#16a34a',
  red: '#ef4444',
};

function CounterSection({
  counter,
  items,
  deliveryStatus,
  onMarkDelivered,
  orderId,
}: {
  counter: 'Snacks' | 'Meals' | 'Cold Beverages';
  items: Array<{ id: number; name: string; qty: number; price: number; category: string }>;
  deliveryStatus: OrderItemDelivery[];
  onMarkDelivered: (orderId: number, itemId: number) => void;
  orderId: number;
}) {
  const counterItems = items.filter((item) => {
    const status = deliveryStatus.find((d) => d.itemId === item.id);
    return status?.counter === counter;
  });

  if (counterItems.length === 0) return null;

  const allDelivered = counterItems.every((item) => {
    const status = deliveryStatus.find((d) => d.itemId === item.id);
    return status?.delivered;
  });

  const getCounterIcon = (counter: string) => {
    switch (counter) {
      case 'Snacks':
        return 'fast-food-outline';
      case 'Meals':
        return 'restaurant-outline';
      case 'Cold Beverages':
        return 'cafe-outline';
      default:
        return 'cube-outline';
    }
  };

  return (
    <View style={styles.counterSection}>
      <View style={styles.counterHeader}>
        <View style={styles.counterTitleRow}>
          <Ionicons name={getCounterIcon(counter) as any} size={20} color={COLORS.accent} />
          <Text style={styles.counterTitle}>{counter} Counter</Text>
        </View>
        {allDelivered && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
            <Text style={styles.completedText}>All Delivered</Text>
          </View>
        )}
      </View>

      {counterItems.map((item) => {
        const status = deliveryStatus.find((d) => d.itemId === item.id);
        const isDelivered = status?.delivered || false;

        return (
          <View key={item.id} style={[styles.itemRow, isDelivered && styles.itemRowDelivered]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, isDelivered && styles.itemNameDelivered]}>
                {item.name}
              </Text>
              <Text style={styles.itemDetails}>
                Qty: {item.qty} × ₹{item.price} = ₹{item.qty * item.price}
              </Text>
            </View>
            {!isDelivered ? (
              <TouchableOpacity
                style={styles.deliverButton}
                onPress={() => {
                  Alert.alert(
                    'Mark as Delivered',
                    `Mark ${item.name} (${item.qty}x) as delivered?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Mark Delivered',
                        onPress: () => onMarkDelivered(orderId, item.id),
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.deliverButtonText}>Mark Delivered</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.deliveredBadge}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
                <Text style={styles.deliveredText}>Delivered</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetails() {
  const params = useLocalSearchParams();
  const orderId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['staff:order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  const { mutate: markDelivered } = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      markItemDelivered(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff:order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['staff:active'] });
      queryClient.invalidateQueries({ queryKey: ['staff:completed'] });
      queryClient.invalidateQueries({ queryKey: ['staff:pending-count'] });
    },
  });

  if (isLoading || !order) {
    return (
      <ImageBackground
        source={require('../../design/owner background.png')}
        style={styles.container}
        blurRadius={10}
      >
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const allItemsDelivered = order.itemDeliveryStatus.every((d) => d.delivered);
  const isCompleted = order.status === 'completed';

  // Group items by counter
  const counters: Array<'Snacks' | 'Meals' | 'Cold Beverages'> = ['Snacks', 'Meals', 'Cold Beverages'];

  return (
    <ImageBackground
      source={require('../../design/owner background.png')}
      style={styles.container}
      blurRadius={10}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.orderInfoCard}>
            <View style={styles.orderCodeRow}>
              <Text style={styles.orderCodeLabel}>Order Code:</Text>
              <Text style={styles.orderCode}>{order.orderCode}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      isCompleted || allItemsDelivered
                        ? COLORS.green + '20'
                        : COLORS.accent + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        isCompleted || allItemsDelivered ? COLORS.green : COLORS.accent,
                    },
                  ]}
                >
                  {isCompleted || allItemsDelivered ? 'COMPLETED' : order.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{formatTime(order.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{order.total}</Text>
            </View>
          </View>

          {isCompleted && (
            <View style={styles.warningCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent} />
              <Text style={styles.warningText}>
                This order has been completed. The code is no longer valid.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Items by Counter</Text>

          {counters.map((counter) => (
            <CounterSection
              key={counter}
              counter={counter}
              items={order.items}
              deliveryStatus={order.itemDeliveryStatus}
              onMarkDelivered={markDelivered}
              orderId={order.id}
            />
          ))}

          {allItemsDelivered && !isCompleted && (
            <View style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={32} color={COLORS.green} />
              <Text style={styles.completionText}>
                All items have been delivered. Order will be marked as completed.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.sub,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  content: { padding: 16, paddingBottom: 100 },
  orderInfoCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  orderCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCodeLabel: {
    fontSize: 14,
    color: COLORS.sub,
    fontWeight: '600',
  },
  orderCode: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.sub,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 11,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  warningCard: {
    backgroundColor: COLORS.accent + '15',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  counterSection: {
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  counterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  counterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.green + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemRowDelivered: {
    opacity: 0.6,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemNameDelivered: {
    textDecorationLine: 'line-through',
  },
  itemDetails: {
    fontSize: 13,
    color: COLORS.sub,
  },
  deliverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.green,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deliverButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.green + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deliveredText: {
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 12,
  },
  completionCard: {
    backgroundColor: COLORS.green + '15',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
  },
  completionText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

