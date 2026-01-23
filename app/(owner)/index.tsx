import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Switch, Alert, useWindowDimensions, Animated, Easing, TextInput, Modal } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOwnerStats, getCanteenStatus, setCanteenStatus, getMenu, toggleAvailability, getLiveOrders, updateOrderStatus, removeMenuItem } from '@/api/owner';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { MenuItem } from '@/components/FoodCard';
import { useAuthStore } from '@/stores/authStore';
import { Order } from '@/api/orders';

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

type TabType = 'Items' | 'Orders';

export default function OwnerDashboard() {
    const queryClient = useQueryClient();
    const logout = useAuthStore((s) => s.logout);
    const { data: stats } = useQuery({ queryKey: ['owner:stats'], queryFn: getOwnerStats });
    const { data: menu = [] } = useQuery({ queryKey: ['owner:menu'], queryFn: getMenu });
    const { data: status } = useQuery({ queryKey: ['owner:canteen-status'], queryFn: getCanteenStatus });
    const isOpen = !!status?.open;

    const [activeTab, setActiveTab] = useState<TabType>('Items');
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

    // Simple animation values
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
    const openAnim = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(openAnim, { toValue: isOpen ? 1 : 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }, [isOpen]);

    const { mutate: toggleItem } = useMutation({
        mutationFn: (id: number) => toggleAvailability(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner:menu'] })
    });

    const { mutate: deleteItem } = useMutation({
        mutationFn: (id: number) => removeMenuItem(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner:menu'] })
    });

    const { mutate: setOpen } = useMutation({
        mutationFn: (open: boolean) => setCanteenStatus(open),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner:canteen-status'] })
    });

    const { data: allOrders = [] } = useQuery({ queryKey: ['owner:live'], queryFn: () => getLiveOrders() });

    const filteredOrders = useMemo(() => {
        if (!searchQuery) return allOrders;
        return allOrders.filter(o =>
            String(o.id).includes(searchQuery) ||
            (o.orderCode && o.orderCode.includes(searchQuery))
        );
    }, [allOrders, searchQuery]);

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.orderCard}>
            <View style={styles.itemRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, gap: 8 }}>
                    <TouchableOpacity onPress={() => Alert.alert('Remove Item', 'Are you sure?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', onPress: () => deleteItem(item.id) },
                    ])}>
                        <Ionicons name="close-circle" size={22} color={COLORS.red} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/(owner)/add-item', params: { item: JSON.stringify(item) } })}>
                        <Ionicons name="create-outline" size={22} color={COLORS.blue} />
                    </TouchableOpacity>
                </View>
                <Image source={typeof item.image === 'number' ? item.image : { uri: item.image || '' }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSub}>{item.counter}</Text>
                </View>
                <View style={styles.itemRight}>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                    <TouchableOpacity style={[styles.actionButton, item.available ? styles.actionButtonOrange : styles.actionButtonGrey]} onPress={() => toggleItem(item.id)}>
                        <Text style={[styles.actionButtonText, !item.available && styles.actionButtonTextGrey]}>{item.available ? 'Mark OOS' : 'Mark Live'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderOrderListItem = ({ item }: { item: Order }) => (
        <TouchableOpacity style={styles.orderCard} onPress={() => setSelectedOrder(item)}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderNumber}>Order ID: #{item.id}</Text>
                    <Text style={styles.orderTime}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
                </View>
                <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.orderCode}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.orderSubtext}>{item.items.length} Items • {item.paymentMethod.toUpperCase()}</Text>
                <Text style={styles.orderTotal}>₹{item.total}</Text>
            </View>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View>
            <View style={styles.optionsRow}>
                <Animated.View style={[styles.optionCard, { transform: [{ scale }] }]}>
                    <TouchableOpacity onPress={() => router.push('/(user)')}>
                        <Text style={styles.optionTitle}>Back to Canteen</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.optionCard, { transform: [{ scale }] }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.optionTitle}>{isOpen ? 'Open' : 'Closed'}</Text>
                        <TouchableOpacity onPress={() => setOpen(!isOpen)}>
                            <View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: isOpen ? COLORS.green : COLORS.red }}>
                                <View style={{ position: 'absolute', top: 2, left: isOpen ? 22 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>

            <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Daily Earnings</Text>
                <Text style={styles.earningsValue}>₹{stats?.todayEarnings ?? 0}</Text>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'Items' && styles.tabActive]} onPress={() => setActiveTab('Items')}>
                    <Text style={[styles.tabText, activeTab === 'Items' && styles.tabTextActive]}>Items</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Orders' && styles.tabActive]} onPress={() => setActiveTab('Orders')}>
                    <Text style={[styles.tabText, activeTab === 'Orders' && styles.tabTextActive]}>Orders</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'Orders' && (
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.sub} />
                    <TextInput
                        placeholder="Search by 4-digit code or ID..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        keyboardType="numeric"
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.sub} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../../design/owner background.png')} style={styles.container} blurRadius={10}>
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backIcon} onPress={() => router.push('/(user)')}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Canteen Owner</Text>
                    <TouchableOpacity style={styles.brandIcon} onPress={() => setMenuOpen(!menuOpen)}>
                        <Feather name="menu" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {menuOpen && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/(owner)/reports' as any); }} style={styles.dropdownItem}>
                            <Text style={styles.dropdownText}>View Analytics</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                            <Text style={[styles.dropdownText, { color: COLORS.red }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={(activeTab === 'Items' ? menu : filteredOrders) as any[]}
                    renderItem={(activeTab === 'Items' ? renderMenuItem : renderOrderListItem) as any}
                    keyExtractor={(item: any) => String(item.id)}
                    ListHeaderComponent={ListHeader}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>}
                />

                {/* Detail Modal */}
                <Modal visible={!!selectedOrder} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Order Details</Text>
                                <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                                    <Ionicons name="close" size={24} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>
                            {selectedOrder && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalInfoRow}><Text style={styles.modalLabel}>Code:</Text><Text style={styles.modalCode}>{selectedOrder.orderCode}</Text></View>
                                    <View style={styles.modalInfoRow}><Text style={styles.modalLabel}>ID:</Text><Text style={styles.modalValue}>#{selectedOrder.id}</Text></View>
                                    <View style={styles.modalInfoRow}><Text style={styles.modalLabel}>Payment:</Text><Text style={styles.modalValue}>{selectedOrder.paymentMethod.toUpperCase()}</Text></View>
                                    <View style={styles.modalInfoRow}><Text style={styles.modalLabel}>Time:</Text><Text style={styles.modalValue}>{formatDate(selectedOrder.createdAt)} {formatTime(selectedOrder.createdAt)}</Text></View>
                                    <View style={styles.modalDivider} />
                                    <Text style={styles.modalSectionTitle}>ITEMS</Text>
                                    {selectedOrder.items.map((it, i) => (
                                        <View key={i} style={styles.modalItemRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalItemName}>{it.name}</Text>
                                                <Text style={styles.modalItemSub}>{it.counter}</Text>
                                            </View>
                                            <Text style={styles.modalItemQty}>x{it.qty}</Text>
                                            <Text style={styles.modalItemPrice}>₹{it.price * it.qty}</Text>
                                        </View>
                                    ))}
                                    <View style={styles.modalDivider} />
                                    <View style={styles.modalTotalRow}><Text style={styles.modalTotalLabel}>Total:</Text><Text style={styles.modalTotalValue}>₹{selectedOrder.total}</Text></View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>

                <TouchableOpacity onPress={() => router.push('/(owner)/add-item')} style={styles.fab}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40, paddingHorizontal: 20, paddingBottom: 15 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
    brandIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    backIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    dropdown: { position: 'absolute', right: 20, top: 100, backgroundColor: '#fff', borderRadius: 12, padding: 8, width: 160, shadowOpacity: 0.1, elevation: 5, zIndex: 1000 },
    dropdownItem: { padding: 12 },
    dropdownText: { fontWeight: '700' },
    optionsRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
    optionCard: { flex: 1, backgroundColor: COLORS.glass, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
    optionTitle: { fontWeight: '900', color: COLORS.text, fontSize: 15 },
    earningsCard: { backgroundColor: COLORS.glass, borderRadius: 16, padding: 18, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    earningsLabel: { fontSize: 14, color: COLORS.sub, fontWeight: '700' },
    earningsValue: { fontSize: 28, fontWeight: '900', color: COLORS.text },
    tabsContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    tab: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.lightGrey, alignItems: 'center' },
    tabActive: { backgroundColor: COLORS.primary },
    tabText: { fontWeight: '800', color: COLORS.text, fontSize: 16 },
    tabTextActive: { color: '#fff' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glass, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 50, borderWidth: 1, borderColor: COLORS.border },
    searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', color: COLORS.text },
    orderCard: { backgroundColor: COLORS.glass, borderRadius: 20, padding: 20, marginBottom: 16, shadowOpacity: 0.08, elevation: 3 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderNumber: { fontWeight: '900', fontSize: 20, color: COLORS.text },
    orderTime: { fontSize: 14, color: COLORS.sub, marginTop: 2, fontWeight: '600' },
    orderSubtext: { fontSize: 15, color: COLORS.sub, fontWeight: '600' },
    orderTotal: { fontWeight: '900', fontSize: 24, color: COLORS.text },
    codeBadge: { backgroundColor: '#fdf2f8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#fbcfe8' },
    codeText: { color: COLORS.accent, fontWeight: '900', fontSize: 20, letterSpacing: 1 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemImage: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontWeight: '900', color: COLORS.text, fontSize: 18 },
    itemSub: { fontSize: 13, color: COLORS.sub, fontWeight: '600' },
    itemRight: { alignItems: 'flex-end', gap: 4 },
    itemPrice: { fontWeight: '900', color: COLORS.text, fontSize: 20 },
    actionButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, minWidth: 80, alignItems: 'center' },
    actionButtonOrange: { backgroundColor: COLORS.accent },
    actionButtonGrey: { backgroundColor: COLORS.lightGrey },
    actionButtonText: { color: '#fff', fontWeight: '800', fontSize: 11 },
    actionButtonTextGrey: { color: COLORS.sub },
    fab: { position: 'absolute', right: 20, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.sub, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    modalLabel: { color: COLORS.sub, fontWeight: '600' },
    modalValue: { fontWeight: '700' },
    modalCode: { fontSize: 24, fontWeight: '900', color: COLORS.accent, letterSpacing: 1 },
    modalDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
    modalSectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.sub, marginBottom: 15 },
    modalItemRow: { flexDirection: 'row', marginBottom: 12 },
    modalItemName: { fontWeight: '700' },
    modalItemSub: { fontSize: 11, color: COLORS.sub },
    modalItemQty: { marginHorizontal: 15, fontWeight: '800', color: COLORS.accent },
    modalItemPrice: { fontWeight: '700', width: 60, textAlign: 'right' },
    modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modalTotalLabel: { fontSize: 18, fontWeight: '800' },
    modalTotalValue: { fontSize: 24, fontWeight: '900' }
});
