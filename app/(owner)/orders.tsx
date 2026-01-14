import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLiveOrders, updateOrderStatus } from '@/api/owner';
import { useLocalSearchParams } from 'expo-router';
import { OwnerHeader, OwnerTabBar, COLORS } from '@/components/OwnerUI';

export default function OwnerOrders() {
  const qc = useQueryClient();
  const params = useLocalSearchParams();
  const status = (params.status as 'pending'|'preparing'|'ready'|'completed'|undefined);
  const { data = [] } = useQuery({ queryKey: ['owner:live', status], queryFn: () => getLiveOrders(status) });
  const { mutate } = useMutation({
    mutationFn: (p: { id: number; status: 'preparing'|'ready'|'completed' }) => updateOrderStatus(p.id, p.status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner:live'] }); }
  });

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
      <Text style={styles.subtitle}>Items: {item.items.reduce((n:any,l:any)=> n + l.qty, 0)} • Total: ₹{item.total}</Text>
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
          data={data}
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
  title: { fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.sub, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: '700', textTransform: 'capitalize' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  actionText: { color: '#fff', fontWeight: '800' },
});
