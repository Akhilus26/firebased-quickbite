import React from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '@/api/orders';
import { useAuthStore } from '@/stores/authStore';

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f1f1',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 12,
  },
  title: { fontWeight: '800', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 6 },
  amount: { fontSize: 16, fontWeight: '800', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: '700', textTransform: 'capitalize' },
});

export default function Orders() {
  const phone = useAuthStore((s) => s.phone);
  const { data = [] } = useQuery({ 
    queryKey: ['orders', phone], 
    queryFn: () => getMyOrders(phone) 
  });
  return (
    <ImageBackground 
      source={require('../../design/background image.jpeg')} 
      style={styles.container}
      blurRadius={8}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 32, fontWeight: '600', color: '#000000', textAlign: 'center', marginBottom: 8 }}>My Orders</Text>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        data={data}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View>
                <Text style={styles.title}>Order #{item.id}</Text>
                {item.orderCode && (
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#f97316', marginTop: 4, letterSpacing: 2 }}>
                    Code: {item.orderCode}
                  </Text>
                )}
              </View>
              <View style={[styles.badge, { backgroundColor: item.status === 'completed' ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.badgeText, { color: item.status === 'completed' ? '#166534' : '#7f1d1d' }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Total</Text>
            <Text style={styles.amount}>₹{item.total}</Text>
          </View>
        )}
      />
    </ImageBackground>
  );
}
