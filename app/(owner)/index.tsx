import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Switch, Alert, useWindowDimensions, Animated, Easing } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOwnerStats, getCanteenStatus, setCanteenStatus, getMenu, toggleAvailability, getLiveOrders, updateOrderStatus, removeMenuItem } from '@/api/owner';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { MenuItem } from '@/components/FoodCard';
import { useAuthStore } from '@/stores/authStore';

const COLORS = {
  bgOverlay: 'rgba(255,255,255,0.85)',
  glass: 'rgba(255,255,255,0.95)',
  text: '#111827',
  sub: '#6b7280',
  border: '#e5e7eb',
  primary: '#111827',
  accent: '#f97316',
  blue: '#2563eb',
  green: '#16a34a',
  red: '#ef4444',
  lightGrey: '#f3f4f6',
  darkGrey: '#4b5563',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  menuIcon: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Welcome Card
  welcomeCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Earnings Card
  earningsCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 0,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.sub,
    fontWeight: '600',
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    marginBottom: 16,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.lightGrey,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.darkGrey,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabMenuIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Order/Item Card
  orderCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderSubtext: {
    fontSize: 12,
    color: COLORS.sub,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.lightGrey,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDietary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dietaryIcon: {
    fontSize: 14,
  },
  dietaryText: {
    fontSize: 12,
    color: COLORS.sub,
    fontWeight: '600',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonOrange: {
    backgroundColor: COLORS.accent,
  },
  actionButtonGrey: {
    backgroundColor: COLORS.lightGrey,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  actionButtonTextGrey: {
    color: COLORS.text,
  },

  // Options Row Cards
  optionsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 0, marginBottom: 12 },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  optionTitle: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  optionSubtitle: { color: COLORS.sub, marginTop: 4, fontSize: 12 },
  responsiveRow: { flexWrap: 'wrap' },

  menuIconRight: {
   position: 'absolute',
   right: 20,
   width: 40,
   height: 40,
   alignItems: 'center',
   justifyContent: 'center',
 },
 dropdown: {
   position: 'absolute',
   right: 20,
   top: 70,
   backgroundColor: COLORS.glass,
   borderRadius: 12,
   borderWidth: 1,
   borderColor: COLORS.border,
   paddingVertical: 6,
   width: 190,
   shadowColor: '#000',
   shadowOpacity: 0.12,
   shadowRadius: 12,
   shadowOffset: { width: 0, height: 6 },
   elevation: 8,
   zIndex: 100,
 },
 dropdownItem: {
   paddingVertical: 10,
   paddingHorizontal: 12,
 }
});

type TabType = 'Items' | 'Orders' | 'Completed';

export default function OwnerDashboard() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const { data: stats } = useQuery({ queryKey: ['owner:stats'], queryFn: getOwnerStats });
  const { data: menu = [] } = useQuery({ queryKey: ['owner:menu'], queryFn: getMenu });
  const { data: status } = useQuery({ queryKey: ['owner:canteen-status'], queryFn: getCanteenStatus });
  const isOpen = !!status?.open;
  const [activeTab, setActiveTab] = useState<TabType>('Items');
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel', onPress: () => setMenuOpen(false) },
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

  // Simple animation values for action cards
  const pulse = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.12] });

  // Animated toggle for Open/Closed control
  const openAnim = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(openAnim, { toValue: isOpen ? 1 : 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [isOpen, openAnim]);
  
  const { mutate: toggleItem } = useMutation({
    mutationFn: (id: number) => toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner:menu'] });
    }
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: (id: number) => removeMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner:menu'] });
    }
  });

  const { mutate: setOpen } = useMutation({
    mutationFn: (open: boolean) => setCanteenStatus(open),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner:canteen-status'] });
    }
  });

  // Confirm before closing canteen
  const confirmToggle = (next: boolean) => {
    if (!next) {
      Alert.alert(
        'Close Canteen?',
        'Users will not be able to place new orders until you reopen. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Close', style: 'destructive', onPress: () => setOpen(false) },
        ]
      );
    } else {
      setOpen(true);
    }
  };

  // Show all items in Items tab so OOS items remain visible with 'Mark Live'
  const getFilteredMenu = () => {
    return menu;
  };

  const filteredMenu = getFilteredMenu();

  // Orders data when viewing Orders/Completed inline on dashboard
  const { data: ordersPending = [] } = useQuery({ queryKey: ['owner:live','pending'], queryFn: () => getLiveOrders('pending') });
  const { data: ordersCompleted = [] } = useQuery({ queryKey: ['owner:live','completed'], queryFn: () => getLiveOrders('completed') });
  const { mutate: moveOrder } = useMutation({
    mutationFn: (p: { id: number; status: 'preparing'|'ready'|'completed' }) => updateOrderStatus(p.id, p.status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['owner:live'] }); }
  });

  const renderItem = ({ item }: { item: MenuItem }) => {
    return (
      <View style={styles.orderCard}>
       <View style={styles.itemRow}>
         <TouchableOpacity onPress={() => Alert.alert('Remove Item','Are you sure you want to remove this item?',[
           { text: 'Cancel', style: 'cancel' },
           { text: 'Remove', style: 'destructive', onPress: () => deleteItem(item.id) },
         ])} style={{ marginRight: 8 }}>
           <Ionicons name="close-circle" size={22} color={COLORS.red} />
         </TouchableOpacity>
         <Image 
           source={typeof item.image === 'number' ? item.image : { uri: item.image || '' }} 
           style={styles.itemImage}
         />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemDietary}>
              <Text style={styles.dietaryIcon}>{item.veg ? '🌿' : '🍗'}</Text>
              <Text style={styles.dietaryText}>{item.veg ? 'Veg' : 'Non-Veg'}</Text>
            </View>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            <TouchableOpacity style={[styles.actionButton, item.available ? styles.actionButtonOrange : styles.actionButtonGrey]} onPress={() => toggleItem(item.id)}>
              <Text style={[styles.actionButtonText, !item.available && styles.actionButtonTextGrey]}>{item.available ? 'Mark OOS' : 'Mark Live'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.blue, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }]} 
              onPress={() => router.push({ pathname: '/(owner)/add-item', params: { item: JSON.stringify(item) } })}
            >
              <Feather name="edit-2" size={14} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'Items') return filteredMenu;
    if (activeTab === 'Orders') return ordersPending;
    return ordersCompleted;
  };

  // Render item based on active tab
  const renderListItem = ({ item }: { item: any }) => {
    if (activeTab === 'Items') {
      return renderItem({ item });
    }
    // Orders/Completed
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: activeTab === 'Completed' ? '#dcfce7' : '#fee2e2' }}>
            <Text style={{ color: activeTab === 'Completed' ? '#166534' : '#7f1d1d', fontWeight: '700' }}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.orderSubtext}>Items: {item.items.reduce((n:any,l:any)=> n + l.qty, 0)} • Total: ₹{item.total}</Text>
        {activeTab === 'Orders' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.blue }]} onPress={() => moveOrder({ id: item.id, status: 'preparing' })}>
              <Text style={styles.actionButtonText}>Preparing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.accent }]} onPress={() => moveOrder({ id: item.id, status: 'ready' })}>
              <Text style={styles.actionButtonText}>Ready</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.green }]} onPress={() => moveOrder({ id: item.id, status: 'completed' })}>
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // List header component
  const ListHeader = () => (
    <View>
      {/* Quick Actions Row */}
      <View style={[styles.optionsRow, styles.responsiveRow, { gap: isSmall ? 8 : 12 }]}>
        {/* Back to Canteen - gradient card */}
        <Animated.View style={[styles.optionCard, { transform: [{ scale }] }]}> 
          <TouchableOpacity onPress={() => router.push('/(user)')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.optionTitle, { fontSize: 15 }]}>Back to Canteen</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Canteen Open/Close - animated pill switch */}
        <Animated.View style={[styles.optionCard, { transform: [{ scale }], shadowOpacity: glow as any, paddingVertical: 12 }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.optionTitle, { fontSize: 15 }]}>{isOpen ? 'Canteen Open' : 'Canteen Closed'}</Text>
            <TouchableOpacity onPress={() => confirmToggle(!isOpen)} activeOpacity={0.9}>
              <Animated.View style={{ width: 54, height: 28, borderRadius: 14, backgroundColor: isOpen ? '#22c55e' : '#ef4444', transform: [{ scale: openAnim.interpolate({ inputRange: [0,1], outputRange: [0.98, 1] }) }] }}>
                <Animated.View style={{ 
                  position: 'absolute', 
                  top: 2, 
                  left: 2,
                  width: 24, 
                  height: 24, 
                  borderRadius: 12, 
                  backgroundColor: '#fff',
                  transform: [{ translateX: openAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 26] }) }]
                }} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Today's Earnings Card */}
      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Today's Earnings</Text>
        <Text style={styles.earningsValue}>₹{stats?.todayEarnings ?? 0}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Items' && styles.tabActive]}
          onPress={() => setActiveTab('Items')}
        >
          <Text style={[styles.tabText, activeTab === 'Items' && styles.tabTextActive]}>Items</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Orders' && styles.tabActive]}
          onPress={() => setActiveTab('Orders')}
        >
          <Text style={[styles.tabText, activeTab === 'Orders' && styles.tabTextActive]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Completed' && styles.tabActive]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={[styles.tabText, activeTab === 'Completed' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../design/owner background.png')} style={styles.container} blurRadius={10}>
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/(user)')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Canteen</Text>
          <TouchableOpacity style={styles.menuIconRight} onPress={() => setMenuOpen(v => !v)}>
            <Feather name="menu" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

       {menuOpen && (
         <View style={styles.dropdown}>
           <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/(owner)/reports'); }} style={styles.dropdownItem}>
             <Text>View Reports</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/(owner)/finance'); }} style={styles.dropdownItem}>
             <Text>Financial Overview</Text>
           </TouchableOpacity>
           <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 4 }} />
           <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
               <Text style={{ color: COLORS.red, fontWeight: '600' }}>Logout</Text>
             </View>
           </TouchableOpacity>
         </View>
       )}

       {/* Single FlatList with ListHeaderComponent to avoid nesting */}
        <FlatList
          data={getCurrentData()}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderListItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ 
            paddingHorizontal: 20,
            paddingBottom: 120 
          }}
          ItemSeparatorComponent={() => activeTab !== 'Items' ? <View style={{ height: 10 }} /> : null}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.sub }}>
                {activeTab === 'Items' ? 'No items found' : 
                 activeTab === 'Orders' ? 'No live orders' : 
                 'No completed orders'}
              </Text>
            </View>
          }
          scrollEnabled={true}
        />

        {/* Floating Add Item Button */}
        <TouchableOpacity
          onPress={() => router.push('/(owner)/add-item')}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 25,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: COLORS.accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
