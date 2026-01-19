import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveOrders, getCompletedOrders, getPendingOrdersCount, getOrderByCode } from '@/api/staff';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import type { Order } from '@/api/orders';

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

function StaffHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBar}>
        <View style={styles.brandWrap}>
          <Ionicons name="restaurant" size={26} color={COLORS.accent} />
          <View>
            <Text style={styles.brandTitle}>Staff Dashboard</Text>
            <Text style={styles.brandSub}>Quick Bite Canteen</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return COLORS.red;
      case 'preparing': return COLORS.accent;
      case 'ready': return COLORS.blue;
      default: return COLORS.green;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Code: {order.orderCode}</Text>
          <Text style={styles.cardSubtitle}>{formatTime(order.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardInfo}>
          {order.items.reduce((sum, item) => sum + item.qty, 0)} items • ₹{order.total}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function StaffDashboard() {
  const logout = useAuthStore((s) => s.logout);
  const [searchCode, setSearchCode] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const queryClient = useQueryClient();

  const { data: activeOrders = [], isLoading: loadingActive } = useQuery({
    queryKey: ['staff:active'],
    queryFn: getActiveOrders,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const { data: completedOrders = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['staff:completed'],
    queryFn: getCompletedOrders,
  });

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['staff:pending-count'],
    queryFn: getPendingOrdersCount,
    refetchInterval: 3000,
  });

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSearch = async () => {
    if (searchCode.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter a 4-digit order code');
      return;
    }

    const order = await getOrderByCode(searchCode);
    if (order) {
      router.push(`/(staff)/order-details?id=${order.id}`);
      setSearchCode('');
    } else {
      Alert.alert('Order Not Found', 'No order found with this code. It may be invalid or already completed.');
    }
  };

  const handleOrderPress = (order: Order) => {
    if (order.status === 'completed') {
      Alert.alert('Order Completed', 'This order has already been completed and the code is no longer valid.');
      return;
    }
    router.push(`/(staff)/order-details?id=${order.id}`);
  };

  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;
  const isLoading = activeTab === 'active' ? loadingActive : loadingHistory;

  return (
    <ImageBackground
      source={require('../../design/owner background.png')}
      style={styles.container}
      blurRadius={10}
    >
      <View style={styles.overlay}>
        <StaffHeader onLogout={handleLogout} />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={COLORS.accent} />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending Orders</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter 4-digit order code"
            value={searchCode}
            onChangeText={setSearchCode}
            keyboardType="numeric"
            maxLength={4}
            placeholderTextColor={COLORS.sub}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Current Orders ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              History ({completedOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={displayedOrders}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <OrderCard order={item} onPress={() => handleOrderPress(item)} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.sub} />
              <Text style={styles.emptyText}>
                {activeTab === 'active' ? 'No active orders' : 'No order history'}
              </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['staff:active'] });
            queryClient.invalidateQueries({ queryKey: ['staff:completed'] });
            queryClient.invalidateQueries({ queryKey: ['staff:pending-count'] });
          }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },
  header: { paddingTop: 18, paddingHorizontal: 16, paddingBottom: 12 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  brandSub: { color: COLORS.sub, fontWeight: '600', fontSize: 12 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statsContainer: { paddingHorizontal: 16, marginBottom: 12 },
  statCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 14, color: COLORS.sub, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
  },
  searchButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontWeight: '800', fontSize: 18, color: COLORS.text },
  cardSubtitle: { color: COLORS.sub, fontSize: 12, marginTop: 2 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
  },
  cardFooter: { marginTop: 8 },
  cardInfo: { color: COLORS.sub, fontSize: 14, fontWeight: '600' },
  separator: { height: 12 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.sub,
    fontSize: 16,
    fontWeight: '600',
  },
});

