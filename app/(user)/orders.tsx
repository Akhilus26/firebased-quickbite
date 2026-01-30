import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getMyOrders, Order, docToOrder } from '@/api/orders';
import { useAuthStore } from '@/stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useEffect } from 'react';

const ORANGE = '#f97316';

export default function Orders() {
    const user = useAuthStore((s) => s.user);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            const authState = useAuthStore.getState();
            if (!authState.isLoading && !authState.user) {
                setLoading(false);
            }
            return;
        }

        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((doc) => {
                list.push(docToOrder(doc.data(), doc.id));
            });
            // Sort by createdAt desc
            list.sort((a, b) => b.createdAt - a.createdAt);
            setOrders(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={styles.loadingText}>Fetching your orders...</Text>
            </View>
        );
    }

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const renderItem = ({ item }: { item: Order }) => (
        <Pressable style={styles.card} onPress={() => setSelectedOrder(item)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View>
                    <Text style={styles.title}>Order #{item.id}</Text>
                    <Text style={styles.dateTime}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
                    {item.orderCode && (
                        <Text style={styles.orderCode}>Code: {item.orderCode}</Text>
                    )}
                </View>
                {item.status !== 'pending' && (
                    <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.badgeText, { color: '#166534' }]}>{item.status}</Text>
                    </View>
                )}
            </View>
            <View style={styles.divider} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.subtitle}>Total Amount</Text>
                <Text style={styles.amount}>₹{item.total}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
                <Text style={styles.tapTip}>Tap to see details</Text>
            </View>
        </Pressable>
    );

    return (
        <ImageBackground
            source={require('../../design/background image.jpeg')}
            style={styles.container}
            blurRadius={10}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <FlatList
                contentContainerStyle={{ padding: 16, paddingTop: 120, paddingBottom: 120 }}
                data={orders}
                keyExtractor={(o) => String(o.id)}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={60} color="#94a3b8" />
                        <Text style={styles.emptyText}>No orders yet</Text>
                    </View>
                }
            />

            {/* Order Detail Modal */}
            <Modal
                visible={!!selectedOrder}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedOrder(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Order Details</Text>
                            <Pressable onPress={() => setSelectedOrder(null)}>
                                <Ionicons name="close" size={24} color="#111827" />
                            </Pressable>
                        </View>

                        {selectedOrder && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Order ID</Text>
                                    <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Pickup Code</Text>
                                    <Text style={styles.detailValueCode}>{selectedOrder.orderCode}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date & Time</Text>
                                    <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Payment Method</Text>
                                    <Text style={styles.detailValueText}>{selectedOrder.paymentMethod.toUpperCase()}</Text>
                                </View>

                                <View style={styles.modalDivider} />

                                <Text style={styles.itemsHeader}>ITEMS ORDERED</Text>
                                {selectedOrder.items.map((it, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{it.name}</Text>
                                            <Text style={styles.itemCounter}>{it.counter}</Text>
                                        </View>
                                        <Text style={styles.itemQty}>x{it.qty}</Text>
                                        <Text style={styles.itemPrice}>₹{it.price * it.qty}</Text>
                                    </View>
                                ))}

                                <View style={styles.modalDivider} />

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total Paid</Text>
                                    <Text style={styles.totalValue}>₹{selectedOrder.total}</Text>
                                </View>

                                {selectedOrder.status === 'completed' && (
                                    <Pressable
                                        style={styles.scratchCardBtn}
                                        onPress={() => {
                                            setSelectedOrder(null);
                                            router.push({ pathname: '/(user)/scratch-cards', params: { orderId: selectedOrder.id } });
                                        }}
                                    >
                                        <Ionicons name="gift-outline" size={20} color="#fff" />
                                        <Text style={styles.scratchCardBtnText}>Collect Order (Scratch Cards)</Text>
                                    </Pressable>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loadingText: { marginTop: 15, color: '#64748b', fontWeight: '600' },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.7)',
        alignItems: 'center',
        zIndex: 100,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
    },
    card: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    title: { fontSize: 18, fontWeight: '800', color: '#111827' },
    dateTime: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '600' },
    orderCode: { fontSize: 16, fontWeight: '900', color: ORANGE, marginTop: 4, letterSpacing: 1 },
    subtitle: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    amount: { fontSize: 20, fontWeight: '900', color: '#111827' },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
    badgeText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
    tapTip: { fontSize: 12, color: '#94a3b8', marginLeft: 4, fontWeight: '500' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 18, fontWeight: '700', color: '#94a3b8' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '700',
    },
    detailValueCode: {
        fontSize: 20,
        color: ORANGE,
        fontWeight: '900',
        letterSpacing: 2,
    },
    detailValueText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '800',
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 20,
    },
    itemsHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    itemCounter: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    itemQty: {
        fontSize: 15,
        fontWeight: '800',
        color: ORANGE,
        marginHorizontal: 12,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        width: 60,
        textAlign: 'right',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    scratchCardBtn: {
        backgroundColor: ORANGE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        marginTop: 10,
        marginBottom: 30,
        shadowColor: ORANGE,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    scratchCardBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    }
});
