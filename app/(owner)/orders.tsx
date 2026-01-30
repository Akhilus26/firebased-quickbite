import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '@/api/owner';
import { useLocalSearchParams } from 'expo-router';
import { OwnerHeader, OwnerTabBar, COLORS } from '@/components/OwnerUI';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { docToOrder, Order } from '@/api/orders';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerOrders() {
  const params = useLocalSearchParams();
  const filterStatus = (params.status as Order['status']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    let q = query(ordersRef, orderBy('createdAt', 'desc'));

    if (filterStatus) {
      q = query(ordersRef, where('status', '==', filterStatus), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push(docToOrder(doc.data(), doc.id));
      });
      setOrders(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterStatus]);

  const { mutate } = useMutation({
    mutationFn: (p: { id: number; status: 'preparing' | 'ready' | 'completed' }) => updateOrderStatus(p.id, p.status),
  });

  if (loading) {
    return (
      <View style={[styles.overlay, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 15, color: COLORS.sub, fontWeight: '700' }}>Loading orders...</Text>
      </View>
    );
  }

  const Action = ({ label, color, onPress }: { label: string; color: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.actionBtn, { backgroundColor: color }]}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Order #{item.id}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'completed' ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.badgeText, { color: item.status === 'completed' ? '#166534' : '#7f1d1d' }]}>{item.status}</Text>
        </View>
      </View>

      {/* Customer Info Section */}
      {item.customer && (
        <View style={styles.customerBox}>
          <View style={styles.customerRow}>
            <Ionicons name="person" size={14} color={COLORS.text} />
            <Text style={styles.customerName}>{item.customer.name}</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{item.customer.type.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.customerRow}>
            <Ionicons name="call" size={14} color={COLORS.sub} />
            <Text style={styles.customerDetail}>{item.customer.phone}</Text>
          </View>
          <View style={styles.customerRow}>
            <Ionicons name="finger-print" size={14} color={COLORS.sub} />
            <Text style={styles.customerDetail}>ID: {item.customer.id}</Text>
          </View>
        </View>
      )}

      <Text style={styles.itemSummary}>Items: {item.items.reduce((n: any, l: any) => n + l.qty, 0)} • Total: ₹{item.total}</Text>
      <View style={styles.actionsRow}>
        <Action label="Preparing" color={COLORS.blue} onPress={() => mutate({ id: item.id, status: 'preparing' })} />
        <Action label="Ready" color={COLORS.accent} onPress={() => mutate({ id: item.id, status: 'ready' })} />
        <Action label="Complete" color={COLORS.green} onPress={() => mutate({ id: item.id, status: 'completed' })} />
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../design/owner background.png')} style={{ flex: 1 }} blurRadius={10}>
      <View style={styles.overlay}>
        <OwnerHeader title="Orders" />
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={orders}
          keyExtractor={(o) => String(o.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<Text style={{ color: COLORS.sub, textAlign: 'center', marginTop: 20 }}>No live orders</Text>}
        />
        <OwnerTabBar active="orders" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.glass,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: '700', textTransform: 'capitalize', fontSize: 12 },

  customerBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    gap: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  customerDetail: {
    fontSize: 13,
    color: COLORS.sub,
    fontWeight: '600',
  },
  typeTag: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },

  itemSummary: { color: COLORS.text, marginTop: 4, fontWeight: '700', fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10 },
  actionText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
