import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { collection, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ScratchCard } from '@/components/ScratchCard';
import { ScratchToken } from '@/api/orders';
import * as ScreenCapture from 'expo-screen-capture';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = '#f97316';
const DARK_BLUE = '#1e293b';

type CounterType = 'Snacks & Hot Beverages' | 'Meals' | 'Cold Beverages';

export default function ScratchCardsPage() {
    const { orderId } = useLocalSearchParams();
    const [tokens, setTokens] = useState<(ScratchToken & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCounter, setSelectedCounter] = useState<CounterType>('Snacks & Hot Beverages');

    useEffect(() => {
        // Best-effort screenshot prevention
        const subscription = ScreenCapture.addScreenshotListener(() => {
            Alert.alert('Security Warning', 'Screenshots are prohibited for security reasons.');
        });

        async function enablePrevention() {
            if (await ScreenCapture.isAvailableAsync()) {
                await ScreenCapture.preventScreenCaptureAsync();
            }
        }
        enablePrevention();

        return () => {
            subscription.remove();
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    useEffect(() => {
        if (!orderId) return;

        const q = query(
            collection(db, 'scratchTokens'),
            where('orderId', '==', parseInt(orderId as string, 10))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tokensData: any[] = [];
            snapshot.forEach((doc) => {
                tokensData.push({ id: doc.id, ...doc.data() });
            });
            setTokens(tokensData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [orderId]);

    const handleReveal = async (tokenId: string) => {
        try {
            const tokenRef = doc(db, 'scratchTokens', tokenId);
            await updateDoc(tokenRef, {
                used: true,
                revealedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating token status:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={styles.loadingText}>Fetching your scratch cards...</Text>
            </View>
        );
    }

    const filteredTokens = tokens.filter(t => t.counter === selectedCounter);
    const now = Date.now();

    return (
        <ImageBackground
            source={require('../../design/background image.jpeg')}
            style={styles.container}
            blurRadius={10}
        >
            <View style={styles.header}>
                <Pressable onPress={() => router.replace('/(user)/orders')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </Pressable>
                <Text style={styles.headerTitle}>Order Pickup</Text>
            </View>

            {/* 3-Toggle Selector */}
            <View style={styles.toggleRow}>
                {(['Snacks & Hot Beverages', 'Meals', 'Cold Beverages'] as CounterType[]).map((c) => (
                    <Pressable
                        key={c}
                        onPress={() => setSelectedCounter(c)}
                        style={[styles.toggleBtn, selectedCounter === c && styles.toggleBtnActive]}
                    >
                        <Ionicons
                            name={c === 'Meals' ? 'restaurant' : (c === 'Cold Beverages' ? 'ice-cream' : 'cafe')}
                            size={18}
                            color={selectedCounter === c ? '#fff' : '#64748b'}
                        />
                        <Text style={[styles.toggleText, selectedCounter === c && styles.toggleTextActive]}>
                            {c.split(' ')[0]}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Ionicons name="shield-checkmark" size={20} color={ORANGE} />
                    <Text style={styles.infoText}>
                        Visible only for 1 minute after scratch. Show this to staff immediately.
                    </Text>
                </View>

                {filteredTokens.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="cart-outline" size={40} color="#94a3b8" />
                        </View>
                        <Text style={styles.emptyText}>No items from this counter</Text>
                        <Text style={styles.emptySubtext}>Try another counter toggle above</Text>
                    </View>
                ) : (
                    filteredTokens.map((token) => {
                        const expiresMillis = token.expiresAt?.toMillis ? token.expiresAt.toMillis() : (token.expiresAt as any);
                        const isExpired = expiresMillis < now;
                        return (
                            <ScratchCard
                                key={token.id}
                                counter={token.counter}
                                isUsed={token.used}
                                isExpired={isExpired}
                                revealedAt={token.revealedAt || null}
                                items={token.items || []}
                                onReveal={() => handleReveal(token.id)}
                            />
                        );
                    })
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    onPress={() => router.replace('/(user)/orders')}
                    style={styles.doneBtn}
                >
                    <Text style={styles.doneBtnText}>Back to My Orders</Text>
                </Pressable>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loadingText: { marginTop: 15, color: '#64748b', fontWeight: '600' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        marginLeft: 15,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
    toggleRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginHorizontal: 15,
        padding: 6,
        borderRadius: 16,
        gap: 8,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    toggleBtnActive: {
        backgroundColor: DARK_BLUE,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    toggleTextActive: {
        color: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 14,
        marginBottom: 20,
        alignItems: 'center',
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: ORANGE,
    },
    infoText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
        fontWeight: '600',
        lineHeight: 18,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 40,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        color: '#334155',
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
    },
    emptySubtext: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 110, // Increased to avoid bottom tab bar
        left: 20,
        right: 20,
    },
    doneBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: ORANGE,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    doneBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 0.5,
    },
});
