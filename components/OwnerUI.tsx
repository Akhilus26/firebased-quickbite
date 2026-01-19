import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

export const COLORS = {
  bgOverlay: 'rgba(255,255,255,0.82)',
  glass: 'rgba(255,255,255,0.92)',
  text: '#111827',
  sub: '#6b7280',
  border: '#e5e7eb',
  primary: '#111827',
  accent: '#f97316',
  blue: '#2563eb',
  green: '#16a34a',
};

export function OwnerHeader({ title, hideIcons }: { title: string; hideIcons?: boolean }) {
  const logout = useAuthStore((s) => s.logout);

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

  return (
    <View style={[styles.header, hideIcons && styles.headerNoPadding]}> 
      <View style={styles.headerBar}>
        <View style={styles.brandWrap}>
          <Ionicons name="restaurant" size={26} color={COLORS.accent} />
          <View>
            <Text style={styles.brandTitle}>{title}</Text>
            {!hideIcons && <Text style={styles.brandSub}>Canteen Dashboard</Text>}
          </View>
        </View>
        {!hideIcons && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(owner)/orders?status=pending')}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(owner)/menu')}>
              <Feather name="menu" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export function OwnerTabBar({ active }: { active: 'dashboard'|'orders'|'menu' }) {
  const Item = ({ label, icon, target, isActive }: { label: string; icon: React.ReactNode; target: string; isActive: boolean }) => (
    <TouchableOpacity onPress={() => router.replace(target)} style={[styles.tabItem, isActive && styles.tabItemActive]}>
      {icon}
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.tabBar}>
      <Item label="Dashboard" icon={<Feather name="home" size={18} color={active==='dashboard'?'#fff':COLORS.text} />} target="/(owner)" isActive={active==='dashboard'} />
      <Item label="Orders" icon={<Feather name="clock" size={18} color={active==='orders'?'#fff':COLORS.text} />} target="/(owner)/orders" isActive={active==='orders'} />
      <Item label="Menu" icon={<Feather name="list" size={18} color={active==='menu'?'#fff':COLORS.text} />} target="/(owner)/menu" isActive={active==='menu'} />
    </View>
  );
}

export const styles = StyleSheet.create({
  header: { paddingTop: 18, paddingHorizontal: 16 },
  headerNoPadding: { paddingTop: 0, paddingHorizontal: 0 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text },
  brandSub: { color: COLORS.sub, fontWeight: '700' },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  tabBar: {
    position: 'absolute', left: 16, right: 16, bottom: 20,
    backgroundColor: COLORS.glass, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border,
    padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  tabItemActive: { backgroundColor: COLORS.primary },
  tabLabel: { fontWeight: '800', color: COLORS.text },
  tabLabelActive: { color: '#fff' },
});
